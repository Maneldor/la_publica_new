'use client';

import { Message, Conversation, User } from '../types/chatTypes';

interface ChatWindowProps {
  activeConversation: Conversation;
  currentUser: User;
  messages: Message[];
  messageText: string;
  setMessageText: (text: string) => void;
  showSearchInChat: boolean;
  setShowSearchInChat: (show: boolean) => void;
  searchInChatTerm: string;
  setSearchInChatTerm: (term: string) => void;
  hoveredMessage: number | null;
  setHoveredMessage: (id: number | null) => void;
  replyingTo: Message | null;
  setReplyingTo: (message: Message | null) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
  showAttachMenu: boolean;
  setShowAttachMenu: (show: boolean) => void;
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  messageInputRef: React.RefObject<HTMLTextAreaElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  isMobile: boolean;
  closeConversation: () => void;
  sendMessage: () => void;
  starMessage: (messageId: number) => void;
  deleteMessage: (messageId: number) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formatTime: (date: Date) => string;
  formatFileSize: (bytes: number) => string;
}

export function ChatWindow({
  activeConversation,
  currentUser,
  messages,
  messageText,
  setMessageText,
  messagesEndRef,
  messageInputRef,
  fileInputRef,
  isMobile,
  closeConversation,
  sendMessage,
  formatTime,
  handleFileSelect
}: ChatWindowProps) {

  const conversationMessages = messages.filter(m => m.conversationId === activeConversation.id);

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'white'
    }}>
      {/* Header del chat */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #e9ecef',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isMobile && (
            <button
              onClick={closeConversation}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '14px',
                cursor: 'pointer',
                padding: '4px',
                marginRight: '8px'
              }}
            >
              Tornar
            </button>
          )}
          <img
            src={activeConversation.avatar}
            alt={activeConversation.name}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
          <div>
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '600',
              color: '#2c3e50'
            }}>
              {activeConversation.name}
            </h3>
            <p style={{
              margin: 0,
              fontSize: '12px',
              color: '#6c757d'
            }}>
              {activeConversation.type === 'company' ? 'Empresa' :
               activeConversation.type === 'admin' ? 'Administrador' :
               activeConversation.type === 'gestor' ? 'Gestor Comercial' : 'Usuario'}
            </p>
          </div>
        </div>
      </div>

      {/* Área de mensajes */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        backgroundColor: '#f8f9fa'
      }}>
        {conversationMessages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              justifyContent: message.senderId === currentUser.id ? 'flex-end' : 'flex-start',
              marginBottom: '12px'
            }}
          >
            <div style={{
              maxWidth: '70%',
              backgroundColor: message.senderId === currentUser.id ? '#3b82f6' : 'white',
              color: message.senderId === currentUser.id ? 'white' : '#2c3e50',
              padding: '8px 12px',
              borderRadius: '12px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              {(message.type === 'text' || !message.type || message.content) && (
                <p style={{ margin: 0, fontSize: '14px' }}>
                  {message.content}
                </p>
              )}

              {message.type === 'document' && message.attachments && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px' }}>Documento:</span>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>
                    {message.attachments[0].name}
                  </span>
                </div>
              )}

              <div style={{
                fontSize: '10px',
                opacity: 0.7,
                marginTop: '4px',
                textAlign: 'right'
              }}>
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensaje */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid #e9ecef',
        backgroundColor: 'white'
      }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-end'
        }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            multiple
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              padding: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
            title="Adjuntar archivo"
          >
            Adjuntar
          </button>

          <textarea
            ref={messageInputRef}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Escriu un missatge..."
            style={{
              flex: 1,
              border: '1px solid #e9ecef',
              borderRadius: '20px',
              padding: '8px 16px',
              resize: 'none',
              fontSize: '14px',
              fontFamily: 'inherit',
              maxHeight: '100px',
              minHeight: '36px'
            }}
            rows={1}
          />

          <button
            onClick={sendMessage}
            disabled={!messageText.trim()}
            style={{
              backgroundColor: messageText.trim() ? '#3b82f6' : '#e9ecef',
              color: messageText.trim() ? 'white' : '#6c757d',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              cursor: messageText.trim() ? 'pointer' : 'not-allowed',
              fontSize: '14px'
            }}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}