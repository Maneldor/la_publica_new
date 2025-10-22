import { useState, useMemo, useCallback } from 'react';
import { Anunci } from '../../../../lib/data/anuncisData';

// Tipus per als filtres d'anuncis
interface AnunciFilters {
  type: string;
  category: string;
  priceMin: string;
  priceMax: string;
  location: string;
  status: string;
}

// Tipus per als tabs
type AnunciTab = 'tots' | 'ofertes' | 'demandes' | 'favorits';

// Tipus per als conteos de tabs
interface TabCounts {
  tots: number;
  ofertes: number;
  demandes: number;
  favorits: number;
}

export function useAnuncis(anuncis: Anunci[]) {
  // Estats de filtres i cerca
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<AnunciTab>('tots');
  const [filters, setFilters] = useState<AnunciFilters>({
    type: '',
    category: '',
    priceMin: '',
    priceMax: '',
    location: '',
    status: ''
  });

  // Resetar tots els filtres
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setFilters({
      type: '',
      category: '',
      priceMin: '',
      priceMax: '',
      location: '',
      status: ''
    });
    setActiveTab('tots');
  }, []);

  // Filtrar anuncis amb lògica completa
  const anuncisFiltrats = useMemo(() => {
    let filtered = [...anuncis];

    // 1. Filtrar per terme de cerca
    if (searchTerm) {
      filtered = filtered.filter(anunci =>
        anunci.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        anunci.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        anunci.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. Aplicar filtres avançats
    if (filters.type) {
      filtered = filtered.filter(anunci => anunci.type === filters.type);
    }
    if (filters.category) {
      filtered = filtered.filter(anunci =>
        anunci.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }
    if (filters.priceMin) {
      filtered = filtered.filter(anunci => anunci.price >= Number(filters.priceMin));
    }
    if (filters.priceMax) {
      filtered = filtered.filter(anunci => anunci.price <= Number(filters.priceMax));
    }
    if (filters.location) {
      filtered = filtered.filter(anunci =>
        anunci.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    if (filters.status) {
      filtered = filtered.filter(anunci => anunci.status === filters.status);
    }

    // 3. Filtrar per tab actiu (s'aplica després dels filtres generals)
    switch (activeTab) {
      case 'ofertes':
        filtered = filtered.filter(anunci => anunci.type === 'oferta');
        break;
      case 'demandes':
        filtered = filtered.filter(anunci => anunci.type === 'demanda');
        break;
      case 'favorits':
        filtered = filtered.filter(anunci => anunci.isFavorite);
        break;
      default:
        // 'tots' - mostrar tots els que passen els altres filtres
        break;
    }

    return filtered;
  }, [anuncis, searchTerm, filters, activeTab]);

  // Calcular conteos per als tabs (basat en anuncis originals, no filtrats)
  const tabCounts = useMemo<TabCounts>(() => ({
    tots: anuncis.length,
    ofertes: anuncis.filter(a => a.type === 'oferta').length,
    demandes: anuncis.filter(a => a.type === 'demanda').length,
    favorits: anuncis.filter(a => a.isFavorite).length
  }), [anuncis]);

  return {
    // Anuncis processats
    anuncisFiltrats,

    // Estats de cerca i filtres
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,

    // Gestió de tabs
    activeTab,
    setActiveTab,
    tabCounts,

    // Utilitats
    resetFilters
  };
}