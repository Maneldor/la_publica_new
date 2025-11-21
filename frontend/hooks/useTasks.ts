import useSWR from 'swr';
import { Task, TaskStatus, TaskPriority, TaskType, TaskCategory } from '@prisma/client';

interface TaskFilters {
  status?: TaskStatus | 'all';
  priority?: TaskPriority | 'all';
  type?: TaskType | 'all';
  category?: TaskCategory | 'all';
  assignedToId?: string;
  leadId?: string;
  companyId?: string;
  search?: string;
  overdue?: boolean;
  hasSubtasks?: boolean;
  isRecurring?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface TaskWithRelations extends Task {
  assignedTo: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  createdBy: {
    id: string;
    name: string | null;
    email: string;
  };
  lead?: {
    id: string;
    companyName: string;
    status: string;
  } | null;
  company?: {
    id: string;
    name: string;
  } | null;
  subtasks?: Array<{
    id: string;
    status: TaskStatus;
  }>;
  _count?: {
    comments: number;
    attachments: number;
    subtasks: number;
  };
}

interface TasksResponse {
  tasks: TaskWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  completionRate: number;
  avgCompletionTime: number;
  dueToday: number;
}

const fetcher = (url: string) => fetch(url).then((r) => {
  if (!r.ok) throw new Error('Error al cargar datos');
  return r.json();
});

export function useTasks(filters?: TaskFilters) {
  // Construir query params
  const params = new URLSearchParams();

  if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters?.priority && filters.priority !== 'all') params.append('priority', filters.priority);
  if (filters?.type && filters.type !== 'all') params.append('type', filters.type);
  if (filters?.category && filters.category !== 'all') params.append('category', filters.category);
  if (filters?.assignedToId) params.append('assignedToId', filters.assignedToId);
  if (filters?.leadId) params.append('leadId', filters.leadId);
  if (filters?.companyId) params.append('companyId', filters.companyId);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.overdue) params.append('overdue', 'true');
  if (filters?.hasSubtasks) params.append('hasSubtasks', 'true');
  if (filters?.isRecurring) params.append('isRecurring', 'true');
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const url = `/api/admin/tasks${params.toString() ? `?${params.toString()}` : ''}`;

  const { data, error, mutate, isLoading } = useSWR<TasksResponse>(url, fetcher, {
    refreshInterval: 30000, // Refrescar cada 30 segundos
    revalidateOnFocus: true,
  });

  // Calcular estadísticas
  const stats: TaskStats = {
    total: data?.pagination.total || 0,
    pending: data?.tasks.filter(t => t.status === 'PENDING').length || 0,
    inProgress: data?.tasks.filter(t => t.status === 'IN_PROGRESS').length || 0,
    completed: data?.tasks.filter(t => t.status === 'COMPLETED').length || 0,
    overdue: data?.tasks.filter(t => {
      if (t.status === 'COMPLETED' || !t.dueDate) return false;
      return new Date(t.dueDate) < new Date();
    }).length || 0,
    completionRate: data?.tasks.length
      ? Math.round((data.tasks.filter(t => t.status === 'COMPLETED').length / data.tasks.length) * 100)
      : 0,
    avgCompletionTime: data?.tasks
      .filter(t => t.completedAt && t.createdAt)
      .reduce((acc, t) => {
        const diff = new Date(t.completedAt!).getTime() - new Date(t.createdAt).getTime();
        return acc + (diff / (1000 * 60 * 60)); // horas
      }, 0) / (data?.tasks.filter(t => t.completedAt).length || 1) || 0,
    dueToday: data?.tasks.filter(t => {
      if (!t.dueDate || t.status === 'COMPLETED') return false;
      const today = new Date();
      const due = new Date(t.dueDate);
      return due.toDateString() === today.toDateString();
    }).length || 0,
  };

  // Funciones de mutación
  const createTask = async (taskData: any) => {
    const response = await fetch('/api/admin/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear tarea');
    }

    const newTask = await response.json();
    mutate(); // Refrescar lista
    return newTask;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const response = await fetch(`/api/admin/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al actualizar tarea');
    }

    const updatedTask = await response.json();
    mutate(); // Refrescar lista
    return updatedTask;
  };

  const deleteTask = async (id: string) => {
    const response = await fetch(`/api/admin/tasks/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al eliminar tarea');
    }

    mutate(); // Refrescar lista
  };

  const toggleComplete = async (id: string) => {
    const task = data?.tasks.find(t => t.id === id);
    if (!task) throw new Error('Tarea no encontrada');

    const newStatus: TaskStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    return updateTask(id, { status: newStatus });
  };

  return {
    tasks: data?.tasks || [],
    pagination: data?.pagination,
    stats,
    loading: isLoading,
    error: error?.message,
    mutate,
    createTask,
    updateTask,
    deleteTask,
    toggleComplete,
  };
}

// Hook para obtener una tarea individual
export function useTask(id: string | null) {
  const url = id ? `/api/admin/tasks/${id}` : null;

  const { data, error, mutate, isLoading } = useSWR(url, fetcher);

  return {
    task: data as TaskWithRelations | undefined,
    loading: isLoading,
    error: error?.message,
    mutate,
  };
}