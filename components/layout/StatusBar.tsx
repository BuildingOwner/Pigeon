'use client';

import { SyncStatus, ClassificationStatus } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import { CheckCircle, AlertCircle, Loader2, ChevronUp, Sparkles } from 'lucide-react';
import { ProgressBar } from '@/components/ui';

interface StatusBarProps {
  syncStatus?: SyncStatus | null;
  totalMailCount?: number;
  lastSyncAt?: string | null;
  onShowSyncDetail?: () => void;
  onShowClassificationDetail?: () => void;
  isClassifying?: boolean;
  classificationStatus?: ClassificationStatus | null;
  totalUnclassified?: number;
}

export function StatusBar({
  syncStatus,
  totalMailCount,
  lastSyncAt,
  onShowSyncDetail,
  onShowClassificationDetail,
  isClassifying,
  classificationStatus,
  totalUnclassified = 0,
}: StatusBarProps) {
  const renderSyncStatus = () => {
    if (!syncStatus) {
      return (
        <button
          onClick={onShowSyncDetail}
          className="flex items-center space-x-2 hover:bg-gray-100 rounded-md px-2 py-1 -ml-2 transition-colors"
        >
          <CheckCircle size={16} className="text-green-600" />
          <span className="text-sm text-gray-700">동기화 완료</span>
          <ChevronUp size={14} className="text-gray-400" />
        </button>
      );
    }

    if (syncStatus.state === 'in_progress') {
      return (
        <button
          onClick={onShowSyncDetail}
          className="flex items-center space-x-3 hover:bg-gray-100 rounded-md px-2 py-1 -ml-2 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Loader2 size={16} className="animate-spin text-primary-600" />
            <span className="text-sm text-gray-700">
              동기화 중... {syncStatus.progress.percentage}%
            </span>
          </div>
          <div className="w-24">
            <ProgressBar value={syncStatus.progress.percentage} size="sm" />
          </div>
          <ChevronUp size={14} className="text-gray-400" />
        </button>
      );
    }

    if (syncStatus.state === 'failed') {
      return (
        <button
          onClick={onShowSyncDetail}
          className="flex items-center space-x-2 hover:bg-gray-100 rounded-md px-2 py-1 -ml-2 transition-colors"
        >
          <AlertCircle size={16} className="text-red-600" />
          <span className="text-sm text-red-700">동기화 실패</span>
          <ChevronUp size={14} className="text-gray-400" />
        </button>
      );
    }

    // completed 상태
    return (
      <button
        onClick={onShowSyncDetail}
        className="flex items-center space-x-2 hover:bg-gray-100 rounded-md px-2 py-1 -ml-2 transition-colors"
      >
        <CheckCircle size={16} className="text-green-600" />
        <span className="text-sm text-gray-700">동기화 완료</span>
        <ChevronUp size={14} className="text-gray-400" />
      </button>
    );
  };

  const renderClassificationStatus = () => {
    const processed = classificationStatus?.summary?.success ?? 0;
    const failed = classificationStatus?.summary?.failed ?? 0;
    const totalProcessed = processed + failed;

    // 전체 진행률 계산 (totalUnclassified 기준)
    const overallProgress = totalUnclassified > 0
      ? Math.round((totalProcessed / totalUnclassified) * 100)
      : 0;

    // 분류 진행 중
    if (isClassifying) {
      return (
        <button
          onClick={onShowClassificationDetail}
          className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200 hover:bg-gray-100 rounded-md px-2 py-1 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Sparkles size={16} className="animate-pulse text-purple-600" />
            <span className="text-sm text-gray-700">
              AI 분류 중... {totalProcessed > 0 ? `${totalProcessed}개 완료` : ''}
            </span>
          </div>
          {totalUnclassified > 0 && (
            <>
              <div className="w-20">
                <ProgressBar value={overallProgress} size="sm" color="purple" />
              </div>
              <span className="text-xs text-gray-500">
                {totalUnclassified - totalProcessed}개 남음
              </span>
            </>
          )}
          <ChevronUp size={14} className="text-gray-400" />
        </button>
      );
    }

    // 분류 중이 아닐 때 - 미분류 메일 있으면 표시
    if (totalUnclassified > 0) {
      return (
        <button
          onClick={onShowClassificationDetail}
          className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-200 hover:bg-gray-100 rounded-md px-2 py-1 transition-colors"
        >
          <AlertCircle size={16} className="text-amber-500" />
          <span className="text-sm text-gray-700">
            미분류 {totalUnclassified}개
          </span>
          <ChevronUp size={14} className="text-gray-400" />
        </button>
      );
    }

    // 모두 분류됨
    return (
      <button
        onClick={onShowClassificationDetail}
        className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-200 hover:bg-gray-100 rounded-md px-2 py-1 transition-colors"
      >
        <Sparkles size={16} className="text-purple-600" />
        <span className="text-sm text-gray-700">분류 완료</span>
        <ChevronUp size={14} className="text-gray-400" />
      </button>
    );
  };

  return (
    <div className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between text-sm">
      <div className="flex items-center space-x-4">
        {renderSyncStatus()}
        {renderClassificationStatus()}
      </div>

      <div className="flex items-center space-x-4 text-gray-600">
        {totalMailCount !== undefined && (
          <span>총 {totalMailCount.toLocaleString()}개 메일</span>
        )}
        {lastSyncAt && (
          <span>마지막 확인: {formatRelativeTime(lastSyncAt)}</span>
        )}
      </div>
    </div>
  );
}
