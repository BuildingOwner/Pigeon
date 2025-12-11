import { FolderSummary } from './folder';

export interface Recipient {
  type: 'to' | 'cc' | 'bcc';
  email: string;
  name: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  mime_type: string;
}

export interface MailListItem {
  id: number;
  gmail_id: string;
  thread_id: string;
  subject: string;
  sender: string;
  sender_email: string;
  snippet: string;
  folder: FolderSummary | null;
  has_attachments: boolean;
  is_read: boolean;
  is_starred: boolean;
  is_classified: boolean;
  received_at: string;
}

export interface Mail extends MailListItem {
  recipients: Recipient[];
  body_html: string;
  attachments: Attachment[];
  created_at?: string;
  updated_at?: string;
}
