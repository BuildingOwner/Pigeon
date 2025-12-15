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
    <header className="bg-white border-b border-gray-200 h-12 md:h-14 flex items-center px-3 md:px-6">
      {showMenuButton && (
        <button
          onClick={onToggleSidebar}
          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded mr-2 md:hidden"
        >
          <Menu size={18} />
        </button>
      )}

      <div className="flex items-center space-x-1.5">
        <span className="text-xl">🕊️</span>
        <span className="text-lg font-bold text-gray-900 hidden sm:inline">Pigeon</span>
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

      <div className="flex items-center gap-1 md:gap-3 ml-auto">
        {onSync && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSync}
            disabled={isSyncing}
            className="px-2 py-1"
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline ml-1 text-xs">{isSyncing ? '동기화 중' : '동기화'}</span>
          </Button>
        )}

        {user && (
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="text-right hidden md:block">
              <p className="text-xs font-medium text-gray-900">{user.name}</p>
              <p className="text-[10px] text-gray-500">{user.email}</p>
            </div>
            {user.picture && (
              <img
                src={user.picture}
                alt={user.name}
                className="w-7 h-7 md:w-8 md:h-8 rounded-full"
              />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              title="로그아웃"
              className="p-1.5"
            >
              <LogOut size={14} />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
