'use client';

import { SyncStatus } from '@/types';
import { Modal, Button, ProgressBar } from '@/components/ui';
import { Mail, Tag, Clock, X, CheckCircle } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

interface SyncProgressProps {
  isOpen: boolean;
  syncStatus: SyncStatus | null;
  onClose: () => void;
  onStop?: () => void;
  totalMailCount?: number;
  lastSyncAt?: string | null;
}

export function SyncProgress({ isOpen, syncStatus, onClose, onStop, totalMailCount, lastSyncAt }: SyncProgressProps) {
  // 동기화 상태가 없거나 완료/대기 상태인 경우 결과 화면 표시
  const showCompletedView = !syncStatus || syncStatus.state === 'completed' || syncStatus.state === 'idle';

  const formatTime = (seconds: number | null): string => {
    if (!seconds) return '-';
    if (seconds < 60) return `약 ${seconds}초`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) return `약 ${minutes}분`;
    return `약 ${minutes}분 ${remainingSeconds}초`;
  };

  const isInProgress = syncStatus?.state === 'in_progress';

  // 완료 상태 또는 동기화 안 한 상태일 때 결과 화면
  if (showCompletedView) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="동기화 상태" size="sm">
        <div className="space-y-6">
          <div className="flex flex-col items-center py-4">
            <CheckCircle size={48} className="text-green-500 mb-3" />
            <p className="text-lg font-medium text-gray-900">동기화 완료</p>
            {lastSyncAt && (
              <p className="text-sm text-gray-500 mt-1">
                마지막 동기화: {formatRelativeTime(lastSyncAt)}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Mail size={18} className="text-primary-600" />
                <span className="text-sm font-medium text-gray-700">총 메일 수</span>
              </div>
              <span className="text-lg font-semibold text-primary-600">
                {totalMailCount?.toLocaleString() ?? 0}개
              </span>
            </div>
          </div>

          <p className="text-xs text-center text-gray-400">
            상단의 동기화 버튼을 클릭하여 새 메일을 가져올 수 있습니다.
          </p>
        </div>
      </Modal>
    );
  }

  // 실패 상태일 때
  if (syncStatus?.state === 'failed') {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="동기화 상태" size="sm">
        <div className="space-y-6">
          <div className="flex flex-col items-center py-4">
            <X size={48} className="text-red-500 mb-3" />
            <p className="text-lg font-medium text-gray-900">동기화 실패</p>
            <p className="text-sm text-gray-500 mt-1">
              문제가 발생했습니다. 다시 시도해주세요.
            </p>
          </div>

          <p className="text-xs text-center text-gray-400">
            상단의 동기화 버튼을 클릭하여 다시 시도할 수 있습니다.
          </p>
        </div>
      </Modal>
    );
  }

  // 진행 중 상태
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="동기화 진행 상황" size="sm">
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">진행률</span>
            <span className="text-sm text-gray-500">{syncStatus?.progress.percentage ?? 0}%</span>
          </div>
          <ProgressBar
            value={syncStatus?.progress.percentage ?? 0}
            max={100}
            size="lg"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <Mail size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600">메일 동기화</span>
            </div>
            <span className="text-sm font-medium">
              {syncStatus?.progress.synced ?? 0} / {syncStatus?.progress.total ?? 0}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <Tag size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600">메일 분류</span>
            </div>
            <span className="text-sm font-medium">
              {syncStatus?.progress.classified ?? 0} / {syncStatus?.progress.total ?? 0}
            </span>
          </div>

          {isInProgress && syncStatus?.estimated_remaining && (
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-2">
                <Clock size={16} className="text-gray-500" />
                <span className="text-sm text-gray-600">예상 남은 시간</span>
              </div>
              <span className="text-sm font-medium text-primary-600">
                {formatTime(syncStatus.estimated_remaining)}
              </span>
            </div>
          )}
        </div>

        {isInProgress && onStop && (
          <div className="flex justify-center pt-2">
            <Button
              variant="secondary"
              onClick={onStop}
              className="w-full"
            >
              <X size={16} className="mr-2" />
              동기화 중단
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
