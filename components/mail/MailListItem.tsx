'use client';

import { MailListItem as MailListItemType } from '@/types';
import { Star, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';
import { Checkbox } from '@/components/ui';

interface MailListItemProps {
  mail: MailListItemType;
  isSelected?: boolean;
  isChecked?: boolean;
  showCheckbox?: boolean;
  onClick?: () => void;
  onCheckChange?: (checked: boolean) => void;
}

export function MailListItem({
  mail,
  isSelected,
  isChecked = false,
  showCheckbox = false,
  onClick,
  onCheckChange,
}: MailListItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'p-4 border-b border-gray-200 cursor-pointer transition-colors',
        isSelected ? 'bg-primary-50' : 'hover:bg-gray-50',
        !mail.is_read && 'bg-blue-50 hover:bg-blue-100',
        isChecked && 'bg-primary-50'
      )}
    >
      <div className="flex items-start space-x-3">
        {showCheckbox && (
          <div className="flex-shrink-0 mt-1">
            <Checkbox
              checked={isChecked}
              onChange={(checked) => onCheckChange?.(checked)}
            />
          </div>
        )}
        <div className="flex-shrink-0 mt-1">
          {mail.is_starred ? (
            <Star size={16} className="text-yellow-500 fill-yellow-500" />
          ) : (
            <Star size={16} className="text-gray-300" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3
              className={cn(
                'text-sm truncate',
                !mail.is_read ? 'font-semibold text-gray-900' : 'font-normal text-gray-700'
              )}
            >
              {mail.subject || '(제목 없음)'}
            </h3>
            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
              {formatRelativeTime(mail.received_at)}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-1">{mail.sender}</p>

          <p className="text-sm text-gray-500 truncate">{mail.snippet}</p>

          <div className="flex items-center space-x-2 mt-2">
            {mail.has_attachments && (
              <div className="flex items-center text-xs text-gray-500">
                <Paperclip size={12} className="mr-1" />
                첨부파일
              </div>
            )}
            {mail.folder && (
              <div className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                {mail.folder.name}
              </div>
            )}
            {!mail.is_classified && (
              <div className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">
                미분류
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
