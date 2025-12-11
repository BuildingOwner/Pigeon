'use client';

import { SyncStatus } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface StatusBarProps {
  syncStatus?: SyncStatus | null;
  totalMailCount?: number;
  lastSyncAt?: string | null;
}

export function StatusBar({ syncStatus, totalMailCount, lastSyncAt }: StatusBarProps) {
  const renderSyncStatus = () => {
    if (!syncStatus) {
      return (
        <div className="flex items-center space-x-2">
          <CheckCircle size={16} className="text-green-600" />
          <span className="text-sm text-gray-700">동기화 완료</span>
        </div>
      );
    }

    if (syncStatus.state === 'in_progress') {
      return (
        <div className="flex items-center space-x-2">
          <Loader2 size={16} className="animate-spin text-primary-600" />
          <span className="text-sm text-gray-700">
            동기화 중... {syncStatus.progress.percentage}% ({syncStatus.progress.synced}/{syncStatus.progress.total})
          </span>
        </div>
      );
    }

    if (syncStatus.state === 'failed') {
      return (
        <div className="flex items-center space-x-2">
          <AlertCircle size={16} className="text-red-600" />
          <span className="text-sm text-red-700">동기화 실패</span>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2">
        <CheckCircle size={16} className="text-green-600" />
        <span className="text-sm text-gray-700">동기화 완료</span>
      </div>
    );
  };

  return (
    <div className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between text-sm">
      {renderSyncStatus()}

      <div className="flex items-center space-x-4 text-gray-600">
        {totalMailCount !== undefined && (
          <span>총 {totalMailCount}개 메일</span>
        )}
        {lastSyncAt && (
          <span>마지막 확인: {formatRelativeTime(lastSyncAt)}</span>
        )}
      </div>
    </div>
  );
}
