'use client';

import { useState } from 'react';

interface CourseFilters {
  category: string;
  level: string;
  mode: string;
  duration: string;
  price: string;
}

interface CourseSearchFiltersProps {
  onSearch: (searchTerm: string) => void;
  onFilterChange: (filters: CourseFilters) => void;
  totalResults: number;
  availableCategories: string[];
}

export function CourseSearchFilters({ onSearch, onFilterChange, totalResults, availableCategories }: CourseSearchFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    mode: '',
    duration: '',
    price: ''
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
      category: '',
      level: '',
      mode: '',
      duration: '',
      price: ''
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
        {/* Botó de filtres - PRIMER */}
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
          <span style={{
            fontSize: '12px',
            transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }}>
            ▼
          </span>
          Filtres
        </button>

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
            placeholder="Buscar cursos per títol, instructor o temàtica..."
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

        {/* Comptador de resultats */}
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#6c757d',
          fontWeight: '500'
        }}>
          {totalResults} cursos
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
                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre per nivell */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Nivell
              </label>
              <select
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '2px solid #e9ecef',
                  borderRadius: '6px',
                  fontSize: '13px',
                  backgroundColor: '#fff'
                }}
              >
                <option value="">Tots els nivells</option>
                <option value="Principiant">Principiant</option>
                <option value="Intermedi">Intermedi</option>
                <option value="Avançat">Avançat</option>
              </select>
            </div>

            {/* Filtre per modalitat */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Modalitat
              </label>
              <select
                value={filters.mode}
                onChange={(e) => handleFilterChange('mode', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '2px solid #e9ecef',
                  borderRadius: '6px',
                  fontSize: '13px',
                  backgroundColor: '#fff'
                }}
              >
                <option value="">Totes les modalitats</option>
                <option value="presencial">🏢 Presencial</option>
                <option value="online">💻 Online</option>
                <option value="hibrid">🔄 Híbrid</option>
              </select>
            </div>

            {/* Filtre per durada */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Durada
              </label>
              <select
                value={filters.duration}
                onChange={(e) => handleFilterChange('duration', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '2px solid #e9ecef',
                  borderRadius: '6px',
                  fontSize: '13px',
                  backgroundColor: '#fff'
                }}
              >
                <option value="">Totes les durades</option>
                <option value="1-15">1-15 hores</option>
                <option value="16-30">16-30 hores</option>
                <option value="31-50">31-50 hores</option>
                <option value="50+">Més de 50 hores</option>
              </select>
            </div>

            {/* Filtre per preu */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Preu
              </label>
              <select
                value={filters.price}
                onChange={(e) => handleFilterChange('price', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '2px solid #e9ecef',
                  borderRadius: '6px',
                  fontSize: '13px',
                  backgroundColor: '#fff'
                }}
              >
                <option value="">Tots els preus</option>
                <option value="0-100">Fins 100€</option>
                <option value="100-250">100€ - 250€</option>
                <option value="250-400">250€ - 400€</option>
                <option value="400+">Més de 400€</option>
                <option value="gratuït">Gratuït</option>
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