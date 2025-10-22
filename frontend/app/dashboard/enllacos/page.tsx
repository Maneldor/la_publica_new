'use client';

import { useState, useMemo } from 'react';
import { PageTemplate } from '../../../components/ui/PageTemplate';
import { LinkSearchFilters } from '../../../components/ui/LinkSearchFilters';
import { LinkTabs } from '../../../components/ui/LinkTabs';
import { ViewToggle } from '../../../components/ui/ViewToggle';
import { LinkCard } from '../../../components/ui/LinkCard';

// Datos de ejemplo de enlaces de interés
const sampleLinks = [
  {
    id: 1,
    name: 'Generalitat de Catalunya',
    slogan: 'Portal oficial del Govern de Catalunya',
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop',
    category: 'Administració Autonòmica',
    phone: '012',
    email: 'info@gencat.cat',
    website: 'https://www.gencat.cat',
    description: 'Portal oficial de la Generalitat de Catalunya amb informació sobre serveis, tràmits i actualitat.',
    isHighlighted: true,
    isFavorite: false,
    totalVisits: 2456,
    createdAt: 'fa 2 dies'
  },
  {
    id: 2,
    name: 'Ajuntament de Barcelona',
    slogan: 'Barcelona, ciutat compromesa amb el progrés',
    logo: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop',
    category: 'Administració Local',
    phone: '010',
    email: 'info@bcn.cat',
    website: 'https://www.barcelona.cat',
    description: 'Portal oficial de l\'Ajuntament de Barcelona amb serveis per a la ciutadania.',
    isHighlighted: true,
    isFavorite: true,
    totalVisits: 1834,
    createdAt: 'fa 1 setmana'
  },
  {
    id: 3,
    name: 'Col·legi de Secretaris, Interventors i Tresorers',
    slogan: 'Professionals al servei de l\'Administració Local',
    logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    category: 'Col·legis Professionals',
    phone: '934 54 78 90',
    email: 'info@cositac.cat',
    website: 'https://www.cositac.cat',
    description: 'Col·legi professional que agrupa els funcionaris d\'habilitació nacional.',
    isHighlighted: false,
    isFavorite: true,
    totalVisits: 756,
    createdAt: 'fa 3 dies'
  },
  {
    id: 4,
    name: 'Associació Catalana de Municipis',
    slogan: 'Representant dels municipis catalans',
    logo: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop',
    category: 'Associacions',
    phone: '934 48 20 20',
    email: 'acm@acm.cat',
    website: 'https://www.acm.cat',
    description: 'Associació que representa i defensa els interessos dels municipis de Catalunya.',
    isHighlighted: false,
    isFavorite: false,
    totalVisits: 892,
    createdAt: 'fa 5 dies'
  },
  {
    id: 5,
    name: 'Departament d\'Economia i Hisenda',
    slogan: 'Gestió econòmica i fiscal de Catalunya',
    logo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop',
    category: 'Administració Autonòmica',
    phone: '934 70 30 00',
    email: 'economia.hisenda@gencat.cat',
    website: 'https://economia.gencat.cat',
    description: 'Departament responsable de la política econòmica i fiscal de la Generalitat.',
    isHighlighted: true,
    isFavorite: false,
    totalVisits: 1247,
    createdAt: 'fa 1 dia'
  },
  {
    id: 6,
    name: 'Federació de Municipis de Catalunya',
    slogan: 'Municipalisme al servei dels ciutadans',
    logo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    category: 'Associacions',
    phone: '934 88 90 00',
    email: 'fmc@fmc.cat',
    website: 'https://www.fmc.cat',
    description: 'Federació que agrupa municipis i comarques de Catalunya per defensar l\'autonomia local.',
    isHighlighted: false,
    isFavorite: true,
    totalVisits: 634,
    createdAt: 'fa 4 dies'
  },
  {
    id: 7,
    name: 'Tribunal de Comptes',
    slogan: 'Control extern del sector públic',
    logo: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop',
    category: 'Institucions de Control',
    phone: '914 46 30 00',
    email: 'comunicacion@tcu.es',
    website: 'https://www.tcu.es',
    description: 'Òrgan constitucional de control extern de l\'activitat econòmica del sector públic.',
    isHighlighted: false,
    isFavorite: false,
    totalVisits: 445,
    createdAt: 'fa 6 dies'
  },
  {
    id: 8,
    name: 'Síndic de Greuges de Catalunya',
    slogan: 'Defensor dels drets i les llibertats',
    logo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150&h=150&fit=crop',
    category: 'Institucions de Control',
    phone: '933 01 75 75',
    email: 'sindic@sindic.cat',
    website: 'https://www.sindic.cat',
    description: 'Institució que vetlla pels drets i llibertats dels ciutadans davant les administracions.',
    isHighlighted: true,
    isFavorite: false,
    totalVisits: 578,
    createdAt: 'ahir'
  }
];

export default function EnllaçosPage() {
  const [activeTab, setActiveTab] = useState('tots');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    type: ''
  });

  const statsData = [
    { label: 'Enllaços Disponibles', value: '89', trend: '+7%' },
    { label: 'Més Visitats', value: '12', trend: '+3' },
    { label: 'Nous Aquest Mes', value: '5', trend: '+2' },
    { label: 'Categories', value: '15', trend: '+1' }
  ];

  // Lista extensible de categorías
  const availableCategories = [
    'Administració Autonòmica',
    'Administració Local',
    'Administració Estatal',
    'Col·legis Professionals',
    'Associacions',
    'Institucions de Control',
    'Sindicats',
    'Fundacions',
    'Universitats',
    'Organismes Europeus',
    'Entitats Financeres Públiques',
    'Empreses Públiques'
  ].sort();

  // Filtrar enlaces basado en búsqueda, filtros y tab activo
  const filteredLinks = useMemo(() => {
    let filtered = [...sampleLinks];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(link =>
        link.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.slogan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por categoría
    if (filters.category) {
      filtered = filtered.filter(link =>
        link.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }

    // Filtrar por tab activo
    switch (activeTab) {
      case 'destacats':
        filtered = filtered.filter(link => link.isHighlighted);
        break;
      case 'favorits':
        filtered = filtered.filter(link => link.isFavorite);
        break;
      case 'mes-visitats':
        filtered = filtered.sort((a, b) => b.totalVisits - a.totalVisits).slice(0, 5);
        break;
      case 'nous':
        // Simular enlaces nuevos (últimos 3)
        filtered = filtered.slice(-3);
        break;
      default:
        // 'tots' - no filtrar
        break;
    }

    return filtered;
  }, [searchTerm, filters, activeTab]);

  // Calcular contadores para pestañas
  const tabCounts = {
    tots: sampleLinks.length,
    destacats: sampleLinks.filter(l => l.isHighlighted).length,
    favorits: sampleLinks.filter(l => l.isFavorite).length,
    'mes-visitats': 5,
    nous: 3
  };

  return (
    <PageTemplate
      title="Enllaços d'Interès"
      subtitle="Recursos útils d'administracions, entitats i associacions"
      statsData={statsData}
    >
      <div style={{ padding: '0 24px 24px 24px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* Búsqueda y filtros */}
        <LinkSearchFilters
          onSearch={setSearchTerm}
          onFilterChange={setFilters}
          totalResults={filteredLinks.length}
          availableCategories={availableCategories}
        />

        {/* Tabs de navegación */}
        <LinkTabs
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
            {filteredLinks.length} enllaç{filteredLinks.length !== 1 ? 'os' : ''} trobat{filteredLinks.length !== 1 ? 's' : ''}
          </h2>

          <ViewToggle
            viewMode={viewMode}
            onViewChange={setViewMode}
          />
        </div>

        {/* Grid/Lista de enlaces */}
        {filteredLinks.length > 0 ? (
          <div style={{
            display: viewMode === 'grid' ? 'grid' : 'block',
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(4, 1fr)' : 'none',
            gap: viewMode === 'grid' ? '20px' : '0'
          }}>
            {filteredLinks.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                viewMode={viewMode}
              />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#fff',
            borderRadius: '12px',
            border: '2px solid #e5e7eb',
            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#6c757d',
              marginBottom: '8px'
            }}>
              No s'han trobat enllaços
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