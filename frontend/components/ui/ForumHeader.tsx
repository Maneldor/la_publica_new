'use client';

import { useRouter } from 'next/navigation';
import { ViewToggle } from './ViewToggle';

interface ForumHeaderProps {
  viewMode: 'grid' | 'list';
  onViewChange: (mode: 'grid' | 'list') => void;
  totalResults: number;
  activeTab: string;
}

export function ForumHeader({ viewMode, onViewChange, totalResults, activeTab }: ForumHeaderProps) {
  const router = useRouter();

  const handleCreatePost = () => {
    // Navegar a la página de crear fórum
    router.push('/dashboard/forums/crear');
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'meus':
        return 'Els Meus Fòrums';
      case 'seguits':
        return 'Fòrums Seguits';
      case 'populars':
        return 'Fòrums Populars';
      default:
        return 'Tots els Fòrums';
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--ForumHeader-background, #ffffff)',
      borderRadius: 'var(--ForumHeader-border-radius, 12px)',
      padding: 'var(--ForumHeader-padding, 20px)',
      border: '2px solid var(--ForumHeader-border-color, #e5e7eb)',
      boxShadow: 'var(--ForumHeader-shadow, 0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06))',
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
            color: 'var(--ForumHeader-title-color, #2c3e50)',
            margin: '0 0 4px 0'
          }}>
            {getTitle()}
          </h2>
          <p style={{
            fontSize: '14px',
            color: 'var(--ForumHeader-subtitle-color, #6c757d)',
            margin: 0
          }}>
            {totalResults} fòrum{totalResults !== 1 ? 's' : ''} trobat{totalResults !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Controles */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {/* Botón crear post */}
          <button
            onClick={handleCreatePost}
            style={{
              padding: '10px 16px',
              backgroundColor: 'var(--ForumHeader-create-button-bg, #10b981)',
              color: 'var(--ForumHeader-create-button-color, #ffffff)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--ForumHeader-create-button-hover-bg, #059669)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--ForumHeader-create-button-bg, #10b981)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Crear Fòrum
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
        borderTop: '1px solid var(--ForumHeader-divider-color, #f0f0f0)'
      }}>
        {activeTab === 'meus' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: 'var(--ForumHeader-tab-meus-color, #10b981)',
            fontWeight: '500'
          }}>
            <span>Aquests són els fòrums que has creat</span>
          </div>
        )}

        {activeTab === 'seguits' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: 'var(--ForumHeader-tab-seguits-color, #3b82f6)',
            fontWeight: '500'
          }}>
            <span>Fòrums que segueixes per rebre notificacions</span>
          </div>
        )}

        {activeTab === 'populars' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: 'var(--ForumHeader-tab-populars-color, #f59e0b)',
            fontWeight: '500'
          }}>
            <span>Fòrums amb més votacions i comentaris</span>
          </div>
        )}

        {activeTab === 'tots' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: 'var(--ForumHeader-tab-tots-color, #6c757d)',
            fontWeight: '500'
          }}>
            <span>Explora tots els fòrums de la plataforma</span>
          </div>
        )}
      </div>
    </div>
  );
}