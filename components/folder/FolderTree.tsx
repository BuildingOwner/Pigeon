'use client';

import { useState } from 'react';
import type { Folder } from '@/types';

interface FolderTreeProps {
  folders: Folder[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string) => void;
}

export function FolderTree({ folders, selectedFolderId, onSelectFolder }: FolderTreeProps) {
  return (
    <div className="py-2">
      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
        폴더
      </div>
      <ul className="space-y-0.5">
        {folders.map((folder) => (
          <FolderTreeItem
            key={folder.id}
            folder={folder}
            selectedFolderId={selectedFolderId}
            onSelectFolder={onSelectFolder}
            depth={0}
          />
        ))}
      </ul>
    </div>
  );
}

interface FolderTreeItemProps {
  folder: Folder;
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string) => void;
  depth: number;
}

function FolderTreeItem({ folder, selectedFolderId, onSelectFolder, depth }: FolderTreeItemProps) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = folder.children && folder.children.length > 0;
  const isSelected = folder.id === selectedFolderId;

  return (
    <li>
      <div
        className={`flex items-center gap-1 px-3 py-1.5 cursor-pointer transition-colors ${
          isSelected
            ? 'bg-blue-100 text-blue-700'
            : 'hover:bg-gray-100 text-gray-700'
        }`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onClick={() => onSelectFolder(folder.id)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="w-4 h-4 flex items-center justify-center text-gray-500"
          >
            {isOpen ? '▼' : '▶'}
          </button>
        ) : (
          <span className="w-4" />
        )}
        <span className="text-sm">📁</span>
        <span className="flex-1 text-sm truncate">{folder.name}</span>
        {folder.unreadCount > 0 && (
          <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
            {folder.unreadCount}
          </span>
        )}
      </div>
      {hasChildren && isOpen && (
        <ul>
          {folder.children!.map((child) => (
            <FolderTreeItem
              key={child.id}
              folder={child}
              selectedFolderId={selectedFolderId}
              onSelectFolder={onSelectFolder}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
