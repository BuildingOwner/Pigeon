import type { Metadata } from 'next'
import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}
