'use client';

import { useRef } from 'react';
import { User, Message, Conversation } from '../types/chatTypes';
import { EmojiPicker } from '../../../dashboard/missatges/components/EmojiPicker';

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
  formatFileSize: (size: number) => string;
}

export function ChatWindow({
  activeConversation,
  currentUser,
  messages,
  messageText,
  setMessageText,
  showSearchInChat,
  setShowSearchInChat,
  searchInChatTerm,
  setSearchInChatTerm,
  hoveredMessage,
  setHoveredMessage,
  replyingTo,
  setReplyingTo,
  showEmojiPicker,
  setShowEmojiPicker,
  showAttachMenu,
  setShowAttachMenu,
  isTyping,
  messagesEndRef,
  messageInputRef,
  fileInputRef,
  isMobile,
  closeConversation,
  sendMessage,
  starMessage,
  deleteMessage,
  setMessages,
  handleFileSelect,
  formatTime,
  formatFileSize
}: ChatWindowProps) {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f0f2f5'
    }}>
      {/* Header de la conversación */}
      <div style={{
        backgroundColor: 'white',
        padding: '12px 20px',
        borderBottom: '1px solid #e9ecef',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isMobile && (
            <button
              onClick={closeConversation}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              ←
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
            <div style={{
              fontWeight: '600',
              fontSize: '16px',
              color: '#2c3e50'
            }}>
              {activeConversation.name}
            </div>
            <div style={{
              fontSize: '13px',
              color: activeConversation.participants[0]?.isOnline ? '#10b981' : '#6c757d'
            }}>
              {activeConversation.participants[0]?.lastSeen}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowSearchInChat(!showSearchInChat)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px'
            }}
          >
            🔍
          </button>
          <button
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px'
            }}
          >
            📞
          </button>
          <button
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px'
            }}
          >
            ⋮
          </button>
        </div>
      </div>

      {/* Búsqueda en el chat */}
      {showSearchInChat && (
        <div style={{
          padding: '12px 20px',
          backgroundColor: 'white',
          borderBottom: '1px solid #e9ecef'
        }}>
          <input
            type="text"
            placeholder="Cercar en aquesta conversa..."
            value={searchInChatTerm}
            onChange={(e) => setSearchInChatTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
      )}

      {/* Área de mensajes */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Divisor de fecha */}
        <div style={{
          textAlign: 'center',
          margin: '16px 0'
        }}>
          <span style={{
            backgroundColor: 'white',
            padding: '6px 12px',
            borderRadius: '12px',
            fontSize: '13px',
            color: '#6c757d',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            Avui
          </span>
        </div>

        {/* Mensajes */}
        {messages.map((message) => {
          const isOwn = message.senderId === currentUser.id;
          const sender = isOwn ? currentUser : activeConversation.participants.find(p => p.id === message.senderId);

          return (
            <div
              key={message.id}
              style={{
                display: 'flex',
                justifyContent: isOwn ? 'flex-end' : 'flex-start',
                marginBottom: '4px'
              }}
              onMouseEnter={() => setHoveredMessage(parseInt(message.id) || 0)}
              onMouseLeave={() => setHoveredMessage(null)}
            >
              <div style={{
                maxWidth: '70%',
                display: 'flex',
                flexDirection: isOwn ? 'row-reverse' : 'row',
                gap: '8px',
                alignItems: 'flex-end',
                position: 'relative'
              }}>
                {!isOwn && activeConversation.type === 'group' && (
                  <img
                    src={sender?.avatar}
                    alt={sender?.name}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                )}

                <div>
                  {!isOwn && activeConversation.type === 'group' && (
                    <div style={{
                      fontSize: '12px',
                      color: '#6c757d',
                      marginBottom: '2px',
                      marginLeft: '12px'
                    }}>
                      {sender?.name}
                    </div>
                  )}

                  <div style={{
                    backgroundColor: isOwn ? '#3b82f6' : 'white',
                    color: isOwn ? 'white' : '#2c3e50',
                    padding: message.type === 'image' ? '4px' : '10px 14px',
                    borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    border: isOwn ? 'none' : '2px solid #e5e7eb',
                    boxShadow: isOwn ? '0 4px 6px -1px rgba(59, 130, 246, 0.3), 0 2px 4px -1px rgba(59, 130, 246, 0.1)' : '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
                    position: 'relative'
                  }}>
                    {/* Contenido del mensaje */}
                    {message.type === 'text' && (
                      <div style={{ fontSize: '15px', lineHeight: '1.4' }}>
                        {message.content}
                      </div>
                    )}

                    {message.type === 'image' && message.attachments && (
                      <img
                        src={message.attachments[0].url}
                        alt="Imatge"
                        style={{
                          width: '100%',
                          maxWidth: '300px',
                          borderRadius: '12px',
                          cursor: 'pointer'
                        }}
                      />
                    )}

                    {message.type === 'document' && message.attachments && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px'
                      }}>
                        <span style={{ fontSize: '24px' }}>📄</span>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500' }}>
                            {message.attachments[0].name}
                          </div>
                          <div style={{ fontSize: '12px', opacity: 0.8 }}>
                            {formatFileSize(message.attachments[0].size || 0)}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Hora y estado */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '4px',
                      fontSize: '11px',
                      opacity: 0.8
                    }}>
                      <span>{formatTime(message.timestamp)}</span>
                      {isOwn && (
                        <span style={{ color: message.status === 'read' && !isOwn ? '#3b82f6' : 'inherit' }}>
                          {message.status === 'read' ? '✓✓' :
                           message.status === 'delivered' ? '✓✓' :
                           message.status === 'sent' ? '✓' : '🕐'}
                        </span>
                      )}
                    </div>

                    {/* Reacciones */}
                    {message.reactions && message.reactions.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        bottom: '-8px',
                        right: '8px',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '2px 6px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        fontSize: '14px',
                        display: 'flex',
                        gap: '2px',
                        alignItems: 'center'
                      }}>
                        {/* Agrupar reacciones por emoji */}
                        {Object.entries(
                          message.reactions.reduce((acc, reaction) => {
                            acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        ).map(([emoji, count], idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              // Alternar reacción del usuario actual
                              setMessages(prev => prev.map(msg => {
                                if (msg.id === message.id) {
                                  const reactions = msg.reactions || [];
                                  const userReaction = reactions.find(r => r.userId === currentUser.id && r.emoji === emoji);

                                  if (userReaction) {
                                    // Quitar reacción
                                    return {
                                      ...msg,
                                      reactions: reactions.filter(r => !(r.userId === currentUser.id && r.emoji === emoji))
                                    };
                                  } else {
                                    // Añadir reacción (quitando otras del usuario primero)
                                    const filteredReactions = reactions.filter(r => r.userId !== currentUser.id);
                                    return {
                                      ...msg,
                                      reactions: [...filteredReactions, { userId: currentUser.id, emoji }]
                                    };
                                  }
                                }
                                return msg;
                              }));
                            }}
                            style={{
                              backgroundColor: message.reactions?.some(r => r.userId === currentUser.id && r.emoji === emoji)
                                ? '#e3f2fd' : 'transparent',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '2px 4px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px',
                              transition: 'background-color 0.2s'
                            }}
                            title={`${count} reacción${count > 1 ? 's' : ''}`}
                          >
                            <span>{emoji}</span>
                            {count > 1 && <span style={{ fontSize: '10px', color: '#6c757d' }}>{count}</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Acciones del mensaje en hover */}
                  {hoveredMessage === (parseInt(message.id) || 0) && (
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      right: isOwn ? 'auto' : '-8px',
                      left: isOwn ? '-8px' : 'auto',
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      padding: '4px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      display: 'flex',
                      gap: '4px',
                      zIndex: 10
                    }}>
                      <button
                        onClick={() => setReplyingTo(message)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          fontSize: '16px',
                          cursor: 'pointer',
                          padding: '4px 6px',
                          borderRadius: '6px'
                        }}
                        title="Respondre"
                      >
                        ↩️
                      </button>
                      <button
                        onClick={() => starMessage(parseInt(message.id) || 0)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          fontSize: '16px',
                          cursor: 'pointer',
                          padding: '4px 6px',
                          borderRadius: '6px'
                        }}
                        title="Destacar"
                      >
                        ⭐
                      </button>
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={() => {
                            const msgId = parseInt(message.id) || 0;
                            setHoveredMessage(hoveredMessage === msgId ? null : msgId);
                          }}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            fontSize: '16px',
                            cursor: 'pointer',
                            padding: '4px 6px',
                            borderRadius: '6px'
                          }}
                          title="Reaccionar"
                        >
                          😊
                        </button>

                        {/* Mini emoji picker para reacciones */}
                        {hoveredMessage === (parseInt(message.id) || 0) && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            backgroundColor: 'white',
                            borderRadius: '20px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            padding: '8px',
                            display: 'flex',
                            gap: '4px',
                            marginTop: '4px',
                            zIndex: 20
                          }}>
                            {['👍', '❤️', '😂', '😮', '😢', '😡'].map((emoji, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  // Añadir reacción al mensaje
                                  setMessages(prev => prev.map(msg => {
                                    if (msg.id === message.id) {
                                      const existingReactions = msg.reactions || [];
                                      const userReaction = existingReactions.find(r => r.userId === currentUser.id);

                                      if (userReaction) {
                                        // Cambiar reacción existente
                                        return {
                                          ...msg,
                                          reactions: existingReactions.map(r =>
                                            r.userId === currentUser.id ? { ...r, emoji } : r
                                          )
                                        };
                                      } else {
                                        // Añadir nueva reacción
                                        return {
                                          ...msg,
                                          reactions: [...existingReactions, { userId: currentUser.id, emoji }]
                                        };
                                      }
                                    }
                                    return msg;
                                  }));
                                  setHoveredMessage(null);
                                }}
                                style={{
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  fontSize: '18px',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  borderRadius: '50%',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {isOwn && (
                        <button
                          onClick={() => deleteMessage(parseInt(message.id) || 0)}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            fontSize: '16px',
                            cursor: 'pointer',
                            padding: '4px 6px',
                            borderRadius: '6px'
                          }}
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Indicador de escribiendo */}
        {isTyping && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#6c757d',
            fontSize: '14px'
          }}>
            <div style={{
              display: 'flex',
              gap: '3px',
              padding: '8px 12px',
              backgroundColor: 'white',
              borderRadius: '18px'
            }}>
              <span className="typing-dot">•</span>
              <span className="typing-dot" style={{ animationDelay: '0.2s' }}>•</span>
              <span className="typing-dot" style={{ animationDelay: '0.4s' }}>•</span>
            </div>
            <span>està escrivint...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Barra de respuesta */}
      {replyingTo && (
        <div style={{
          padding: '8px 20px',
          backgroundColor: 'white',
          borderTop: '1px solid #e9ecef',
          borderLeft: '4px solid #3b82f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '12px',
              color: '#3b82f6',
              marginBottom: '2px'
            }}>
              Responent a {replyingTo.senderId === currentUser.id ? 'tu mateix' : activeConversation.name}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#6c757d',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {replyingTo.content}
            </div>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Input de mensaje */}
      <div style={{
        backgroundColor: 'white',
        padding: '12px 20px',
        borderTop: '1px solid #e9ecef',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '12px'
      }}>
        <div style={{ position: 'relative' }}>
          <button
            data-emoji-button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            😊
          </button>

          <EmojiPicker
            isOpen={showEmojiPicker}
            onClose={() => setShowEmojiPicker(false)}
            onSelectEmoji={(emoji: string) => setMessageText(messageText + emoji)}
          />
        </div>

        <div style={{ position: 'relative' }}>
          <button
            data-attach-button
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            📎
          </button>

          {showAttachMenu && (
            <div data-attach-menu style={{
              position: 'absolute',
              bottom: '100%',
              left: 0,
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              padding: '8px',
              minWidth: '180px',
              marginBottom: '8px',
              zIndex: 100
            }}>
              {[
                { icon: '📷', label: 'Foto/Vídeo', action: () => fileInputRef.current?.click() },
                { icon: '📁', label: 'Document', action: () => fileInputRef.current?.click() },
                { icon: '📍', label: 'Ubicació', action: () => console.log('Ubicació') },
                { icon: '👤', label: 'Contacte', action: () => console.log('Contacte') }
              ].map((option) => (
                <button
                  key={option.label}
                  onClick={() => {
                    option.action();
                    setShowAttachMenu(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    textAlign: 'left',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span>{option.icon}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
        />

        <textarea
          ref={messageInputRef}
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          placeholder="Escriu un missatge..."
          style={{
            flex: 1,
            padding: '10px 14px',
            backgroundColor: '#f8f9fa',
            border: '2px solid #e5e7eb',
            borderRadius: '24px',
            fontSize: '15px',
            resize: 'none',
            minHeight: '40px',
            maxHeight: '120px',
            lineHeight: '1.4',
            fontFamily: 'inherit',
            transition: 'border-color 0.2s',
            outline: 'none'
          }}
          rows={1}
        />

        <button
          onClick={messageText.trim() ? sendMessage : undefined}
          style={{
            backgroundColor: messageText.trim() ? '#3b82f6' : 'transparent',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '20px',
            color: messageText.trim() ? 'white' : '#6c757d',
            transition: 'all 0.2s'
          }}
        >
          {messageText.trim() ? '➤' : '🎤'}
        </button>
      </div>
    </div>
  );
}