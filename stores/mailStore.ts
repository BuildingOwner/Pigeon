import { create } from 'zustand';
import { Mail, MailListItem, Pagination } from '@/types';

interface MailStore {
  mails: MailListItem[];
  selectedMail: Mail | null;
  selectedMailIds: number[];
  pagination: Pagination | null;
  searchQuery: string;
  isLoading: boolean;

  setMails: (mails: MailListItem[]) => void;
  setSelectedMail: (mail: Mail | null) => void;
  setPagination: (pagination: Pagination) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (isLoading: boolean) => void;

  selectMail: (id: number) => void;
  toggleMailSelection: (id: number) => void;
  selectAllMails: () => void;
  clearSelection: () => void;
}

export const useMailStore = create<MailStore>((set, get) => ({
  mails: [],
  selectedMail: null,
  selectedMailIds: [],
  pagination: null,
  searchQuery: '',
  isLoading: false,

  setMails: (mails) => set({ mails }),

  setSelectedMail: (mail) => set({ selectedMail: mail }),

  setPagination: (pagination) => set({ pagination }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setLoading: (isLoading) => set({ isLoading }),

  selectMail: (id) => set({ selectedMailIds: [id] }),

  toggleMailSelection: (id) => {
    const { selectedMailIds } = get();
    const newSelection = selectedMailIds.includes(id)
      ? selectedMailIds.filter((mailId) => mailId !== id)
      : [...selectedMailIds, id];
    set({ selectedMailIds: newSelection });
  },

  selectAllMails: () => {
    const { mails } = get();
    set({ selectedMailIds: mails.map((mail) => mail.id) });
  },

  clearSelection: () => set({ selectedMailIds: [] }),
}));
