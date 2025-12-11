import { MailListItem as MailListItemType, Pagination as PaginationType } from '@/types';
import { MailListItem } from './MailListItem';
import { Pagination, SkeletonMailList } from '@/components/ui';

interface MailListProps {
  mails: MailListItemType[];
  selectedMailId?: number | null;
  pagination?: PaginationType | null;
  isLoading?: boolean;
  onSelectMail?: (id: number) => void;
  onPageChange?: (page: number) => void;
}

export function MailList({
  mails,
  selectedMailId,
  pagination,
  isLoading,
  onSelectMail,
  onPageChange,
}: MailListProps) {
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
      <div className="flex-1 overflow-y-auto">
        {mails.map((mail) => (
          <MailListItem
            key={mail.id}
            mail={mail}
            isSelected={selectedMailId === mail.id}
            onClick={() => onSelectMail?.(mail.id)}
          />
        ))}
      </div>

      {pagination && onPageChange && (
        <Pagination pagination={pagination} onPageChange={onPageChange} />
      )}
    </div>
  );
}
