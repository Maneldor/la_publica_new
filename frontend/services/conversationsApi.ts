export interface Conversation {
  id: string;
  name: string;
  type: 'individual' | 'company' | 'admin' | 'gestor' | 'group';
  avatar: string;
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  participants: Participant[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'file' | 'image' | 'audio' | 'video';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  isEdited?: boolean;
  replyTo?: {
    id: string;
    content: string;
    sender: string;
  };
  attachments?: Attachment[];
}

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Recipient {
  id: string;
  name: string;
  avatar: string;
  type: 'admin' | 'gestor' | 'company';
  role: string;
}

export interface CreateConversationRequest {
  participantIds: string[];
  name?: string;
  isGroup?: boolean;
}

export interface SendMessageRequest {
  content: string;
  type?: string;
  replyToId?: string;
}

import { apiGet, apiPost, apiPut } from '../lib/api-client';

class ConversationsApiService {

  // Obtenir converses
  async getConversations(): Promise<Conversation[]> {
    return apiGet<Conversation[]>('/conversations');
  }

  // Obtenir missatges d'una conversa
  async getMessages(conversationId: string): Promise<Message[]> {
    return apiGet<Message[]>(`/conversations/${conversationId}/messages`);
  }

  // Enviar missatge
  async sendMessage(conversationId: string, messageData: SendMessageRequest): Promise<Message> {
    return apiPost<Message>(`/conversations/${conversationId}/messages`, messageData);
  }

  // Obtenir destinataris disponibles
  async getRecipients(): Promise<Recipient[]> {
    return apiGet<Recipient[]>('/conversations/recipients');
  }

  // Crear nova conversa
  async createConversation(conversationData: CreateConversationRequest): Promise<{ id: string }> {
    return apiPost<{ id: string }>('/conversations', conversationData);
  }

  // Marcar missatges com llegits
  async markAsRead(conversationId: string): Promise<void> {
    await apiPost<void>(`/conversations/${conversationId}/read`);
  }

  // Silenciar conversa
  async muteConversation(conversationId: string, muted: boolean): Promise<void> {
    await apiPut<void>(`/conversations/${conversationId}/mute`, { muted });
  }

  // Fixar conversa
  async pinConversation(conversationId: string, pinned: boolean): Promise<void> {
    await apiPut<void>(`/conversations/${conversationId}/pin`, { pinned });
  }

  // Arxivar conversa
  async archiveConversation(conversationId: string, archived: boolean): Promise<void> {
    await apiPut<void>(`/conversations/${conversationId}/archive`, { archived });
  }
}

export const conversationsApi = new ConversationsApiService();
export default conversationsApi;