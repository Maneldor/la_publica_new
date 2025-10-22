'use client';

interface OfferTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts: {
    totes: number;
    destacades: number;
    favorits: number;
    noves: number;
  };
}

export function OfferTabs({ activeTab, onTabChange, counts }: OfferTabsProps) {
  const tabs = [
    {
      id: 'totes',
      label: 'Totes',
      count: counts.totes,
      description: 'Totes les ofertes disponibles'
    },
    {
      id: 'destacades',
      label: 'Destacades',
      count: counts.destacades,
      description: 'Ofertes destacades i promocionals'
    },
    {
      id: 'favorits',
      label: 'Favorits',
      count: counts.favorits,
      description: 'Les meves ofertes favorites'
    },
    {
      id: 'noves',
      label: 'Noves',
      count: counts.noves,
      description: 'Ofertes recentment publicades'
    }
  ];

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '6px',
      border: '2px solid #e5e7eb',
      boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
      marginBottom: '20px'
    }}>
      <div style={{
        display: 'flex',
        gap: '4px'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              flex: 1,
              padding: '12px 16px',
              backgroundColor: activeTab === tab.id ? '#3b82f6' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#6c757d',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
                e.currentTarget.style.color = '#374151';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#6c757d';
              }
            }}
            title={tab.description}
          >
            <span>{tab.label}</span>

            {/* Badge amb el número */}
            <span style={{
              backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : '#e5e7eb',
              color: activeTab === tab.id ? 'white' : '#6b7280',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600',
              minWidth: '20px',
              textAlign: 'center',
              lineHeight: '1.2'
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Descripció del tab actiu */}
      <div style={{
        marginTop: '8px',
        paddingTop: '8px',
        borderTop: '1px solid #f0f0f0',
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: '12px',
          color: '#8e8e93',
          margin: 0,
          fontStyle: 'italic'
        }}>
          {tabs.find(tab => tab.id === activeTab)?.description}
        </p>
      </div>
    </div>
  );
}