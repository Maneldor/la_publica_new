'use client';

interface ViewToggleProps {
  viewMode: 'grid' | 'list';
  onViewChange: (mode: 'grid' | 'list') => void;
  className?: string;
  style?: React.CSSProperties;
}

export function ViewToggle({ viewMode, onViewChange, className = '', style }: ViewToggleProps) {
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--ViewToggle-gap, 8px)',
    backgroundColor: 'var(--ViewToggle-background, #f8f9fa)',
    padding: 'var(--ViewToggle-padding, 4px)',
    borderRadius: 'var(--ViewToggle-border-radius, 8px)',
    border: '1px solid var(--ViewToggle-border-color, #e9ecef)',
    ...style,
  };

  const labelStyles: React.CSSProperties = {
    fontSize: 'var(--ViewToggle-label-font-size, 12px)',
    color: 'var(--ViewToggle-label-color, #6c757d)',
    fontWeight: 500,
    marginLeft: '8px',
  };

  const getButtonStyles = (isActive: boolean): React.CSSProperties => ({
    padding: 'var(--ViewToggle-button-padding, 6px 12px)',
    backgroundColor: isActive
      ? 'var(--ViewToggle-active-background, #3b82f6)'
      : 'transparent',
    color: isActive
      ? 'var(--ViewToggle-active-color, #ffffff)'
      : 'var(--ViewToggle-inactive-color, #6c757d)',
    border: 'none',
    borderRadius: 'var(--ViewToggle-button-border-radius, 6px)',
    fontSize: 'var(--ViewToggle-button-font-size, 12px)',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  });

  return (
    <div className={className} style={containerStyles}>
      <span style={labelStyles}>
        Vista:
      </span>

      <button
        onClick={() => onViewChange('grid')}
        style={getButtonStyles(viewMode === 'grid')}
        onMouseEnter={(e) => {
          if (viewMode !== 'grid') {
            e.currentTarget.style.backgroundColor = 'var(--ViewToggle-hover-background, #e9ecef)';
            e.currentTarget.style.color = 'var(--ViewToggle-hover-color, #374151)';
          }
        }}
        onMouseLeave={(e) => {
          if (viewMode !== 'grid') {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--ViewToggle-inactive-color, #6c757d)';
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
        style={getButtonStyles(viewMode === 'list')}
        onMouseEnter={(e) => {
          if (viewMode !== 'list') {
            e.currentTarget.style.backgroundColor = 'var(--ViewToggle-hover-background, #e9ecef)';
            e.currentTarget.style.color = 'var(--ViewToggle-hover-color, #374151)';
          }
        }}
        onMouseLeave={(e) => {
          if (viewMode !== 'list') {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--ViewToggle-inactive-color, #6c757d)';
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
