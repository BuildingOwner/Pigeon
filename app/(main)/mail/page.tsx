'use client';

import { useState } from 'react';
import { MailList } from '@/components/mail/MailList';
import { MailDetail } from '@/components/mail/MailDetail';
import { mockMails } from '@/lib/mock/data';

export default function MailPage() {
  const [selectedMailId, setSelectedMailId] = useState<string | null>('mail-1');

  const selectedMail = mockMails.find((mail) => mail.id === selectedMailId) || null;

  const handleDelete = () => {
    alert('삭제 기능은 아직 구현되지 않았습니다.');
  };

  const handleMove = (folderId: string) => {
    alert('이동 기능은 아직 구현되지 않았습니다.');
  };

  return (
    <div className="flex h-full">
      {/* Mail List */}
      <div className="w-[360px] border-r border-gray-200 bg-white">
        <MailList
          mails={mockMails}
          selectedMailId={selectedMailId}
          onSelectMail={setSelectedMailId}
        />
      </div>

      {/* Mail Detail */}
      <div className="flex-1 bg-white">
        <MailDetail mail={selectedMail} onDelete={handleDelete} onMove={handleMove} />
      </div>
    </div>
  );
}
