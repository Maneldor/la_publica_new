'use client';

import { useState, useMemo, useEffect } from 'react';
import { PageTemplate } from '../../../components/ui/PageTemplate';
import { CompanySearchFilters } from '../../../components/ui/CompanySearchFilters';
import { CompanyTabs } from '../../../components/ui/CompanyTabs';
import { ViewToggle } from '../../../components/ui/ViewToggle';
import { CompanyCard } from '../../../components/ui/CompanyCard';

// Datos de ejemplo de empresas colaboradoras
const sampleCompanies = [
  {
    id: 1,
    name: 'TechSolutions BCN',
    description: 'Especialistes en transformació digital per al sector públic. Desenvolupem solucions tecnològiques innovadores.',
    sector: 'Tecnologia',
    location: 'Barcelona',
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=150&fit=crop',
    collaborationType: 'Partner tecnològic',
    status: 'Verificada',
    contactEmail: 'info@techsolutions.cat',
    contactPhone: '+34 933 456 789',
    website: 'www.techsolutions.cat',
    rating: 4.8,
    reviewsCount: 24,
    certifications: ['ISO 9001', 'ISO 27001'],
    isHighlighted: true,
    yearEstablished: 2015,
    employeeCount: '50-100'
  },
  {
    id: 2,
    name: 'Consultoria Puig & Associats',
    description: 'Assessorament legal i administratiu especialitzat en contractació pública i normativa del sector públic.',
    sector: 'Consultoria Legal',
    location: 'Girona',
    logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=150&fit=crop',
    collaborationType: 'Serveis professionals',
    status: 'Activa',
    contactEmail: 'contacte@puigassociats.cat',
    contactPhone: '+34 972 123 456',
    website: 'www.puigassociats.cat',
    rating: 4.6,
    reviewsCount: 18,
    certifications: ['Col·legi Advocats'],
    isHighlighted: false,
    yearEstablished: 2008,
    employeeCount: '10-25'
  },
  {
    id: 3,
    name: 'EcoServeis Catalunya',
    description: 'Empresa especialitzada en serveis de neteja sostenible i manteniment d\'edificis públics amb certificació ecològica.',
    sector: 'Serveis',
    location: 'Lleida',
    logo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=150&fit=crop',
    collaborationType: 'Proveïdora',
    status: 'Premium',
    contactEmail: 'info@ecoserveis.cat',
    contactPhone: '+34 973 789 012',
    website: 'www.ecoserveis.cat',
    rating: 4.9,
    reviewsCount: 31,
    certifications: ['ISO 14001', 'EMAS'],
    isHighlighted: true,
    yearEstablished: 2012,
    employeeCount: '100-250'
  },
  {
    id: 4,
    name: 'Infraestructures Mediterrània',
    description: 'Constructora especialitzada en obres públiques, infraestructures i edificació sostenible.',
    sector: 'Construcció',
    location: 'Tarragona',
    logo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=150&fit=crop',
    collaborationType: 'Proveïdora',
    status: 'Verificada',
    contactEmail: 'contractes@inframed.cat',
    contactPhone: '+34 977 345 678',
    website: 'www.inframed.cat',
    rating: 4.4,
    reviewsCount: 12,
    certifications: ['ISO 9001', 'OHSAS 18001'],
    isHighlighted: false,
    yearEstablished: 2005,
    employeeCount: '250+'
  },
  {
    id: 5,
    name: 'DataAnalytics Pro',
    description: 'Consultoria especialitzada en anàlisi de dades i intel·ligència artificial per a l\'optimització de serveis públics.',
    sector: 'Tecnologia',
    location: 'Barcelona',
    logo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=150&fit=crop',
    collaborationType: 'Partner tecnològic',
    status: 'Activa',
    contactEmail: 'hello@dataanalytics.cat',
    contactPhone: '+34 934 567 890',
    website: 'www.dataanalytics.cat',
    rating: 4.7,
    reviewsCount: 16,
    certifications: ['ISO 27001'],
    isHighlighted: false,
    yearEstablished: 2018,
    employeeCount: '25-50'
  },
  {
    id: 6,
    name: 'Mobilitat Urbana SL',
    description: 'Solucions integrals de mobilitat sostenible, vehicles elèctrics i sistemes de transport públic.',
    sector: 'Transport',
    location: 'Valencia',
    logo: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=150&fit=crop',
    collaborationType: 'Proveïdora',
    status: 'Activa',
    contactEmail: 'info@mobilitaturbana.cat',
    contactPhone: '+34 963 234 567',
    website: 'www.mobilitaturbana.cat',
    rating: 4.5,
    reviewsCount: 9,
    certifications: ['ISO 14001'],
    isHighlighted: false,
    yearEstablished: 2020,
    employeeCount: '50-100'
  },
  {
    id: 7,
    name: 'Seguretat Integral Catalunya',
    description: 'Empresa de seguretat privada especialitzada en la protecció d\'edificis i instal·lacions públiques.',
    sector: 'Seguretat',
    location: 'Barcelona',
    logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=150&fit=crop',
    collaborationType: 'Proveïdora',
    status: 'Premium',
    contactEmail: 'contractes@seguretatic.cat',
    contactPhone: '+34 932 345 678',
    website: 'www.seguretatic.cat',
    rating: 4.6,
    reviewsCount: 21,
    certifications: ['Ministerio Interior'],
    isHighlighted: true,
    yearEstablished: 2010,
    employeeCount: '100-250'
  },
  {
    id: 8,
    name: 'Formació Professional Plus',
    description: 'Centre de formació especialitzat en programes de capacitació per a empleats públics i reciclatge professional.',
    sector: 'Formació',
    location: 'Girona',
    logo: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=150&fit=crop',
    collaborationType: 'Serveis professionals',
    status: 'Verificada',
    contactEmail: 'info@formacioplus.cat',
    contactPhone: '+34 972 456 789',
    website: 'www.formacioplus.cat',
    rating: 4.8,
    reviewsCount: 27,
    certifications: ['Generalitat Catalunya'],
    isHighlighted: false,
    yearEstablished: 2013,
    employeeCount: '25-50'
  }
];

export default function EmpresesesPage() {
  const [activeTab, setActiveTab] = useState('totes');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [allCompanies, setAllCompanies] = useState(sampleCompanies);
  const [filters, setFilters] = useState({
    sector: '',
    location: '',
    collaborationType: '',
    status: ''
  });

  // Cargar empresas creadas desde admin
  useEffect(() => {
    const createdEmpresas = JSON.parse(localStorage.getItem('createdEmpresas') || '[]');

    // Convertir empresas de admin al formato Company
    const convertedCompanies = createdEmpresas
      .filter((empresa: any) => empresa.status === 'published')
      .map((empresa: any) => ({
        id: empresa.id,
        name: empresa.name,
        description: empresa.description,
        sector: empresa.category,
        location: empresa.address,
        logo: empresa.logoUrl || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop',
        coverImage: empresa.imageUrls?.[0] || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=150&fit=crop',
        collaborationType: 'Partner verificat',
        status: empresa.isVerified ? 'Verificada' : empresa.isFeatured ? 'Premium' : 'Activa',
        contactEmail: empresa.email,
        contactPhone: empresa.phone,
        website: empresa.website,
        rating: 5.0,
        reviewsCount: 0,
        certifications: empresa.services || [],
        isHighlighted: empresa.isPinned || empresa.isFeatured,
        yearEstablished: empresa.foundedYear ? parseInt(empresa.foundedYear) : new Date().getFullYear(),
        employeeCount: empresa.employeeRange || '1-10'
      }));

    // Combinar empresas de ejemplo con empresas creadas (las creadas aparecen primero)
    const combinedCompanies = [...convertedCompanies, ...sampleCompanies];
    setAllCompanies(combinedCompanies);
  }, []);

  const statsData = useMemo(() => [
    { label: 'Total Empreses', value: allCompanies.length.toString(), trend: '+12%' },
    { label: 'Noves Aquest Mes', value: '8', trend: '+3' },
    { label: 'Verificades', value: allCompanies.filter(c => c.status === 'Verificada').length.toString(), trend: '+8%' },
    { label: 'Actives', value: allCompanies.filter(c => c.status !== 'Suspesa').length.toString(), trend: '+5%' }
  ], [allCompanies]);

  // Lista extensible de categorías disponibles
  const availableCategories = [
    'Tecnologia',
    'Consultoria Legal',
    'Serveis',
    'Construcció',
    'Transport',
    'Seguretat',
    'Formació',
    'Energies Renovables',
    'Consultoria Ambiental',
    'Reciclatge',
    'Telecomunicacions',
    'Consultoria Financera',
    'Recursos Humans',
    'Marketing Digital',
    'Disseny Gràfic'
  ].sort();

  // Filtrar empresas basado en búsqueda, filtros y tab activo
  const filteredCompanies = useMemo(() => {
    let filtered = [...allCompanies];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.sector.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por filtros
    if (filters.sector) {
      filtered = filtered.filter(company =>
        company.sector.toLowerCase().includes(filters.sector.toLowerCase())
      );
    }
    if (filters.location) {
      filtered = filtered.filter(company =>
        company.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    if (filters.collaborationType) {
      filtered = filtered.filter(company =>
        company.collaborationType.toLowerCase().includes(filters.collaborationType.toLowerCase())
      );
    }
    if (filters.status) {
      filtered = filtered.filter(company =>
        company.status.toLowerCase().includes(filters.status.toLowerCase())
      );
    }

    // Filtrar por tab activo
    switch (activeTab) {
      case 'destacades':
        filtered = filtered.filter(company => company.isHighlighted);
        break;
      case 'noves':
        // Simular empresas nuevas (últimas 3)
        filtered = filtered.slice(-3);
        break;
      default:
        // 'totes' - no filtrar
        break;
    }

    return filtered;
  }, [searchTerm, filters, activeTab, allCompanies]);

  // Calcular contadores para pestañas básicas
  const tabCounts = useMemo(() => ({
    totes: allCompanies.length,
    destacades: allCompanies.filter(c => c.isHighlighted).length,
    noves: 3
  }), [allCompanies]);

  return (
    <PageTemplate
      title="Empreses Collaboradores"
      subtitle="Directori d'empreses i proveïdors verificats per al sector públic"
      statsData={statsData}
    >
      <div style={{ padding: '0 24px 24px 24px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* Búsqueda y filtros */}
        <CompanySearchFilters
          onSearch={setSearchTerm}
          onFilterChange={setFilters}
          totalResults={filteredCompanies.length}
          availableCategories={availableCategories}
        />

        {/* Tabs de navegación */}
        <CompanyTabs
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
            {filteredCompanies.length} empresa{filteredCompanies.length !== 1 ? 's' : ''} trobada{filteredCompanies.length !== 1 ? 's' : ''}
          </h2>

          <ViewToggle
            viewMode={viewMode}
            onViewChange={setViewMode}
          />
        </div>

        {/* Grid/Lista de empresas */}
        {filteredCompanies.length > 0 ? (
          <div style={{
            display: viewMode === 'grid' ? 'grid' : 'block',
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(4, 1fr)' : 'none',
            gap: viewMode === 'grid' ? '20px' : '0'
          }}>
            {filteredCompanies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
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
              No s'han trobat empreses
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