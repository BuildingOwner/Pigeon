import { create } from 'zustand';
import { SyncStatus } from '@/types';

interface SyncStore {
  status: SyncStatus | null;
  isPolling: boolean;

  setStatus: (status: SyncStatus | null) => void;
  setPolling: (isPolling: boolean) => void;
}

export const useSyncStore = create<SyncStore>((set) => ({
  status: null,
  isPolling: false,

  setStatus: (status) => set({ status }),

  setPolling: (isPolling) => set({ isPolling }),
}));
