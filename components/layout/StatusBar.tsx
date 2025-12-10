'use client';

import type { SyncStatus } from '@/types';

interface StatusBarProps {
  syncStatus: SyncStatus;
  totalMails: number;
}

export function StatusBar({ syncStatus, totalMails }: StatusBarProps) {
  const getStatusText = () => {
    switch (syncStatus.status) {
      case 'syncing':
        return `동기화 중... ${syncStatus.progress}%`;
      case 'classifying':
        return `분류 중... ${syncStatus.processedMails}/${syncStatus.totalMails}`;
      case 'completed':
        return '✓ 동기화 완료';
      case 'error':
        return `⚠️ 오류: ${syncStatus.errorMessage}`;
      default:
        return '대기 중';
    }
  };

  const getLastSyncText = () => {
    if (!syncStatus.lastSyncAt) return '';

    const lastSync = new Date(syncStatus.lastSyncAt);
    const now = new Date();
    const diffMs = now.getTime() - lastSync.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);

    if (diffMin < 1) return '방금 전';
    if (diffMin < 60) return `${diffMin}분 전`;
    return lastSync.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <footer className="flex items-center justify-between px-4 py-2 text-xs text-gray-500 border-t border-gray-200 bg-gray-50">
      <div className="flex items-center gap-4">
        <span>{getStatusText()}</span>
        <span>|</span>
        <span>총 {totalMails}개 메일</span>
      </div>
      {syncStatus.lastSyncAt && (
        <div>
          마지막 확인: {getLastSyncText()}
        </div>
      )}
    </footer>
  );
}
