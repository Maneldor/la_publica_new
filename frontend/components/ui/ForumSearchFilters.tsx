'use client';

import { useState } from 'react';

interface ForumSearchFiltersProps {
  onSearch: (searchTerm: string) => void;
  onFilterChange: (filters: any) => void;
  totalResults: number;
}

export function ForumSearchFilters({ onSearch, onFilterChange, totalResults }: ForumSearchFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    tags: '',
    author: '',
    hasAttachments: false
  });

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFilterChange = (key: string, value: string | boolean) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      category: '',
      tags: '',
      author: '',
      hasAttachments: false
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
      {/* Barra de búsqueda principal */}
      <div style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        marginBottom: showFilters ? '20px' : '0'
      }}>
        {/* Input de búsqueda */}
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
            placeholder="Buscar fòrums per títol, contingut, categoria o tags..."
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

        {/* Botón de filtros */}
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

        {/* Contador de resultados */}
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#6c757d',
          fontWeight: '500'
        }}>
          {totalResults} fòrums
        </div>
      </div>

      {/* Panel de filtros expandible */}
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
            {/* Filtro por categoría */}
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
                <option value="tecnologia">Tecnologia i Innovació</option>
                <option value="gestio">Gestió Pública</option>
                <option value="recursos">Recursos Humans</option>
                <option value="normativa">Normativa i Legislació</option>
                <option value="formacio">Formació i Desenvolupament</option>
                <option value="consultes">Consultes Generals</option>
              </select>
            </div>

            {/* Filtro por tags */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Tags
              </label>
              <input
                type="text"
                placeholder="Cercar per tags..."
                value={filters.tags}
                onChange={(e) => handleFilterChange('tags', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '2px solid #e9ecef',
                  borderRadius: '6px',
                  fontSize: '13px'
                }}
              />
            </div>

            {/* Filtro por autor */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Autor
              </label>
              <input
                type="text"
                placeholder="Nom de l'autor..."
                value={filters.author}
                onChange={(e) => handleFilterChange('author', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '2px solid #e9ecef',
                  borderRadius: '6px',
                  fontSize: '13px'
                }}
              />
            </div>

            {/* Filtro por adjuntos */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Adjuntos
              </label>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={filters.hasAttachments}
                  onChange={(e) => handleFilterChange('hasAttachments', e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px'
                  }}
                />
                <span style={{
                  fontSize: '13px',
                  color: '#374151'
                }}>
                  Només fòrums amb adjuntos
                </span>
              </label>
            </div>
          </div>

          {/* Botón para limpiar filtros */}
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