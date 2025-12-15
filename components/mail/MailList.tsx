'use client';

import { MailListItem as MailListItemType, Pagination as PaginationType } from '@/types';
import { MailListItem } from './MailListItem';
import { Pagination, SkeletonMailList, Checkbox, Button } from '@/components/ui';
import { Trash2, FolderInput, MailOpen, Mail } from 'lucide-react';

interface MailListProps {
  mails: MailListItemType[];
  selectedMailId?: number | null;
  selectedMailIds?: number[];
  pagination?: PaginationType | null;
  isLoading?: boolean;
  onSelectMail?: (id: number) => void;
  onPageChange?: (page: number) => void;
  onToggleSelection?: (id: number) => void;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  onBulkDelete?: (ids: number[]) => void;
  onBulkMove?: (ids: number[]) => void;
  onBulkMarkRead?: (ids: number[]) => void;
  onBulkMarkUnread?: (ids: number[]) => void;
}

export function MailList({
  mails,
  selectedMailId,
  selectedMailIds = [],
  pagination,
  isLoading,
  onSelectMail,
  onPageChange,
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  onBulkDelete,
  onBulkMove,
  onBulkMarkRead,
  onBulkMarkUnread,
}: MailListProps) {
  const hasSelection = selectedMailIds.length > 0;
  const allSelected = mails.length > 0 && selectedMailIds.length === mails.length;
  const someSelected = selectedMailIds.length > 0 && selectedMailIds.length < mails.length;

  const handleSelectAllChange = (checked: boolean) => {
    if (checked) {
      onSelectAll?.();
    } else {
      onClearSelection?.();
    }
  };

  if (isLoading) {
    return <SkeletonMailList />;
  }

  if (mails.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        메일이 없습니다
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected}
            onChange={handleSelectAllChange}
          />
          <span className="text-xs text-gray-600">
            {hasSelection
              ? `${selectedMailIds.length}개 선택`
              : '전체 선택'
            }
          </span>
        </div>

        {hasSelection && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onBulkMarkRead?.(selectedMailIds)}
              title="읽음으로 표시"
              className="p-1.5"
            >
              <MailOpen size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onBulkMarkUnread?.(selectedMailIds)}
              title="안읽음으로 표시"
              className="p-1.5"
            >
              <Mail size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onBulkMove?.(selectedMailIds)}
              title="이동"
              className="p-1.5"
            >
              <FolderInput size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onBulkDelete?.(selectedMailIds)}
              title="삭제"
              className="p-1.5 text-red-600 hover:bg-red-50"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {mails.map((mail) => (
          <MailListItem
            key={mail.id}
            mail={mail}
            isSelected={selectedMailId === mail.id}
            isChecked={selectedMailIds.includes(mail.id)}
            showCheckbox={true}
            onClick={() => onSelectMail?.(mail.id)}
            onCheckChange={() => onToggleSelection?.(mail.id)}
          />
        ))}
      </div>

      {pagination && onPageChange && (
        <Pagination pagination={pagination} onPageChange={onPageChange} />
      )}
    </div>
  );
}
