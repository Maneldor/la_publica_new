'use client';

import { useState, useMemo, useEffect } from 'react';
import { TaskStatus, TaskPriority } from '@prisma/client';
import TimelineMetrics from './TimelineMetrics';
import ManagerRow from './ManagerRow';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: Date | string;
  dueDate?: Date | string;
  assignedTo: {
    id: string;
    name: string | null;
    email: string;
  };
  company?: { name: string } | null;
  lead?: { companyName: string } | null;
}

interface TaskTimelineProps {
  tasks: Task[];
  loading?: boolean;
  onTaskClick: (taskId: string) => void;
  filters?: {
    status?: string;
    priority?: string;
    assignedToId?: string;
    search?: string;
  };
}

type TimelineView = 'weeks' | 'months';
type DateRange = 'this_month' | 'next_7' | 'next_30' | 'custom';

export default function TaskTimeline({
  tasks,
  loading = false,
  onTaskClick,
  filters
}: TaskTimelineProps) {
  const [timelineView, setTimelineView] = useState<TimelineView>('weeks');
  const [dateRange, setDateRange] = useState<DateRange>('this_month');
  const [showOnlyRisk, setShowOnlyRisk] = useState(false);
  const [showOnlyOverdue, setShowOnlyOverdue] = useState(false);
  const [selectedManager, setSelectedManager] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // Calcular fechas del timeline
  const { timelineStart, timelineEnd } = useMemo(() => {
    const today = new Date();
    let start: Date, end: Date;

    switch (dateRange) {
      case 'this_month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'next_7':
        start = new Date(today);
        end = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'next_30':
        start = new Date(today);
        end = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        break;
      case 'custom':
        start = customStartDate ? new Date(customStartDate) : new Date(today);
        end = customEndDate ? new Date(customEndDate) : new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }

    return { timelineStart: start, timelineEnd: end };
  }, [dateRange, customStartDate, customEndDate]);

  // Filtrar tareas según los filtros aplicados
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Filtros existentes
    if (filters?.status && filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    if (filters?.priority && filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    if (filters?.assignedToId && filters.assignedToId !== 'all') {
      filtered = filtered.filter(task => task.assignedTo.id === filters.assignedToId);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower)
      );
    }

    // Filtros específicos del timeline
    if (selectedManager !== 'all') {
      filtered = filtered.filter(task => task.assignedTo.id === selectedManager);
    }

    const today = new Date();

    if (showOnlyOverdue) {
      filtered = filtered.filter(task => {
        if (!task.dueDate || task.status === 'COMPLETED') return false;
        return new Date(task.dueDate) < today;
      });
    }

    if (showOnlyRisk) {
      filtered = filtered.filter(task => {
        if (!task.dueDate || task.status === 'COMPLETED') return false;
        const dueDate = new Date(task.dueDate);
        const riskDate = new Date(today);
        riskDate.setDate(riskDate.getDate() + 2);
        return dueDate <= riskDate && dueDate >= today;
      });
    }

    return filtered;
  }, [tasks, filters, selectedManager, showOnlyRisk, showOnlyOverdue]);

  // Agrupar tareas por gestor
  const tasksByManager = useMemo(() => {
    const grouped = filteredTasks.reduce((acc, task) => {
      const managerId = task.assignedTo.id;
      if (!acc[managerId]) {
        acc[managerId] = {
          manager: task.assignedTo,
          tasks: []
        };
      }
      acc[managerId].tasks.push(task);
      return acc;
    }, {} as Record<string, { manager: Task['assignedTo'], tasks: Task[] }>);

    // Ordenar por número de tareas activas
    return Object.values(grouped).sort((a, b) => {
      const aActive = a.tasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length;
      const bActive = b.tasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length;
      return bActive - aActive;
    });
  }, [filteredTasks]);

  // Obtener lista única de gestores para el filtro
  const uniqueManagers = useMemo(() => {
    const managers = new Map<string, Task['assignedTo']>();
    tasks.forEach(task => {
      if (!managers.has(task.assignedTo.id)) {
        managers.set(task.assignedTo.id, task.assignedTo);
      }
    });
    return Array.from(managers.values());
  }, [tasks]);

  // Calcular ancho de cada período
  const weekWidth = useMemo(() => {
    const totalDuration = timelineEnd.getTime() - timelineStart.getTime();
    const weekDuration = 7 * 24 * 60 * 60 * 1000;
    const numberOfWeeks = Math.ceil(totalDuration / weekDuration);
    return 100 / numberOfWeeks;
  }, [timelineStart, timelineEnd]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Métricas KPI */}
      <TimelineMetrics tasks={filteredTasks} />

      {/* Controles y filtros */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Lado izquierdo: Título y vista */}
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-semibold text-gray-900">
              Timeline Ejecutivo
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTimelineView('weeks')}
                className={`px-3 py-1 text-xs rounded ${
                  timelineView === 'weeks'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Semanas
              </button>
              <button
                onClick={() => setTimelineView('months')}
                className={`px-3 py-1 text-xs rounded ${
                  timelineView === 'months'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Meses
              </button>
            </div>
          </div>

          {/* Lado derecho: Filtros */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Rango de fechas */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className="text-xs border border-gray-300 rounded px-2 py-1"
            >
              <option value="this_month">Este mes</option>
              <option value="next_7">Próximos 7 días</option>
              <option value="next_30">Próximos 30 días</option>
              <option value="custom">Personalizado</option>
            </select>

            {/* Fechas custom */}
            {dateRange === 'custom' && (
              <>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="text-xs border border-gray-300 rounded px-2 py-1"
                />
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="text-xs border border-gray-300 rounded px-2 py-1"
                />
              </>
            )}

            {/* Gestor específico */}
            <select
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
              className="text-xs border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">Todos los gestores</option>
              {uniqueManagers.map(manager => (
                <option key={manager.id} value={manager.id}>
                  {manager.name || manager.email.split('@')[0]}
                </option>
              ))}
            </select>

            {/* Toggles */}
            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={showOnlyRisk}
                onChange={(e) => setShowOnlyRisk(e.target.checked)}
                className="w-3 h-3"
              />
              Solo en riesgo
            </label>

            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={showOnlyOverdue}
                onChange={(e) => setShowOnlyOverdue(e.target.checked)}
                className="w-3 h-3"
              />
              Solo vencidas
            </label>
          </div>
        </div>
      </div>

      {/* Header del timeline - Escala temporal */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-64 px-4 py-2 text-xs font-semibold text-gray-700 border-r border-gray-200">
            Gestor / Tareas
          </div>
          <div className="flex-1 relative">
            <div className="flex">
              {Array.from({ length: Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) }, (_, weekIndex) => {
                const weekStart = new Date(timelineStart.getTime() + weekIndex * 7 * 24 * 60 * 60 * 1000);
                return (
                  <div
                    key={weekIndex}
                    className="border-r border-gray-200 px-2 py-2 text-xs text-center text-gray-600"
                    style={{ width: `${weekWidth}%` }}
                  >
                    {weekStart.toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short'
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Lista de gestores y sus tareas */}
      <div className="max-h-96 overflow-y-auto">
        {tasksByManager.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tareas para mostrar</h3>
            <p className="text-gray-500 text-sm">
              No se encontraron tareas que coincidan con los filtros aplicados.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {tasksByManager.map(({ manager, tasks: managerTasks }) => (
              <div key={manager.id} className="flex">
                <div className="w-64 flex-shrink-0">
                  <ManagerRow
                    manager={manager}
                    tasks={managerTasks}
                    onTaskClick={onTaskClick}
                    timelineStart={timelineStart}
                    timelineEnd={timelineEnd}
                    weekWidth={weekWidth}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer con resumen */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
        <div className="flex items-center justify-between">
          <span>
            {tasksByManager.length} gestores • {filteredTasks.length} tareas
          </span>
          <span>
            Período: {timelineStart.toLocaleDateString('es-ES')} - {timelineEnd.toLocaleDateString('es-ES')}
          </span>
        </div>
      </div>
    </div>
  );
}