import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { Pagination as PaginationType } from '@/types';

interface PaginationProps {
  pagination: PaginationType;
  onPageChange: (page: number) => void;
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, total_pages, has_prev, has_next, total_count, page_size } = pagination;

  const start = (page - 1) * page_size + 1;
  const end = Math.min(page * page_size, total_count);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
      <div className="text-sm text-gray-700">
        {start}-{end} / {total_count}개
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!has_prev}
        >
          <ChevronLeft size={16} />
          이전
        </Button>
        <span className="text-sm text-gray-700">
          {page} / {total_pages}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!has_next}
        >
          다음
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
