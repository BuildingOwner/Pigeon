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
      // BE에서 리다이렉트된 경우: 토큰이 URL에 직접 포함됨
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');

      if (accessToken && refreshToken) {
        try {
          // 토큰 저장
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', refreshToken);

          // 사용자 정보 조회
          const { data } = await api.get<ApiResponse<User>>('/auth/me/');

          if (data.status === 'success' && data.data) {
            // 스토어 업데이트
            login(data.data, accessToken, refreshToken);

            // 메일함으로 이동
            router.push('/mail');
          } else {
            throw new Error('Failed to get user info');
          }
        } catch (error) {
          console.error('OAuth callback error:', error);
          alert('로그인에 실패했습니다. 다시 시도해주세요.');
          router.push('/login');
        }
        return;
      }

      // 토큰이 없는 경우 로그인 페이지로 이동
      console.error('No tokens found in callback URL');
      router.push('/login');
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
