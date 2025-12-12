'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Header, Sidebar, StatusBar } from '@/components/layout';
import { MailList, MailDetail, FolderSelectModal } from '@/components/mail';
import { SyncProgress, ClassificationProgress } from '@/components/sync';
import { ToastContainer, toast, ResizeHandle } from '@/components/ui';
import { useAuthStore, useFolderStore, useMailStore, useSyncStore } from '@/stores';
import api from '@/lib/api';
import { ApiResponse, Folder, MailListItem, Mail, Pagination, SyncStatus, ClassificationStatus, VirtualFolderCounts } from '@/types';

export default function MailPage() {
  const { user } = useAuthStore();
  const { folders, setFolders, selectedFolderId, selectedVirtualFolder } = useFolderStore();
  const {
    mails,
    selectedMail,
    selectedMailIds,
    pagination,
    searchQuery,
    setMails,
    setSelectedMail,
    setPagination,
    setLoading,
    setSearchQuery,
    toggleMailSelection,
    selectAllMails,
    clearSelection,
    isLoading,
  } = useMailStore();
  const { status: syncStatus, setStatus: setSyncStatus } = useSyncStore();

  const [selectedMailId, setSelectedMailId] = useState<number | null>(null);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isBulkMoveModalOpen, setIsBulkMoveModalOpen] = useState(false);
  const [isSyncDetailOpen, setIsSyncDetailOpen] = useState(false);
  const [isClassificationDetailOpen, setIsClassificationDetailOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [virtualFolderCounts, setVirtualFolderCounts] = useState<VirtualFolderCounts>({
    all: 0,
    unread: 0,
    starred: 0,
    unclassified: 0,
  });
  const [classificationId, setClassificationId] = useState<string | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [classificationStatus, setClassificationStatus] = useState<ClassificationStatus | null>(null);
  const [totalUnclassified, setTotalUnclassified] = useState<number>(0);

  // 분류 중복 호출 방지를 위한 ref
  const isClassifyingRef = useRef(false);
  // 초기 로드 시 중복 호출 방지
  const initialClassificationTriggered = useRef(false);
  // 폴링 중복 방지를 위한 ref
  const classificationPollingRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);
  // 사용자가 수동으로 분류를 중단했을 때 자동 재시작 방지
  const manuallyStoppedRef = useRef(false);
  // 배치 간 누적 성공 카운트 (전체 진행률 표시용)
  const cumulativeSuccessRef = useRef(0);

  // 패널 너비 상태 (리사이즈 가능)
  const [sidebarWidth, setSidebarWidth] = useState(240); // 기본 240px
  const [mailListWidth, setMailListWidth] = useState(384); // 기본 384px (24rem)

  // 리사이즈 핸들러
  const handleSidebarResize = useCallback((delta: number) => {
    setSidebarWidth((prev) => Math.max(180, Math.min(400, prev + delta)));
  }, []);

  const handleMailListResize = useCallback((delta: number) => {
    setMailListWidth((prev) => Math.max(280, Math.min(600, prev + delta)));
  }, []);

  useEffect(() => {
    fetchFolders();
    fetchMails();
    fetchSyncStatus();
    fetchVirtualFolderCounts();
    // 페이지 로드 시 미분류 메일이 있으면 자동 분류 시작 (한 번만)
    if (!initialClassificationTriggered.current) {
      initialClassificationTriggered.current = true;
      checkAndStartClassification();
    }
  }, []);

  // 미분류 메일 수 변경 시 자동 분류 체크 (초기 로드 이후에만)
  useEffect(() => {
    // 초기 로드 중에는 위의 useEffect에서 처리하므로 스킵
    if (!initialClassificationTriggered.current) return;

    // 사용자가 수동으로 중단한 경우 자동 재시작하지 않음
    if (manuallyStoppedRef.current) return;

    // ref로 즉시 체크하여 중복 호출 방지
    if (virtualFolderCounts.unclassified > 0 && !isClassifyingRef.current && syncStatus?.state !== 'in_progress') {
      checkAndStartClassification();
    }
  }, [virtualFolderCounts.unclassified, syncStatus?.state]);

  useEffect(() => {
    fetchMails();
    clearSelection();
    setSelectedMailId(null);
    setSelectedMail(null);
  }, [selectedFolderId, selectedVirtualFolder]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (syncStatus?.state === 'in_progress') {
      intervalId = setInterval(() => {
        fetchSyncStatus();
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [syncStatus?.state]);

  // 분류 상태 폴링 시작/중지 함수
  const startClassificationPolling = useCallback((clsId: string) => {
    // 이미 폴링 중이면 스킵
    if (isPollingRef.current || classificationPollingRef.current) {
      return;
    }

    isPollingRef.current = true;
    console.log('[Classification] Starting polling for:', clsId);

    const poll = async () => {
      if (!isPollingRef.current) return;

      try {
        const { data } = await api.get<ApiResponse<ClassificationStatus>>(`/classification/${clsId}/`);

        if (data.status === 'success' && data.data) {
          const status = data.data;

          // 누적 값을 반영한 상태로 업데이트
          const adjustedStatus = {
            ...status,
            summary: {
              ...status.summary,
              success: status.summary.success + cumulativeSuccessRef.current,
            },
          };
          setClassificationStatus(adjustedStatus);

          if (status.state === 'completed' || status.state === 'failed' || status.state === 'cancelled') {
            console.log('[Classification] Polling stopped - state:', status.state);
            stopClassificationPolling();

            if (status.state === 'completed') {
              const { summary } = status;
              // 누적 값 업데이트
              cumulativeSuccessRef.current += summary.success;

              fetchMails();
              fetchFolders();
              fetchVirtualFolderCounts();

              // 아직 미분류 메일이 남아있으면 다음 배치 분류 시작
              setTimeout(async () => {
                // 미분류 메일 수 확인
                const { data: countData } = await api.get<ApiResponse<{ pagination: Pagination }>>('/mails/', {
                  params: { page_size: 1, is_classified: false }
                });
                const remainingCount = countData.data?.pagination?.total_count || 0;

                if (remainingCount > 0) {
                  // 다음 배치 시작을 위해 플래그 리셋
                  isClassifyingRef.current = false;
                  // 아직 남은 메일이 있으면 다음 배치 시작 (토스트 없이)
                  checkAndStartClassification();
                } else {
                  // 모든 분류 완료
                  toast(`AI 분류 완료: 총 ${cumulativeSuccessRef.current}개 분류됨`, 'success');
                  cumulativeSuccessRef.current = 0; // 리셋
                  isClassifyingRef.current = false;
                  setIsClassifying(false);
                  setClassificationId(null);
                }
              }, 1000);
            } else if (status.state === 'cancelled') {
              // 취소됨 - 이미 handleStopClassification에서 처리
              cumulativeSuccessRef.current = 0; // 리셋
              isClassifyingRef.current = false;
              setIsClassifying(false);
              setClassificationId(null);
            } else {
              toast('AI 분류에 실패했습니다.', 'error');
              cumulativeSuccessRef.current = 0; // 리셋
              isClassifyingRef.current = false;
              setIsClassifying(false);
              setClassificationId(null);
            }
            return;
          }

          // 아직 진행 중이면 다음 폴링 예약
          if (isPollingRef.current) {
            classificationPollingRef.current = setTimeout(poll, 3000); // 3초 간격
          }
        }
      } catch (error) {
        console.error('Failed to fetch classification status:', error);
        stopClassificationPolling();
        isClassifyingRef.current = false;
        setIsClassifying(false);
        setClassificationId(null);
      }
    };

    // 첫 폴링은 1초 후 시작
    classificationPollingRef.current = setTimeout(poll, 1000);
  }, []);

  const stopClassificationPolling = useCallback(() => {
    isPollingRef.current = false;
    if (classificationPollingRef.current) {
      clearTimeout(classificationPollingRef.current);
      classificationPollingRef.current = null;
    }
  }, []);

  // 분류 상태 폴링 (classificationId가 변경되면 폴링 시작/중지)
  useEffect(() => {
    if (classificationId && isClassifying) {
      startClassificationPolling(classificationId);
    } else {
      stopClassificationPolling();
    }

    return () => {
      stopClassificationPolling();
    };
  }, [classificationId, isClassifying, startClassificationPolling, stopClassificationPolling]);

  const fetchFolders = async () => {
    try {
      const { data } = await api.get<ApiResponse<{ folders: Folder[] }>>('/folders/');
      if (data.status === 'success' && data.data) {
        setFolders(data.data.folders);
      }
    } catch (error) {
      console.error('Failed to fetch folders:', error);
    }
  };

  const fetchVirtualFolderCounts = async () => {
    try {
      const [allRes, unreadRes, starredRes, unclassifiedRes] = await Promise.all([
        api.get<ApiResponse<{ pagination: Pagination }>>('/mails/', { params: { page_size: 1 } }),
        api.get<ApiResponse<{ pagination: Pagination }>>('/mails/', { params: { page_size: 1, is_read: false } }),
        api.get<ApiResponse<{ pagination: Pagination }>>('/mails/', { params: { page_size: 1, is_starred: true } }),
        api.get<ApiResponse<{ pagination: Pagination }>>('/mails/', { params: { page_size: 1, is_classified: false } }),
      ]);

      setVirtualFolderCounts({
        all: allRes.data.data?.pagination?.total_count || 0,
        unread: unreadRes.data.data?.pagination?.total_count || 0,
        starred: starredRes.data.data?.pagination?.total_count || 0,
        unclassified: unclassifiedRes.data.data?.pagination?.total_count || 0,
      });
    } catch (error) {
      console.error('Failed to fetch virtual folder counts:', error);
    }
  };

  const fetchMails = async (page: number = 1) => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, page_size: 20 };

      if (selectedFolderId) {
        params.folder_id = selectedFolderId;
      } else if (selectedVirtualFolder) {
        switch (selectedVirtualFolder) {
          case 'unread':
            params.is_read = false;
            break;
          case 'starred':
            params.is_starred = true;
            break;
          case 'unclassified':
            params.is_classified = false;
            break;
        }
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const { data } = await api.get<ApiResponse<{
        mails: MailListItem[];
        pagination: Pagination;
      }>>('/mails/', { params });

      if (data.status === 'success' && data.data) {
        setMails(data.data.mails);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch mails:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMailDetail = async (mailId: number) => {
    try {
      const { data } = await api.get<ApiResponse<Mail>>(`/mails/${mailId}/`);
      if (data.status === 'success' && data.data) {
        setSelectedMail(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch mail detail:', error);
    }
  };

  const checkAndStartClassification = async () => {
    // 이미 분류 중이면 스킵 (ref로 즉시 체크)
    if (isClassifyingRef.current) return;

    try {
      // 미분류 메일 수 확인
      const { data } = await api.get<ApiResponse<{ pagination: Pagination }>>('/mails/', {
        params: { page_size: 1, is_classified: false }
      });
      if (data.status === 'success' && data.data?.pagination) {
        const unclassifiedCount = data.data.pagination.total_count;
        setTotalUnclassified(unclassifiedCount);

        if (unclassifiedCount > 0) {
          classifyUnclassifiedMails(unclassifiedCount);
        }
      }
    } catch (error) {
      console.error('Failed to check unclassified count:', error);
    }
  };

  const classifyUnclassifiedMails = async (unclassifiedCount?: number) => {
    // 이미 분류 중이면 스킵 (ref로 즉시 체크)
    if (isClassifyingRef.current) return;

    // 즉시 ref를 true로 설정하여 중복 호출 방지
    isClassifyingRef.current = true;

    try {
      const { data } = await api.post<ApiResponse<{ classification_id: string; mail_count: number }>>('/classification/classify-unclassified/');
      if (data.status === 'success' && data.data) {
        setClassificationId(data.data.classification_id);
        setIsClassifying(true);
        if (unclassifiedCount) {
          setTotalUnclassified(unclassifiedCount);
        }
        toast(`${data.data.mail_count}개 메일을 AI로 분류 중...`, 'info');
      } else {
        // 성공이 아니면 ref 원복
        isClassifyingRef.current = false;
      }
    } catch (error: any) {
      // 에러 시 ref 원복
      isClassifyingRef.current = false;
      // 분류할 메일이 없는 경우는 에러가 아님
      if (error.response?.data?.code === 'NO_UNCLASSIFIED_MAILS' || error.response?.data?.message?.includes('분류할')) {
        setIsClassifying(false);
        setClassificationId(null);
        return;
      }
      console.error('Failed to classify mails:', error);
      toast('AI 분류 시작에 실패했습니다.', 'error');
    }
  };

  const fetchSyncStatus = async () => {
    try {
      const { data } = await api.get<ApiResponse<SyncStatus>>('/sync/status/');
      if (data.status === 'success' && data.data) {
        const prevState = syncStatus?.state;
        setSyncStatus(data.data);

        if (prevState === 'in_progress' && data.data.state === 'completed') {
          toast('동기화가 완료되었습니다.', 'success');
          fetchMails();
          fetchFolders();
          fetchVirtualFolderCounts();
          // 동기화 완료 시 수동 중단 플래그 리셋 (새 메일 자동 분류 허용)
          manuallyStoppedRef.current = false;
          // 동기화 완료 후 자동으로 미분류 메일 분류
          classifyUnclassifiedMails();
        } else if (prevState === 'in_progress' && data.data.state === 'failed') {
          toast('동기화에 실패했습니다.', 'error');
        }
      }
    } catch (error) {
      console.error('Failed to fetch sync status:', error);
    }
  };

  const handleSync = async () => {
    try {
      await api.post('/sync/start/');
      toast('동기화를 시작합니다.', 'info');
      fetchSyncStatus();
    } catch (error) {
      console.error('Failed to start sync:', error);
      toast('동기화 시작에 실패했습니다.', 'error');
    }
  };

  const handleStopSync = async () => {
    try {
      await api.post('/sync/stop/');
      toast('동기화가 중단되었습니다.', 'info');
      fetchSyncStatus();
      setIsSyncDetailOpen(false);
    } catch (error) {
      console.error('Failed to stop sync:', error);
      toast('동기화 중단에 실패했습니다.', 'error');
    }
  };

  const handleStopClassification = async () => {
    if (!classificationId) return;

    try {
      await api.post(`/classification/${classificationId}/stop/`);
      toast('AI 분류가 중단되었습니다.', 'info');

      // 수동 중단 플래그 설정 (자동 재시작 방지)
      manuallyStoppedRef.current = true;

      // 폴링 중지 및 상태 초기화
      stopClassificationPolling();
      isClassifyingRef.current = false;
      setIsClassifying(false);
      setClassificationId(null);
      setIsClassificationDetailOpen(false);
      cumulativeSuccessRef.current = 0; // 누적 카운트 리셋

      // 현재까지 분류된 결과 반영
      fetchMails();
      fetchFolders();
      fetchVirtualFolderCounts();
    } catch (error) {
      console.error('Failed to stop classification:', error);
      toast('AI 분류 중단에 실패했습니다.', 'error');
    }
  };

  const handleSelectMail = (mailId: number) => {
    setSelectedMailId(mailId);
    fetchMailDetail(mailId);
  };

  const handlePageChange = (page: number) => {
    fetchMails(page);
  };

  const handleSearchSubmit = () => {
    fetchMails(1);
  };

  const handleToggleStar = async () => {
    if (!selectedMail) return;
    try {
      await api.patch(`/mails/${selectedMail.id}/`, {
        is_starred: !selectedMail.is_starred,
      });
      fetchMailDetail(selectedMail.id);
      fetchMails();
      fetchVirtualFolderCounts();
    } catch (error) {
      console.error('Failed to toggle star:', error);
      toast('별표 변경에 실패했습니다.', 'error');
    }
  };

  const handleOpenMoveModal = () => {
    setIsMoveModalOpen(true);
  };

  const handleMove = async (folderId: number) => {
    if (!selectedMail) return;
    try {
      await api.post(`/mails/${selectedMail.id}/move/`, {
        folder_id: folderId,
      });
      toast('메일이 이동되었습니다.', 'success');
      fetchMailDetail(selectedMail.id);
      fetchMails();
      fetchFolders();
      fetchVirtualFolderCounts();
      setIsMoveModalOpen(false);
    } catch (error) {
      console.error('Failed to move mail:', error);
      toast('메일 이동에 실패했습니다.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selectedMail) return;
    if (!confirm('이 메일을 삭제하시겠습니까?')) return;
    try {
      await api.delete(`/mails/${selectedMail.id}/`);
      toast('메일이 삭제되었습니다.', 'success');
      setSelectedMail(null);
      setSelectedMailId(null);
      fetchMails();
      fetchFolders();
      fetchVirtualFolderCounts();
    } catch (error) {
      console.error('Failed to delete mail:', error);
      toast('메일 삭제에 실패했습니다.', 'error');
    }
  };

  const handleBulkMove = async (ids: number[]) => {
    setIsBulkMoveModalOpen(true);
  };

  const handleBulkMoveConfirm = async (folderId: number) => {
    try {
      await api.post('/mails/bulk-move/', {
        mail_ids: selectedMailIds,
        folder_id: folderId,
      });
      toast(`${selectedMailIds.length}개 메일이 이동되었습니다.`, 'success');
      clearSelection();
      fetchMails();
      fetchFolders();
      fetchVirtualFolderCounts();
      setIsBulkMoveModalOpen(false);
    } catch (error) {
      console.error('Failed to bulk move mails:', error);
      toast('메일 이동에 실패했습니다.', 'error');
    }
  };

  const handleBulkDelete = async (ids: number[]) => {
    if (!confirm(`${ids.length}개의 메일을 삭제하시겠습니까?`)) return;
    try {
      await Promise.all(ids.map((id) => api.delete(`/mails/${id}/`)));
      toast(`${ids.length}개 메일이 삭제되었습니다.`, 'success');
      clearSelection();
      if (selectedMailId && ids.includes(selectedMailId)) {
        setSelectedMail(null);
        setSelectedMailId(null);
      }
      fetchMails();
      fetchFolders();
      fetchVirtualFolderCounts();
    } catch (error) {
      console.error('Failed to bulk delete mails:', error);
      toast('메일 삭제에 실패했습니다.', 'error');
    }
  };

  const handleBulkMarkRead = async (ids: number[]) => {
    try {
      await api.post('/mails/bulk-update/', {
        mail_ids: ids,
        is_read: true,
      });
      toast(`${ids.length}개 메일을 읽음 처리했습니다.`, 'success');
      clearSelection();
      fetchMails();
      fetchVirtualFolderCounts();
    } catch (error) {
      console.error('Failed to mark mails as read:', error);
      toast('읽음 처리에 실패했습니다.', 'error');
    }
  };

  const handleBulkMarkUnread = async (ids: number[]) => {
    try {
      await api.post('/mails/bulk-update/', {
        mail_ids: ids,
        is_read: false,
      });
      toast(`${ids.length}개 메일을 안읽음 처리했습니다.`, 'success');
      clearSelection();
      fetchMails();
      fetchVirtualFolderCounts();
    } catch (error) {
      console.error('Failed to mark mails as unread:', error);
      toast('안읽음 처리에 실패했습니다.', 'error');
    }
  };

  const handleCreateFolder = async (name: string, parentId?: number) => {
    try {
      await api.post('/folders/', { name, parent_id: parentId });
      toast('폴더가 생성되었습니다.', 'success');
      fetchFolders();
    } catch (error) {
      console.error('Failed to create folder:', error);
      toast('폴더 생성에 실패했습니다.', 'error');
    }
  };

  const handleRenameFolder = async (id: number, name: string) => {
    try {
      await api.patch(`/folders/${id}/`, { name });
      toast('폴더 이름이 변경되었습니다.', 'success');
      fetchFolders();
    } catch (error) {
      console.error('Failed to rename folder:', error);
      toast('폴더 이름 변경에 실패했습니다.', 'error');
    }
  };

  const handleDeleteFolder = async (id: number) => {
    try {
      await api.delete(`/folders/${id}/`);
      toast('폴더가 삭제되었습니다.', 'success');
      fetchFolders();
      fetchMails();
      fetchVirtualFolderCounts();
    } catch (error) {
      console.error('Failed to delete folder:', error);
      toast('폴더 삭제에 실패했습니다.', 'error');
    }
  };

  const handleDownloadAttachment = async (attachmentId: string) => {
    if (!selectedMail) return;
    try {
      const response = await api.get(`/mails/${selectedMail.id}/attachments/${attachmentId}/`, {
        responseType: 'blob',
      });

      const attachment = selectedMail.attachments.find((a) => a.id === attachmentId);
      const filename = attachment?.name || 'attachment';

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download attachment:', error);
      toast('첨부파일 다운로드에 실패했습니다.', 'error');
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        onSync={handleSync}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSyncing={syncStatus?.state === 'in_progress'}
        showMenuButton={true}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* 사이드바 (리사이즈 가능) */}
        <div
          className={`${isSidebarOpen ? 'block' : 'hidden'} md:block absolute md:relative z-40 h-full flex-shrink-0`}
          style={{ width: sidebarWidth }}
        >
          <Sidebar
            folders={folders}
            virtualFolderCounts={virtualFolderCounts}
            onCreateFolder={handleCreateFolder}
            onRenameFolder={handleRenameFolder}
            onDeleteFolder={handleDeleteFolder}
          />
        </div>

        {/* 사이드바 리사이즈 핸들 */}
        <ResizeHandle
          onResize={handleSidebarResize}
          direction="horizontal"
          className="hidden md:block"
        />

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className="flex-1 flex overflow-hidden">
          {/* 메일 목록 (리사이즈 가능) */}
          <div
            className="border-r border-gray-200 overflow-hidden flex-shrink-0 w-full md:w-auto"
            style={{ minWidth: 280, maxWidth: 600, width: mailListWidth }}
          >
            <MailList
              mails={mails}
              selectedMailId={selectedMailId}
              selectedMailIds={selectedMailIds}
              pagination={pagination}
              isLoading={isLoading}
              onSelectMail={handleSelectMail}
              onPageChange={handlePageChange}
              onToggleSelection={toggleMailSelection}
              onSelectAll={selectAllMails}
              onClearSelection={clearSelection}
              onBulkDelete={handleBulkDelete}
              onBulkMove={handleBulkMove}
              onBulkMarkRead={handleBulkMarkRead}
              onBulkMarkUnread={handleBulkMarkUnread}
            />
          </div>

          {/* 메일 목록 리사이즈 핸들 */}
          <ResizeHandle
            onResize={handleMailListResize}
            direction="horizontal"
            className="hidden md:block"
          />

          {/* 메일 상세 */}
          <div className="hidden md:block flex-1 overflow-hidden">
            <MailDetail
              mail={selectedMail}
              onToggleStar={handleToggleStar}
              onMove={handleOpenMoveModal}
              onDelete={handleDelete}
              onDownloadAttachment={handleDownloadAttachment}
            />
          </div>
        </div>
      </div>

      <StatusBar
        syncStatus={syncStatus}
        totalMailCount={pagination?.total_count}
        lastSyncAt={user?.last_sync_at}
        onShowSyncDetail={() => setIsSyncDetailOpen(true)}
        onShowClassificationDetail={() => setIsClassificationDetailOpen(true)}
        isClassifying={isClassifying}
        classificationStatus={classificationStatus}
        totalUnclassified={totalUnclassified}
      />

      <FolderSelectModal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        onSelect={handleMove}
        folders={folders}
        currentFolderId={selectedMail?.folder?.id}
        title="메일 이동"
      />

      <FolderSelectModal
        isOpen={isBulkMoveModalOpen}
        onClose={() => setIsBulkMoveModalOpen(false)}
        onSelect={handleBulkMoveConfirm}
        folders={folders}
        title={`${selectedMailIds.length}개 메일 이동`}
      />

      <SyncProgress
        isOpen={isSyncDetailOpen}
        syncStatus={syncStatus}
        onClose={() => setIsSyncDetailOpen(false)}
        onStop={handleStopSync}
        totalMailCount={pagination?.total_count}
        lastSyncAt={user?.last_sync_at}
      />

      <ClassificationProgress
        isOpen={isClassificationDetailOpen}
        onClose={() => setIsClassificationDetailOpen(false)}
        onStop={isClassifying ? handleStopClassification : undefined}
        onStart={!isClassifying ? () => classifyUnclassifiedMails(totalUnclassified) : undefined}
        isClassifying={isClassifying}
        classificationStatus={classificationStatus}
        totalUnclassified={totalUnclassified}
      />

      <ToastContainer />
    </div>
  );
}
