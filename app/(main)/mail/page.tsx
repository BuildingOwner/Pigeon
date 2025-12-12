'use client';

import { useEffect, useState, useCallback } from 'react';
import { Header, Sidebar, StatusBar } from '@/components/layout';
import { MailList, MailDetail, FolderSelectModal } from '@/components/mail';
import { SyncProgress } from '@/components/sync';
import { ToastContainer, toast } from '@/components/ui';
import { useAuthStore, useFolderStore, useMailStore, useSyncStore } from '@/stores';
import api from '@/lib/api';
import { ApiResponse, Folder, MailListItem, Mail, Pagination, SyncStatus, VirtualFolderCounts } from '@/types';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [virtualFolderCounts, setVirtualFolderCounts] = useState<VirtualFolderCounts>({
    all: 0,
    unread: 0,
    starred: 0,
    unclassified: 0,
  });

  useEffect(() => {
    fetchFolders();
    fetchMails();
    fetchSyncStatus();
    fetchVirtualFolderCounts();
  }, []);

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
        <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block absolute md:relative z-40 h-full`}>
          <Sidebar
            folders={folders}
            virtualFolderCounts={virtualFolderCounts}
            onCreateFolder={handleCreateFolder}
            onRenameFolder={handleRenameFolder}
            onDeleteFolder={handleDeleteFolder}
          />
        </div>

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className="flex-1 flex overflow-hidden">
          <div className="w-full md:w-96 border-r border-gray-200 overflow-hidden">
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
      />

      <ToastContainer />
    </div>
  );
}
