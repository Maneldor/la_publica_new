// app/gestio/tasques/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { TaskHeader } from '@/components/gestio-empreses/tasques/TaskHeader'
import { TaskViewTabs } from '@/components/gestio-empreses/tasques/TaskViewTabs'
import { TaskStatsAdvanced } from '@/components/gestio-empreses/tasques/TaskStatsAdvanced'
import { ProgressBar } from '@/components/gestio-empreses/tasques/ProgressBar'
import { TaskFiltersAdvanced } from '@/components/gestio-empreses/tasques/TaskFiltersAdvanced'
import { TaskList } from '@/components/gestio-empreses/tasques/TaskList'
import { TaskKanban } from '@/components/gestio-empreses/tasques/TaskKanban'
import { TaskCalendar } from '@/components/gestio-empreses/tasques/TaskCalendar'
import { TaskTimeline } from '@/components/gestio-empreses/tasques/TaskTimeline'
import { TaskModal } from '@/components/gestio-empreses/tasques/TaskModal'
import {
  getUserTasks,
  getAdvancedTaskStats,
  getTasksByStatus,
  updateTask,
  deleteTask,
  type TaskStatus
} from '@/lib/gestio-empreses/task-actions'

type ViewType = 'list' | 'kanban' | 'calendar' | 'timeline'

export default function TasquesPage() {
  const { data: session } = useSession()
  const [activeView, setActiveView] = useState<ViewType>('list')
  const [tasks, setTasks] = useState<any[]>([])
  const [tasksByStatus, setTasksByStatus] = useState<any>({})
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editingTask, setEditingTask] = useState<any>(null)

  const currentUserId = session?.user?.id || ''

  const loadData = async () => {
    if (!currentUserId) return

    setIsLoading(true)
    try {
      const [tasksData, statsData, byStatusData] = await Promise.all([
        getUserTasks(currentUserId),
        getAdvancedTaskStats(currentUserId),
        getTasksByStatus(currentUserId),
      ])
      setTasks(tasksData)
      setStats(statsData)
      setTasksByStatus(byStatusData)
    } catch (error) {
      console.error('Error carregant dades:', error)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (currentUserId) {
      loadData()
    }
  }, [currentUserId])

  const handleRefresh = () => {
    loadData()
  }

  const handleEdit = (task: any) => {
    setEditingTask(task)
  }

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      await updateTask(taskId, { status }, currentUserId)
      loadData()
    } catch (error) {
      console.error('Error actualitzant estat:', error)
    }
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm('Segur que vols eliminar aquesta tasca?')) return

    try {
      await deleteTask(taskId)
      loadData()
    } catch (error) {
      console.error('Error eliminant tasca:', error)
    }
  }

  const handleTaskClick = (task: any) => {
    setEditingTask(task)
  }

  if (!session) {
    return <div>Carregant...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header amb botons */}
      <TaskHeader tasks={tasks} onRefresh={handleRefresh} />

      {/* Tabs de vista */}
      <div className="bg-white rounded-lg border border-slate-200">
        <TaskViewTabs activeView={activeView} onViewChange={setActiveView} />
      </div>

      {/* Estadístiques */}
      {stats && <TaskStatsAdvanced stats={stats} />}

      {/* Barra de progrés i rendiment */}
      {stats && (
        <ProgressBar
          completed={stats.completed}
          total={stats.total}
          avgHours={stats.avgCompletionHours}
          dueToday={stats.dueToday}
          completionRate={stats.completionRate}
        />
      )}

      {/* Filtres */}
      <TaskFiltersAdvanced />

      {/* Contingut segons vista */}
      {isLoading ? (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
          <div className="inline-flex items-center gap-2 text-slate-500">
            <div className="animate-spin h-4 w-4 border-2 border-slate-300 border-t-slate-600 rounded-full"></div>
            Carregant tasques...
          </div>
        </div>
      ) : (
        <>
          {activeView === 'list' && (
            <TaskList
              tasks={tasks}
              onEdit={handleEdit}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          )}

          {activeView === 'kanban' && (
            <TaskKanban
              tasksByStatus={tasksByStatus}
              onRefresh={handleRefresh}
            />
          )}

          {activeView === 'calendar' && (
            <TaskCalendar
              tasks={tasks}
              onTaskClick={handleTaskClick}
            />
          )}

          {activeView === 'timeline' && (
            <TaskTimeline
              tasks={tasks}
              onTaskClick={handleTaskClick}
            />
          )}
        </>
      )}

      {/* Modal d'edició */}
      {editingTask && (
        <TaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={() => {
            setEditingTask(null)
            handleRefresh()
          }}
        />
      )}
    </div>
  )
}