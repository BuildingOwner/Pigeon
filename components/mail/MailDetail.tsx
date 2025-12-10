'use client';

import type { Mail } from '@/types';

interface MailDetailProps {
  mail: Mail | null;
  onMove?: (folderId: string) => void;
  onDelete?: () => void;
}

export function MailDetail({ mail, onMove, onDelete }: MailDetailProps) {
  if (!mail) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📬</div>
          <p>메일을 선택하세요</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">{mail.subject}</h2>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div>
            <span className="text-gray-500">From:</span>{' '}
            <span className="font-medium">{mail.from.name}</span>{' '}
            <span className="text-gray-400">&lt;{mail.from.email}&gt;</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
          <div>
            <span className="text-gray-500">To:</span>{' '}
            {mail.to.map((recipient, i) => (
              <span key={i}>
                {recipient.name}
                {i < mail.to.length - 1 && ', '}
              </span>
            ))}
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-2">{formatDate(mail.receivedAt)}</div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-700">
          {mail.body}
        </div>
      </div>

      {/* Footer - Classification Info & Actions */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <span>📁</span>
              <span className="font-medium">{mail.folderPath}</span>
            </div>
            {mail.classificationReason && (
              <div className="flex items-center gap-2 text-gray-500 mt-1">
                <span>💡</span>
                <span className="text-xs">{mail.classificationReason}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onMove?.('')}
              className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              📁 이동
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-1.5 text-sm text-red-600 bg-white border border-gray-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              🗑️ 삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
