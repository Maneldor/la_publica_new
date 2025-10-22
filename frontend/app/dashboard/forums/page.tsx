'use client';

import { useState, useMemo } from 'react';
import { PageTemplate } from '../../../components/ui/PageTemplate';
import { ForumSearchFilters } from '../../../components/ui/ForumSearchFilters';
import { ForumTabs } from '../../../components/ui/ForumTabs';
import { ForumHeader } from '../../../components/ui/ForumHeader';
import { ForumPostCard } from '../../../components/ui/ForumPostCard';
import { Post, ForumFilters, TabCounts } from './types/forumTypes';
import { samplePosts, statsData } from './data/forumData';
import { useForumFilters } from './hooks/useForumFilters';


export default function ForumsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const {
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    filteredPosts,
    tabCounts
  } = useForumFilters(samplePosts);

  return (
    <PageTemplate
      title="Fòrums"
      subtitle="Espai de debat i col·laboració professional"
      statsData={statsData}
    >
      <div style={{ padding: '0 24px 24px 24px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* Búsqueda y filtros */}
        <ForumSearchFilters
          onSearch={setSearchTerm}
          onFilterChange={setFilters}
          totalResults={filteredPosts.length}
        />

        {/* Tabs de navegación */}
        <ForumTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={tabCounts}
        />

        {/* Header con título, botón crear y toggle vista */}
        <ForumHeader
          viewMode={viewMode}
          onViewChange={setViewMode}
          totalResults={filteredPosts.length}
          activeTab={activeTab}
        />

        {/* Grid/Lista de posts */}
        {filteredPosts.length > 0 ? (
          <div style={{
            display: viewMode === 'grid' ? 'grid' : 'block',
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(4, 1fr)' : 'none',
            gap: viewMode === 'grid' ? '20px' : '0'
          }}>
            {filteredPosts.map((post) => (
              <ForumPostCard
                key={post.id}
                post={post}
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
              No s'han trobat fòrums
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