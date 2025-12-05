// components/gestio-empreses/tasques/TaskListWrapper.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { TaskList } from './TaskList'
import { TaskModal } from './TaskModal'
import {
  getUserTasks,
  updateTask,
  deleteTask,
  type TaskPriority,
  type TaskStatus
} from '@/lib/gestio-empreses/task-actions'

interface TaskListWrapperProps {
  initialTasks?: any[]
  filters?: {
    status?: TaskStatus
    priority?: TaskPriority
    leadId?: string
    companyId?: string
    assignedToId?: string
  }
  onTasksUpdate?: () => void
  className?: string
  showActions?: boolean
  maxItems?: number
}

export function TaskListWrapper({
  initialTasks = [],
  filters = {},
  onTasksUpdate,
  className,
  showActions = true,
  maxItems
}: TaskListWrapperProps) {
  const { data: session } = useSession()
  const [tasks, setTasks] = useState(initialTasks)
  const [selectedTask, setSelectedTask] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(!initialTasks.length)

  const currentUserId = session?.user?.id || ''

  const loadTasks = async () => {
    if (!currentUserId) return

    setIsLoading(true)
    try {
      const tasksData = await getUserTasks(currentUserId, filters)
      let finalTasks = tasksData

      // Apply maxItems limit if specified
      if (maxItems) {
        finalTasks = tasksData.slice(0, maxItems)
      }

      setTasks(finalTasks)
    } catch (error) {
      console.error('Error carregant tasques:', error)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (currentUserId && !initialTasks.length) {
      loadTasks()
    }
  }, [currentUserId, filters])

  useEffect(() => {
    if (initialTasks.length) {
      let finalTasks = initialTasks
      if (maxItems) {
        finalTasks = initialTasks.slice(0, maxItems)
      }
      setTasks(finalTasks)
    }
  }, [initialTasks, maxItems])

  const handleTaskClick = (task: any) => {
    if (showActions) {
      setSelectedTask(task)
    }
  }

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    if (!showActions) return

    try {
      await updateTask(taskId, { status }, currentUserId)

      // Actualizar la tarea localmente
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status } : task
        )
      )

      onTasksUpdate?.()
    } catch (error) {
      console.error('Error actualitzant estat:', error)
    }
  }

  const handleEdit = (task: any) => {
    if (showActions) {
      setSelectedTask(task)
    }
  }

  const handleDelete = async (taskId: string) => {
    if (!showActions) return

    if (!confirm('Segur que vols eliminar aquesta tasca?')) return

    try {
      await deleteTask(taskId)

      // Remove task locally
      setTasks(prevTasks =>
        prevTasks.filter(task => task.id !== taskId)
      )

      onTasksUpdate?.()
    } catch (error) {
      console.error('Error eliminant tasca:', error)
    }
  }

  const handleSave = () => {
    loadTasks()
    onTasksUpdate?.()
  }

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border border-slate-200 p-8 text-center ${className}`}>
        <div className="inline-flex items-center gap-2 text-slate-500">
          <div className="animate-spin h-4 w-4 border-2 border-slate-300 border-t-slate-600 rounded-full"></div>
          Carregant tasques...
        </div>
      </div>
    )
  }

  return (
    <>
      <TaskList
        tasks={tasks}
        onTaskClick={handleTaskClick}
        onStatusChange={showActions ? handleStatusChange : undefined}
        onEdit={showActions ? handleEdit : undefined}
        onDelete={showActions ? handleDelete : undefined}
        showFilters={false}
      />

      {/* Task modal */}
      {selectedTask && showActions && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSave={handleSave}
        />
      )}
    </>
  )
}