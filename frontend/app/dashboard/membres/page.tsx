'use client';

import { useState } from 'react';
import { PageTemplate } from '../../../components/ui/PageTemplate';
import { MembersSearchFilters } from '../../../components/ui/MembersSearchFilters';
import { MembersTabs } from '../../../components/ui/MembersTabs';
import { ViewToggle } from '../../../components/ui/ViewToggle';
import { sampleMembers } from './data/sampleMembers';
import { useMembers } from './hooks/useMembers';
import { MembersGrid } from './components/MembersGrid';

export default function MembresPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const {
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    filteredMembers,
    tabCounts
  } = useMembers(sampleMembers);

  const statsData = [
    { label: 'Total Membres', value: '2.4K', trend: '+18%' },
    { label: 'Nous Avui', value: '12', trend: '+3' },
    { label: 'Actius Aquest Mes', value: '1.8K', trend: '+15%' },
    { label: 'En Línia Ara', value: '89', trend: '+7' }
  ];

  return (
    <PageTemplate
      title="Membres"
      subtitle="Connecta amb altres professionals del sector públic"
      statsData={statsData}
    >
      <div style={{ padding: '0 24px 24px 24px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* Búsqueda y filtros */}
        <MembersSearchFilters
          onSearch={setSearchTerm}
          onFilterChange={setFilters}
          totalResults={filteredMembers.length}
        />

        {/* Tabs de navegación */}
        <MembersTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={tabCounts}
        />

        {/* Header con toggle de vista */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#2c3e50',
            margin: 0
          }}>
            {filteredMembers.length} membre{filteredMembers.length !== 1 ? 's' : ''} trobat{filteredMembers.length !== 1 ? 's' : ''}
          </h2>

          <ViewToggle
            viewMode={viewMode}
            onViewChange={setViewMode}
          />
        </div>

        {/* Grid/Lista de miembros */}
        <MembersGrid
          members={filteredMembers}
          viewMode={viewMode}
        />
      </div>
    </PageTemplate>
  );
}