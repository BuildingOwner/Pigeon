export const APP_NAME = 'Pigeon';
export const APP_DESCRIPTION = 'AI 메일 분류 시스템';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  CALLBACK: '/callback',
  MAIL: '/mail',
  MAIL_DETAIL: (id: number) => `/mail/${id}`,
} as const;

export const VIRTUAL_FOLDERS = {
  ALL: 'all',
  UNREAD: 'unread',
  STARRED: 'starred',
  UNCLASSIFIED: 'unclassified',
} as const;

export const VIRTUAL_FOLDER_LABELS = {
  all: '전체',
  unread: '안읽음',
  starred: '별표',
  unclassified: '미분류',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
