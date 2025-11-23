'use client';

import { Search, X, Filter } from 'lucide-react';

interface LeadFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
  selectedPriority: string;
  setSelectedPriority: (value: string) => void;
  dateFrom: string;
  setDateFrom: (value: string) => void;
  dateTo: string;
  setDateTo: (value: string) => void;
  onClearFilters: () => void;
}

export default function LeadFilters({
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
  selectedPriority,
  setSelectedPriority,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  onClearFilters
}: LeadFiltersProps) {
  const hasActiveFilters = searchTerm || selectedStatus !== 'all' || selectedPriority !== 'all' || dateFrom || dateTo;

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <div className="grid items-center gap-4" style={{ gridTemplateColumns: 'minmax(250px, 1fr) auto auto 140px 140px auto' }}>
        {/* Input de búsqueda */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full h-10 pl-10 pr-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Buscar por empresa, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Dropdown Estado */}
        <select
          className="h-10 px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm min-w-[180px]"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="all">Todos los estados</option>
          <option value="new">Nuevo</option>
          <option value="contacted">Contactado</option>
          <option value="negotiating">Negociando</option>
          <option value="converted">Convertido</option>
          <option value="lost">Perdido</option>
        </select>

        {/* Dropdown Prioridad */}
        <select
          className="h-10 px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm min-w-[180px]"
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
        >
          <option value="all">Todas las prioridades</option>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baja</option>
        </select>

        {/* Input fecha Desde */}
        <div className="w-[140px]">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Desde
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="block w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Input fecha Hasta */}
        <div className="w-[140px]">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Hasta
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="block w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Botón Limpiar */}
        <button
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
          className="h-10 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <X className="h-4 w-4 mr-2" />
          Limpiar
        </button>
      </div>

      {/* Indicador de filtros activos */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500">Filtros activos:</span>
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                <Search className="h-3 w-3" />
                {searchTerm}
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedStatus !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                Estado: {selectedStatus}
                <button
                  onClick={() => setSelectedStatus('all')}
                  className="text-green-500 hover:text-green-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedPriority !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700">
                Prioridad: {selectedPriority}
                <button
                  onClick={() => setSelectedPriority('all')}
                  className="text-orange-500 hover:text-orange-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {dateFrom && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                Desde: {dateFrom}
                <button
                  onClick={() => setDateFrom('')}
                  className="text-purple-500 hover:text-purple-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {dateTo && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                Hasta: {dateTo}
                <button
                  onClick={() => setDateTo('')}
                  className="text-purple-500 hover:text-purple-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}