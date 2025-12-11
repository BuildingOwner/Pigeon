'use client';

import { RefreshCw, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores';
import { Button } from '@/components/ui';

interface HeaderProps {
  onSync?: () => void;
  isSyncing?: boolean;
}

export function Header({ onSync, isSyncing = false }: HeaderProps) {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6">
      <div className="flex items-center space-x-2">
        <span className="text-2xl">🕊️</span>
        <span className="text-xl font-bold text-gray-900">Pigeon</span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center space-x-4">
        {onSync && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSync}
            disabled={isSyncing}
          >
            <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? '동기화 중' : '동기화'}
          </Button>
        )}

        {user && (
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut size={16} />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
