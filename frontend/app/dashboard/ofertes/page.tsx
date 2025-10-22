'use client';

import { useState, useMemo } from 'react';
import { PageTemplate } from '../../../components/ui/PageTemplate';
import { OfferSearchFilters } from '../../../components/ui/OfferSearchFilters';
import { OfferTabs } from '../../../components/ui/OfferTabs';
import { ViewToggle } from '../../../components/ui/ViewToggle';
import { OfferCard } from '../../../components/ui/OfferCard';

// Datos de ejemplo de ofertas comerciales
const sampleOffers = [
  {
    id: 1,
    title: 'Descuento 25% en Portàtils Professionals',
    description: 'Equipament informàtic professional per a empleats públics. Portàtils d\'alta gamma amb garantia estesa.',
    company: {
      id: 1,
      name: 'TechSolutions BCN',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop',
      plan: 'Premium'
    },
    category: 'Tecnologia',
    originalPrice: 1200,
    discountPrice: 900,
    discountPercentage: 25,
    images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=250&fit=crop'],
    validUntil: '2024-12-31',
    stock: 15,
    isHighlighted: true,
    isFavorite: false,
    views: 234,
    saves: 18,
    createdAt: 'fa 3 dies',
    terms: 'Vàlid només per a empleats públics amb acreditació. Màxim 2 unitats per persona.'
  },
  {
    id: 2,
    title: 'Assessorament Legal Gratuït - Primera Consulta',
    description: 'Consulta legal gratuïta en dret administratiu i contractació pública per a funcionaris.',
    company: {
      id: 2,
      name: 'Consultoria Puig & Associats',
      logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
      plan: 'Bàsic'
    },
    category: 'Serveis Professionals',
    originalPrice: 150,
    discountPrice: 0,
    discountPercentage: 100,
    images: ['https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=250&fit=crop'],
    validUntil: '2024-11-30',
    stock: null,
    isHighlighted: false,
    isFavorite: true,
    views: 89,
    saves: 12,
    createdAt: 'fa 1 setmana',
    terms: 'Primera consulta gratuïta de 30 minuts. Cita prèvia necessària.'
  },
  {
    id: 3,
    title: '30% Descompte en Neteja d\'Oficines',
    description: 'Servei de neteja ecològica professional per a oficines públiques amb productes certificats.',
    company: {
      id: 3,
      name: 'EcoServeis Catalunya',
      logo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
      plan: 'Premium'
    },
    category: 'Serveis',
    originalPrice: 500,
    discountPrice: 350,
    discountPercentage: 30,
    images: ['https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=250&fit=crop'],
    validUntil: '2025-01-31',
    stock: null,
    isHighlighted: true,
    isFavorite: false,
    views: 156,
    saves: 24,
    createdAt: 'fa 2 dies',
    terms: 'Contracte mínim 6 mesos. Descompte aplicable només a nous clients del sector públic.'
  },
  {
    id: 4,
    title: 'Formació en Transformació Digital - 50% Off',
    description: 'Curs intensiu de digitalització per a empleats públics. Certificació oficial inclosa.',
    company: {
      id: 8,
      name: 'Formació Professional Plus',
      logo: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop',
      plan: 'Estàndard'
    },
    category: 'Formació',
    originalPrice: 800,
    discountPrice: 400,
    discountPercentage: 50,
    images: ['https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=250&fit=crop'],
    validUntil: '2024-12-15',
    stock: 20,
    isHighlighted: false,
    isFavorite: false,
    views: 67,
    saves: 8,
    createdAt: 'fa 5 dies',
    terms: 'Places limitades. Curs online amb sessions presencials opcionals.'
  },
  {
    id: 5,
    title: 'Vehicles Elèctrics - Preu Especial Funcionaris',
    description: 'Vehicles elèctrics per a flotes públiques amb condicions especials i manteniment inclòs.',
    company: {
      id: 6,
      name: 'Mobilitat Urbana SL',
      logo: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop',
      plan: 'Estàndard'
    },
    category: 'Transport',
    originalPrice: 25000,
    discountPrice: 22000,
    discountPercentage: 12,
    images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop'],
    validUntil: '2025-03-31',
    stock: 5,
    isHighlighted: false,
    isFavorite: true,
    views: 98,
    saves: 15,
    createdAt: 'fa 1 setmana',
    terms: 'Oferta vàlida per a compres institucionals. Finançament disponible.'
  },
  {
    id: 6,
    title: 'Seguretat 24h - 3 Mesos Gratuïts',
    description: 'Servei de seguretat professional per a edificis públics. 3 primers mesos sense cost.',
    company: {
      id: 7,
      name: 'Seguretat Integral Catalunya',
      logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
      plan: 'Premium'
    },
    category: 'Seguretat',
    originalPrice: 1500,
    discountPrice: 1500,
    discountPercentage: 0,
    images: ['https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=250&fit=crop'],
    validUntil: '2024-12-31',
    stock: null,
    isHighlighted: true,
    isFavorite: false,
    views: 178,
    saves: 32,
    createdAt: 'ahir',
    terms: '3 mesos gratuïts amb contracte mínim d\'1 any. Personal qualificat i assegurat.'
  }
];

export default function OferterPage() {
  const [activeTab, setActiveTab] = useState('totes');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    company: '',
    discountRange: '',
    validUntil: ''
  });

  const statsData = [
    { label: 'Ofertes Disponibles', value: '47', trend: '+8%' },
    { label: 'Noves Aquesta Setmana', value: '12', trend: '+4' },
    { label: 'Els Meus Favorits', value: '6', trend: '+2' },
    { label: 'Ofertes Utilitzades', value: '3', trend: '+1' }
  ];

  // Lista extensible de categorías disponibles
  const availableCategories = [
    'Tecnologia',
    'Serveis Professionals',
    'Serveis',
    'Formació',
    'Transport',
    'Seguretat',
    'Material Oficina',
    'Consultoria',
    'Equipament',
    'Software',
    'Telecomunicacions'
  ].sort();

  // Filtrar ofertas basado en búsqueda, filtros y tab activo
  const filteredOffers = useMemo(() => {
    let filtered = [...sampleOffers];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(offer =>
        offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.company.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por filtros
    if (filters.category) {
      filtered = filtered.filter(offer =>
        offer.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }

    // Filtrar por tab activo
    switch (activeTab) {
      case 'destacades':
        filtered = filtered.filter(offer => offer.isHighlighted);
        break;
      case 'favorits':
        filtered = filtered.filter(offer => offer.isFavorite);
        break;
      case 'noves':
        // Simular ofertas nuevas (últimas 3)
        filtered = filtered.slice(-3);
        break;
      default:
        // 'totes' - no filtrar
        break;
    }

    return filtered;
  }, [searchTerm, filters, activeTab]);

  // Calcular contadores para pestañas básicas
  const tabCounts = {
    totes: sampleOffers.length,
    destacades: sampleOffers.filter(o => o.isHighlighted).length,
    favorits: sampleOffers.filter(o => o.isFavorite).length,
    noves: 3
  };

  return (
    <PageTemplate
      title="Ofertes Comercials"
      subtitle="Descubreix descomptes exclusius d'empreses col·laboradores"
      statsData={statsData}
    >
      <div style={{ padding: '0 24px 24px 24px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* Búsqueda y filtros */}
        <OfferSearchFilters
          onSearch={setSearchTerm}
          onFilterChange={setFilters}
          totalResults={filteredOffers.length}
          availableCategories={availableCategories}
        />

        {/* Tabs de navegación */}
        <OfferTabs
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
            {filteredOffers.length} oferta{filteredOffers.length !== 1 ? 's' : ''} trobada{filteredOffers.length !== 1 ? 's' : ''}
          </h2>

          <ViewToggle
            viewMode={viewMode}
            onViewChange={setViewMode}
          />
        </div>

        {/* Grid/Lista de ofertas */}
        {filteredOffers.length > 0 ? (
          <div style={{
            display: viewMode === 'grid' ? 'grid' : 'block',
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(4, 1fr)' : 'none',
            gap: viewMode === 'grid' ? '20px' : '0'
          }}>
            {filteredOffers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
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
              No s'han trobat ofertes
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