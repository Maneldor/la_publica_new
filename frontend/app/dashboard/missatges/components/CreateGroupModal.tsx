'use client';

import { useState, useEffect } from 'react';
import { X, Users, Search, Check, Loader2 } from 'lucide-react';

interface Contact {
  id: string;
  nick: string | null;
  name: string;
  image: string | null;
  isOnline: boolean;
  position?: string;
}

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: (conversationId: string) => void;
}

export function CreateGroupModal({ isOpen, onClose, onGroupCreated }: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  // Carregar contactes
  useEffect(() => {
    if (isOpen) {
      loadContacts();
    }
  }, [isOpen]);

  // Reset quan es tanca
  useEffect(() => {
    if (!isOpen) {
      setGroupName('');
      setSelectedContacts([]);
      setSearchTerm('');
      setError('');
    }
  }, [isOpen]);

  const loadContacts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/contacts');
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      }
    } catch (error) {
      console.error('Error carregant contactes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleContact = (contactId: string) => {
    setSelectedContacts(prev => {
      if (prev.includes(contactId)) {
        return prev.filter(id => id !== contactId);
      } else {
        return [...prev, contactId];
      }
    });
  };

  const filteredContacts = contacts.filter(c => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(search) ||
      c.nick?.toLowerCase().includes(search)
    );
  });

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError('Cal introduir un nom per al grup');
      return;
    }

    if (selectedContacts.length < 1) {
      setError('Cal seleccionar almenys un participant');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantIds: selectedContacts,
          type: 'group',
          name: groupName.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        const conversationId = data.id || data.conversation?.id;
        onGroupCreated(conversationId);
        onClose();
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Error creant el grup');
      }
    } catch (error) {
      console.error('Error creant grup:', error);
      setError('Error de connexió');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--CreateGroupModal-overlay, rgba(0, 0, 0, 0.5))'
    }}>
      <div style={{
        backgroundColor: 'var(--CreateGroupModal-background, #ffffff)',
        borderRadius: 'var(--CreateGroupModal-border-radius, 16px)',
        boxShadow: 'var(--CreateGroupModal-shadow, 0 25px 50px -12px rgba(0, 0, 0, 0.25))',
        width: '100%',
        maxWidth: '480px',
        margin: '16px',
        overflow: 'hidden',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--CreateGroupModal-border-color, #e5e7eb)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'var(--CreateGroupModal-icon-bg, #dbeafe)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--CreateGroupModal-title-color, #1f2937)',
                margin: 0
              }}>
                Crear grup
              </h3>
              <p style={{
                fontSize: '13px',
                color: 'var(--CreateGroupModal-subtitle-color, #6b7280)',
                margin: 0
              }}>
                {selectedContacts.length} participant{selectedContacts.length !== 1 ? 's' : ''} seleccionat{selectedContacts.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Nom del grup */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--CreateGroupModal-border-color, #e5e7eb)' }}>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '500',
            color: 'var(--CreateGroupModal-label-color, #374151)',
            marginBottom: '6px'
          }}>
            Nom del grup
          </label>
          <input
            type="text"
            placeholder="Ex: Equip de projecte..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '2px solid var(--CreateGroupModal-input-border, #e5e7eb)',
              borderRadius: 'var(--CreateGroupModal-input-radius, 10px)',
              fontSize: '14px',
              color: 'var(--CreateGroupModal-input-text, #1f2937)',
              backgroundColor: 'var(--CreateGroupModal-input-bg, #ffffff)',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--CreateGroupModal-focus-color, #3b82f6)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--CreateGroupModal-input-border, #e5e7eb)'}
          />
        </div>

        {/* Cercador de participants */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--CreateGroupModal-border-color, #e5e7eb)' }}>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '500',
            color: 'var(--CreateGroupModal-label-color, #374151)',
            marginBottom: '6px'
          }}>
            Afegir participants
          </label>
          <div style={{ position: 'relative' }}>
            <Search style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              color: 'var(--CreateGroupModal-icon-muted, #9ca3af)'
            }} />
            <input
              type="text"
              placeholder="Buscar contactes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 40px',
                border: '2px solid var(--CreateGroupModal-input-border, #e5e7eb)',
                borderRadius: 'var(--CreateGroupModal-input-radius, 10px)',
                fontSize: '14px',
                color: 'var(--CreateGroupModal-input-text, #1f2937)',
                backgroundColor: 'var(--CreateGroupModal-input-bg, #ffffff)',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--CreateGroupModal-focus-color, #3b82f6)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--CreateGroupModal-input-border, #e5e7eb)'}
            />
          </div>
        </div>

        {/* Llista de contactes */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px',
          maxHeight: '300px'
        }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
              <p style={{ marginTop: '12px', color: '#6b7280', fontSize: '14px' }}>
                Carregant contactes...
              </p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <Users className="w-12 h-12 mx-auto mb-3" style={{ color: '#d1d5db' }} />
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                {contacts.length === 0
                  ? 'No tens contactes per afegir al grup'
                  : 'No s\'han trobat contactes'
                }
              </p>
            </div>
          ) : (
            filteredContacts.map(contact => {
              const isSelected = selectedContacts.includes(contact.id);
              return (
                <button
                  key={contact.id}
                  onClick={() => toggleContact(contact.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                    border: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    marginBottom: '4px'
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    {contact.image ? (
                      <img
                        src={contact.image}
                        alt={contact.name}
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        backgroundColor: isSelected ? '#3b82f6' : '#e0e7ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isSelected ? '#ffffff' : '#4f46e5',
                        fontSize: '16px',
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
                        backgroundColor: '#10b981',
                        borderRadius: '50%',
                        border: '2px solid white'
                      }} />
                    )}
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <p style={{
                      fontSize: '15px',
                      fontWeight: '500',
                      color: '#1f2937',
                      margin: 0
                    }}>
                      {contact.name}
                    </p>
                    {contact.position && (
                      <p style={{
                        fontSize: '13px',
                        color: '#6b7280',
                        margin: '2px 0 0 0'
                      }}>
                        {contact.position}
                      </p>
                    )}
                  </div>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: isSelected ? '#3b82f6' : '#e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            padding: '12px 20px',
            backgroundColor: 'var(--CreateGroupModal-error-bg, #fef2f2)',
            color: 'var(--CreateGroupModal-error-text, #dc2626)',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Footer amb botons */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--CreateGroupModal-border-color, #e5e7eb)',
          display: 'flex',
          gap: '12px'
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: 'var(--CreateGroupModal-cancel-bg, #f3f4f6)',
              border: 'none',
              borderRadius: 'var(--CreateGroupModal-input-radius, 10px)',
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--CreateGroupModal-cancel-text, #374151)',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            Cancel·lar
          </button>
          <button
            onClick={handleCreateGroup}
            disabled={isCreating || !groupName.trim() || selectedContacts.length === 0}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: isCreating || !groupName.trim() || selectedContacts.length === 0 ? 'var(--CreateGroupModal-button-disabled, #9ca3af)' : 'var(--CreateGroupModal-primary-button, #3b82f6)',
              border: 'none',
              borderRadius: 'var(--CreateGroupModal-input-radius, 10px)',
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--CreateGroupModal-button-text, white)',
              cursor: isCreating || !groupName.trim() || selectedContacts.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background-color 0.2s'
            }}
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creant...
              </>
            ) : (
              <>
                <Users className="w-4 h-4" />
                Crear grup
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
