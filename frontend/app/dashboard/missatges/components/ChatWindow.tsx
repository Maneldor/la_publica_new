'use client';

import { useState, useEffect } from 'react';
import { User, Message, Conversation, CurrentUser } from '../types/chatTypes';
import { EmojiPicker } from './EmojiPicker';
import {
  ArrowLeft,
  Search,
  Phone,
  MoreVertical,
  FileText,
  Clock,
  Reply,
  Star,
  Smile,
  Trash2,
  Paperclip,
  Camera,
  MapPin,
  User as UserIcon,
  Mic,
  Send,
  X,
  Loader2,
  Users,
  BellOff,
  Bell,
  Archive,
  UserPlus,
  LogOut
} from 'lucide-react';

interface ChatWindowProps {
  activeConversation: Conversation;
  currentUser: CurrentUser;
  messages: Message[];
  messageText: string;
  setMessageText: (text: string) => void;
  showSearchInChat: boolean;
  setShowSearchInChat: (show: boolean) => void;
  searchInChatTerm: string;
  setSearchInChatTerm: (term: string) => void;
  hoveredMessage: string | null;
  setHoveredMessage: (id: string | null) => void;
  replyingTo: Message | null;
  setReplyingTo: (message: Message | null) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
  showAttachMenu: boolean;
  setShowAttachMenu: (show: boolean) => void;
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  messageInputRef: React.RefObject<HTMLTextAreaElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isMobile: boolean;
  closeConversation: () => void;
  sendMessage: () => void;
  starMessage: (messageId: string) => void;
  deleteMessage: (messageId: string) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formatTime: (date: Date | string) => string;
  formatFileSize: (size: number) => string;
  isLoadingMessages?: boolean;
  isSending?: boolean;
  onCreateGroup?: () => void;
  onMuteConversation?: (conversationId: string) => void;
  onArchiveConversation?: (conversationId: string) => void;
  onDeleteConversation?: (conversationId: string) => void;
  onViewProfile?: (userId: string) => void;
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
  formatFileSize,
  isLoadingMessages = false,
  isSending = false,
  onCreateGroup,
  onMuteConversation,
  onArchiveConversation,
  onDeleteConversation,
  onViewProfile
}: ChatWindowProps) {

  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  // Tancar menú al fer clic fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-options-menu]') && !target.closest('[data-options-button]')) {
        setShowOptionsMenu(false);
      }
    };

    if (showOptionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showOptionsMenu]);

  // Obtenir nom i avatar de la conversa
  const conversationName = activeConversation.name || activeConversation.title || 'Conversa';
  const conversationAvatar = activeConversation.avatar ||
    activeConversation.participants?.[0]?.image ||
    activeConversation.participants?.[0]?.avatar ||
    '/default-avatar.png';
  const firstParticipant = activeConversation.participants?.[0];

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header de la conversación */}
      <div className="bg-white px-5 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isMobile && (
            <button
              onClick={closeConversation}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {conversationAvatar && conversationAvatar !== '/default-avatar.png' ? (
              <img
                src={conversationAvatar}
                alt={conversationName}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div>
            <div className="font-semibold text-gray-900">
              {conversationName}
            </div>
            <div className={`text-xs ${firstParticipant?.isOnline ? 'text-green-500' : 'text-gray-500'}`}>
              {firstParticipant?.isOnline ? 'En línia' : firstParticipant?.lastSeen || ''}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowSearchInChat(!showSearchInChat)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Search className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <div style={{ position: 'relative' }}>
            <button
              data-options-button
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              style={{
                backgroundColor: showOptionsMenu ? '#f3f4f6' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!showOptionsMenu) e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                if (!showOptionsMenu) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>

            {/* Menú desplegable */}
            {showOptionsMenu && (
              <div
                data-options-menu
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                  border: '1px solid #e5e7eb',
                  minWidth: '220px',
                  zIndex: 50,
                  overflow: 'hidden'
                }}
              >
                {/* Crear grup */}
                <button
                  onClick={() => {
                    setShowOptionsMenu(false);
                    onCreateGroup?.();
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '14px',
                    color: '#374151',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Users className="w-5 h-5 text-blue-500" />
                  <span>Crear grup</span>
                </button>

                {/* Afegir participants (solo para grupos) */}
                {activeConversation.type === 'group' && (
                  <button
                    onClick={() => {
                      setShowOptionsMenu(false);
                      // TODO: Implementar afegir participants
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '14px',
                      color: '#374151',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <UserPlus className="w-5 h-5 text-green-500" />
                    <span>Afegir participants</span>
                  </button>
                )}

                {/* Veure perfil (solo para conversaciones individuales) */}
                {activeConversation.type !== 'group' && activeConversation.participants?.[0] && (
                  <button
                    onClick={() => {
                      setShowOptionsMenu(false);
                      onViewProfile?.(activeConversation.participants![0].id);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '14px',
                      color: '#374151',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <UserIcon className="w-5 h-5 text-purple-500" />
                    <span>Veure perfil</span>
                  </button>
                )}

                {/* Separador */}
                <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '4px 0' }} />

                {/* Silenciar/Activar notificacions */}
                <button
                  onClick={() => {
                    setShowOptionsMenu(false);
                    onMuteConversation?.(activeConversation.id);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '14px',
                    color: '#374151',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {activeConversation.isMuted ? (
                    <>
                      <Bell className="w-5 h-5 text-amber-500" />
                      <span>Activar notificacions</span>
                    </>
                  ) : (
                    <>
                      <BellOff className="w-5 h-5 text-amber-500" />
                      <span>Silenciar conversa</span>
                    </>
                  )}
                </button>

                {/* Arxivar */}
                <button
                  onClick={() => {
                    setShowOptionsMenu(false);
                    onArchiveConversation?.(activeConversation.id);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '14px',
                    color: '#374151',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Archive className="w-5 h-5 text-gray-500" />
                  <span>{activeConversation.isArchived ? 'Desarxivar' : 'Arxivar conversa'}</span>
                </button>

                {/* Sortir del grup (solo para grupos) */}
                {activeConversation.type === 'group' && (
                  <button
                    onClick={() => {
                      setShowOptionsMenu(false);
                      // TODO: Implementar sortir del grup
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '14px',
                      color: '#374151',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut className="w-5 h-5 text-orange-500" />
                    <span>Sortir del grup</span>
                  </button>
                )}

                {/* Separador */}
                <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '4px 0' }} />

                {/* Eliminar conversa */}
                <button
                  onClick={() => {
                    setShowOptionsMenu(false);
                    onDeleteConversation?.(activeConversation.id);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '14px',
                    color: '#ef4444',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Eliminar conversa</span>
                </button>
              </div>
            )}
          </div>
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
              padding: '10px 14px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#1f2937',
              backgroundColor: '#ffffff',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
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
        {/* Estat de càrrega */}
        {isLoadingMessages ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1
          }}>
            <div style={{ textAlign: 'center' }}>
              <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
              <span style={{ color: '#6c757d', fontSize: '14px' }}>Carregant missatges...</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1
          }}>
            <div style={{ textAlign: 'center', color: '#6c757d' }}>
              <p>Encara no hi ha missatges.</p>
              <p style={{ fontSize: '14px' }}>Envia el primer missatge!</p>
            </div>
          </div>
        ) : (
          <>
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
              const sender = isOwn
                ? currentUser
                : message.sender || activeConversation.participants?.find(p => p.id === message.senderId);
              const senderName = sender?.name || sender?.nick || 'Usuari';
              const senderAvatar = (sender as User)?.image || (sender as User)?.avatar;

              return (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    justifyContent: isOwn ? 'flex-end' : 'flex-start',
                    marginBottom: '4px'
                  }}
                  onMouseEnter={() => setHoveredMessage(message.id)}
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
                    {!isOwn && activeConversation.type === 'group' && senderAvatar && (
                      <img
                        src={senderAvatar}
                        alt={senderName}
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
                          {senderName}
                        </div>
                      )}

                      <div style={{
                        backgroundColor: isOwn ? '#3b82f6' : 'white',
                        color: isOwn ? 'white' : '#2c3e50',
                        padding: message.type === 'image' ? '4px' : '10px 14px',
                        borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        border: isOwn ? 'none' : '2px solid #e5e7eb',
                        boxShadow: isOwn ? '0 4px 6px -1px rgba(59, 130, 246, 0.3), 0 2px 4px -1px rgba(59, 130, 246, 0.1)' : '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
                        position: 'relative',
                        opacity: message.status === 'sending' ? 0.7 : 1
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
                            <FileText className="w-6 h-6 text-gray-500" />
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
                            <span style={{ color: message.status === 'read' && !isOwn ? '#3b82f6' : 'inherit', display: 'inline-flex', alignItems: 'center' }}>
                              {message.status === 'sending' ? <Clock className="w-3 h-3" /> :
                               message.status === 'read' ? '✓✓' :
                               message.status === 'delivered' ? '✓✓' :
                               message.status === 'sent' ? '✓' : <Clock className="w-3 h-3" />}
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
                            {Object.entries(
                              message.reactions.reduce((acc, reaction) => {
                                acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                                return acc;
                              }, {} as Record<string, number>)
                            ).map(([emoji, count], idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setMessages(prev => prev.map(msg => {
                                    if (msg.id === message.id) {
                                      const reactions = msg.reactions || [];
                                      const userReaction = reactions.find(r => r.userId === currentUser.id && r.emoji === emoji);

                                      if (userReaction) {
                                        return {
                                          ...msg,
                                          reactions: reactions.filter(r => !(r.userId === currentUser.id && r.emoji === emoji))
                                        };
                                      } else {
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
                                title={`${count} reacció${count > 1 ? 'ns' : ''}`}
                              >
                                <span>{emoji}</span>
                                {count > 1 && <span style={{ fontSize: '10px', color: '#6c757d' }}>{count}</span>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Acciones del mensaje en hover */}
                      {hoveredMessage === message.id && message.status !== 'sending' && (
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
                              cursor: 'pointer',
                              padding: '4px 6px',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title="Respondre"
                          >
                            <Reply className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => starMessage(message.id)}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px 6px',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title="Destacar"
                          >
                            <Star className={`w-4 h-4 ${message.isStarred ? 'text-amber-500 fill-amber-500' : 'text-amber-500'}`} />
                          </button>
                          <div style={{ position: 'relative' }}>
                            <button
                              style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px 6px',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              title="Reaccionar"
                            >
                              <Smile className="w-4 h-4 text-amber-500" />
                            </button>

                            {/* Mini emoji picker per reaccions */}
                            {hoveredMessage === message.id && (
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
                                      setMessages(prev => prev.map(msg => {
                                        if (msg.id === message.id) {
                                          const existingReactions = msg.reactions || [];
                                          const userReaction = existingReactions.find(r => r.userId === currentUser.id);

                                          if (userReaction) {
                                            return {
                                              ...msg,
                                              reactions: existingReactions.map(r =>
                                                r.userId === currentUser.id ? { ...r, emoji } : r
                                              )
                                            };
                                          } else {
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
                              onClick={() => deleteMessage(message.id)}
                              style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px 6px',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

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
              Responent a {replyingTo.senderId === currentUser.id ? 'tu mateix' : conversationName}
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
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X className="w-5 h-5 text-gray-500" />
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
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Smile className="w-6 h-6 text-gray-500 hover:text-amber-500 transition-colors" />
          </button>

          <EmojiPicker
            isOpen={showEmojiPicker}
            onClose={() => setShowEmojiPicker(false)}
            onSelectEmoji={(emoji) => setMessageText(messageText + emoji)}
          />
        </div>

        <div style={{ position: 'relative' }}>
          <button
            data-attach-button
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Paperclip className="w-6 h-6 text-gray-500 hover:text-blue-500 transition-colors" />
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
                { icon: Camera, label: 'Foto/Vídeo', action: () => fileInputRef.current?.click(), color: 'text-blue-500' },
                { icon: FileText, label: 'Document', action: () => fileInputRef.current?.click(), color: 'text-amber-500' },
                { icon: MapPin, label: 'Ubicació', action: () => console.log('Ubicació'), color: 'text-red-500' },
                { icon: UserIcon, label: 'Contacte', action: () => console.log('Contacte'), color: 'text-violet-500' }
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
                    color: '#374151',
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
                  <option.icon className={`w-5 h-5 ${option.color}`} />
                  <span style={{ color: '#374151' }}>{option.label}</span>
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
          disabled={isSending}
          className="message-input"
          style={{
            flex: 1,
            padding: '10px 14px',
            backgroundColor: '#ffffff',
            border: '2px solid #e5e7eb',
            borderRadius: '24px',
            fontSize: '15px',
            color: '#1f2937',
            resize: 'none',
            minHeight: '40px',
            maxHeight: '120px',
            lineHeight: '1.4',
            fontFamily: 'inherit',
            transition: 'border-color 0.2s',
            outline: 'none',
            opacity: isSending ? 0.7 : 1
          }}
          rows={1}
        />

        <button
          onClick={messageText.trim() && !isSending ? sendMessage : undefined}
          disabled={isSending || !messageText.trim()}
          style={{
            backgroundColor: messageText.trim() ? '#3b82f6' : 'transparent',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: messageText.trim() && !isSending ? 'pointer' : 'default',
            transition: 'all 0.2s',
            opacity: isSending ? 0.7 : 1
          }}
        >
          {isSending ? (
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          ) : messageText.trim() ? (
            <Send className="w-5 h-5 text-white" />
          ) : (
            <Mic className="w-5 h-5 text-gray-500" />
          )}
        </button>
      </div>
    </div>
  );
}
