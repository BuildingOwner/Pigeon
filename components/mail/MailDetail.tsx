import { Mail } from '@/types';
import { Star, Folder, Trash2, Download } from 'lucide-react';
import { Button, SkeletonMailDetail } from '@/components/ui';
import { formatDate, formatFileSize } from '@/lib/utils';

interface MailDetailProps {
  mail: Mail | null;
  isLoading?: boolean;
  onToggleStar?: () => void;
  onMove?: () => void;
  onDelete?: () => void;
  onDownloadAttachment?: (attachmentId: string) => void;
}

export function MailDetail({
  mail,
  isLoading,
  onToggleStar,
  onMove,
  onDelete,
  onDownloadAttachment,
}: MailDetailProps) {
  if (isLoading) {
    return <SkeletonMailDetail />;
  }

  if (!mail) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        메일을 선택하세요
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {mail.subject || '(제목 없음)'}
        </h1>

        <div className="space-y-2 text-sm">
          <div className="flex items-start">
            <span className="w-20 text-gray-500">발신:</span>
            <span className="text-gray-900">{mail.sender}</span>
          </div>
          <div className="flex items-start">
            <span className="w-20 text-gray-500">수신:</span>
            <span className="text-gray-900">
              {mail.recipients
                .filter((r) => r.type === 'to')
                .map((r) => r.name || r.email)
                .join(', ')}
            </span>
          </div>
          {mail.recipients.some((r) => r.type === 'cc') && (
            <div className="flex items-start">
              <span className="w-20 text-gray-500">참조:</span>
              <span className="text-gray-900">
                {mail.recipients
                  .filter((r) => r.type === 'cc')
                  .map((r) => r.name || r.email)
                  .join(', ')}
              </span>
            </div>
          )}
          <div className="flex items-start">
            <span className="w-20 text-gray-500">날짜:</span>
            <span className="text-gray-900">
              {formatDate(mail.received_at, 'PPP p')}
            </span>
          </div>
          {mail.folder && (
            <div className="flex items-start">
              <span className="w-20 text-gray-500">폴더:</span>
              <span className="text-gray-900">{mail.folder.path}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleStar}
          >
            <Star
              size={16}
              className={mail.is_starred ? 'text-yellow-500 fill-yellow-500' : ''}
            />
            별표
          </Button>
          <Button variant="ghost" size="sm" onClick={onMove}>
            <Folder size={16} />
            이동
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 size={16} />
            삭제
          </Button>
        </div>
      </div>

      {mail.attachments.length > 0 && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            첨부파일 ({mail.attachments.length})
          </h3>
          <div className="space-y-2">
            {mail.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-900">{attachment.name}</span>
                  <span className="text-xs text-gray-500">
                    ({formatFileSize(attachment.size)})
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDownloadAttachment?.(attachment.id)}
                >
                  <Download size={14} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6">
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: mail.body_html }}
        />
      </div>
    </div>
  );
}
