'use client';

import { useEffect, useRef } from 'react';
import { Mail } from '@/types';
import { Star, Folder, Trash2, Download, FolderOpen, ArrowLeft } from 'lucide-react';
import { Button, SkeletonMailDetail } from '@/components/ui';
import { formatDate, formatFileSize } from '@/lib/utils';
import DOMPurify from 'dompurify';

interface MailDetailProps {
  mail: Mail | null;
  isLoading?: boolean;
  onToggleStar?: () => void;
  onMove?: () => void;
  onDelete?: () => void;
  onDownloadAttachment?: (attachmentId: string) => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function MailDetail({
  mail,
  isLoading,
  onToggleStar,
  onMove,
  onDelete,
  onDownloadAttachment,
  onBack,
  showBackButton = false,
}: MailDetailProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // iframe 높이 자동 조절
  useEffect(() => {
    if (!mail || !iframeRef.current) return;

    const iframe = iframeRef.current;
    const adjustHeight = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc?.body) {
          iframe.style.height = `${doc.body.scrollHeight + 20}px`;
        }
      } catch {
        // 크로스 오리진 에러 무시
      }
    };

    iframe.onload = adjustHeight;
    // ResizeObserver로 콘텐츠 변경 감지
    const resizeObserver = new ResizeObserver(adjustHeight);
    if (iframe.contentDocument?.body) {
      resizeObserver.observe(iframe.contentDocument.body);
    }

    return () => resizeObserver.disconnect();
  }, [mail]);

  if (isLoading) {
    return <SkeletonMailDetail />;
  }

  if (!mail) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <FolderOpen size={48} className="mb-4 text-gray-300" />
        <p>메일을 선택하세요</p>
      </div>
    );
  }

  // 더 유연한 DOMPurify 설정으로 원본 스타일 유지
  const sanitizedHtml = typeof window !== 'undefined'
    ? DOMPurify.sanitize(mail.body_html, {
        WHOLE_DOCUMENT: false,
        ADD_TAGS: ['style'],
        ADD_ATTR: ['target', 'rel'],
        ALLOW_DATA_ATTR: true,
      })
    : mail.body_html;

  // iframe에 삽입할 HTML 문서
  const iframeContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <base target="_blank">
        <style>
          * {
            box-sizing: border-box;
          }
          html, body {
            margin: 0;
            padding: 0;
            overflow-x: auto;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            font-size: 14px;
            line-height: 1.5;
            color: #1f2937;
          }
          img {
            max-width: 100% !important;
            height: auto !important;
          }
          a {
            color: #2563eb;
          }
          pre {
            white-space: pre-wrap;
            max-width: 100%;
            overflow-x: auto;
          }
        </style>
      </head>
      <body>${sanitizedHtml}</body>
    </html>
  `;

  return (
    <div className="flex flex-col h-full">
      {/* 컴팩트한 헤더 영역 */}
      <div className="px-4 py-3 border-b border-gray-200">
        {/* 제목 + 액션 버튼 */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-start gap-2 min-w-0">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-1.5 flex-shrink-0 -ml-1 md:hidden"
              >
                <ArrowLeft size={18} />
              </Button>
            )}
            <h1 className="text-lg font-bold text-gray-900 line-clamp-2">
              {mail.subject || '(제목 없음)'}
            </h1>
          </div>
          <div className="flex items-center space-x-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleStar}
              className="p-1.5"
              title="별표"
            >
              <Star
                size={16}
                className={mail.is_starred ? 'text-yellow-500 fill-yellow-500' : ''}
              />
            </Button>
            <Button variant="ghost" size="sm" onClick={onMove} className="p-1.5" title="이동">
              <Folder size={16} />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} className="p-1.5" title="삭제">
              <Trash2 size={16} />
            </Button>
          </div>
        </div>

        {/* 메일 정보 - 컴팩트 레이아웃 */}
        <div className="text-sm text-gray-600 space-y-0.5">
          <div className="flex items-center flex-wrap gap-x-4 gap-y-0.5">
            <span>
              <span className="text-gray-400">From:</span> {mail.sender}
            </span>
            <span>
              <span className="text-gray-400">To:</span>{' '}
              {mail.recipients
                .filter((r) => r.type === 'to')
                .map((r) => r.name || r.email)
                .join(', ')}
            </span>
          </div>
          <div className="flex items-center flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
            <span>{formatDate(mail.received_at, 'yyyy.MM.dd HH:mm')}</span>
            {mail.folder && (
              <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">
                {mail.folder.path}
              </span>
            )}
            {mail.recipients.some((r) => r.type === 'cc') && (
              <span>
                CC: {mail.recipients
                  .filter((r) => r.type === 'cc')
                  .map((r) => r.name || r.email)
                  .join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 첨부파일 - 더 컴팩트하게 */}
      {mail.attachments.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-xs font-medium text-gray-500">
              첨부파일 ({mail.attachments.length})
            </span>
            {mail.attachments.map((attachment) => (
              <button
                key={attachment.id}
                onClick={() => onDownloadAttachment?.(attachment.id)}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50"
              >
                <Download size={12} />
                <span className="max-w-[150px] truncate">{attachment.name}</span>
                <span className="text-gray-400">({formatFileSize(attachment.size)})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto p-4">
        <iframe
          ref={iframeRef}
          srcDoc={iframeContent}
          sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          className="w-full border-0 min-h-[300px]"
          title="메일 본문"
        />
      </div>
    </div>
  );
}
