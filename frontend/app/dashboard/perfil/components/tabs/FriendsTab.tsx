'use client';

import { UserPlus } from 'lucide-react';
import { mockFriends } from '../../data/mockData';

type AdministrationType = 'LOCAL' | 'AUTONOMICA' | 'CENTRAL';

interface Friend {
  id: string;
  name: string;
  nick: string;
  avatar: string;
  administration: AdministrationType;
}

export default function FriendsTab() {
  const friends: Friend[] = mockFriends as Friend[];

  const getAdministrationBadge = (type: AdministrationType) => {
    const badges = {
      LOCAL: { label: 'Local', bg: 'var(--FriendsTab-badge-local-bg, #dcfce7)', color: 'var(--FriendsTab-badge-local-color, #166534)' },
      AUTONOMICA: { label: 'Autonòmica', bg: 'var(--FriendsTab-badge-autonomica-bg, #f3e8ff)', color: 'var(--FriendsTab-badge-autonomica-color, #7c3aed)' },
      CENTRAL: { label: 'Central', bg: 'var(--FriendsTab-badge-central-bg, #dbeafe)', color: 'var(--FriendsTab-badge-central-color, #1d4ed8)' }
    };
    return badges[type];
  };

  return (
    <div style={{
      backgroundColor: 'var(--FriendsTab-background, #ffffff)',
      borderRadius: 'var(--FriendsTab-border-radius, 12px)',
      padding: 'var(--FriendsTab-padding, 20px)',
      boxShadow: 'var(--FriendsTab-shadow, 0 2px 8px rgba(0,0,0,0.1))',
      marginBottom: '20px',
      border: '1px solid var(--FriendsTab-border-color, #f0f0f0)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: 'var(--FriendsTab-title-color, #1f2937)',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <UserPlus style={{ width: '20px', height: '20px' }} />
          Amistats ({friends.length} connexions)
        </h3>
        <button style={{
          padding: '8px 16px',
          backgroundColor: 'var(--FriendsTab-button-bg, #3b82f6)',
          border: 'none',
          borderRadius: '6px',
          color: 'var(--FriendsTab-button-color, #ffffff)',
          fontSize: '14px',
          cursor: 'pointer'
        }}>
          Gestionar sol·licituds
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        {friends.map((friend) => (
          <div key={friend.id} style={{
            padding: '16px',
            backgroundColor: 'var(--FriendsTab-card-bg, #f8f9fa)',
            borderRadius: '8px',
            border: '1px solid var(--FriendsTab-card-border, #e9ecef)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              backgroundColor: 'var(--FriendsTab-avatar-bg, #3b82f6)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--FriendsTab-avatar-color, #ffffff)',
              fontSize: '18px',
              fontWeight: 'bold',
              margin: '0 auto 12px'
            }}>
              {friend.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--FriendsTab-friend-name, #1f2937)',
              margin: '0 0 4px 0'
            }}>
              {friend.name}
            </h4>
            <p style={{
              fontSize: '12px',
              color: 'var(--FriendsTab-friend-nick, #6b7280)',
              margin: '0 0 8px 0'
            }}>
              @{friend.nick}
            </p>
            <span style={{
              fontSize: '10px',
              padding: '2px 8px',
              backgroundColor: getAdministrationBadge(friend.administration).bg,
              color: getAdministrationBadge(friend.administration).color,
              borderRadius: '10px',
              fontWeight: '500'
            }}>
              {getAdministrationBadge(friend.administration).label}
            </span>
          </div>
        ))}
      </div>

      <button style={{
        marginTop: '20px',
        padding: '8px 16px',
        backgroundColor: 'transparent',
        border: '1px solid var(--FriendsTab-secondary-border, #d1d5db)',
        borderRadius: '6px',
        color: 'var(--FriendsTab-secondary-color, #374151)',
        fontSize: '14px',
        cursor: 'pointer',
        width: '100%',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--FriendsTab-secondary-hover-bg, #f9fafb)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        Veure totes les connexions
      </button>
    </div>
  );
}
