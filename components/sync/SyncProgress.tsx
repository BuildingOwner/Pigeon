'use client';

import { SyncStatus } from '@/types';
import { Modal, Button, ProgressBar } from '@/components/ui';
import { Mail, Tag, Clock, X } from 'lucide-react';

interface SyncProgressProps {
  isOpen: boolean;
  syncStatus: SyncStatus | null;
  onClose: () => void;
  onStop?: () => void;
}

export function SyncProgress({ isOpen, syncStatus, onClose, onStop }: SyncProgressProps) {
  if (!syncStatus) return null;

  const formatTime = (seconds: number | null): string => {
    if (!seconds) return '-';
    if (seconds < 60) return `약 ${seconds}초`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) return `약 ${minutes}분`;
    return `약 ${minutes}분 ${remainingSeconds}초`;
  };

  const isInProgress = syncStatus.state === 'in_progress';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="동기화 진행 상황" size="sm">
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">진행률</span>
            <span className="text-sm text-gray-500">{syncStatus.progress.percentage}%</span>
          </div>
          <ProgressBar
            value={syncStatus.progress.percentage}
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
              {syncStatus.progress.synced} / {syncStatus.progress.total}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <Tag size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600">메일 분류</span>
            </div>
            <span className="text-sm font-medium">
              {syncStatus.progress.classified} / {syncStatus.progress.total}
            </span>
          </div>

          {isInProgress && syncStatus.estimated_remaining && (
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

        {syncStatus.state === 'completed' && (
          <div className="text-center py-2">
            <p className="text-sm text-green-600 font-medium">
              동기화가 완료되었습니다.
            </p>
          </div>
        )}

        {syncStatus.state === 'failed' && (
          <div className="text-center py-2">
            <p className="text-sm text-red-600 font-medium">
              동기화에 실패했습니다. 다시 시도해주세요.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
