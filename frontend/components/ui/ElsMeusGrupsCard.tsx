'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Group, publicGroups, privateGroups, secretGroups } from './data/groupsData';
import { GroupSection } from './ElsMeusGrupsCard/components/GroupSection';
import { GroupItem } from './ElsMeusGrupsCard/components/GroupItem';

export function ElsMeusGrupsCard() {
  const router = useRouter();

  // Estados para controlar expansión
  const [showPublics, setShowPublics] = useState(false);
  const [showPrivats, setShowPrivats] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '20px',
      border: '2px solid #e5e7eb',
      boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
      marginTop: '20px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#2c3e50',
          margin: 0
        }}>
          Els Meus Grups
        </h3>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          color: '#3b82f6',
          fontWeight: '500'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6'
          }} />
          {publicGroups.length + privateGroups.length + secretGroups.length} grups
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <GroupSection
          title="Públics"
          count={publicGroups.length}
          groups={publicGroups}
          isExpanded={showPublics}
          onToggle={() => setShowPublics(!showPublics)}
          renderGroupItem={(group) => <GroupItem group={group} />}
          backgroundColor="#10b981"
          filterType="public"
        />

        <GroupSection
          title="Privats"
          count={privateGroups.length}
          groups={privateGroups}
          isExpanded={showPrivats}
          onToggle={() => setShowPrivats(!showPrivats)}
          renderGroupItem={(group) => <GroupItem group={group} />}
          backgroundColor="#f59e0b"
          filterType="private"
        />

        <GroupSection
          title="Secrets"
          count={secretGroups.length}
          groups={secretGroups}
          isExpanded={showSecrets}
          onToggle={() => setShowSecrets(!showSecrets)}
          renderGroupItem={(group) => <GroupItem group={group} />}
          backgroundColor="#ef4444"
          filterType="secret"
        />
      </div>
    </div>
  );
}