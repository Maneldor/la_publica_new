import { useState, useEffect, useCallback } from 'react';

export interface Task {
  id: string;
  leadId: string | null;
  userId: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lead?: {
    id: string;
    companyName: string;
    status: string;
    priority: string;
  } | null;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface TasksData {
  all: Task[];
  urgent: Task[];
  today: Task[];
  upcoming: Task[];
  completed: Task[];
  stats: {
    total: number;
    pending: number;
    overdue: number;
    today: number;
    completedThisWeek: number;
  };
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  leadId?: string;
}

export function useTasks() {
  const [tasks, setTasks] = useState<TasksData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tareas
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/crm/tasks', {
        credentials: 'include',
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error carregant tasques');
      }

      setTasks(data.data);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError(err.message || 'Error de connexió');
    } finally {
      setLoading(false);
    }
  }, []);

  // Marcar tarea como completada (toggle)
  const toggleComplete = useCallback(async (taskId: string) => {
    try {
      const response = await fetch(`/api/crm/tasks/${taskId}/complete`, {
        method: 'PATCH',
        credentials: 'include',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error actualitzant tasca');
      }

      // Refrescar lista
      await fetchTasks();

      return data.data;
    } catch (err: any) {
      console.error('Error toggling task:', err);
      throw err;
    }
  }, [fetchTasks]);

  // Crear tarea
  const createTask = useCallback(async (input: CreateTaskInput) => {
    try {
      const response = await fetch('/api/crm/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error creant tasca');
      }

      // Refrescar lista
      await fetchTasks();

      return data.data;
    } catch (err: any) {
      console.error('Error creating task:', err);
      throw err;
    }
  }, [fetchTasks]);

  // Eliminar tarea
  const deleteTask = useCallback(async (taskId: string) => {
    if (!confirm('Segur que vols eliminar aquesta tasca?')) {
      return;
    }

    try {
      const response = await fetch(`/api/crm/tasks/${taskId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error eliminant tasca');
      }

      // Refrescar lista
      await fetchTasks();
    } catch (err: any) {
      console.error('Error deleting task:', err);
      throw err;
    }
  }, [fetchTasks]);

  // Cargar tareas al montar
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    toggleComplete,
    createTask,
    deleteTask,
  };
}