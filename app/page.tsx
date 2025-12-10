export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🕊️</span>
          <span className="text-xl font-semibold text-gray-900">Pigeon</span>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
          Gmail로 시작하기
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 bg-gray-50">
        <div className="text-center max-w-2xl">
          <div className="text-6xl mb-6">🕊️</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI 메일 폴더링</h1>
          <p className="text-xl text-gray-600 mb-8">LLM이 당신의 메일을 자동으로 분류해드립니다</p>
          <button className="px-8 py-4 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-lg">
            Gmail로 시작하기
          </button>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">자동 분류</h3>
            <p className="text-gray-600 text-sm">
              AI가 메일 내용을 분석하여 적절한 폴더로 자동 분류합니다
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
            <div className="text-3xl mb-3">📁</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">스마트 폴더</h3>
            <p className="text-gray-600 text-sm">필요한 폴더 구조를 자동으로 생성하고 관리합니다</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
            <div className="text-3xl mb-3">🔄</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">실시간 동기화</h3>
            <p className="text-gray-600 text-sm">새 메일이 도착하면 즉시 분류하여 알려드립니다</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-gray-500 border-t border-gray-200">
        © 2025 Pigeon. AI-powered email organization.
      </footer>
    </div>
  );
}
