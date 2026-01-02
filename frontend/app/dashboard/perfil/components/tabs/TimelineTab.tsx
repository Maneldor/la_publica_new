'use client';
import { Activity } from 'lucide-react';
import { mockActivities } from '../../data/mockData';

export default function TimelineTab() {
  return (
    <div style={{
      backgroundColor: 'var(--TimelineTab-background, #ffffff)',
      borderRadius: 'var(--TimelineTab-border-radius, 12px)',
      padding: 'var(--TimelineTab-padding, 20px)',
      boxShadow: 'var(--TimelineTab-shadow, 0 2px 8px rgba(0,0,0,0.1))',
      marginBottom: '20px',
      border: '1px solid var(--TimelineTab-border-color, #f0f0f0)'
    }}>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '600',
        color: 'var(--TimelineTab-title-color, #1f2937)',
        margin: '0 0 20px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Activity style={{ width: '20px', height: '20px' }} />
        Activitat Recent
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {mockActivities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '12px',
              backgroundColor: 'var(--TimelineTab-card-bg, #f8f9fa)',
              borderRadius: '8px',
              border: '1px solid var(--TimelineTab-card-border, #e9ecef)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'var(--TimelineTab-icon-bg, #3b82f6)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Icon style={{ width: '20px', height: '20px', color: 'var(--TimelineTab-icon-color, #ffffff)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: '14px',
                  color: 'var(--TimelineTab-content-color, #374151)',
                  margin: '0 0 4px 0',
                  lineHeight: '1.4'
                }}>
                  {activity.content}
                </p>
                <span style={{
                  fontSize: '12px',
                  color: 'var(--TimelineTab-timestamp-color, #6b7280)'
                }}>
                  {activity.timestamp}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <button style={{
        marginTop: '16px',
        padding: '8px 16px',
        backgroundColor: 'transparent',
        border: '1px solid var(--TimelineTab-button-border, #d1d5db)',
        borderRadius: '6px',
        color: 'var(--TimelineTab-button-color, #374151)',
        fontSize: '14px',
        cursor: 'pointer',
        width: '100%',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--TimelineTab-button-hover-bg, #f9fafb)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        Veure més activitat
      </button>
    </div>
  );
}
