'use client';

import { useState } from 'react';

interface GroupFilters {
  category: string;
  privacy: string;
  members: string;
  activity: string;
}

interface GroupsSearchFiltersProps {
  onSearch: (searchTerm: string) => void;
  onFilterChange: (filters: GroupFilters) => void;
  totalResults: number;
}

export function GroupsSearchFilters({ onSearch, onFilterChange, totalResults }: GroupsSearchFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    privacy: '',
    members: '',
    activity: ''
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
      privacy: '',
      members: '',
      activity: ''
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
            placeholder="Buscar grups per nom, descripció o categoria..."
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
          {totalResults} grups
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
                <option value="tecnologia">Tecnologia</option>
                <option value="disseny">Disseny</option>
                <option value="marketing">Marketing</option>
                <option value="negocis">Negocis</option>
                <option value="educacio">Educació</option>
                <option value="recerca">Recerca</option>
              </select>
            </div>

            {/* Filtro por privacidad */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Privacitat
              </label>
              <select
                value={filters.privacy}
                onChange={(e) => handleFilterChange('privacy', e.target.value)}
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
                <option value="public">Públics</option>
                <option value="private">Privats</option>
                <option value="secret">Secrets</option>
              </select>
            </div>

            {/* Filtro por número de miembros */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Mida del grup
              </label>
              <select
                value={filters.members}
                onChange={(e) => handleFilterChange('members', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '2px solid #e9ecef',
                  borderRadius: '6px',
                  fontSize: '13px',
                  backgroundColor: '#fff'
                }}
              >
                <option value="">Qualsevol mida</option>
                <option value="small">Petit (1-50 membres)</option>
                <option value="medium">Mitjà (51-200 membres)</option>
                <option value="large">Gran (201+ membres)</option>
              </select>
            </div>

            {/* Filtro por actividad */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Activitat
              </label>
              <select
                value={filters.activity}
                onChange={(e) => handleFilterChange('activity', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '2px solid #e9ecef',
                  borderRadius: '6px',
                  fontSize: '13px',
                  backgroundColor: '#fff'
                }}
              >
                <option value="">Qualsevol activitat</option>
                <option value="very_active">Molt actiu</option>
                <option value="active">Actiu</option>
                <option value="quiet">Tranquil</option>
              </select>
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