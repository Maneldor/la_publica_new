'use client';

import { useRouter } from 'next/navigation';
import { PageTemplate } from '../../../components/ui/PageTemplate';
import { AnunciSearchFilters } from '../../../components/ui/AnunciSearchFilters';
import { AnunciTabs } from '../../../components/ui/AnunciTabs';
import { AnunciCard } from '../../../components/ui/AnunciCard';
import { ViewToggle } from '../../../components/ui/ViewToggle';
import { sampleAnuncis } from '../../../lib/data/anuncisData';
import { useAnuncis } from './hooks/useAnuncis';
import { useAnunciView } from './hooks/useAnunciView';

export default function AnuncisPage() {
  const router = useRouter();

  // Hooks customizados per gestionar lògica d'anuncis
  const {
    anuncisFiltrats,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    activeTab,
    setActiveTab,
    tabCounts
  } = useAnuncis(sampleAnuncis);

  // Hook per gestionar vista grid/lista
  const { viewMode, setViewMode } = useAnunciView();

  // Dades d'estadístiques per al PageTemplate
  const statsData = [
    { label: 'Total Anuncis', value: '234', trend: '+15%' },
    { label: 'Els Meus Anuncis', value: '3', trend: '+1' },
    { label: 'Nous Avui', value: '8', trend: '+2' },
    { label: 'Visualitzacions', value: '1.5K', trend: '+28%' }
  ];

  return (
    <PageTemplate
      title="Anuncis"
      subtitle="Descobreix ofertes i demandes de la comunitat"
      statsData={statsData}
    >
      <div style={{ padding: '0 24px 24px 24px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* Cerca i filtres */}
        <AnunciSearchFilters
          onSearch={setSearchTerm}
          onFilterChange={setFilters}
          totalResults={anuncisFiltrats.length}
        />

        {/* Tabs de navegació */}
        <AnunciTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={tabCounts}
        />

        {/* Header amb botó crear i toggle vista */}
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
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            {/* Títol i recompte */}
            <div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#2c3e50',
                margin: '0 0 4px 0'
              }}>
                {activeTab === 'ofertes' && 'Ofertes disponibles'}
                {activeTab === 'demandes' && 'Demandes actives'}
                {activeTab === 'favorits' && 'Els meus favorits'}
                {activeTab === 'tots' && 'Tots els anuncis'}
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#6c757d',
                margin: 0
              }}>
                {anuncisFiltrats.length} anunci{anuncisFiltrats.length !== 1 ? 's' : ''} trobat{anuncisFiltrats.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Controls */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {/* Botó crear anunci */}
              <button
                onClick={() => router.push('/dashboard/anuncis/crear')}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#059669';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#10b981';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Publicar Anunci
              </button>

              {/* Toggle de vista */}
              <ViewToggle
                viewMode={viewMode}
                onViewChange={setViewMode}
              />
            </div>
          </div>
        </div>

        {/* Grid/Llista d'anuncis */}
        {anuncisFiltrats.length > 0 ? (
          <div style={{
            display: viewMode === 'grid' ? 'grid' : 'block',
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(4, 1fr)' : 'none',
            gap: viewMode === 'grid' ? '20px' : '0'
          }}>
            {anuncisFiltrats.map((anunci) => (
              <AnunciCard
                key={anunci.id}
                anunci={anunci}
                viewMode={viewMode}
              />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            border: '2px dashed #e9ecef'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#6c757d',
              marginBottom: '8px'
            }}>
              No s'han trobat anuncis
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#8e8e93',
              margin: 0
            }}>
              Prova a ajustar els filtres o el terme de cerca
            </p>
          </div>
        )}
      </div>
    </PageTemplate>
  );
}