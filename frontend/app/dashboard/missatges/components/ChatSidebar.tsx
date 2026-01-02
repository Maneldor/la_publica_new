'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CurrentUser } from '../types/chatTypes';
import {
  Inbox, Star, BellOff, Archive, Users, Building2,
  User as UserIcon, Search, X, MessageCircle, Loader2
} from 'lucide-react';

interface Contact {
  id: string;
  nick: string | null;
  name: string;
  image: string | null;
  isOnline: boolean;
  position?: string;
  department?: string;
}

interface ChatSidebarProps {
  isMobile: boolean;
  showConversation: boolean;
  activeConversation: any;
  currentUser: CurrentUser;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeFilter: 'all' | 'starred' | 'muted' | 'archived' | 'groups' | 'companies';
  setActiveFilter: (filter: 'all' | 'starred' | 'muted' | 'archived' | 'groups' | 'companies') => void;
  totalUnread: number;
  onNewConversation?: (conversationId: string) => void;
}

export function ChatSidebar({
  isMobile,
  showConversation,
  activeConversation,
  currentUser,
  searchTerm,
  setSearchTerm,
  activeFilter,
  setActiveFilter,
  totalUnread,
  onNewConversation
}: ChatSidebarProps) {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  const userAvatar = currentUser.image;
  const userName = currentUser.name || currentUser.nick || 'Usuari';

  // Carregar contactes
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setIsLoadingContacts(true);
    try {
      const res = await fetch('/api/contacts');
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      }
    } catch (error) {
      console.error('Error carregant contactes:', error);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  // Iniciar nova conversa amb un contacte
  const startConversation = async (contactId: string) => {
    setIsCreatingConversation(true);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantIds: [contactId]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const conversationId = data.id || data.conversation?.id;

        setShowNewConversationModal(false);
        setContactSearch('');

        // Notificar al pare per recarregar converses i seleccionar la nova
        if (onNewConversation && conversationId) {
          onNewConversation(conversationId);
        }
      }
    } catch (error) {
      console.error('Error iniciant conversa:', error);
    } finally {
      setIsCreatingConversation(false);
    }
  };

  // Filtrar contactes per cerca
  const filteredContacts = contacts.filter(c => {
    if (!contactSearch) return true;
    const search = contactSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(search) ||
      c.nick?.toLowerCase().includes(search) ||
      c.position?.toLowerCase().includes(search)
    );
  });

  const filters = [
    { key: 'all', icon: Inbox, label: 'Tots els xats', badge: totalUnread },
    { key: 'starred', icon: Star, label: 'Destacats' },
    { key: 'muted', icon: BellOff, label: 'Silenciats' },
    { key: 'archived', icon: Archive, label: 'Arxivats' },
    { key: 'groups', icon: Users, label: 'Grups' },
    { key: 'companies', icon: Building2, label: 'Empreses' }
  ];

  return (
    <>
      <div style={{
        width: isMobile ? '100%' : '240px',
        backgroundColor: 'var(--ChatSidebar-background, #1e293b)',
        color: 'var(--ChatSidebar-text-color, #ffffff)',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--ChatSidebar-border-color, #334155)'
      }}>
        {/* Header Sidebar */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--ChatSidebar-border-color, #334155)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--ChatSidebar-avatar-bg, #334155)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <UserIcon style={{ width: '20px', height: '20px', color: 'var(--ChatSidebar-icon-color, #9ca3af)' }} />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: '600', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
              <div style={{ fontSize: '12px', color: 'var(--ChatSidebar-secondary-text, #94a3b8)' }}>En línia</div>
            </div>
            <button
              onClick={() => setShowNewConversationModal(true)}
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: 'var(--ChatSidebar-button-bg, #4f46e5)',
                border: 'none',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ChatSidebar-button-color, #ffffff)',
                fontSize: '18px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              title="Nova conversa"
            >
              +
            </button>
          </div>

          {/* Buscador */}
          <div style={{ position: 'relative' }}>
            <Search style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              color: 'var(--ChatSidebar-icon-color, #94a3b8)'
            }} />
            <input
              type="text"
              placeholder="Buscar converses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '36px',
                paddingRight: '16px',
                padding: '8px 16px 8px 36px',
                backgroundColor: 'var(--ChatSidebar-input-bg, #334155)',
                border: '1px solid var(--ChatSidebar-input-border, #475569)',
                borderRadius: '8px',
                fontSize: '14px',
                color: 'var(--ChatSidebar-text-color, #ffffff)',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Filtros de navegación */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key as any)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '4px',
                backgroundColor: activeFilter === filter.key ? 'var(--ChatSidebar-filter-active-bg, #334155)' : 'transparent',
                color: activeFilter === filter.key ? 'var(--ChatSidebar-text-color, #ffffff)' : 'var(--ChatSidebar-secondary-text, #cbd5e1)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <filter.icon style={{ width: '16px', height: '16px' }} />
              <span style={{ flex: 1, textAlign: 'left' }}>{filter.label}</span>
              {filter.badge && filter.badge > 0 && (
                <span style={{
                  backgroundColor: 'var(--ChatSidebar-badge-bg, #ef4444)',
                  color: 'var(--ChatSidebar-badge-color, #ffffff)',
                  borderRadius: '9999px',
                  padding: '2px 8px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {filter.badge}
                </span>
              )}
            </button>
          ))}

          {/* Secció de contactes */}
          <div style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid var(--ChatSidebar-border-color, #334155)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
              padding: '0 4px'
            }}>
              <span style={{
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                color: 'var(--ChatSidebar-secondary-text, #94a3b8)',
                letterSpacing: '0.05em'
              }}>
                Contactes ({contacts.length})
              </span>
            </div>

            {isLoadingContacts ? (
              <div style={{ textAlign: 'center', padding: '12px' }}>
                <Loader2 style={{ width: '20px', height: '20px', margin: '0 auto', color: 'var(--ChatSidebar-icon-color, #64748b)' }} className="animate-spin" />
              </div>
            ) : contacts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '12px', fontSize: '14px', color: 'var(--ChatSidebar-secondary-text, #94a3b8)' }}>
                <Users style={{ width: '32px', height: '32px', margin: '0 auto 8px', color: 'var(--ChatSidebar-icon-color, #475569)' }} />
                <p>No tens contactes</p>
                <button
                  onClick={() => router.push('/dashboard/membres')}
                  style={{
                    marginTop: '8px',
                    padding: '6px 12px',
                    backgroundColor: 'var(--ChatSidebar-button-bg, #4f46e5)',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'var(--ChatSidebar-button-color, #ffffff)',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Anar a Membres
                </button>
              </div>
            ) : (
              <div style={{ maxHeight: '144px', overflowY: 'auto' }}>
                {contacts.slice(0, 5).map(contact => (
                  <button
                    key={contact.id}
                    onClick={() => startConversation(contact.id)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'inherit',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      {contact.image ? (
                        <img
                          src={contact.image}
                          alt={contact.name}
                          style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--ChatSidebar-avatar-bg, #475569)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {contact.isOnline && (
                        <span style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: '8px',
                          height: '8px',
                          backgroundColor: 'var(--ChatSidebar-online-color, #22c55e)',
                          borderRadius: '50%',
                          border: '2px solid var(--ChatSidebar-background, #1e293b)'
                        }} />
                      )}
                    </div>
                    <span style={{ fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{contact.name}</span>
                  </button>
                ))}
                {contacts.length > 5 && (
                  <button
                    onClick={() => setShowNewConversationModal(true)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      color: 'var(--ChatSidebar-link-color, #818cf8)',
                      fontSize: '12px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Veure tots ({contacts.length})
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Nova Conversa */}
      {showNewConversationModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <div style={{
            backgroundColor: 'var(--ChatSidebar-modal-bg, #ffffff)',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            width: '100%',
            maxWidth: '448px',
            margin: '0 16px',
            overflow: 'hidden'
          }}>
            {/* Header Modal */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid var(--ChatSidebar-modal-border, #e5e7eb)'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--ChatSidebar-modal-title, #111827)',
                margin: 0
              }}>
                Nova conversa
              </h3>
              <button
                onClick={() => {
                  setShowNewConversationModal(false);
                  setContactSearch('');
                }}
                style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <X style={{ width: '20px', height: '20px', color: 'var(--ChatSidebar-modal-icon, #6b7280)' }} />
              </button>
            </div>

            {/* Cercador */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid var(--ChatSidebar-modal-border, #e5e7eb)'
            }}>
              <div style={{ position: 'relative' }}>
                <Search style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '16px',
                  height: '16px',
                  color: 'var(--ChatSidebar-modal-icon, #9ca3af)'
                }} />
                <input
                  type="text"
                  placeholder="Buscar contacte..."
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '10px 16px 10px 40px',
                    border: '2px solid var(--ChatSidebar-modal-input-border, #e5e7eb)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: 'var(--ChatSidebar-modal-text, #111827)',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Llista de contactes */}
            <div style={{ maxHeight: '320px', overflowY: 'auto', padding: '8px' }}>
              {isLoadingContacts ? (
                <div style={{ textAlign: 'center', padding: '32px' }}>
                  <Loader2 style={{ width: '32px', height: '32px', margin: '0 auto', color: 'var(--ChatSidebar-button-bg, #4f46e5)' }} className="animate-spin" />
                  <p style={{ marginTop: '12px', color: 'var(--ChatSidebar-modal-secondary, #6b7280)', fontSize: '14px' }}>Carregant contactes...</p>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px' }}>
                  <Users style={{ width: '48px', height: '48px', margin: '0 auto 12px', color: 'var(--ChatSidebar-modal-icon, #d1d5db)' }} />
                  <p style={{ color: 'var(--ChatSidebar-modal-secondary, #6b7280)', fontSize: '14px', marginBottom: '16px' }}>
                    {contacts.length === 0
                      ? 'No tens contactes. Connecta amb altres membres primer.'
                      : 'No s\'han trobat contactes'
                    }
                  </p>
                  {contacts.length === 0 && (
                    <button
                      onClick={() => {
                        setShowNewConversationModal(false);
                        router.push('/dashboard/membres');
                      }}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: 'var(--ChatSidebar-button-bg, #4f46e5)',
                        color: 'var(--ChatSidebar-button-color, #ffffff)',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      Anar a Membres
                    </button>
                  )}
                </div>
              ) : (
                filteredContacts.map(contact => (
                  <button
                    key={contact.id}
                    onClick={() => startConversation(contact.id)}
                    disabled={isCreatingConversation}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '12px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: isCreatingConversation ? 'wait' : 'pointer',
                      opacity: isCreatingConversation ? 0.7 : 1,
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      {contact.image ? (
                        <img
                          src={contact.image}
                          alt={contact.name}
                          style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--ChatSidebar-modal-avatar-bg, #e0e7ff)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--ChatSidebar-button-bg, #4f46e5)',
                          fontWeight: '600'
                        }}>
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {contact.isOnline && (
                        <span style={{
                          position: 'absolute',
                          bottom: '2px',
                          right: '2px',
                          width: '12px',
                          height: '12px',
                          backgroundColor: 'var(--ChatSidebar-online-color, #22c55e)',
                          borderRadius: '50%',
                          border: '2px solid var(--ChatSidebar-modal-bg, #ffffff)'
                        }} />
                      )}
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: 'var(--ChatSidebar-modal-text, #111827)',
                        margin: 0
                      }}>
                        {contact.name}
                      </p>
                      {contact.position && (
                        <p style={{
                          fontSize: '12px',
                          color: 'var(--ChatSidebar-modal-secondary, #6b7280)',
                          marginTop: '2px'
                        }}>
                          {contact.position}
                        </p>
                      )}
                    </div>
                    <MessageCircle style={{ width: '20px', height: '20px', color: 'var(--ChatSidebar-modal-icon, #9ca3af)' }} />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
