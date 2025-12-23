// app/gestio/tasques/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
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
import { LeadFilterBanner } from '@/components/gestio-empreses/tasques/LeadFilterBanner'
import {
  getUserTasks,
  getAdvancedTaskStats,
  getTasksByStatus,
  updateTask,
  deleteTask,
  getLeadBasicInfo,
  type TaskStatus
} from '@/lib/gestio-empreses/task-actions'

type ViewType = 'list' | 'kanban' | 'calendar' | 'timeline'

export default function TasquesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const leadIdFilter = searchParams.get('leadId')

  const [activeView, setActiveView] = useState<ViewType>('list')
  const [tasks, setTasks] = useState<any[]>([])
  const [tasksByStatus, setTasksByStatus] = useState<any>({})
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editingTask, setEditingTask] = useState<any>(null)
  const [leadInfo, setLeadInfo] = useState<{ id: string; companyName: string } | null>(null)

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const LIMIT = 50

  const currentUserId = session?.user?.id || ''

  // Cargar datos
  const loadData = async (targetPage = 1) => {
    if (!currentUserId) return

    setIsLoading(true)
    try {
      // Construir filtres
      const filters: any = {}
      if (leadIdFilter) {
        filters.leadId = leadIdFilter
      }

      // 1. Cargar datos básicos de lista y stats (siempre necesarios al inicio o refresh)
      // Kanban se carga bajo demanda o en background si estamos en esa vista
      const [tasksResult, statsData] = await Promise.all([
        // @ts-expect-error - Types mismatch with legacy API
        getUserTasks(currentUserId, filters, targetPage, LIMIT),
        getAdvancedTaskStats(currentUserId)
      ])

      // @ts-expect-error - Types mismatch with legacy API
      setTasks(tasksResult.tasks || [])
      // @ts-expect-error - Types mismatch with legacy API
      if (tasksResult.metadata) {
        // @ts-expect-error - Types mismatch with legacy API
        setTotalPages(tasksResult.metadata.totalPages)
        // @ts-expect-error - Types mismatch with legacy API
        setPage(tasksResult.metadata.page)
      }

      setStats(statsData)

      // 2. Si la vista activa es kanban, cargar kanban. Si no, podemos cargarlo lazy después
      if (activeView === 'kanban') {
        loadKanbanData()
      }

    } catch (error) {
      console.error('Error carregant dades:', error)
    }
    setIsLoading(false)
  }

  const loadKanbanData = async () => {
    try {
      const byStatusData = await getTasksByStatus(currentUserId)
      setTasksByStatus(byStatusData)
    } catch (error) {
      console.error("Error loading kanban", error)
    }
  }

  // Carregar info del lead si hi ha filtre
  const loadLeadInfo = async () => {
    if (leadIdFilter) {
      try {
        const info = await getLeadBasicInfo(leadIdFilter)
        if (info) {
          setLeadInfo(info)
        }
      } catch (error) {
        console.error('Error carregant info del lead:', error)
      }
    } else {
      setLeadInfo(null)
    }
  }

  useEffect(() => {
    if (activeView === 'kanban' && (!tasksByStatus || Object.keys(tasksByStatus).length === 0)) {
      loadKanbanData()
    }
  }, [activeView])

  useEffect(() => {
    if (currentUserId) {
      // Reset page to 1 on clean load
      loadData(1)
    }
  }, [currentUserId, leadIdFilter])

  useEffect(() => {
    loadLeadInfo()
  }, [leadIdFilter])

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

  const handleClearLeadFilter = () => {
    router.push('/gestio/tasques')
  }

  if (!session) {
    return <div>Carregant...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header amb botons */}
      <TaskHeader tasks={tasks} onRefresh={handleRefresh} />

      {/* Banner de filtres per lead */}
      {leadInfo && (
        <LeadFilterBanner
          leadInfo={leadInfo}
          onClear={handleClearLeadFilter}
        />
      )}

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
            <>
              <TaskList
                tasks={tasks}
                onEdit={handleEdit}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-200 pt-4 mt-4 bg-white p-4 rounded-b-lg">
                  <button
                    onClick={() => loadData(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-slate-600">
                    Pàgina {page} de {totalPages}
                  </span>
                  <button
                    onClick={() => loadData(page + 1)}
                    disabled={page === totalPages}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                  >
                    Següent
                  </button>
                </div>
              )}
            </>
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