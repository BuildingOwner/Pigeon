'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores';
import api from '@/lib/api';
import { ApiResponse, User } from '@/types';

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      if (!code || !state) {
        router.push('/login');
        return;
      }

      try {
        const { data } = await api.get<ApiResponse<{
          access_token: string;
          refresh_token: string;
          expires_in: number;
          user: User;
        }>>('/auth/google/callback/', {
          params: { code, state },
        });

        if (data.status === 'success' && data.data) {
          const { access_token, refresh_token, user } = data.data;

          // 토큰 저장
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);

          // 스토어 업데이트
          login(user, access_token);

          // 메일함으로 이동
          router.push('/mail');
        } else {
          throw new Error('Login failed');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        router.push('/login');
      }
    };

    handleCallback();
  }, [searchParams, router, login]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">로그인 중...</p>
      </div>
    </div>
  );
}
