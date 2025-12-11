'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores';

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // 로딩 중에는 아무것도 하지 않음
    if (isLoading) {
      return;
    }

    // 보호된 경로 (인증 필요)
    const protectedRoutes = ['/mail'];
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    // 인증 경로 (이미 로그인한 경우 접근 불가)
    const authRoutes = ['/login'];
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

    // 콜백 페이지는 항상 허용
    if (pathname === '/callback') {
      return;
    }

    // 보호된 경로인데 인증되지 않은 경우
    if (isProtectedRoute && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // 인증 경로인데 이미 인증된 경우
    if (isAuthRoute && isAuthenticated) {
      router.push('/mail');
      return;
    }
  }, [pathname, isAuthenticated, isLoading, router]);

  // 로딩 중일 때 로딩 화면 표시
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
