'use client';

import { useState, useMemo } from 'react';
import { PageTemplate } from '../../../components/ui/PageTemplate';
import { GroupsSearchFilters } from '../../../components/ui/GroupsSearchFilters';
import { GroupsTabs } from '../../../components/ui/GroupsTabs';
import { GroupsHeader } from '../../../components/ui/GroupsHeader';
import { GroupCard } from '../../../components/ui/GroupCard';

// Datos de ejemplo de grupos
const sampleGroups = [
  {
    id: 1,
    name: 'Desenvolupadors Frontend',
    description: 'Comunitat de desenvolupadors especialitzats en tecnologies frontend: React, Vue, Angular, TypeScript i les últimes tendències en desenvolupament web.',
    category: 'Tecnologia',
    privacy: 'public' as const,
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop',
    membersCount: 247,
    postsCount: 89,
    lastActivity: 'fa 2 hores',
    isMember: true,
    isAdmin: false,
    adminName: 'Marc Torres',
    tags: ['React', 'TypeScript', 'Frontend']
  },
  {
    id: 2,
    name: 'Disseny UX/UI',
    description: 'Grup dedicat al disseny d\'experiències d\'usuari i interfícies. Compartim recursos, tècniques i metodologies per crear productes digitals centrats en l\'usuari.',
    category: 'Disseny',
    privacy: 'public' as const,
    coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=200&fit=crop',
    membersCount: 189,
    postsCount: 156,
    lastActivity: 'fa 1 hora',
    isMember: false,
    isAdmin: false,
    adminName: 'Anna Soler',
    tags: ['UX', 'UI', 'Figma']
  },
  {
    id: 3,
    name: 'Marketing Digital',
    description: 'Estratègies de màrqueting digital, SEO, SEM, xarxes socials i analítica. Ideal per professionals que volen estar al dia amb les últimes tendències.',
    category: 'Marketing',
    privacy: 'public' as const,
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop',
    membersCount: 324,
    postsCount: 201,
    lastActivity: 'fa 30 min',
    isMember: true,
    isAdmin: false,
    adminName: 'Laura Puig',
    tags: ['SEO', 'Analytics', 'Social Media']
  },
  {
    id: 4,
    name: 'Emprenedors Catalunya',
    description: 'Xarxa d\'emprenedors i startups catalanes. Compartim experiències, busquem col·laboracions i donem suport mutu en els nostres projectes empresarials.',
    category: 'Negocis',
    privacy: 'private' as const,
    coverImage: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=200&fit=crop',
    membersCount: 156,
    postsCount: 78,
    lastActivity: 'ahir',
    isMember: false,
    isAdmin: false,
    adminName: 'Joan Martínez',
    tags: ['Startup', 'Networking', 'Inversió'],
    membershipStatus: 'pending' as const,
    joinRequestDate: '2025-10-10T10:00:00Z'
  },
  {
    id: 5,
    name: 'Data Science & AI',
    description: 'Grup per a professionals de la ciència de dades, machine learning i intel·ligència artificial. Compartim datasets, algoritmes i casos d\'ús reals.',
    category: 'Tecnologia',
    privacy: 'public' as const,
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop',
    membersCount: 198,
    postsCount: 134,
    lastActivity: 'fa 3 hores',
    isMember: true,
    isAdmin: false,
    adminName: 'Carla Roca',
    tags: ['Python', 'Machine Learning', 'AI']
  },
  {
    id: 6,
    name: 'Consultors Senior',
    description: 'Grup exclusiu per a consultors amb més de 5 anys d\'experiència. Compartim oportunitats de negoci, millors pràctiques i estratègies de creixement.',
    category: 'Consultoria',
    privacy: 'private' as const,
    coverImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200&fit=crop',
    membersCount: 89,
    postsCount: 45,
    lastActivity: 'fa 1 dia',
    isMember: false,
    isAdmin: false,
    adminName: 'Maria González',
    tags: ['Consultoria', 'Strategy', 'Business']
  },
  {
    id: 7,
    name: 'Formació Contínua',
    description: 'Espai per compartir recursos de formació, cursos, certificacions i oportunitats d\'aprenentatge continu per al desenvolupament professional.',
    category: 'Educació',
    privacy: 'public' as const,
    coverImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=200&fit=crop',
    membersCount: 278,
    postsCount: 167,
    lastActivity: 'fa 4 hores',
    isMember: false,
    isAdmin: false,
    adminName: 'David Ferrer',
    tags: ['Formació', 'Cursos', 'Certificacions']
  },
  {
    id: 8,
    name: 'Innovació R&D',
    description: 'Grup per a professionals de recerca i desenvolupament. Exploram noves tecnologies, metodologies d\'innovació i projectes de futur.',
    category: 'Recerca',
    privacy: 'secret' as const,
    coverImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=200&fit=crop',
    membersCount: 67,
    postsCount: 34,
    lastActivity: 'fa 2 dies',
    isMember: false,
    isAdmin: false,
    adminName: 'Elena Vidal',
    tags: ['R&D', 'Innovació', 'Tecnologia']
  }
];

export default function GrupsPage() {
  const [activeTab, setActiveTab] = useState('myGroups');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    privacy: '',
    members: '',
    activity: ''
  });

  const statsData = [
    { label: 'Total Grups', value: '89', trend: '+5%' },
    { label: 'Els Meus Grups', value: '7', trend: '+2' },
    { label: 'Nous Aquest Mes', value: '12', trend: '+4' },
    { label: 'Membres Total', value: '3.2K', trend: '+22%' }
  ];

  // Filtrar grupos basado en búsqueda, filtros y tab activo
  const filteredGroups = useMemo(() => {
    let filtered = [...sampleGroups];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por filtros
    if (filters.category) {
      filtered = filtered.filter(group =>
        group.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }
    if (filters.privacy) {
      filtered = filtered.filter(group => group.privacy === filters.privacy);
    }
    if (filters.members) {
      switch (filters.members) {
        case 'small':
          filtered = filtered.filter(group => group.membersCount <= 50);
          break;
        case 'medium':
          filtered = filtered.filter(group => group.membersCount > 50 && group.membersCount <= 200);
          break;
        case 'large':
          filtered = filtered.filter(group => group.membersCount > 200);
          break;
      }
    }

    // Filtrar por tab activo
    switch (activeTab) {
      case 'myGroups':
        filtered = filtered.filter(group => group.isMember);
        break;
      case 'public':
        filtered = filtered.filter(group => group.privacy === 'public');
        break;
      case 'professional':
        filtered = filtered.filter(group => group.privacy === 'private');
        break;
      default:
        // Mostrar mis grupos por defecto
        filtered = filtered.filter(group => group.isMember);
        break;
    }

    return filtered;
  }, [searchTerm, filters, activeTab]);

  const tabCounts = {
    all: sampleGroups.length,
    myGroups: sampleGroups.filter(g => g.isMember).length,
    recommended: sampleGroups.filter((g: any) => g.isRecommended || false).length,
    popular: sampleGroups.filter((g: any) => g.isPopular || false).length
  };

  return (
    <PageTemplate
      title="Grups"
      subtitle="Uneix-te a comunitats d'interès professional"
      statsData={statsData}
    >
      <div style={{ padding: '0 24px 24px 24px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* Búsqueda y filtros */}
        <GroupsSearchFilters
          onSearch={setSearchTerm}
          onFilterChange={setFilters}
          totalResults={filteredGroups.length}
        />

        {/* Tabs de navegación */}
        <GroupsTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={tabCounts}
        />

        {/* Header con título, botón crear y toggle vista */}
        <GroupsHeader
          viewMode={viewMode}
          onViewChange={setViewMode}
          totalResults={filteredGroups.length}
          activeTab={activeTab}
        />

        {/* Grid/Lista de grupos */}
        {filteredGroups.length > 0 ? (
          <div style={{
            display: viewMode === 'grid' ? 'grid' : 'block',
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(4, 1fr)' : 'none',
            gap: viewMode === 'grid' ? '20px' : '0'
          }}>
            {filteredGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
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
              No s'han trobat grups
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