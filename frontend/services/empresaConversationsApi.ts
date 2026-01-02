// Usar API interna de Next.js en lugar del backend externo

// Tipos para la API
export interface Participant {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: string;
  status?: string;
}

export interface Attachment {
  id: string;
  type: 'image' | 'document' | 'audio' | 'video' | 'file';
  url: string;
  name?: string;
  size?: number;
}

export interface Message {
  id: string;
  conversationId?: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'link' | 'system' | 'file';
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  isEdited?: boolean;
  replyTo?: { id: string; content: string; senderId: string };
  attachments?: Attachment[];
}

export interface Conversation {
  id: string;
  type: 'individual' | 'group' | 'company' | 'gestor' | 'admin';
  name: string;
  avatar: string;
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  participants: Participant[];
}

export interface Recipient {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

export interface SendMessageRequest {
  content: string;
  type: string;
  replyToId?: string;
}

export interface CreateConversationRequest {
  participantIds: string[];
  initialMessage?: string;
}

class EmpresaConversationsApiService {

  // Obtenir converses para empresas (usa API interna de Next.js)
  async getConversations(): Promise<Conversation[]> {
    try {
      const response = await fetch('/api/empresa/messages');
      if (!response.ok) throw new Error('Error carregant converses');

      const data = await response.json();

      // Convertir el formato de la API interna al formato esperado
      return (data.conversations || []).map((conv: any) => ({
        id: conv.id,
        type: this.getConversationType(conv.participant?.role),
        name: conv.participant?.name || 'Usuari',
        avatar: conv.participant?.image || '',
        lastMessage: conv.lastMessage ? {
          id: 'last',
          senderId: '',
          content: conv.lastMessage,
          type: 'text' as const,
          timestamp: conv.lastMessageAt,
          status: 'read' as const
        } : undefined,
        unreadCount: conv.unreadCount || 0,
        isPinned: false,
        isMuted: false,
        isArchived: false,
        participants: [{
          id: conv.participant?.id || '',
          name: conv.participant?.name || 'Usuari',
          avatar: conv.participant?.image || '',
          isOnline: false
        }]
      }));
    } catch (error) {
      console.error('Error en getConversations:', error);
      return [];
    }
  }

  // Obtenir missatges d'una conversa
  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const response = await fetch(`/api/empresa/messages?conversationId=${conversationId}`);
      if (!response.ok) throw new Error('Error carregant missatges');

      const data = await response.json();

      return (data.messages || []).map((msg: any) => ({
        id: msg.id,
        conversationId: conversationId,
        senderId: msg.senderId,
        content: msg.content,
        type: 'text' as const,
        timestamp: msg.createdAt,
        status: 'read' as const,
        isEdited: false,
        attachments: []
      }));
    } catch (error) {
      console.error('Error en getMessages:', error);
      return [];
    }
  }

  // Enviar missatge
  async sendMessage(conversationId: string, messageData: SendMessageRequest): Promise<Message> {
    const response = await fetch('/api/empresa/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId,
        content: messageData.content
      })
    });

    if (!response.ok) throw new Error('Error enviant missatge');

    const data = await response.json();

    return {
      id: data.message.id,
      conversationId: conversationId,
      senderId: data.message.senderId,
      content: data.message.content,
      type: 'text',
      timestamp: data.message.createdAt,
      status: 'sent',
      isEdited: false,
      attachments: []
    };
  }

  // Crear nova conversa
  async createConversation(conversationData: CreateConversationRequest): Promise<{ id: string }> {
    console.warn('createConversation: Les empreses no poden crear converses directament');
    throw new Error('No implementat');
  }

  // Obtenir destinataris possibles
  async getRecipients(): Promise<Recipient[]> {
    return [];
  }

  // Marcar com a llegit
  async markAsRead(conversationId: string): Promise<void> {
    try {
      await fetch('/api/empresa/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId })
      });
    } catch (error) {
      console.error('Error marcant com a llegit:', error);
    }
  }

  // Silenciar conversa (no implementat)
  async muteConversation(conversationId: string, muted: boolean): Promise<void> {
    console.warn('muteConversation: No implementat');
  }

  // Fixar conversa (no implementat)
  async pinConversation(conversationId: string, pinned: boolean): Promise<void> {
    console.warn('pinConversation: No implementat');
  }

  // Arxivar conversa (no implementat)
  async archiveConversation(conversationId: string, archived: boolean): Promise<void> {
    console.warn('archiveConversation: No implementat');
  }

  // Helper per determinar el tipus de conversa
  private getConversationType(role?: string): 'individual' | 'group' | 'company' | 'gestor' | 'admin' {
    if (!role) return 'individual';

    if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'ADMIN_GESTIO') {
      return 'admin';
    }
    if (role === 'CRM_COMERCIAL' || role === 'CRM_CONTINGUT' || role === 'ACCOUNT_MANAGER') {
      return 'gestor';
    }
    if (role === 'COMPANY' || role === 'COMPANY_OWNER' || role === 'COMPANY_MEMBER') {
      return 'company';
    }

    return 'individual';
  }
}

export const empresaConversationsApi = new EmpresaConversationsApiService();
export default empresaConversationsApi;