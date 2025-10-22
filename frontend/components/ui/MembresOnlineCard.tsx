'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Member {
  id: number;
  name: string;
  avatar: string;
}

export function MembresOnlineCard() {
  const router = useRouter();

  // Estados para controlar expansión
  const [showConnected, setShowConnected] = useState(false); // false = contraido por defecto
  const [showNotConnected, setShowNotConnected] = useState(false);

  // Datos de ejemplo
  const connectedMembers = [
    { id: 1, name: 'Joan Martínez', avatar: '/avatar1.jpg' },
    { id: 2, name: 'Maria García', avatar: '/avatar2.jpg' },
    { id: 3, name: 'Anna Soler', avatar: '/avatar3.jpg' },
    { id: 4, name: 'Carla Roca', avatar: '/avatar4.jpg' },
    { id: 5, name: 'David Ferrer', avatar: '/avatar5.jpg' },
    { id: 6, name: 'Elena Vidal', avatar: '/avatar6.jpg' },
  ];

  const notConnectedMembers = [
    { id: 7, name: 'Pere López', avatar: '/avatar3.jpg' },
    { id: 8, name: 'Laura Puig', avatar: '/avatar4.jpg' },
    { id: 9, name: 'Marc Torres', avatar: '/avatar5.jpg' },
    { id: 10, name: 'Francesc Pons', avatar: '/avatar6.jpg' },
  ];

  const renderMemberItem = (member: Member) => (
    <div
      key={member.id}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'background-color 0.2s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: '#e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        fontWeight: '600',
        color: '#666'
      }}>
        {member.name.charAt(0)}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#2c3e50'
        }}>
          {member.name}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '20px',
      border: '2px solid #e5e7eb',
      boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#2c3e50',
          margin: 0
        }}>
          Membres online
        </h3>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          color: '#10b981',
          fontWeight: '500'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            animation: 'pulse 2s infinite'
          }} />
          5 actius
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Amb Connexió Section */}
        <div style={{
          border: '1px solid #e9ecef',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#fff'
        }}>
          <button
            type="button"
            onClick={() => setShowConnected(!showConnected)}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#f8f9fa',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'background-color 0.2s',
              border: 'none',
              outline: 'none'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#2c3e50'
              }}>
                Amb Connexió
              </span>
              <span style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                {connectedMembers.length}
              </span>
            </div>
            <div style={{
              fontSize: '18px',
              color: '#6c757d',
              transform: showConnected ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.3s'
            }}>
              ▼
            </div>
          </button>

          {showConnected && (
            <div style={{
              padding: '12px',
              borderTop: '1px solid #f0f0f0',
              backgroundColor: '#fafbfc'
            }}>
              {connectedMembers.slice(0, 5).map(renderMemberItem)}
              {connectedMembers.length > 5 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push('/dashboard/membres?filter=connected');
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginTop: '8px',
                    backgroundColor: 'transparent',
                    color: '#3b82f6',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f7ff'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Veure més ({connectedMembers.length - 5})
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sense Connexió Section */}
        <div style={{
          border: '1px solid #e9ecef',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#fff'
        }}>
          <button
            type="button"
            onClick={() => setShowNotConnected(!showNotConnected)}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#f8f9fa',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'background-color 0.2s',
              border: 'none',
              outline: 'none'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#2c3e50'
              }}>
                Sense Connexió
              </span>
              <span style={{
                backgroundColor: '#6c757d',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                {notConnectedMembers.length}
              </span>
            </div>
            <div style={{
              fontSize: '18px',
              color: '#6c757d',
              transform: showNotConnected ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.3s'
            }}>
              ▼
            </div>
          </button>

          {showNotConnected && (
            <div style={{
              padding: '12px',
              borderTop: '1px solid #f0f0f0',
              backgroundColor: '#fafbfc'
            }}>
              {notConnectedMembers.slice(0, 5).map(renderMemberItem)}
              {notConnectedMembers.length > 5 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push('/dashboard/membres?filter=not-connected');
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginTop: '8px',
                    backgroundColor: 'transparent',
                    color: '#3b82f6',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f7ff'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Veure més ({notConnectedMembers.length - 5})
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}