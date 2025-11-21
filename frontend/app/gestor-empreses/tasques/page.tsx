'use client';

import { useState } from 'react';
import { PageTemplate } from '@/components/ui/PageTemplate';
import { useTasks } from '@/hooks/useTasks';
import { TaskStatus, TaskPriority, TaskType } from '@prisma/client';
import TaskStats from './components/TaskStats';
import TaskFilters from './components/TaskFilters';
import TaskListView from './components/TaskListView';
import TaskKanbanView from './components/TaskKanbanView';
import TaskCreateModal from './components/TaskCreateModal';
import TaskDetailPanel from './components/TaskDetailPanel';

type ViewMode = 'list' | 'kanban' | 'calendar' | 'timeline';

// Mock data para desarrollo - después conectaremos con APIs reales
const mockTasks = [
  {
    id: '1',
    title: 'Llamada de seguimiento - Ayuntamiento Barcelona',
    description: 'Contactar para confirmar interés en el plan Strategic',
    status: 'PENDING' as const,
    priority: 'HIGH' as const,
    type: 'CALL',
    category: 'SALES',
    assignedTo: {
      id: '1',
      name: 'Maria García',
      avatar: null
    },
    dueDate: '2024-11-22',
    createdAt: '2024-11-20',
    updatedAt: '2024-11-20',
    tags: ['seguimiento', 'ayuntamiento'],
    urgencyScore: 85,
    impactScore: 90,
    effortScore: 30,
    autoScore: 88,
    isOverdue: false,
    lead: {
      id: 'lead1',
      companyName: 'Ayuntamiento de Barcelona'
    }
  },
  {
    id: '2',
    title: 'Demo producto - Empresa Tech Solutions',
    description: 'Presentación del dashboard y funcionalidades principales',
    status: 'IN_PROGRESS' as const,
    priority: 'HIGH' as const,
    type: 'DEMO',
    category: 'SALES',
    assignedTo: {
      id: '2',
      name: 'Juan López',
      avatar: null
    },
    dueDate: '2024-11-21',
    createdAt: '2024-11-18',
    updatedAt: '2024-11-20',
    tags: ['demo', 'tech'],
    urgencyScore: 75,
    impactScore: 85,
    effortScore: 60,
    autoScore: 75,
    isOverdue: false,
    company: {
      id: 'company1',
      name: 'Tech Solutions SL'
    }
  },
  {
    id: '3',
    title: 'Preparar propuesta comercial',
    description: 'Crear propuesta personalizada basada en los requisitos discutidos',
    status: 'PENDING' as const,
    priority: 'MEDIUM' as const,
    type: 'PROPOSAL',
    category: 'SALES',
    assignedTo: {
      id: '1',
      name: 'Maria García',
      avatar: null
    },
    dueDate: '2024-11-25',
    createdAt: '2024-11-19',
    updatedAt: '2024-11-19',
    tags: ['propuesta', 'comercial'],
    urgencyScore: 60,
    impactScore: 80,
    effortScore: 70,
    autoScore: 70,
    isOverdue: false,
    lead: {
      id: 'lead2',
      companyName: 'Diputación de Valencia'
    }
  },
  {
    id: '4',
    title: 'Enviar documentación legal',
    description: 'Enviar contratos y documentación necesaria para formalizar',
    status: 'COMPLETED' as const,
    priority: 'HIGH' as const,
    type: 'CONTRACT',
    category: 'OPERATIONS',
    assignedTo: {
      id: '3',
      name: 'Ana Martín',
      avatar: null
    },
    dueDate: '2024-11-19',
    createdAt: '2024-11-15',
    updatedAt: '2024-11-19',
    tags: ['contrato', 'legal'],
    urgencyScore: 40,
    impactScore: 95,
    effortScore: 40,
    autoScore: 85,
    isOverdue: false,
    company: {
      id: 'company2',
      name: 'Ayuntamiento de Madrid'
    }
  },
  {
    id: '5',
    title: 'Seguimiento post-venta',
    description: 'Verificar satisfacción del cliente y identificar oportunidades de upselling',
    status: 'PENDING' as const,
    priority: 'LOW' as const,
    type: 'FOLLOW_UP',
    category: 'SUPPORT',
    assignedTo: {
      id: '2',
      name: 'Juan López',
      avatar: null
    },
    dueDate: '2024-11-28',
    createdAt: '2024-11-20',
    updatedAt: '2024-11-20',
    tags: ['post-venta', 'satisfacción'],
    urgencyScore: 30,
    impactScore: 60,
    effortScore: 40,
    autoScore: 45,
    isOverdue: false,
    company: {
      id: 'company3',
      name: 'Generalitat de Catalunya'
    }
  },
  {
    id: '6',
    title: 'Reunión estratégica - Q1 2025',
    description: 'Planificar objetivos y presupuesto para el primer trimestre',
    status: 'IN_PROGRESS' as const,
    priority: 'URGENT' as const,
    type: 'MEETING',
    category: 'SALES',
    assignedTo: {
      id: '4',
      name: 'Carlos Ruiz',
      avatar: null
    },
    dueDate: '2024-11-23',
    createdAt: '2024-11-21',
    updatedAt: '2024-11-21',
    tags: ['estrategia', 'planificación'],
    urgencyScore: 95,
    impactScore: 88,
    effortScore: 45,
    autoScore: 92,
    isOverdue: false,
    company: {
      id: 'company4',
      name: 'Diputación de Girona'
    }
  },
  {
    id: '7',
    title: 'Envío de newsletter mensual',
    description: 'Preparar y enviar newsletter con novedades del producto',
    status: 'CANCELLED' as const,
    priority: 'LOW' as const,
    type: 'EMAIL',
    category: 'MARKETING',
    assignedTo: {
      id: '5',
      name: 'Laura Fernández',
      avatar: null
    },
    dueDate: '2024-11-20',
    createdAt: '2024-11-18',
    updatedAt: '2024-11-21',
    tags: ['newsletter', 'marketing'],
    urgencyScore: 20,
    impactScore: 40,
    effortScore: 30,
    autoScore: 25,
    isOverdue: false,
    lead: {
      id: 'lead3',
      companyName: 'Consorcio Municipal'
    }
  },
  {
    id: '8',
    title: 'Revisión técnica del sistema',
    description: 'Auditoría completa de seguridad y rendimiento',
    status: 'COMPLETED' as const,
    priority: 'MEDIUM' as const,
    type: 'FOLLOW_UP',
    category: 'OPERATIONS',
    assignedTo: {
      id: '6',
      name: 'Pedro González',
      avatar: null
    },
    dueDate: '2024-11-18',
    createdAt: '2024-11-15',
    updatedAt: '2024-11-18',
    tags: ['técnico', 'seguridad'],
    urgencyScore: 65,
    impactScore: 85,
    effortScore: 75,
    autoScore: 72,
    isOverdue: false,
    company: {
      id: 'company5',
      name: 'Ayuntamiento de Sevilla'
    }
  }
];

const mockStats = {
  total: mockTasks.length,
  pending: mockTasks.filter(t => t.status === 'PENDING').length,
  inProgress: mockTasks.filter(t => t.status === 'IN_PROGRESS').length,
  completed: mockTasks.filter(t => t.status === 'COMPLETED').length,
  overdue: mockTasks.filter(t => t.isOverdue).length,
  dueToday: mockTasks.filter(t => {
    const today = new Date().toISOString().split('T')[0];
    return t.dueDate === today && t.status !== 'COMPLETED';
  }).length,
  thisWeek: mockTasks.filter(t => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(t.createdAt) >= weekAgo;
  }).length,
  avgCompletionTime: 24,
  completionRate: 80
};

export default function TasquesEnterprisePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  // Estado para filtros
  const [filters, setFilters] = useState({
    status: 'all' as TaskStatus | 'all',
    priority: 'all' as TaskPriority | 'all',
    type: 'all' as TaskType | 'all',
    search: '',
    sortBy: 'autoScore',
    sortOrder: 'desc' as 'asc' | 'desc',
  });

  // Hook para datos reales
  const { tasks: realTasks, loading, error, stats: realStats, createTask, updateTask, deleteTask, toggleComplete } = useTasks(filters);

  // Usar datos mock temporalmente para demostración
  const tasks = realTasks.length > 0 ? realTasks : mockTasks;
  const stats = realTasks.length > 0 ? realStats : mockStats;

  const handleFiltersChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleLegacyFiltersChange = (filters: any) => {
    // Mantener compatibilidad con el antiguo sistema por ahora
    let filtered = tasks;

    // Filtro por búsqueda
    if (filters.search) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    // Filtro por status
    if (filters.status.length > 0) {
      filtered = filtered.filter(task => filters.status.includes(task.status));
    }

    // Filtro por priority
    if (filters.priority.length > 0) {
      filtered = filtered.filter(task => filters.priority.includes(task.priority));
    }

    // Filtro por type
    if (filters.type.length > 0) {
      filtered = filtered.filter(task => filters.type.includes(task.type));
    }

    // Filtro por category
    if (filters.category.length > 0) {
      filtered = filtered.filter(task => task.category && filters.category.includes(task.category));
    }

    // Filtro por assigned to
    if (filters.assignedTo.length > 0) {
      filtered = filtered.filter(task => filters.assignedTo.includes(task.assignedTo.id));
    }

    // Filtro por fecha
    if (filters.dueDate.from || filters.dueDate.to) {
      filtered = filtered.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        const fromDate = filters.dueDate.from ? new Date(filters.dueDate.from) : null;
        const toDate = filters.dueDate.to ? new Date(filters.dueDate.to) : null;

        if (fromDate && taskDate < fromDate) return false;
        if (toDate && taskDate > toDate) return false;
        return true;
      });
    }

    // Filtro por overdue
    if (filters.isOverdue) {
      filtered = filtered.filter(task => task.isOverdue);
    }

    // Filtro por urgency score
    filtered = filtered.filter(task =>
      task.urgencyScore >= filters.urgencyScore.min &&
      task.urgencyScore <= filters.urgencyScore.max
    );

    setFilteredTasks(filtered);
  };

  const userOptions = [
    { id: '1', name: 'Maria García' },
    { id: '2', name: 'Juan López' },
    { id: '3', name: 'Ana Martín' }
  ];

  return (
    <PageTemplate>
      {/* HEADER ENTERPRISE */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Task Management Enterprise</h1>
            <p className="text-sm text-gray-600 mt-1">
              Sistema de gestió empresarial completa de tasques, workflows i automatitzacions
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Botones de acción rápida */}
            <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Plantilla
              </span>
            </button>

            <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Exportar
              </span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nova Tasca
              </span>
            </button>
          </div>
        </div>

        {/* TABS DE VISTAS */}
        <div className="flex items-center gap-2 border-b border-gray-200">
          {[
            { id: 'list', label: 'Llista', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
            { id: 'kanban', label: 'Kanban', icon: 'M9 3h6M9 21h6M4 9h16M4 15h16' },
            { id: 'calendar', label: 'Calendari', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
            { id: 'timeline', label: 'Timeline', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' }
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => setViewMode(view.id as ViewMode)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                viewMode === view.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={view.icon} />
              </svg>
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {/* DASHBOARD DE MÉTRICAS */}
      <TaskStats stats={stats} />

      {/* FILTROS AVANZADOS */}
      <TaskFilters
        filters={filters}
        onFilterChange={handleFiltersChange}
      />

      {/* ACCIONES MASIVAS (si hay tareas seleccionadas) */}
      {selectedTasks.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-blue-800">
                {selectedTasks.length} tareas seleccionadas
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm bg-white border border-blue-300 text-blue-700 rounded hover:bg-blue-50">
                Asignar
              </button>
              <button className="px-3 py-1 text-sm bg-white border border-blue-300 text-blue-700 rounded hover:bg-blue-50">
                Cambiar Estado
              </button>
              <button className="px-3 py-1 text-sm bg-white border border-blue-300 text-blue-700 rounded hover:bg-blue-50">
                Eliminar
              </button>
              <button
                onClick={() => setSelectedTasks([])}
                className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VISTAS CONDICIONALES */}
      <div className="mt-6">
        {viewMode === 'list' && (
          <TaskListView
            tasks={tasks}
            loading={loading}
            onTaskEdit={(task) => setSelectedTaskId(task.id)}
            onTaskUpdate={updateTask}
            onTaskDelete={deleteTask}
          />
        )}

        {viewMode === 'kanban' && (
          <TaskKanbanView
            tasks={tasks}
            onOpenDetail={(id) => setSelectedTaskId(id)}
            onUpdateTask={async (id, updates) => {
              try {
                await updateTask(id, updates);
              } catch (error) {
                console.error('Error al actualizar tarea:', error);
              }
            }}
          />
        )}

        {viewMode === 'calendar' && (
          <div className="bg-gray-100 p-8 rounded-lg text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Vista Calendario</h3>
            <p className="text-gray-600">Próximamente disponible</p>
          </div>
        )}

        {viewMode === 'timeline' && (
          <div className="bg-gray-100 p-8 rounded-lg text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Vista Timeline</h3>
            <p className="text-gray-600">Próximamente disponible</p>
          </div>
        )}
      </div>

      {/* PANEL LATERAL DE DETALLES */}
      <TaskDetailPanel
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onUpdate={() => {
          // Refrescar datos si se está usando hook real
          if (realTasks.length > 0) {
            // El hook useTasks manejará la refrescada automáticamente
          }
        }}
      />

      {/* MODAL CREAR/EDITAR */}
      <TaskCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={async (taskData) => {
          try {
            await createTask(taskData);
          } catch (err) {
            console.error('Error creating task:', err);
          }
        }}
      />
    </PageTemplate>
  );
}