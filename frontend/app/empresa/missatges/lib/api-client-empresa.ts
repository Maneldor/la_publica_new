import { getSession } from 'next-auth/react';

// Use existing types from gestor system
interface ApiConversation {
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

interface ApiMessage {
  id: string;
  senderId: string;
  content: string;
  type: string;
  timestamp: string;
  status: string;
  isEdited?: boolean;
  replyTo?: string;
  attachments?: any[];
}

interface SendMessageRequest {
  content: string;
  type: string;
  replyToId?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  console.log(`🔍 API Request: ${endpoint}`);

  const session = await getSession();

  if (!session?.user?.apiToken) {
    throw new Error('No authentication token available');
  }

  const url = `${API_BASE}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.user.apiToken}`,
      ...options.headers,
    },
    credentials: 'include',
  };

  console.log('📡 Empresa API Request:', {
    url,
    method: config.method || 'GET',
    headers: config.headers,
    sessionUser: session?.user,
    token: session?.user?.apiToken
  });

  const response = await fetch(url, config);

  console.log('📡 Empresa API Response:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('❌ Empresa API Error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorData
    });

    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('✅ Empresa API Success:', data);

  return data.data || data;
}

export const conversationsApi = {
  // Obtener conversaciones de la empresa
  async getConversations(): Promise<ApiConversation[]> {
    console.log('🔄 Fetching company conversations...');
    return apiRequest<ApiConversation[]>('/empresa/messages/conversations');
  },

  // Obtener mensajes de una conversación
  async getMessages(conversationId: string): Promise<ApiMessage[]> {
    console.log(`📨 Fetching messages for conversation: ${conversationId}`);
    return apiRequest<ApiMessage[]>(`/empresa/messages/conversations/${conversationId}/messages`);
  },

  // Enviar mensaje
  async sendMessage(conversationId: string, message: SendMessageRequest): Promise<ApiMessage> {
    console.log(`📤 Sending message to conversation: ${conversationId}`, message);
    return apiRequest<ApiMessage>(`/empresa/messages/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(message),
    });
  },

  // Marcar conversación como leída
  async markAsRead(conversationId: string): Promise<void> {
    console.log(`👁️ Marking conversation as read: ${conversationId}`);
    try {
      await apiRequest<void>(`/empresa/messages/conversations/${conversationId}/read`, {
        method: 'POST',
      });
    } catch (error) {
      // Si el endpoint no existe aún, no fallar
      console.warn('⚠️ Mark as read endpoint not implemented yet');
    }
  },

  // Crear nueva conversación (futuro)
  async createConversation(participantIds: string[]): Promise<ApiConversation> {
    console.log('🆕 Creating new conversation with participants:', participantIds);
    return apiRequest<ApiConversation>('/empresa/messages/conversations', {
      method: 'POST',
      body: JSON.stringify({ participantIds }),
    });
  }
};