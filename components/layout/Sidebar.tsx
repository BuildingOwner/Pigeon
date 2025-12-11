'use client';

import { Folder, VirtualFolderType } from '@/types';
import { useFolderStore } from '@/stores';
import { Inbox, Mail, Star, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface SidebarProps {
  folders: Folder[];
  virtualFolderCounts?: {
    all: number;
    unread: number;
    starred: number;
    unclassified: number;
  };
}

export function Sidebar({ folders, virtualFolderCounts }: SidebarProps) {
  const { selectedFolderId, selectedVirtualFolder, selectFolder, selectVirtualFolder } = useFolderStore();
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());

  const toggleFolder = (folderId: number) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const virtualFolders: Array<{ type: VirtualFolderType; label: string; icon: React.ReactNode; count?: number }> = [
    { type: 'all', label: '전체', icon: <Inbox size={16} />, count: virtualFolderCounts?.all },
    { type: 'unread', label: '안읽음', icon: <Mail size={16} />, count: virtualFolderCounts?.unread },
    { type: 'starred', label: '별표', icon: <Star size={16} />, count: virtualFolderCounts?.starred },
    { type: 'unclassified', label: '미분류', icon: <FolderOpen size={16} />, count: virtualFolderCounts?.unclassified },
  ];

  const renderFolder = (folder: Folder, depth: number = 0) => {
    const hasChildren = folder.children && folder.children.length > 0;
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolderId === folder.id;

    return (
      <div key={folder.id}>
        <button
          onClick={() => selectFolder(folder.id)}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors',
            isSelected ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
          )}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
        >
          <div className="flex items-center space-x-2 flex-1">
            {hasChildren && (
              <span onClick={(e) => { e.stopPropagation(); toggleFolder(folder.id); }}>
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
            )}
            <FolderOpen size={16} />
            <span className="truncate">{folder.name}</span>
          </div>
          {folder.unread_count > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
              {folder.unread_count}
            </span>
          )}
        </button>
        {hasChildren && isExpanded && (
          <div>
            {folder.children!.map((child) => renderFolder(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-60 bg-gray-50 border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">가상 폴더</h3>
          <div className="space-y-1">
            {virtualFolders.map((vFolder) => (
              <button
                key={vFolder.type}
                onClick={() => selectVirtualFolder(vFolder.type)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors',
                  selectedVirtualFolder === vFolder.type
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <div className="flex items-center space-x-2">
                  {vFolder.icon}
                  <span>{vFolder.label}</span>
                </div>
                {vFolder.count !== undefined && vFolder.count > 0 && (
                  <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                    {vFolder.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">내 폴더</h3>
          <div className="space-y-1">
            {folders.map((folder) => renderFolder(folder))}
          </div>
        </div>
      </div>
    </aside>
  );
}
