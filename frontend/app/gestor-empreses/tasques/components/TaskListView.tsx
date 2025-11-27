'use client';

import { useState } from 'react';
import { Task, TaskStatus, TaskPriority, TaskType } from '@prisma/client';

interface TaskWithRelations {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  dueDate?: Date | string;
  assignedTo: {
    id: string;
    name: string | null;
    email: string;
  };
  createdBy: {
    id: string;
    name: string | null;
    email: string;
  };
  lead?: {
    id: string;
    companyName: string;
  } | null;
  company?: {
    id: string;
    name: string;
  } | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface TaskListViewProps {
  tasks: TaskWithRelations[];
  loading: boolean;
  onTaskClick?: (taskId: string) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onTaskDelete?: (taskId: string) => Promise<void>;
  onTaskEdit?: (task: TaskWithRelations) => void;
}

export default function TaskListView({
  tasks,
  loading,
  onTaskClick,
  onTaskUpdate,
  onTaskDelete,
  onTaskEdit
}: TaskListViewProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const getStatusBadge = (status: TaskStatus) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      IN_PROGRESS: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-gray-100 text-gray-700'
    };

    const labels = {
      PENDING: 'Pendiente',
      IN_PROGRESS: 'En Progreso',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada'
    };

    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    const badges = {
      URGENT: 'bg-red-100 text-red-700',
      HIGH: 'bg-orange-100 text-orange-700',
      MEDIUM: 'bg-yellow-100 text-yellow-700',
      LOW: 'bg-green-100 text-green-700'
    };

    const labels = {
      URGENT: 'Urgent',
      HIGH: 'Alta',
      MEDIUM: 'Media',
      LOW: 'Baja'
    };

    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded ${badges[priority]}`}>
        {labels[priority]}
      </span>
    );
  };

  const getTypeLabel = (type: TaskType) => {
    const labels = {
      FOLLOW_UP: 'Seguimiento',
      MEETING: 'Reunión',
      CALL: 'Llamada',
      EMAIL: 'Email',
      DEMO: 'Demo',
      PROPOSAL: 'Propuesta'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  const toggleRowExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedRows(newExpanded);
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    if (onTaskUpdate) {
      try {
        await onTaskUpdate(taskId, { status: newStatus });
      } catch (error) {
        console.error('Error updating task status:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Cargando tareas...</p>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-8 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron tareas</h3>
          <p className="text-gray-500 text-sm">No hay tareas que coincidan con los filtros aplicados.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            Tareas ({tasks.length})
          </h3>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide w-2/5">
                Tarea
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Estado
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Prioridad
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Asignado
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Vence
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map((task) => (
              <>
                <tr
                  key={task.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onTaskClick?.(task.id)}
                >
                  {/* Tarea */}
                  <td className="px-3 py-3">
                    <div className="flex items-start gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRowExpansion(task.id);
                        }}
                        className="mt-0.5 flex-shrink-0"
                      >
                        <svg
                          className={`w-3 h-3 text-gray-400 transition-transform ${
                            expandedRows.has(task.id) ? 'rotate-90' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate" title={task.title}>
                          {task.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">#{task.id.slice(-6)}</span>
                          {task.company && (
                            <span className="text-xs text-green-600" title={task.company.name}>
                              • {task.company.name.length > 15 ? task.company.name.slice(0, 15) + '...' : task.company.name}
                            </span>
                          )}
                          {task.lead && !task.company && (
                            <span className="text-xs text-blue-600" title={task.lead.companyName}>
                              • {task.lead.companyName.length > 15 ? task.lead.companyName.slice(0, 15) + '...' : task.lead.companyName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Estado */}
                  <td className="px-3 py-3">
                    {getStatusBadge(task.status)}
                  </td>

                  {/* Prioridad */}
                  <td className="px-3 py-3">
                    {getPriorityBadge(task.priority)}
                  </td>

                  {/* Asignado a */}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-blue-700">
                          {(task.assignedTo.name || task.assignedTo.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs text-gray-700 truncate max-w-[80px]" title={task.assignedTo.name || task.assignedTo.email}>
                        {(task.assignedTo.name || task.assignedTo.email).split(' ')[0]}
                      </span>
                    </div>
                  </td>

                  {/* Vencimiento */}
                  <td className="px-3 py-3">
                    <span className={`text-xs ${
                      task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED'
                        ? 'text-red-600 font-medium'
                        : 'text-gray-700'
                    }`}>
                      {formatDate(task.dueDate)}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="px-3 py-3 text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      {/* Toggle Complete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(
                            task.id,
                            task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
                          );
                        }}
                        className={`p-1 rounded text-xs transition-colors ${
                          task.status === 'COMPLETED'
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                        title={task.status === 'COMPLETED' ? 'Marcar como pendiente' : 'Marcar como completada'}
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>

                      {/* Edit */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskEdit?.(task);
                        }}
                        className="p-1 rounded text-gray-400 hover:bg-gray-50 transition-colors"
                        title="Editar tarea"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskDelete?.(task.id);
                        }}
                        className="p-1 rounded text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Eliminar tarea"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Expanded Row */}
                {expandedRows.has(task.id) && (
                  <tr className="bg-gray-50">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Descripción</h4>
                          <p className="text-gray-700">
                            {task.description || 'Sin descripción'}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Detalles</h4>
                          <div className="space-y-1 text-gray-600">
                            <div>Creado por: {task.createdBy?.name || task.createdBy?.email || 'Sistema'}</div>
                            <div>Fecha creación: {formatDate(task.createdAt)}</div>
                            <div>Última actualización: {formatDate(task.updatedAt)}</div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}