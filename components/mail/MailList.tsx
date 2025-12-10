'use client';

import type { Mail } from '@/types';

interface MailListProps {
  mails: Mail[];
  selectedMailId: string | null;
  onSelectMail: (mailId: string) => void;
}

export function MailList({ mails, selectedMailId, onSelectMail }: MailListProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200">
        <input type="checkbox" className="w-4 h-4" />
        <span className="text-sm text-gray-600">전체선택</span>
        <button className="ml-auto text-sm text-gray-600 hover:text-red-600">🗑️ 삭제</button>
      </div>

      {/* Mail List */}
      <div className="flex-1 overflow-y-auto">
        {mails.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            메일이 없습니다
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {mails.map((mail) => (
              <MailListItem
                key={mail.id}
                mail={mail}
                isSelected={mail.id === selectedMailId}
                onSelect={() => onSelectMail(mail.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

interface MailListItemProps {
  mail: Mail;
  isSelected: boolean;
  onSelect: () => void;
}

function MailListItem({ mail, isSelected, onSelect }: MailListItemProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  return (
    <li
      className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
        isSelected
          ? 'bg-blue-50 border-l-2 border-blue-500'
          : 'hover:bg-gray-50 border-l-2 border-transparent'
      }`}
      onClick={onSelect}
    >
      <input type="checkbox" className="mt-1 w-4 h-4" onClick={(e) => e.stopPropagation()} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm ${mail.isRead ? 'text-gray-600' : 'font-semibold text-gray-900'}`}
          >
            {mail.from.name}
          </span>
          {mail.isStarred && <span className="text-yellow-500">⭐</span>}
          {!mail.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
        </div>
        <div
          className={`text-sm truncate ${mail.isRead ? 'text-gray-600' : 'font-medium text-gray-900'}`}
        >
          {mail.subject}
        </div>
        <div className="text-xs text-gray-500 truncate mt-0.5">{mail.bodyPreview}</div>
      </div>
      <div className="text-xs text-gray-500 whitespace-nowrap">{formatTime(mail.receivedAt)}</div>
    </li>
  );
}
