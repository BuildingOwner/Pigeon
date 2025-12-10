'use client';

import { mockUser } from '@/lib/mock/data';

interface HeaderProps {
  onSync?: () => void;
  isSyncing?: boolean;
}

export function Header({ onSync, isSyncing = false }: HeaderProps) {
  const user = mockUser;

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-2">
        <span className="text-xl">🕊️</span>
        <span className="text-lg font-semibold text-gray-900">Pigeon</span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onSync}
          disabled={isSyncing}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          title="동기화"
        >
          <span className={isSyncing ? 'animate-spin inline-block' : ''}>🔄</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{user.email}</span>
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm">
            {user.name.charAt(0)}
          </div>
        </div>

        <button className="text-sm text-gray-600 hover:text-gray-900">
          로그아웃
        </button>
      </div>
    </header>
  );
}
