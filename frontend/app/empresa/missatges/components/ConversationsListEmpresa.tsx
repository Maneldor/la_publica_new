'use client';

import { User, Conversation } from '../../../gestor-empreses/missatges/types/chatTypes';

interface ConversationsListProps {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  openConversation: (conversation: Conversation) => void;
  currentUser: User;
  searchInChatTerm: string;
  setSearchInChatTerm: (term: string) => void;
  isMobile: boolean;
}

export function ConversationsList({
  conversations,
  activeConversation,
  openConversation,
  currentUser,
  searchInChatTerm,
  setSearchInChatTerm,
  isMobile
}: ConversationsListProps) {

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchInChatTerm.toLowerCase())
  );

  const formatTime = (date: Date | string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diff = now.getTime() - messageDate.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return messageDate.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Ahir';
    } else if (days < 7) {
      return messageDate.toLocaleDateString('ca-ES', { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' });
    }
  };

  const getConversationTypeIcon = (type: string) => {
    switch (type) {
      case 'gestor':
        return '👤'; // Gestor comercial
      case 'company':
        return '🏢'; // Otras empresas/personas de contacto
      case 'group':
        return '👥'; // Grupo
      default:
        return '💬'; // Conversación general
    }
  };

  const getConversationTypeBadge = (type: string) => {
    switch (type) {
      case 'gestor':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            Gestor Assignat
          </span>
        );
      case 'company':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            Equip
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{
      width: isMobile ? '100vw' : '320px',
      borderRight: '1px solid #e9ecef',
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #e9ecef',
        backgroundColor: 'white'
      }}>
        <h1 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#2c3e50',
          margin: '0 0 12px 0'
        }}>
          Missatges
        </h1>

        {/* Search */}
        <div style={{
          position: 'relative'
        }}>
          <input
            type="text"
            placeholder="Buscar converses..."
            value={searchInChatTerm}
            onChange={(e) => setSearchInChatTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              border: '1px solid #e9ecef',
              borderRadius: '20px',
              fontSize: '14px',
              backgroundColor: '#f8f9fa'
            }}
          />
          <svg
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              color: '#6c757d'
            }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Conversations List */}
      <div style={{
        flex: 1,
        overflowY: 'auto'
      }}>
        {filteredConversations.length === 0 ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: '#6c757d'
          }}>
            {searchInChatTerm ? (
              <>
                <p>No s'han trobat converses</p>
                <p style={{ fontSize: '14px', marginTop: '8px' }}>
                  Prova amb altres termes de cerca
                </p>
              </>
            ) : (
              <>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto'
                }}>
                  <svg style={{ width: '24px', height: '24px', color: '#6c757d' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p>No tens converses encara</p>
                <p style={{ fontSize: '14px', marginTop: '8px' }}>
                  El teu gestor comercial es posarà en contacte aviat
                </p>
              </>
            )}
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => openConversation(conversation)}
              style={{
                padding: '12px 20px',
                borderBottom: '1px solid #f1f3f4',
                cursor: 'pointer',
                backgroundColor: activeConversation?.id === conversation.id ? '#e3f2fd' : 'white',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                if (activeConversation?.id !== conversation.id) {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }
              }}
              onMouseLeave={(e) => {
                if (activeConversation?.id !== conversation.id) {
                  e.currentTarget.style.backgroundColor = 'white';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                {/* Avatar with type indicator */}
                <div style={{ position: 'relative' }}>
                  <img
                    src={conversation.avatar}
                    alt={conversation.name}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '20px',
                    height: '20px',
                    backgroundColor: (conversation.type as string) === 'gestor' ? '#3b82f6' : '#10b981',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    border: '2px solid white'
                  }}>
                    {getConversationTypeIcon(conversation.type)}
                  </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <h3 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#2c3e50',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {conversation.name}
                    </h3>
                    {conversation.lastMessage && (
                      <span style={{
                        fontSize: '12px',
                        color: '#6c757d',
                        flexShrink: 0,
                        marginLeft: '8px'
                      }}>
                        {formatTime(conversation.lastMessage.timestamp)}
                      </span>
                    )}
                  </div>

                  {/* Type badge */}
                  <div style={{ marginBottom: '4px' }}>
                    {getConversationTypeBadge(conversation.type)}
                  </div>

                  {/* Last message */}
                  {conversation.lastMessage && (
                    <p style={{
                      fontSize: '13px',
                      color: '#6c757d',
                      margin: '0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {conversation.lastMessage.senderId === currentUser.id ? 'Tu: ' : ''}
                      {conversation.lastMessage.content}
                    </p>
                  )}

                  {/* Indicators */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    {conversation.unreadCount > 0 && (
                      <span style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        fontSize: '11px',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        fontWeight: '600',
                        minWidth: '18px',
                        textAlign: 'center'
                      }}>
                        {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                      </span>
                    )}
                    {conversation.isPinned && (
                      <span style={{ color: '#ffc107', fontSize: '12px' }}>📌</span>
                    )}
                    {conversation.isMuted && (
                      <span style={{ color: '#6c757d', fontSize: '12px' }}>🔕</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}