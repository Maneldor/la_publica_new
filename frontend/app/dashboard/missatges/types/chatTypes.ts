// Interfaces y tipos para el sistema de chat

export interface User {
  id: number;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: string;
  status?: string;
}

export interface Attachment {
  id: number;
  type: 'image' | 'document' | 'audio' | 'video';
  url: string;
  name?: string;
  size?: number;
  duration?: number;
  thumbnail?: string;
}

export interface Reaction {
  userId: number;
  emoji: string;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'link' | 'system';
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  isEdited?: boolean;
  replyTo?: number;
  attachments?: Attachment[];
  reactions?: Reaction[];
  isStarred?: boolean;
  isForwarded?: boolean;
}

export interface Conversation {
  id: number;
  type: 'individual' | 'group' | 'company';
  name: string;
  avatar: string;
  lastMessage: Message | null;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  participants: User[];
  groupInfo?: {
    description: string;
    admins: number[];
    createdAt: Date;
  };
}