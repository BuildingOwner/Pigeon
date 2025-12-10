import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="py-6 px-6">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <span className="text-2xl">🕊️</span>
          <span className="text-xl font-semibold text-gray-900">Pigeon</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">{children}</main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-gray-500">
        © 2025 Pigeon. AI-powered email organization.
      </footer>
    </div>
  );
}
