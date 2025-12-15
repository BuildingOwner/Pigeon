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
    <div className="flex items-center justify-between px-3 py-1.5 border-t border-gray-200 text-xs">
      <div className="text-gray-600">
        {start}-{end} / {total_count}개
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!has_prev}
          className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-40 disabled:cursor-not-allowed"
        >
          &lt; <span className="hidden sm:inline">이전</span>
        </button>
        <span className="text-gray-600 px-1">
          {page} / {total_pages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!has_next}
          className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="hidden sm:inline">다음</span> &gt;
        </button>
      </div>
    </div>
  );
}
