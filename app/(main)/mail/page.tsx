'use client';

import { useEffect, useState } from 'react';
import { Header, Sidebar, StatusBar } from '@/components/layout';
import { MailList, MailDetail } from '@/components/mail';
import { useAuthStore, useFolderStore, useMailStore, useSyncStore } from '@/stores';
import api from '@/lib/api';
import { ApiResponse, Folder, MailListItem, Mail, Pagination, SyncStatus } from '@/types';

export default function MailPage() {
  const { user } = useAuthStore();
  const { folders, setFolders, selectedFolderId, selectedVirtualFolder } = useFolderStore();
  const { mails, selectedMail, pagination, setMails, setSelectedMail, setPagination, setLoading, isLoading } = useMailStore();
  const { status: syncStatus, setStatus: setSyncStatus } = useSyncStore();

  const [selectedMailId, setSelectedMailId] = useState<number | null>(null);

  useEffect(() => {
    fetchFolders();
    fetchMails();
    fetchSyncStatus();
  }, []);

  useEffect(() => {
    fetchMails();
  }, [selectedFolderId, selectedVirtualFolder]);

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
        setSyncStatus(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch sync status:', error);
    }
  };

  const handleSync = async () => {
    try {
      await api.post('/sync/start/');
      fetchSyncStatus();
    } catch (error) {
      console.error('Failed to start sync:', error);
    }
  };

  const handleSelectMail = (mailId: number) => {
    setSelectedMailId(mailId);
    fetchMailDetail(mailId);
  };

  const handlePageChange = (page: number) => {
    fetchMails(page);
  };

  return (
    <div className="h-screen flex flex-col">
      <Header onSync={handleSync} isSyncing={syncStatus?.state === 'in_progress'} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          folders={folders}
          virtualFolderCounts={{
            all: pagination?.total_count || 0,
            unread: 0,
            starred: 0,
            unclassified: 0,
          }}
        />

        <div className="flex-1 flex overflow-hidden">
          <div className="w-96 border-r border-gray-200 overflow-hidden">
            <MailList
              mails={mails}
              selectedMailId={selectedMailId}
              pagination={pagination}
              isLoading={isLoading}
              onSelectMail={handleSelectMail}
              onPageChange={handlePageChange}
            />
          </div>

          <div className="flex-1 overflow-hidden">
            <MailDetail mail={selectedMail} />
          </div>
        </div>
      </div>

      <StatusBar
        syncStatus={syncStatus}
        totalMailCount={pagination?.total_count}
        lastSyncAt={user?.last_sync_at}
      />
    </div>
  );
}
