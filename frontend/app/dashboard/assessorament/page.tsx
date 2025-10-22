'use client';

import { useState, useMemo } from 'react';
import { PageTemplate } from '../../../components/ui/PageTemplate';
import { AssessmentSearchFilters } from '../../../components/ui/AssessmentSearchFilters';
import { AssessmentTabs } from '../../../components/ui/AssessmentTabs';
import { ViewToggle } from '../../../components/ui/ViewToggle';
import { AssessmentCard } from '../../../components/ui/AssessmentCard';

// Datos de ejemplo de assessoraments gratuitos
const sampleAssessments = [
  {
    id: 1,
    slug: 'assessorament-legal-contractacio-publica',
    title: 'Assessorament Legal en Contractació Pública',
    description: 'Consulta jurídica especialitzada en procediments de contractació pública i licitacions.',
    company: {
      id: 2,
      name: 'Consultoria Puig & Associats',
      logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
      plan: 'Premium'
    },
    type: 'Legal',
    category: 'Contractació Pública',
    duration: 60,
    mode: 'presencial',
    images: ['https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=250&fit=crop'],
    availableSlots: 12,
    isHighlighted: true,
    isFavorite: false,
    totalBooked: 89,
    rating: 4.8,
    createdAt: 'fa 2 dies',
    requirements: 'Documentació del procediment, identificació professional'
  },
  {
    id: 2,
    slug: 'assessorament-fiscal-pimes',
    title: 'Assessorament Fiscal per PIMES',
    description: 'Consultoria tributària gratuïta especialitzada per a entitats públiques i PIMES col·laboradores.',
    company: {
      id: 4,
      name: 'Assessoria Fiscal Catalunya',
      logo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop',
      plan: 'Estàndard'
    },
    type: 'Fiscal',
    category: 'Tributació',
    duration: 45,
    mode: 'online',
    images: ['https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop'],
    availableSlots: 8,
    isHighlighted: false,
    isFavorite: true,
    totalBooked: 123,
    rating: 4.6,
    createdAt: 'fa 1 setmana',
    requirements: 'Última declaració de la renda, nòmines dels últims 3 mesos'
  },
  {
    id: 3,
    slug: 'assessorament-transformacio-digital',
    title: 'Transformació Digital per Administracions',
    description: 'Consultoria tecnològica gratuïta especialitzada en digitalització de processos administratius.',
    company: {
      id: 1,
      name: 'DigitalPub Solutions',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop',
      plan: 'Premium'
    },
    type: 'Tecnològic',
    category: 'Digitalització',
    duration: 90,
    mode: 'hibrid',
    images: ['https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=250&fit=crop'],
    availableSlots: 15,
    isHighlighted: true,
    isFavorite: false,
    totalBooked: 95,
    rating: 4.5,
    createdAt: 'fa 3 dies',
    requirements: 'Descripció del projecte o procés a digitalitzar'
  },
  {
    id: 4,
    slug: 'assessorament-nutricional-empleats',
    title: 'Assessorament Nutricional per Empleats Públics',
    description: 'Consulta dietètica gratuïta per millorar hàbits alimentaris i benestar laboral.',
    company: {
      id: 5,
      name: 'Centre Nutrisalut',
      logo: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop',
      plan: 'Bàsic'
    },
    type: 'Salut',
    category: 'Nutrició',
    duration: 60,
    mode: 'presencial',
    images: ['https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=250&fit=crop'],
    availableSlots: 6,
    isHighlighted: false,
    isFavorite: true,
    totalBooked: 234,
    rating: 4.9,
    createdAt: 'fa 5 dies',
    requirements: 'Conveni col·lectiu aplicable, descripció de la consulta'
  },
  {
    id: 5,
    title: 'Assessorament en Sostenibilitat i Medi Ambient',
    description: 'Consulta sobre polítiques ambientals, certificacions ecològiques i sostenibilitat corporativa.',
    company: {
      id: 3,
      name: 'EcoServeis Catalunya',
      logo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
      plan: 'Premium'
    },
    type: 'Ambiental',
    category: 'Sostenibilitat',
    duration: 75,
    mode: 'online',
    images: ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=250&fit=crop'],
    availableSlots: 10,
    isHighlighted: false,
    isFavorite: false,
    totalBooked: 78,
    rating: 4.8,
    createdAt: 'fa 1 setmana',
    requirements: 'Informació sobre l\'organització o projecte'
  },
  {
    id: 6,
    title: 'Consulta en Seguretat i Protecció de Dades',
    description: 'Assessorament en RGPD, ciberseguretat i protecció de dades per a administracions públiques.',
    company: {
      id: 7,
      name: 'Seguretat Integral Catalunya',
      logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
      plan: 'Premium'
    },
    type: 'Seguretat',
    category: 'Protecció de Dades',
    duration: 60,
    mode: 'hibrid',
    images: ['https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=250&fit=crop'],
    availableSlots: 4,
    isHighlighted: true,
    isFavorite: false,
    totalBooked: 123,
    rating: 4.9,
    createdAt: 'ahir',
    requirements: 'Descripció del sistema o dades a protegir'
  }
];

export default function AssessoramentPage() {
  const [activeTab, setActiveTab] = useState('tots');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    mode: '',
    duration: ''
  });

  const statsData = [
    { label: 'Assessoraments Disponibles', value: '24', trend: '+6' },
    { label: 'Consultes Realitzades', value: '18', trend: '+3' },
    { label: 'Els Meus Favorits', value: '5', trend: '+2' },
    { label: 'Empreses Col·laboradores', value: '12', trend: '+1' }
  ];

  // Lista extensible de tipos de assessoraments
  const availableTypes = [
    'Legal',
    'Fiscal',
    'Tecnològic',
    'Laboral',
    'Ambiental',
    'Seguretat',
    'Financer',
    'Administratiu',
    'Urbanístic',
    'Formació'
  ].sort();

  const availableCategories = [
    'Contractació Pública',
    'Tributació Personal',
    'Digitalització',
    'Recursos Humans',
    'Sostenibilitat',
    'Protecció de Dades',
    'Finances Públiques',
    'Procediments Administratius',
    'Urbanisme i Territori',
    'Desenvolupament Professional'
  ].sort();

  // Filtrar assessoraments basado en búsqueda, filtros y tab activo
  const filteredAssessments = useMemo(() => {
    let filtered = [...sampleAssessments];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(assessment =>
        assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.company.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por filtros
    if (filters.type) {
      filtered = filtered.filter(assessment =>
        assessment.type.toLowerCase().includes(filters.type.toLowerCase())
      );
    }

    if (filters.category) {
      filtered = filtered.filter(assessment =>
        assessment.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }

    if (filters.mode) {
      filtered = filtered.filter(assessment =>
        assessment.mode === filters.mode
      );
    }

    // Filtrar por tab activo
    switch (activeTab) {
      case 'destacats':
        filtered = filtered.filter(assessment => assessment.isHighlighted);
        break;
      case 'favorits':
        filtered = filtered.filter(assessment => assessment.isFavorite);
        break;
      case 'nous':
        // Simular assessoraments nuevos (últimos 3)
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
    tots: sampleAssessments.length,
    destacats: sampleAssessments.filter(a => a.isHighlighted).length,
    favorits: sampleAssessments.filter(a => a.isFavorite).length,
    nous: 3
  };

  return (
    <PageTemplate
      title="Assessoraments Gratuïts"
      subtitle="Consultes especialitzades ofertes per empreses col·laboradores"
      statsData={statsData}
    >
      <div style={{ padding: '0 24px 24px 24px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* Búsqueda y filtros */}
        <AssessmentSearchFilters
          onSearch={setSearchTerm}
          onFilterChange={setFilters}
          totalResults={filteredAssessments.length}
          availableTypes={availableTypes}
          availableCategories={availableCategories}
        />

        {/* Tabs de navegación */}
        <AssessmentTabs
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
            {filteredAssessments.length} assessorament{filteredAssessments.length !== 1 ? 's' : ''} trobat{filteredAssessments.length !== 1 ? 's' : ''}
          </h2>

          <ViewToggle
            viewMode={viewMode}
            onViewChange={setViewMode}
          />
        </div>

        {/* Grid/Lista de assessoraments */}
        {filteredAssessments.length > 0 ? (
          <div style={{
            display: viewMode === 'grid' ? 'grid' : 'block',
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(4, 1fr)' : 'none',
            gap: viewMode === 'grid' ? '20px' : '0'
          }}>
            {filteredAssessments.map((assessment) => (
              <AssessmentCard
                key={assessment.id}
                assessment={assessment}
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
              No s'han trobat assessoraments
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