import { create } from 'zustand';
import { User } from '@/types';
import api from '@/lib/api';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  refreshAccessToken: () => Promise<boolean>;
  initialize: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setAccessToken: (token) => set({ accessToken: token }),

  login: (user, accessToken, refreshToken) => set({
    user,
    accessToken,
    refreshToken,
    isAuthenticated: true,
    isLoading: false,
  }),

  logout: () => {
    // localStorage 클리어
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  // 토큰 유효성 확인
  checkAuth: async () => {
    const { accessToken, refreshAccessToken } = get();

    if (!accessToken) {
      return false;
    }

    try {
      // /auth/me 엔드포인트로 사용자 정보 확인
      const { data } = await api.get('/auth/me/');

      if (data.status === 'success' && data.data) {
        set({
          user: data.data,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      }

      return false;
    } catch (error: any) {
      // 401 에러면 토큰 갱신 시도
      if (error.response?.status === 401) {
        return await refreshAccessToken();
      }

      get().logout();
      return false;
    }
  },

  // 토큰 갱신
  refreshAccessToken: async () => {
    const { refreshToken } = get();

    if (!refreshToken) {
      get().logout();
      return false;
    }

    try {
      const { data } = await api.post('/auth/token/refresh/', {
        refresh_token: refreshToken,
      });

      if (data.status === 'success' && data.data?.access_token) {
        const newAccessToken = data.data.access_token;

        // localStorage 업데이트
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', newAccessToken);
        }

        set({
          accessToken: newAccessToken,
          isLoading: false,
        });

        return true;
      }

      get().logout();
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      get().logout();
      return false;
    }
  },

  // 앱 시작 시 호출
  initialize: () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false });
      return;
    }

    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');

    if (!accessToken || !refreshToken) {
      set({ isLoading: false });
      return;
    }

    set({
      accessToken,
      refreshToken,
      isLoading: true,
    });

    // 토큰 유효성 확인
    get().checkAuth();
  },
}));
