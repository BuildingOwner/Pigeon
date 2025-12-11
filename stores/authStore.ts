import { create } from 'zustand';
import { User } from '@/types';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  login: (user: User, accessToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setAccessToken: (token) => set({ accessToken: token }),

  login: (user, accessToken) => set({
    user,
    accessToken,
    isAuthenticated: true,
  }),

  logout: () => set({
    user: null,
    accessToken: null,
    isAuthenticated: false,
  }),
}));
