'use client';

import { RefreshCw, LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '@/stores';
import { Button, SearchInput } from '@/components/ui';

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSearchSubmit?: () => void;
  onSync?: () => void;
  onToggleSidebar?: () => void;
  isSyncing?: boolean;
  showMenuButton?: boolean;
}

export function Header({
  searchQuery = '',
  onSearchChange,
  onSearchSubmit,
  onSync,
  onToggleSidebar,
  isSyncing = false,
  showMenuButton = false,
}: HeaderProps) {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 md:px-6">
      {showMenuButton && (
        <button
          onClick={onToggleSidebar}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-md mr-2 md:hidden"
        >
          <Menu size={20} />
        </button>
      )}

      <div className="flex items-center space-x-2">
        <span className="text-2xl">🕊️</span>
        <span className="text-xl font-bold text-gray-900 hidden sm:inline">Pigeon</span>
      </div>

      {onSearchChange && (
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            onSubmit={onSearchSubmit}
            placeholder="메일 검색..."
          />
        </div>
      )}

      <div className="flex-1 md:hidden" />

      <div className="flex items-center space-x-2 md:space-x-4">
        {onSync && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSync}
            disabled={isSyncing}
          >
            <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline ml-1">{isSyncing ? '동기화 중' : '동기화'}</span>
          </Button>
        )}

        {user && (
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            {user.picture && (
              <img
                src={user.picture}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              title="로그아웃"
            >
              <LogOut size={16} />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
