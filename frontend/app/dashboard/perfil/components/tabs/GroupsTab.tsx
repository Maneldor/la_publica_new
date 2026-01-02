'use client';

import { Users } from 'lucide-react';
import { mockGroups } from '../../data/mockData';

type GroupRole = 'admin' | 'moderator' | 'member';

interface Group {
  id: string;
  name: string;
  avatar: string;
  members: number;
  lastActivity: string;
  role: GroupRole;
}

export default function GroupsTab() {
  const groups: Group[] = mockGroups as Group[];

  const getRoleBadge = (role: GroupRole) => {
    const badges = {
      admin: { bg: 'var(--GroupsTab-role-admin-bg, #fef3c7)', color: 'var(--GroupsTab-role-admin-color, #92400e)' },
      moderator: { bg: 'var(--GroupsTab-role-moderator-bg, #dbeafe)', color: 'var(--GroupsTab-role-moderator-color, #1e40af)' },
      member: { bg: 'var(--GroupsTab-role-member-bg, #f3e8ff)', color: 'var(--GroupsTab-role-member-color, #7c3aed)' }
    };
    return badges[role];
  };

  return (
    <div style={{
      backgroundColor: 'var(--GroupsTab-background, #ffffff)',
      borderRadius: 'var(--GroupsTab-border-radius, 12px)',
      padding: 'var(--GroupsTab-padding, 20px)',
      boxShadow: 'var(--GroupsTab-shadow, 0 2px 8px rgba(0,0,0,0.1))',
      marginBottom: '20px',
      border: '1px solid var(--GroupsTab-border-color, #f0f0f0)'
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
          color: 'var(--GroupsTab-title-color, #1f2937)',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Users style={{ width: '20px', height: '20px' }} />
          Els Meus Grups ({groups.length})
        </h3>
        <button style={{
          padding: '8px 16px',
          backgroundColor: 'var(--GroupsTab-button-bg, #3b82f6)',
          border: 'none',
          borderRadius: '6px',
          color: 'var(--GroupsTab-button-color, #ffffff)',
          fontSize: '14px',
          cursor: 'pointer'
        }}>
          Descobrir grups
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        {groups.map((group) => (
          <div key={group.id} style={{
            padding: '16px',
            backgroundColor: 'var(--GroupsTab-card-bg, #f8f9fa)',
            borderRadius: '8px',
            border: '1px solid var(--GroupsTab-card-border, #e9ecef)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                backgroundColor: 'var(--GroupsTab-avatar-bg, #8b5cf6)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--GroupsTab-avatar-color, #ffffff)',
                fontSize: '16px',
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                {group.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '4px'
                }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--GroupsTab-group-name, #1f2937)',
                    margin: 0
                  }}>
                    {group.name}
                  </h4>
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    backgroundColor: getRoleBadge(group.role).bg,
                    color: getRoleBadge(group.role).color,
                    borderRadius: '4px',
                    fontWeight: '500',
                    textTransform: 'capitalize'
                  }}>
                    {group.role}
                  </span>
                </div>
                <p style={{
                  fontSize: '12px',
                  color: 'var(--GroupsTab-group-members, #6b7280)',
                  margin: '0 0 8px 0'
                }}>
                  {group.members.toLocaleString()} membres
                </p>
                <p style={{
                  fontSize: '11px',
                  color: 'var(--GroupsTab-group-activity, #9ca3af)',
                  margin: 0
                }}>
                  Última activitat: {group.lastActivity}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
