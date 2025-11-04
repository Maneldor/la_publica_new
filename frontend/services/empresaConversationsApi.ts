import { apiGet, apiPost, apiPut } from '../lib/api-client';

// Usar los mismos tipos que el conversationsApi original
export type { Conversation, Message, Participant, Attachment, Recipient, SendMessageRequest, CreateConversationRequest } from './conversationsApi';
import { Conversation, Message, Participant, Attachment, Recipient, SendMessageRequest, CreateConversationRequest } from './conversationsApi';

class EmpresaConversationsApiService {

  // Obtenir converses para empresas
  async getConversations(): Promise<Conversation[]> {
    return apiGet<Conversation[]>('/empresa/messages/conversations');
  }

  // Obtenir missatges d'una conversa para empresas
  async getMessages(conversationId: string): Promise<Message[]> {
    return apiGet<Message[]>(`/empresa/messages/conversations/${conversationId}/messages`);
  }

  // Enviar missatge para empresas
  async sendMessage(conversationId: string, messageData: SendMessageRequest): Promise<Message> {
    return apiPost<Message>(`/empresa/messages/conversations/${conversationId}/messages`, messageData);
  }

  // Crear nova conversa para empresas (no implementado aún en backend)
  async createConversation(conversationData: CreateConversationRequest): Promise<{ id: string }> {
    return apiPost<{ id: string }>('/empresa/messages/conversations', conversationData);
  }

  // Para mantener compatibilidad con el sistema del gestor, estos métodos pueden no estar implementados
  async getRecipients(): Promise<Recipient[]> {
    // Las empresas no pueden crear conversaciones por ahora, pero retornamos array vacío para compatibilidad
    return Promise.resolve([]);
  }

  async markAsRead(conversationId: string): Promise<void> {
    // TODO: Implementar cuando se añada al backend de empresa
    console.warn('markAsRead not implemented for empresa yet');
  }

  async muteConversation(conversationId: string, muted: boolean): Promise<void> {
    // TODO: Implementar cuando se añada al backend de empresa
    console.warn('muteConversation not implemented for empresa yet');
  }

  async pinConversation(conversationId: string, pinned: boolean): Promise<void> {
    // TODO: Implementar cuando se añada al backend de empresa
    console.warn('pinConversation not implemented for empresa yet');
  }

  async archiveConversation(conversationId: string, archived: boolean): Promise<void> {
    // TODO: Implementar cuando se añada al backend de empresa
    console.warn('archiveConversation not implemented for empresa yet');
  }
}

export const empresaConversationsApi = new EmpresaConversationsApiService();
export default empresaConversationsApi;