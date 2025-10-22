'use client';

import { useRouter } from 'next/navigation';
import { ViewToggle } from './ViewToggle';

interface GroupsHeaderProps {
  viewMode: 'grid' | 'list';
  onViewChange: (mode: 'grid' | 'list') => void;
  totalResults: number;
  activeTab: string;
}

export function GroupsHeader({ viewMode, onViewChange, totalResults, activeTab }: GroupsHeaderProps) {
  const router = useRouter();

  const handleCreateGroup = () => {
    router.push('/dashboard/grups/crear');
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'myGroups':
        return 'Els Meus Grups';
      case 'recommended':
        return 'Grups Recomanats';
      case 'popular':
        return 'Grups Populars';
      default:
        return 'Tots els Grups';
    }
  };

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '20px',
      border: '2px solid #e5e7eb',
      boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
      marginBottom: '20px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Título y contador */}
        <div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#2c3e50',
            margin: '0 0 4px 0'
          }}>
            {getTitle()}
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#6c757d',
            margin: 0
          }}>
            {totalResults} grup{totalResults !== 1 ? 's' : ''} trobat{totalResults !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Controles */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {/* Botón crear grupo */}
          <button
            onClick={handleCreateGroup}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6';
            }}
          >
            📝 Sol·licitar Grup
          </button>

          {/* Toggle de vista */}
          <ViewToggle
            viewMode={viewMode}
            onViewChange={onViewChange}
          />
        </div>
      </div>

      {/* Información adicional según el tab */}
      <div style={{
        marginTop: '12px',
        paddingTop: '12px',
        borderTop: '1px solid #f0f0f0'
      }}>
        {activeTab === 'myGroups' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: '#10b981',
            fontWeight: '500'
          }}>
            <span>ℹ️</span>
            <span>Aquests són els grups dels quals ets membre</span>
          </div>
        )}

        {activeTab === 'recommended' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: '#3b82f6',
            fontWeight: '500'
          }}>
            <span>⭐</span>
            <span>Grups recomanats basats en els teus interessos i activitat</span>
          </div>
        )}

        {activeTab === 'popular' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: '#f59e0b',
            fontWeight: '500'
          }}>
            <span>🔥</span>
            <span>Grups amb més activitat i interacció recent</span>
          </div>
        )}

        {activeTab === 'all' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: '#6c757d',
            fontWeight: '500'
          }}>
            <span>🌐</span>
            <span>Explora tots els grups disponibles a la plataforma</span>
          </div>
        )}
      </div>
    </div>
  );
}