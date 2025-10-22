'use client';

interface ViewToggleProps {
  viewMode: 'grid' | 'list';
  onViewChange: (mode: 'grid' | 'list') => void;
}

export function ViewToggle({ viewMode, onViewChange }: ViewToggleProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: '#f8f9fa',
      padding: '4px',
      borderRadius: '8px',
      border: '1px solid #e9ecef'
    }}>
      <span style={{
        fontSize: '12px',
        color: '#6c757d',
        fontWeight: '500',
        marginLeft: '8px'
      }}>
        Vista:
      </span>

      <button
        onClick={() => onViewChange('grid')}
        style={{
          padding: '6px 12px',
          backgroundColor: viewMode === 'grid' ? '#3b82f6' : 'transparent',
          color: viewMode === 'grid' ? 'white' : '#6c757d',
          border: 'none',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
        onMouseEnter={(e) => {
          if (viewMode !== 'grid') {
            e.currentTarget.style.backgroundColor = '#e9ecef';
            e.currentTarget.style.color = '#374151';
          }
        }}
        onMouseLeave={(e) => {
          if (viewMode !== 'grid') {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#6c757d';
          }
        }}
        title="Vista en graella"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z"/>
        </svg>
        Graella
      </button>

      <button
        onClick={() => onViewChange('list')}
        style={{
          padding: '6px 12px',
          backgroundColor: viewMode === 'list' ? '#3b82f6' : 'transparent',
          color: viewMode === 'list' ? 'white' : '#6c757d',
          border: 'none',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
        onMouseEnter={(e) => {
          if (viewMode !== 'list') {
            e.currentTarget.style.backgroundColor = '#e9ecef';
            e.currentTarget.style.color = '#374151';
          }
        }}
        onMouseLeave={(e) => {
          if (viewMode !== 'list') {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#6c757d';
          }
        }}
        title="Vista en llista"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/>
        </svg>
        Llista
      </button>
    </div>
  );
}