export interface Folder {
  id: number;
  name: string;
  path: string;
  depth: number;
  parent_id: number | null;
  mail_count: number;
  unread_count: number;
  order: number;
  children?: Folder[];
  created_at?: string;
  updated_at?: string;
}

export interface FolderSummary {
  id: number;
  name: string;
  path: string;
}

export type VirtualFolderType = 'all' | 'unread' | 'starred' | 'unclassified';

export interface VirtualFolderCounts {
  all: number;
  unread: number;
  starred: number;
  unclassified: number;
}
