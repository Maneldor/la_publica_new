'use client';

import { useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
  color?: string;
}

interface FilterSection {
  title: string;
  key: string;
  type: 'checkbox' | 'radio';
  options: FilterOption[];
  collapsible?: boolean;
  initialCollapsed?: boolean;
  maxVisibleOptions?: number;
  layout?: 'single' | 'double' | 'triple' | 'quad'; // Layout de columnas
}

interface ExpandableFiltersProps {
  title: string;
  subtitle: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  filters: FilterSection[];
  selectedFilters: Record<string, string[]>;
  onFilterChange: (filterKey: string, value: string, checked: boolean) => void;
  onClearAll: () => void;
  activeFiltersCount: number;
}

export default function ExpandableFilters({
  title,
  subtitle,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters,
  selectedFilters,
  onFilterChange,
  onClearAll,
  activeFiltersCount
}: ExpandableFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sectionStates, setSectionStates] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    filters.forEach(section => {
      if (section.collapsible) {
        initialState[section.key] = !section.initialCollapsed;
      }
    });
    return initialState;
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header del filtro */}
      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          {activeFiltersCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearAll();
              }}
              className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full hover:bg-blue-200 transition-colors"
            >
              Limpiar {activeFiltersCount > 1 ? `(${activeFiltersCount})` : ''}
            </button>
          )}

          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Contenido expandible */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4">
          {/* Barra de búsqueda */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchValue && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Secciones de filtros */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {filters.map((section) => {
              const isCollapsible = section.collapsible;
              const isExpanded = sectionStates[section.key] !== false;
              const maxVisible = section.maxVisibleOptions || section.options.length;
              const visibleOptions = isExpanded ? section.options : section.options.slice(0, maxVisible);
              const hasMore = section.options.length > maxVisible;

              // Asignar espacio según la sección
              const getColumnSpan = (key: string) => {
                switch (key) {
                  case 'estado': return 'lg:col-span-2';
                  case 'plan': return 'lg:col-span-2 lg:mr-6'; // Margen derecho para separar de SECTOR
                  case 'sector': return 'lg:col-span-8';
                  default: return 'lg:col-span-4';
                }
              };

              return (
                <div key={section.key} className={getColumnSpan(section.key)}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                      {section.title}
                    </h4>
                    {isCollapsible && hasMore && (
                      <button
                        onClick={() => setSectionStates(prev => ({
                          ...prev,
                          [section.key]: !isExpanded
                        }))}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {isExpanded ? 'Ver menos' : 'Ver más'}
                      </button>
                    )}
                  </div>

                  <div className={`${
                    section.layout === 'double'
                      ? 'grid grid-cols-2 gap-x-4 gap-y-2'
                      : section.layout === 'triple'
                      ? 'grid grid-cols-3 gap-x-3 gap-y-2'
                      : section.layout === 'quad'
                      ? 'grid grid-cols-4 gap-x-0'
                      : 'space-y-2'
                  }`} style={section.layout === 'quad' ? { rowGap: '0.5rem' } : {}}>
                    {visibleOptions.map((option) => {
                      const isSelected = selectedFilters[section.key]?.includes(option.value) || false;

                      return (
                        <label
                          key={option.value}
                          className={`flex items-center cursor-pointer hover:bg-gray-50 rounded-lg transition-colors ${
                            section.layout === 'quad' ? 'space-x-1 py-2 px-1' : 'space-x-2 p-2'
                          }`}
                        >
                          <input
                            type={section.type}
                            name={section.type === 'radio' ? section.key : undefined}
                            checked={isSelected}
                            onChange={(e) => onFilterChange(section.key, option.value, e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                          />
                          <span
                            className={`text-sm ${isSelected ? 'font-medium text-gray-900' : 'text-gray-700'} truncate`}
                            style={option.color ? { color: option.color } : {}}
                          >
                            {option.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botón para limpiar todo */}
          {activeFiltersCount > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={onClearAll}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Limpiar todos los filtros
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}