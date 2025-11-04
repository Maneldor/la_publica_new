'use client';

import { Conversation, User } from '../types/chatTypes';

interface ConversationsListProps {
  isMobile: boolean;
  showConversation: boolean;
  filteredConversations: Conversation[];
  activeConversation: Conversation | null;
  currentUser: User;
  openConversation: (conversation: Conversation) => void;
  formatTime: (date: Date) => string;
}

export function ConversationsList({
  isMobile,
  showConversation,
  filteredConversations,
  activeConversation,
  currentUser,
  openConversation,
  formatTime
}: ConversationsListProps) {
  return (
    <div style={{
      width: isMobile ? '100%' : '350px',
      backgroundColor: 'white',
      borderRight: '1px solid #e9ecef',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header lista de chats */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #e9ecef'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#2c3e50',
            margin: 0
          }}>
            Missatges
          </h2>
          <select
            style={{
              padding: '6px 12px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <option>Recents</option>
            <option>No llegits</option>
            <option>Destacats</option>
          </select>
        </div>
      </div>

      {/* Lista de conversaciones */}
      <div style={{
        flex: 1,
        overflowY: 'auto'
      }}>
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => openConversation(conv)}
              style={{
                padding: '12px 20px',
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer',
                backgroundColor: activeConversation?.id === conv.id ? '#f0f7ff' : 'white',
                border: activeConversation?.id === conv.id ? '2px solid #3b82f6' : '2px solid transparent',
                borderRadius: '8px',
                margin: '4px 8px',
                transition: 'all 0.2s ease-in-out',
                position: 'relative',
                transform: 'translateY(0)'
              }}
              onMouseEnter={(e) => {
                if (activeConversation?.id !== conv.id) {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.border = '2px solid #3b82f6';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px -4px rgba(59, 130, 246, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeConversation?.id !== conv.id) {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.border = '2px solid transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <div style={{ display: 'flex', gap: '12px' }}>
                {/* Avatar */}
                <div style={{ position: 'relative' }}>
                  <img
                    src={conv.avatar}
                    alt={conv.name}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                  {conv.type === 'individual' && conv.participants[0]?.isOnline && (
                    <div style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '2px',
                      width: '12px',
                      height: '12px',
                      backgroundColor: '#10b981',
                      borderRadius: '50%',
                      border: '2px solid white'
                    }} />
                  )}
                </div>

                {/* Contenido */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '4px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span style={{
                        fontWeight: '600',
                        fontSize: '15px',
                        color: '#2c3e50'
                      }}>
                        {conv.name}
                      </span>
                      {conv.isPinned && <span style={{ fontSize: '12px', color: '#f59e0b' }}>FIXAT</span>}
                      {conv.isMuted && <span style={{ fontSize: '12px', color: '#6b7280' }}>SILENCIAT</span>}
                    </div>
                    <span style={{
                      fontSize: '12px',
                      color: '#6c757d'
                    }}>
                      {conv.lastMessage && formatTime(conv.lastMessage.timestamp)}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      color: '#6c757d',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1
                    }}>
                      {conv.lastMessage && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {conv.lastMessage.senderId === currentUser.id && (
                            <span style={{ color: conv.lastMessage.status === 'read' ? '#3b82f6' : '#6c757d' }}>
                              {conv.lastMessage.status === 'read' ? 'Llegit' :
                               conv.lastMessage.status === 'delivered' ? 'Entregat' : 'Enviat'}
                            </span>
                          )}
                          {conv.lastMessage.type === 'image' && 'Imatge: '}
                          {conv.lastMessage.type === 'document' && 'Document: '}
                          {conv.lastMessage.type === 'audio' && 'Audio: '}
                          {conv.lastMessage.content}
                        </span>
                      )}
                    </div>
                    {conv.unreadCount > 0 && (
                      <span style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        borderRadius: '12px',
                        padding: '2px 8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        minWidth: '20px',
                        textAlign: 'center'
                      }}>
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#6c757d'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              No hi ha converses
            </h3>
            <p style={{ fontSize: '14px' }}>
              Comença una nova conversa
            </p>
          </div>
        )}
      </div>
    </div>
  );
}