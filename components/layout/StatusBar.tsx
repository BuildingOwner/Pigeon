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
          className="flex items-center gap-1 hover:bg-gray-100 rounded px-1.5 py-0.5 transition-colors"
        >
          <CheckCircle size={14} className="text-green-600" />
          <span className="text-gray-700 hidden sm:inline">동기화 완료</span>
          <ChevronUp size={12} className="text-gray-400" />
        </button>
      );
    }

    if (syncStatus.state === 'in_progress') {
      return (
        <button
          onClick={onShowSyncDetail}
          className="flex items-center gap-1.5 hover:bg-gray-100 rounded px-1.5 py-0.5 transition-colors"
        >
          <Loader2 size={14} className="animate-spin text-primary-600" />
          <span className="text-gray-700">
            {syncStatus.progress.percentage}%
          </span>
          <div className="w-16 hidden sm:block">
            <ProgressBar value={syncStatus.progress.percentage} size="sm" />
          </div>
          <ChevronUp size={12} className="text-gray-400" />
        </button>
      );
    }

    if (syncStatus.state === 'failed') {
      return (
        <button
          onClick={onShowSyncDetail}
          className="flex items-center gap-1 hover:bg-gray-100 rounded px-1.5 py-0.5 transition-colors"
        >
          <AlertCircle size={14} className="text-red-600" />
          <span className="text-red-700 hidden sm:inline">실패</span>
          <ChevronUp size={12} className="text-gray-400" />
        </button>
      );
    }

    // completed 상태
    return (
      <button
        onClick={onShowSyncDetail}
        className="flex items-center gap-1 hover:bg-gray-100 rounded px-1.5 py-0.5 transition-colors"
      >
        <CheckCircle size={14} className="text-green-600" />
        <span className="text-gray-700 hidden sm:inline">동기화 완료</span>
        <ChevronUp size={12} className="text-gray-400" />
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
          className="flex items-center gap-1.5 ml-2 pl-2 border-l border-gray-200 hover:bg-gray-100 rounded px-1.5 py-0.5 transition-colors"
        >
          <Sparkles size={14} className="animate-pulse text-purple-600" />
          <span className="text-gray-700">
            <span className="hidden sm:inline">분류 </span>{overallProgress}%
          </span>
          <div className="w-12 hidden sm:block">
            <ProgressBar value={overallProgress} size="sm" color="purple" />
          </div>
          <ChevronUp size={12} className="text-gray-400" />
        </button>
      );
    }

    // 분류 중이 아닐 때 - 미분류 메일 있으면 표시
    if (totalUnclassified > 0) {
      return (
        <button
          onClick={onShowClassificationDetail}
          className="flex items-center gap-1 ml-2 pl-2 border-l border-gray-200 hover:bg-gray-100 rounded px-1.5 py-0.5 transition-colors"
        >
          <AlertCircle size={14} className="text-amber-500" />
          <span className="text-gray-700">
            <span className="hidden sm:inline">미분류 </span>{totalUnclassified}
          </span>
          <ChevronUp size={12} className="text-gray-400" />
        </button>
      );
    }

    // 모두 분류됨
    return (
      <button
        onClick={onShowClassificationDetail}
        className="flex items-center gap-1 ml-2 pl-2 border-l border-gray-200 hover:bg-gray-100 rounded px-1.5 py-0.5 transition-colors"
      >
        <Sparkles size={14} className="text-purple-600" />
        <span className="text-gray-700 hidden sm:inline">분류 완료</span>
        <ChevronUp size={12} className="text-gray-400" />
      </button>
    );
  };

  return (
    <div className="bg-white border-t border-gray-200 px-3 md:px-6 py-1.5 flex items-center justify-between text-xs md:text-sm gap-2 overflow-x-auto">
      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        {renderSyncStatus()}
        {renderClassificationStatus()}
      </div>

      <div className="flex items-center gap-2 md:gap-4 text-gray-600 flex-shrink-0">
        {totalMailCount !== undefined && (
          <span className="whitespace-nowrap">{totalMailCount.toLocaleString()}개</span>
        )}
        {lastSyncAt && (
          <span className="whitespace-nowrap hidden sm:inline">{formatRelativeTime(lastSyncAt)}</span>
        )}
      </div>
    </div>
  );
}
