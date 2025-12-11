import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { RouteGuard } from '@/components/providers/RouteGuard'

export const metadata: Metadata = {
  title: 'Pigeon - AI 메일 분류 시스템',
  description: 'LLM이 당신의 메일을 자동으로 분류해드립니다',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          <RouteGuard>{children}</RouteGuard>
        </AuthProvider>
      </body>
    </html>
  )
}
