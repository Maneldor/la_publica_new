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
      LOCAL: { label: 'Local', color: 'bg-green-100 text-green-800' },
      AUTONOMICA: { label: 'Autonòmica', color: 'bg-purple-100 text-purple-800' },
      CENTRAL: { label: 'Central', color: 'bg-blue-100 text-blue-800' }
    };
    return badges[type];
  };

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginBottom: '20px',
      border: '1px solid #f0f0f0'
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
          color: '#1f2937',
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
          backgroundColor: '#3b82f6',
          border: 'none',
          borderRadius: '6px',
          color: 'white',
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
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#3b82f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
              margin: '0 auto 12px'
            }}>
              {friend.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 4px 0'
            }}>
              {friend.name}
            </h4>
            <p style={{
              fontSize: '12px',
              color: '#6b7280',
              margin: '0 0 8px 0'
            }}>
              @{friend.nick}
            </p>
            <span style={{
              fontSize: '10px',
              padding: '2px 8px',
              backgroundColor: getAdministrationBadge(friend.administration).color.includes('green') ? '#dcfce7' :
                               getAdministrationBadge(friend.administration).color.includes('purple') ? '#f3e8ff' : '#dbeafe',
              color: getAdministrationBadge(friend.administration).color.includes('green') ? '#166534' :
                     getAdministrationBadge(friend.administration).color.includes('purple') ? '#7c3aed' : '#1d4ed8',
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
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        color: '#374151',
        fontSize: '14px',
        cursor: 'pointer',
        width: '100%',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        Veure totes les connexions
      </button>
    </div>
  );
}