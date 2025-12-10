'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { StatusBar } from '@/components/layout/StatusBar';
import { FolderTree } from '@/components/folder/FolderTree';
import { mockFolders, mockMails, mockSyncStatus } from '@/lib/mock/data';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>('folder-1-1');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <Header onSync={handleSync} isSyncing={isSyncing} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Folder Tree */}
        <aside className="w-60 border-r border-gray-200 bg-gray-50 overflow-y-auto">
          <FolderTree
            folders={mockFolders}
            selectedFolderId={selectedFolderId}
            onSelectFolder={setSelectedFolderId}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>

      <StatusBar syncStatus={mockSyncStatus} totalMails={mockMails.length} />
    </div>
  );
}
