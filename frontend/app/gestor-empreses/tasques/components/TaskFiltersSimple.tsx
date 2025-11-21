'use client';

import React from 'react';

interface TaskFiltersProps {
  filters: {
    status: string;
    priority: string;
    type: string;
    search: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

export default function TaskFilters({ filters, onFilterChange }: TaskFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      {/* Búsqueda */}
      <input
        type="text"
        value={filters.search}
        onChange={(e) => onFilterChange('search', e.target.value)}
        placeholder="Buscar tareas por título, descripción o etiquetas..."
        className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Estado */}
        <select
          value={filters.status}
          onChange={(e) => onFilterChange('status', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos los estados</option>
          <option value="PENDING">Pendiente</option>
          <option value="IN_PROGRESS">En Progreso</option>
          <option value="WAITING">Esperando</option>
          <option value="BLOCKED">Bloqueada</option>
          <option value="COMPLETED">Completada</option>
          <option value="CANCELLED">Cancelada</option>
        </select>

        {/* Prioridad */}
        <select
          value={filters.priority}
          onChange={(e) => onFilterChange('priority', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todas las prioridades</option>
          <option value="URGENT">Urgente</option>
          <option value="HIGH">Alta</option>
          <option value="MEDIUM">Media</option>
          <option value="LOW">Baja</option>
        </select>

        {/* Tipo */}
        <select
          value={filters.type}
          onChange={(e) => onFilterChange('type', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos los tipos</option>
          <option value="FOLLOW_UP">Seguimiento</option>
          <option value="MEETING">Reunión</option>
          <option value="CALL">Llamada</option>
          <option value="EMAIL">Email</option>
          <option value="DEMO">Demo</option>
          <option value="PROPOSAL">Propuesta</option>
          <option value="OTHER">Otros</option>
        </select>

        {/* Botón limpiar filtros */}
        <button
          onClick={() => {
            onFilterChange('status', 'all');
            onFilterChange('priority', 'all');
            onFilterChange('type', 'all');
            onFilterChange('search', '');
          }}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Limpiar filtros
        </button>
      </div>

      {/* Estado de carga y resultados */}
      <div className="mt-4 text-sm text-gray-600">
        Filtros aplicados automáticamente
      </div>
    </div>
  );
}