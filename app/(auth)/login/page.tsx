'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui';
import { API_BASE_URL } from '@/lib/constants';

export default function LoginPage() {
  const handleGoogleLogin = () => {
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
        >
          Gmail로 시작하기
        </Button>

        <p className="text-xs text-gray-500 text-center mt-4">
          로그인하면 Gmail 계정에 접근하여 메일을 동기화하고 분류합니다.
        </p>
      </div>
    </div>
  );
}
