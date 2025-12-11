'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { useAuthStore } from '@/stores';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // 이미 인증된 사용자는 /mail로 리다이렉트
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/mail');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleGoogleLogin = () => {
    setIsRedirecting(true);
    window.location.href = `${API_BASE_URL}/auth/google/login/`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <span className="text-6xl">🕊️</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Pigeon</h1>
          <p className="text-gray-600 mt-2">AI 메일 분류 시스템</p>
        </div>

        <Button
          onClick={handleGoogleLogin}
          className="w-full"
          size="lg"
          disabled={isRedirecting || isLoading}
        >
          {isRedirecting ? '로그인 중...' : 'Gmail로 시작하기'}
        </Button>

        <p className="text-xs text-gray-500 text-center mt-4">
          로그인하면 Gmail 계정에 접근하여 메일을 동기화하고 분류합니다.
        </p>
      </div>
    </div>
  );
}
