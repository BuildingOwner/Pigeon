import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 인증이 필요한 경로
const protectedRoutes = ['/mail'];

// 인증된 사용자는 접근할 수 없는 경로 (이미 로그인한 경우)
const authRoutes = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 토큰 확인 (클라이언트 사이드에서 localStorage를 사용하므로, 쿠키 대신 헤더 확인)
  // Next.js 미들웨어는 서버 사이드이므로 localStorage에 접근 불가
  // 따라서 쿠키나 헤더를 통해 확인하거나, 클라이언트 사이드에서 리다이렉트 처리

  // 현재는 클라이언트 사이드에서 인증 체크를 하도록 구현
  // 미들웨어는 기본적인 경로 보호만 수행

  // 보호된 경로 체크
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // 인증 경로 체크
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // 콜백 페이지는 항상 허용
  if (pathname === '/callback') {
    return NextResponse.next();
  }

  // 참고: 실제 인증 확인은 클라이언트 컴포넌트에서 수행됩니다
  // 이 미들웨어는 기본적인 라우트 구조만 정의합니다

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
