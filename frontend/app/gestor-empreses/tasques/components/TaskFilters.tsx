'use client';

import { useState } from 'react';
import { TaskStatus, TaskPriority, TaskType } from '@prisma/client';
import { useUsers } from '@/hooks/useUsers';

interface TaskFiltersProps {
  filters: {
    status: TaskStatus | 'all';
    priority: TaskPriority | 'all';
    type: TaskType | 'all';
    assignedToId?: string;
    search: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

export default function TaskFilters({ filters, onFilterChange }: TaskFiltersProps) {
  const [expanded, setExpanded] = useState(true);
  const { users } = useUsers();

  const statusOptions = [
    { value: 'PENDING', label: 'Pendiente', badge: 'bg-yellow-100 text-yellow-700' },
    { value: 'IN_PROGRESS', label: 'En Progreso', badge: 'bg-blue-100 text-blue-700' },
    { value: 'COMPLETED', label: 'Completada', badge: 'bg-green-100 text-green-700' },
    { value: 'CANCELLED', label: 'Cancelada', badge: 'bg-gray-100 text-gray-700' },
  ];

  const priorityOptions = [
    { value: 'URGENT', label: 'Urgent', badge: 'bg-red-100 text-red-700' },
    { value: 'HIGH', label: 'Alta', badge: 'bg-orange-100 text-orange-700' },
    { value: 'MEDIUM', label: 'Media', badge: 'bg-yellow-100 text-yellow-700' },
    { value: 'LOW', label: 'Baja', badge: 'bg-green-100 text-green-700' },
  ];

  const typeOptions = [
    { value: 'FOLLOW_UP', label: 'Seguimiento' },
    { value: 'MEETING', label: 'Reunión' },
    { value: 'CALL', label: 'Llamada' },
    { value: 'EMAIL', label: 'Email' },
    { value: 'DEMO', label: 'Demo' },
    { value: 'PROPOSAL', label: 'Propuesta' },
  ];

  const isFilterActive = (key: string, value: string) => {
    if (key === 'status') return filters.status === value;
    if (key === 'priority') return filters.priority === value;
    if (key === 'type') return filters.type === value;
    if (key === 'assignedToId') return filters.assignedToId === value;
    return false;
  };

  const toggleFilter = (key: string, value: string) => {
    const currentValue = filters[key as keyof typeof filters];
    onFilterChange(key, currentValue === value ? 'all' : value);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Filtres</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Filtra tasques per estat, prioritat i tipus
          </p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          {expanded ? 'Contraure' : 'Expandir'}
          <svg
            className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Contenido */}
      {expanded && (
        <div className="p-6">
          {/* Búsqueda */}
          <div className="mb-6">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => onFilterChange('search', e.target.value)}
                placeholder="Buscar tareas por título, descripción o etiquetas..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Grid de 4 columnas */}
          <div className="grid grid-cols-4 gap-6">
            {/* COLUMNA 1: Estado */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Estado
              </label>
              <div className="space-y-2.5">
                {statusOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={isFilterActive('status', option.value)}
                      onChange={() => toggleFilter('status', option.value)}
                      className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${option.badge}`}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* COLUMNA 2: Prioridad */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Prioritat
              </label>
              <div className="space-y-2.5">
                {priorityOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={isFilterActive('priority', option.value)}
                      onChange={() => toggleFilter('priority', option.value)}
                      className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${option.badge}`}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* COLUMNA 3: Tipo */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Tipo
              </label>
              <div className="space-y-2.5">
                {typeOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={isFilterActive('type', option.value)}
                      onChange={() => toggleFilter('type', option.value)}
                      className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-700 group-hover:text-gray-900">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* COLUMNA 4: Asignado a */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Asignado a
              </label>
              <div className="space-y-2.5">
                {users.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Cargando usuarios...</p>
                ) : (
                  users.slice(0, 6).map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={isFilterActive('assignedToId', user.id)}
                        onChange={() => toggleFilter('assignedToId', user.id)}
                        className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-700 group-hover:text-gray-900">
                        {user.name || user.email}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}