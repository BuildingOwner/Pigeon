'use client';

import { Folder, VirtualFolderType } from '@/types';
import { useFolderStore } from '@/stores';
import { Inbox, Mail, Star, FolderOpen, ChevronRight, ChevronDown, Plus, Edit2, Trash2, FolderPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { ContextMenu, ContextMenuItem } from '@/components/ui';

interface SidebarProps {
  folders: Folder[];
  virtualFolderCounts?: {
    all: number;
    unread: number;
    starred: number;
    unclassified: number;
  };
  onCreateFolder?: (name: string, parentId?: number) => void;
  onRenameFolder?: (id: number, name: string) => void;
  onDeleteFolder?: (id: number) => void;
}

export function Sidebar({
  folders,
  virtualFolderCounts,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
}: SidebarProps) {
  const { selectedFolderId, selectedVirtualFolder, selectFolder, selectVirtualFolder } = useFolderStore();
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    folderId: number | null;
  }>({ isOpen: false, x: 0, y: 0, folderId: null });
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<number | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');

  const toggleFolder = (folderId: number) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleContextMenu = (e: React.MouseEvent, folderId: number) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      folderId,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ isOpen: false, x: 0, y: 0, folderId: null });
  };

  const handleRename = () => {
    if (contextMenu.folderId) {
      const folder = findFolderById(folders, contextMenu.folderId);
      if (folder) {
        setEditingFolderId(contextMenu.folderId);
        setEditingFolderName(folder.name);
      }
    }
    handleCloseContextMenu();
  };

  const handleDelete = () => {
    if (contextMenu.folderId && onDeleteFolder) {
      if (confirm('이 폴더를 삭제하시겠습니까? 폴더 내 메일은 미분류로 이동됩니다.')) {
        onDeleteFolder(contextMenu.folderId);
      }
    }
    handleCloseContextMenu();
  };

  const handleAddSubfolder = () => {
    if (contextMenu.folderId) {
      toggleFolder(contextMenu.folderId);
      setIsCreatingFolder(true);
    }
    handleCloseContextMenu();
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim() && onCreateFolder) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreatingFolder(false);
    }
  };

  const handleSaveRename = () => {
    if (editingFolderId && editingFolderName.trim() && onRenameFolder) {
      onRenameFolder(editingFolderId, editingFolderName.trim());
    }
    setEditingFolderId(null);
    setEditingFolderName('');
  };

  const findFolderById = (folders: Folder[], id: number): Folder | null => {
    for (const folder of folders) {
      if (folder.id === id) return folder;
      if (folder.children) {
        const found = findFolderById(folder.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const contextMenuItems: ContextMenuItem[] = [
    {
      label: '이름 변경',
      icon: <Edit2 size={14} />,
      onClick: handleRename,
    },
    {
      label: '하위 폴더 추가',
      icon: <FolderPlus size={14} />,
      onClick: handleAddSubfolder,
    },
    {
      label: '폴더 삭제',
      icon: <Trash2 size={14} />,
      onClick: handleDelete,
      danger: true,
      divider: true,
    },
  ];

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
    const isEditing = editingFolderId === folder.id;

    return (
      <div key={folder.id}>
        <div
          onContextMenu={(e) => handleContextMenu(e, folder.id)}
          className={cn(
            'flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors cursor-pointer group',
            isSelected ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
          )}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
        >
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {hasChildren ? (
              <button onClick={() => toggleFolder(folder.id)} className="p-0.5 hover:bg-gray-200 rounded">
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            ) : (
              <span className="w-5" />
            )}
            <FolderOpen size={16} className="flex-shrink-0" />
            {isEditing ? (
              <input
                type="text"
                value={editingFolderName}
                onChange={(e) => setEditingFolderName(e.target.value)}
                onBlur={handleSaveRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveRename();
                  if (e.key === 'Escape') {
                    setEditingFolderId(null);
                    setEditingFolderName('');
                  }
                }}
                className="flex-1 px-1 py-0.5 text-sm border border-primary-400 rounded focus:outline-none"
                autoFocus
              />
            ) : (
              <button
                onClick={() => selectFolder(folder.id)}
                className="truncate text-left flex-1"
              >
                {folder.name}
              </button>
            )}
          </div>
          {folder.unread_count > 0 && !isEditing && (
            <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
              {folder.unread_count}
            </span>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div>
            {folder.children!.map((child) => renderFolder(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-60 bg-gray-50 border-r border-gray-200 overflow-y-auto flex-shrink-0">
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
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase">내 폴더</h3>
            <button
              onClick={() => setIsCreatingFolder(true)}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
              title="새 폴더"
            >
              <Plus size={14} />
            </button>
          </div>

          {isCreatingFolder && (
            <div className="flex items-center space-x-2 mb-2 px-3 py-2">
              <FolderOpen size={16} className="text-gray-400" />
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onBlur={() => {
                  if (!newFolderName.trim()) {
                    setIsCreatingFolder(false);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateFolder();
                  if (e.key === 'Escape') {
                    setIsCreatingFolder(false);
                    setNewFolderName('');
                  }
                }}
                placeholder="새 폴더 이름"
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                autoFocus
              />
            </div>
          )}

          <div className="space-y-1">
            {folders.map((folder) => renderFolder(folder))}
          </div>

          {folders.length === 0 && !isCreatingFolder && (
            <p className="text-sm text-gray-500 text-center py-4">
              폴더가 없습니다
            </p>
          )}
        </div>
      </div>

      <ContextMenu
        isOpen={contextMenu.isOpen}
        x={contextMenu.x}
        y={contextMenu.y}
        items={contextMenuItems}
        onClose={handleCloseContextMenu}
      />
    </aside>
  );
}
