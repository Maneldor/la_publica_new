'use client';

import { useRouter } from 'next/navigation';
import { Group } from '../../../data/groupsData';

interface GroupSectionProps {
  title: string;
  count: number;
  groups: Group[];
  isExpanded: boolean;
  onToggle: () => void;
  renderGroupItem: (group: Group) => JSX.Element;
  backgroundColor: string;
  filterType: string;
}

export function GroupSection({
  title,
  count,
  groups,
  isExpanded,
  onToggle,
  renderGroupItem,
  backgroundColor,
  filterType
}: GroupSectionProps) {
  const router = useRouter();

  return (
    <div style={{
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: '#fff'
    }}>
      <button
        type="button"
        onClick={onToggle}
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
            {title}
          </span>
          <span style={{
            backgroundColor: backgroundColor,
            color: 'white',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '600'
          }}>
            {count}
          </span>
        </div>
        <div style={{
          fontSize: '18px',
          color: '#6c757d',
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.3s'
        }}>
          ▼
        </div>
      </button>

      {isExpanded && (
        <div style={{
          padding: '12px',
          borderTop: '1px solid #f0f0f0',
          backgroundColor: '#fafbfc'
        }}>
          {groups.slice(0, 3).map(renderGroupItem)}
          {groups.length > 3 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/dashboard/grups?filter=${filterType}`);
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
              Veure més ({groups.length - 3})
            </button>
          )}
        </div>
      )}
    </div>
  );
}