export interface Pagination {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  code?: string;
  details?: unknown;
}

export interface ApiError {
  status: 'error';
  code: string;
  message: string;
  details?: unknown;
}
