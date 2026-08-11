export type ContactMessageStatus = 'new' | 'read' | 'replied' | 'archived';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  createdAt: string;
  updatedAt: string;
}
