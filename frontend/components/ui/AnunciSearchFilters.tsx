'use client';

import { useState } from 'react';

interface AnunciFilters {
  category: string;
  type: string;
  priceMin: string;
  priceMax: string;
  province: string;
  condition: string;
}

interface AnunciSearchFiltersProps {
  onSearch: (searchTerm: string) => void;
  onFilterChange: (filters: AnunciFilters) => void;
  totalResults: number;
}

export function AnunciSearchFilters({ onSearch, onFilterChange, totalResults }: AnunciSearchFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    priceMin: '',
    priceMax: '',
    location: '',
    status: ''
  });

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      type: '',
      category: '',
      priceMin: '',
      priceMax: '',
      location: '',
      status: ''
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '20px',
      border: '2px solid #e5e7eb',
      boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
      marginBottom: '20px'
    }}>
      {/* Barra de cerca principal */}
      <div style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        marginBottom: showFilters ? '20px' : '0'
      }}>
        {/* Input de cerca */}
        <div style={{
          position: 'relative',
          flex: 1
        }}>
          <div style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#6c757d',
            fontSize: '16px'
          }}>
            🔍
          </div>
          <input
            type="text"
            placeholder="Buscar anuncis per títol, descripció o categoria..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 40px',
              border: '2px solid #e9ecef',
              borderRadius: '8px',
              fontSize: '14px',
              transition: 'border-color 0.2s',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
          />
        </div>

        {/* Botó de filtres */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            padding: '12px 16px',
            backgroundColor: showFilters ? '#3b82f6' : '#f8f9fa',
            color: showFilters ? 'white' : '#6c757d',
            border: showFilters ? '2px solid #3b82f6' : '2px solid #e9ecef',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          Filtres
        </button>

        {/* Comptador de resultats */}
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#6c757d',
          fontWeight: '500'
        }}>
          {totalResults} anuncis
        </div>
      </div>

      {/* Panell de filtres expandible */}
      {showFilters && (
        <div style={{
          borderTop: '1px solid #f0f0f0',
          paddingTop: '20px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '16px'
          }}>
            {/* Filtre per tipus */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Tipus d&apos;anunci
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '2px solid #e9ecef',
                  borderRadius: '6px',
                  fontSize: '13px',
                  backgroundColor: '#fff'
                }}
              >
                <option value="">Tots els tipus</option>
                <option value="oferta">Ofertes</option>
                <option value="demanda">Demandes</option>
              </select>
            </div>

            {/* Filtre per categoria */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Categoria
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '2px solid #e9ecef',
                  borderRadius: '6px',
                  fontSize: '13px',
                  backgroundColor: '#fff'
                }}
              >
                <option value="">Totes les categories</option>
                <option value="equipament">Equipament Oficina</option>
                <option value="serveis">Serveis Professionals</option>
                <option value="vehicles">Vehicles</option>
                <option value="immobiliaria">Immobiliària</option>
                <option value="tecnologia">Tecnologia</option>
                <option value="material">Material Fungible</option>
                <option value="altres">Altres</option>
              </select>
            </div>

            {/* Rang de preu */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Preu mínim (€)
              </label>
              <input
                type="number"
                placeholder="0"
                value={filters.priceMin}
                onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '2px solid #e9ecef',
                  borderRadius: '6px',
                  fontSize: '13px'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Preu màxim (€)
              </label>
              <input
                type="number"
                placeholder="Sense límit"
                value={filters.priceMax}
                onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '2px solid #e9ecef',
                  borderRadius: '6px',
                  fontSize: '13px'
                }}
              />
            </div>

            {/* Ubicació */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Ubicació
              </label>
              <input
                type="text"
                placeholder="Ciutat o comarca..."
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '2px solid #e9ecef',
                  borderRadius: '6px',
                  fontSize: '13px'
                }}
              />
            </div>

            {/* Estat */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Estat
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '2px solid #e9ecef',
                  borderRadius: '6px',
                  fontSize: '13px',
                  backgroundColor: '#fff'
                }}
              >
                <option value="">Tots els estats</option>
                <option value="actiu">Actiu</option>
                <option value="reservat">Reservat</option>
                <option value="tancat">Tancat</option>
              </select>
            </div>
          </div>

          {/* Botó per netejar filtres */}
          <button
            onClick={clearFilters}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: '#6c757d',
              border: '1px solid #e9ecef',
              borderRadius: '6px',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
              e.currentTarget.style.color = '#374151';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#6c757d';
            }}
          >
            Netejar filtres
          </button>
        </div>
      )}
    </div>
  );
}