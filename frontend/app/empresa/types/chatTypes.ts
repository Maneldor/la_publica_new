// Interfaces y tipos para el sistema de chat de empresas
// Reutiliza los tipos base del sistema de gestores

export interface User {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: string;
  status?: string;
}

export interface Attachment {
  id: string;
  type: 'image' | 'document' | 'audio' | 'video';
  url: string;
  name?: string;
  size?: number;
  duration?: number;
  thumbnail?: string;
}

export interface Reaction {
  userId: string;
  emoji: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'link' | 'system';
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  isEdited?: boolean;
  replyTo?: string;
  attachments?: Attachment[];
  reactions?: Reaction[];
  isStarred?: boolean;
  isForwarded?: boolean;
}

export interface Conversation {
  id: string;
  type: 'gestor' | 'company' | 'individual' | 'group';
  name: string;
  avatar: string;
  lastMessage: Message | null;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  participants: User[];
  companyInfo?: {
    plan: 'BASIC' | 'STANDARD' | 'PREMIUM' | 'ENTERPRISE';
    isContactPerson: boolean;
    maxContactPersons: number;
    accountManagerId?: string;
  };
}

// Tipos específicos para la API de empresas
export interface CompanyApiConversation {
  id: string;
  type: string;
  name: string;
  avatar: string;
  lastMessage?: {
    id: string;
    senderId: string;
    content: string;
    type: string;
    timestamp: string;
  };
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  participants: Array<{
    id: string;
    name: string;
    avatar: string;
    isOnline: boolean;
    lastSeen: string;
    status: string;
  }>;
}

export interface CompanyApiMessage {
  id: string;
  senderId: string;
  content: string;
  type: string;
  timestamp: string;
  status: string;
  isEdited?: boolean;
  replyTo?: string;
  attachments?: Attachment[];
}

export interface SendMessageRequest {
  content: string;
  type: string;
  replyToId?: string;
}