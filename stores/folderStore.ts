import { create } from 'zustand';
import { Folder, VirtualFolderType } from '@/types';

interface FolderStore {
  folders: Folder[];
  selectedFolderId: number | null;
  selectedVirtualFolder: VirtualFolderType | null;
  isLoading: boolean;

  setFolders: (folders: Folder[]) => void;
  selectFolder: (id: number | null) => void;
  selectVirtualFolder: (type: VirtualFolderType | null) => void;
  clearSelection: () => void;
}

export const useFolderStore = create<FolderStore>((set) => ({
  folders: [],
  selectedFolderId: null,
  selectedVirtualFolder: null,
  isLoading: false,

  setFolders: (folders) => set({ folders }),

  selectFolder: (id) => set({
    selectedFolderId: id,
    selectedVirtualFolder: null,
  }),

  selectVirtualFolder: (type) => set({
    selectedVirtualFolder: type,
    selectedFolderId: null,
  }),

  clearSelection: () => set({
    selectedFolderId: null,
    selectedVirtualFolder: null,
  }),
}));
