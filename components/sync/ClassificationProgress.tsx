'use client';

import { ClassificationStatus } from '@/types';
import { Modal, Button, ProgressBar } from '@/components/ui';
import { Sparkles, CheckCircle, XCircle, FolderPlus, AlertCircle, StopCircle, Play } from 'lucide-react';

interface ClassificationProgressProps {
  isOpen: boolean;
  onClose: () => void;
  onStop?: () => void;
  onStart?: () => void;
  isClassifying: boolean;
  classificationStatus: ClassificationStatus | null;
  totalUnclassified: number;
}

export function ClassificationProgress({
  isOpen,
  onClose,
  onStop,
  onStart,
  isClassifying,
  classificationStatus,
  totalUnclassified,
}: ClassificationProgressProps) {
  const processed = classificationStatus?.summary?.success ?? 0;
  const failed = classificationStatus?.summary?.failed ?? 0;
  const newFolders = classificationStatus?.summary?.new_folders_created ?? 0;
  const totalProcessed = processed + failed;

  // 전체 진행률 계산
  const overallProgress = totalUnclassified > 0
    ? Math.round((totalProcessed / totalUnclassified) * 100)
    : 0;

  const remaining = totalUnclassified - totalProcessed;

  // 분류 중이 아닐 때 (완료 또는 대기 상태)
  if (!isClassifying) {
    const hasUnclassified = totalUnclassified > 0;

    return (
      <Modal isOpen={isOpen} onClose={onClose} title="AI 분류 상태" size="sm">
        <div className="space-y-6">
          <div className="flex flex-col items-center py-4">
            {hasUnclassified ? (
              <>
                <AlertCircle size={48} className="text-amber-500 mb-3" />
                <p className="text-lg font-medium text-gray-900">미분류 메일</p>
                <p className="text-sm text-gray-500 mt-1">
                  {totalUnclassified}개의 메일이 분류되지 않았습니다.
                </p>
              </>
            ) : (
              <>
                <CheckCircle size={48} className="text-green-500 mb-3" />
                <p className="text-lg font-medium text-gray-900">분류 완료</p>
                <p className="text-sm text-gray-500 mt-1">
                  모든 메일이 분류되었습니다.
                </p>
              </>
            )}
          </div>

          {classificationStatus?.summary && (classificationStatus.summary.success > 0 || classificationStatus.summary.failed > 0) && (
            <div className="space-y-3">
              {classificationStatus.summary.success > 0 && (
                <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={18} className="text-green-600" />
                    <span className="text-sm font-medium text-gray-700">성공</span>
                  </div>
                  <span className="text-lg font-semibold text-green-600">
                    {classificationStatus.summary.success}개
                  </span>
                </div>
              )}

              {classificationStatus.summary.failed > 0 && (
                <div className="flex items-center justify-between py-3 px-4 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <XCircle size={18} className="text-red-600" />
                    <span className="text-sm font-medium text-gray-700">실패</span>
                  </div>
                  <span className="text-lg font-semibold text-red-600">
                    {classificationStatus.summary.failed}개
                  </span>
                </div>
              )}

              {classificationStatus.summary.new_folders_created > 0 && (
                <div className="flex items-center justify-between py-3 px-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FolderPlus size={18} className="text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">새 폴더 생성</span>
                  </div>
                  <span className="text-lg font-semibold text-purple-600">
                    {classificationStatus.summary.new_folders_created}개
                  </span>
                </div>
              )}
            </div>
          )}

          {hasUnclassified && onStart && (
            <div className="flex justify-center pt-2">
              <Button
                variant="primary"
                onClick={onStart}
                className="w-full"
              >
                <Sparkles size={16} className="mr-2" />
                AI 분류 시작
              </Button>
            </div>
          )}
        </div>
      </Modal>
    );
  }

  // 분류 진행 중
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI 분류 진행 상황" size="sm">
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">진행률</span>
            <span className="text-sm text-gray-500">{overallProgress}%</span>
          </div>
          <ProgressBar value={overallProgress} max={100} size="lg" color="purple" />
        </div>

        <div className="flex items-center justify-center py-4">
          <Sparkles size={24} className="animate-pulse text-purple-600 mr-2" />
          <span className="text-sm text-gray-600">AI가 메일을 분석하고 있습니다...</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <CheckCircle size={16} className="text-green-500" />
              <span className="text-sm text-gray-600">분류 성공</span>
            </div>
            <span className="text-sm font-medium text-green-600">{processed}개</span>
          </div>

          {failed > 0 && (
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <XCircle size={16} className="text-red-500" />
                <span className="text-sm text-gray-600">분류 실패</span>
              </div>
              <span className="text-sm font-medium text-red-600">{failed}개</span>
            </div>
          )}

          {newFolders > 0 && (
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <FolderPlus size={16} className="text-purple-500" />
                <span className="text-sm text-gray-600">새 폴더 생성</span>
              </div>
              <span className="text-sm font-medium text-purple-600">{newFolders}개</span>
            </div>
          )}

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-2">
              <AlertCircle size={16} className="text-gray-400" />
              <span className="text-sm text-gray-600">남은 메일</span>
            </div>
            <span className="text-sm font-medium text-gray-600">{remaining}개</span>
          </div>
        </div>

        {onStop && (
          <div className="flex justify-center pt-2">
            <Button
              variant="secondary"
              onClick={onStop}
              className="w-full"
            >
              <StopCircle size={16} className="mr-2" />
              분류 중단
            </Button>
          </div>
        )}

        <p className="text-xs text-center text-gray-400">
          분류가 완료되면 자동으로 메일 목록이 업데이트됩니다.
        </p>
      </div>
    </Modal>
  );
}
