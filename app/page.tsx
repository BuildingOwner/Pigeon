import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🕊️</span>
            <span className="text-xl font-bold text-gray-900">Pigeon</span>
          </div>
          <Link
            href="/login"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Gmail로 시작하기
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-3xl">
          <div className="mb-8">
            <span className="text-6xl">🕊️</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI 메일 폴더링
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            LLM이 당신의 메일을 자동으로 분류해드립니다
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-primary-600 text-white text-lg rounded-md hover:bg-primary-700 transition-colors"
          >
            Gmail로 시작하기
          </Link>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                자동분류
              </h3>
              <p className="text-gray-600">AI 기반 스마트 메일 분류</p>
            </div>
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                스마트 폴더생성
              </h3>
              <p className="text-gray-600">메일 패턴에 맞춘 자동 폴더 생성</p>
            </div>
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                실시간 동기화
              </h3>
              <p className="text-gray-600">Gmail과 실시간 연동</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
