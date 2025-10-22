'use client';

import { User } from '../types/chatTypes';

interface ChatSidebarProps {
  isMobile: boolean;
  showConversation: boolean;
  activeConversation: any;
  currentUser: User;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeFilter: 'all' | 'starred' | 'muted' | 'archived' | 'groups' | 'companies';
  setActiveFilter: (filter: 'all' | 'starred' | 'muted' | 'archived' | 'groups' | 'companies') => void;
  totalUnread: number;
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
  totalUnread
}: ChatSidebarProps) {
  return (
    <div style={{
      width: isMobile ? '100%' : '240px',
      backgroundColor: '#2c3e50',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid #34495e'
    }}>
      {/* Header Sidebar */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #34495e'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', fontSize: '14px' }}>{currentUser.name}</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>En línia</div>
          </div>
          <button
            style={{
              backgroundColor: '#3b82f6',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '18px',
              color: 'white'
            }}
            title="Nou missatge"
          >
            +
          </button>
        </div>

        {/* Buscador */}
        <input
          type="text"
          placeholder="Buscar converses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            backgroundColor: '#34495e',
            border: '1px solid #445566',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px'
          }}
        />
      </div>

      {/* Filtros de navegación */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px'
      }}>
        {[
          { key: 'all', icon: '📬', label: 'Tots els xats', badge: totalUnread },
          { key: 'starred', icon: '⭐', label: 'Destacats' },
          { key: 'muted', icon: '🔕', label: 'Silenciats' },
          { key: 'archived', icon: '📁', label: 'Arxivats' },
          { key: 'groups', icon: '👥', label: 'Grups' },
          { key: 'companies', icon: '🏢', label: 'Empreses' }
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key as any)}
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: activeFilter === filter.key ? '#34495e' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              marginBottom: '4px',
              transition: 'background-color 0.2s'
            }}
          >
            <span>{filter.icon}</span>
            <span style={{ flex: 1, textAlign: 'left' }}>{filter.label}</span>
            {filter.badge && filter.badge > 0 && (
              <span style={{
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '12px',
                padding: '2px 8px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {filter.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}