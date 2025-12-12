'use client';

import { useState } from 'react';
import { Folder } from '@/types';
import { Modal, Button } from '@/components/ui';
import { FolderOpen, ChevronRight, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FolderSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (folderId: number) => void;
  folders: Folder[];
  currentFolderId?: number;
  title?: string;
}

export function FolderSelectModal({
  isOpen,
  onClose,
  onSelect,
  folders,
  currentFolderId,
  title = '폴더 선택',
}: FolderSelectModalProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());

  const toggleFolder = (folderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleSelect = () => {
    if (selectedId !== null) {
      onSelect(selectedId);
      onClose();
      setSelectedId(null);
    }
  };

  const renderFolder = (folder: Folder, depth: number = 0) => {
    const hasChildren = folder.children && folder.children.length > 0;
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedId === folder.id;
    const isCurrent = currentFolderId === folder.id;

    return (
      <div key={folder.id}>
        <button
          onClick={() => !isCurrent && setSelectedId(folder.id)}
          disabled={isCurrent}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-md transition-colors',
            isSelected && 'bg-primary-100 text-primary-700 border border-primary-300',
            isCurrent && 'bg-gray-100 text-gray-400 cursor-not-allowed',
            !isSelected && !isCurrent && 'text-gray-700 hover:bg-gray-100'
          )}
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
        >
          <div className="flex items-center space-x-2 flex-1">
            {hasChildren ? (
              <span
                onClick={(e) => toggleFolder(folder.id, e)}
                className="cursor-pointer hover:bg-gray-200 rounded p-0.5"
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
            ) : (
              <span className="w-5" />
            )}
            <FolderOpen size={16} className={isSelected ? 'text-primary-600' : ''} />
            <span className="truncate">{folder.name}</span>
            {isCurrent && (
              <span className="text-xs text-gray-400 ml-1">(현재 위치)</span>
            )}
          </div>
          {isSelected && (
            <Check size={16} className="text-primary-600" />
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

  // 모든 폴더를 평탄화 (루트 레벨만)
  const flattenFolders = (folders: Folder[]): Folder[] => {
    return folders;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-2">
          {folders.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              폴더가 없습니다
            </div>
          ) : (
            <div className="space-y-1">
              {folders.map((folder) => renderFolder(folder))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button
            onClick={handleSelect}
            disabled={selectedId === null}
          >
            이동
          </Button>
        </div>
      </div>
    </Modal>
  );
}




