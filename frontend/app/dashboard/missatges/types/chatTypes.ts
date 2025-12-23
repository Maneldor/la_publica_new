// Interfaces y tipos para el sistema de chat

export interface User {
  id: string;
  name: string | null;
  nick?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  image?: string | null;
  avatar?: string | null;
  isOnline?: boolean;
  lastSeen?: string;
  status?: string;
}

export interface Attachment {
  id: string;
  type: 'image' | 'document' | 'audio' | 'video';
  url: string;
  name?: string;
  size?: number | null;
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
  sender?: User;
  content: string;
  type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'link' | 'system';
  timestamp: Date | string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  isRead?: boolean;
  isEdited?: boolean;
  replyTo?: string;
  attachments?: Attachment[];
  reactions?: Reaction[];
  isStarred?: boolean;
  isForwarded?: boolean;
}

// Info del anuncio relacionado con una conversación
export interface AnuncioInfo {
  id: string;
  title: string;
  slug?: string;
  status: string;
  imageUrl?: string;
  price?: number;
  priceType?: 'fixed' | 'negotiable' | 'free';
}

export interface Conversation {
  id: string;
  type: 'individual' | 'group' | 'company';
  name?: string;
  title?: string;
  avatar?: string | null;
  lastMessage: Message | null;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  participants: User[];
  updatedAt?: Date | string;
  createdAt?: Date | string;
  groupInfo?: {
    description: string;
    admins: string[];
    createdAt: Date;
  };
  anuncio?: AnuncioInfo | null; // Info del anuncio relacionado
}

// Tipus per a l'usuari actual de la sessió
export interface CurrentUser {
  id: string;
  name: string | null;
  nick?: string | null;
  image?: string | null;
  email?: string | null;
}
