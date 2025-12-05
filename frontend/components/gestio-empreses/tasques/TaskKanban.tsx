// components/gestio-empreses/tasques/TaskKanban.tsx
'use client'

import { useState, useTransition } from 'react'
import {
  Clock,
  PlayCircle,
  CheckCircle,
  XCircle,
  GripVertical,
  Target,
  Building2
} from 'lucide-react'
import { format, isPast } from 'date-fns'
import { ca } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { moveTaskToStatus } from '@/lib/gestio-empreses/task-actions'

interface Task {
  id: string
  title: string
  description: string | null
  priority: string
  status: string
  dueDate: Date | null
  lead?: { id: string; companyName: string } | null
  company?: { id: string; name: string } | null
}

interface TasksByStatus {
  PENDING: Task[]
  IN_PROGRESS: Task[]
  COMPLETED: Task[]
  CANCELLED: Task[]
}

const columns = [
  { id: 'PENDING', label: 'Pendents', icon: Clock, color: 'border-t-amber-500' },
  { id: 'IN_PROGRESS', label: 'En progrés', icon: PlayCircle, color: 'border-t-blue-500' },
  { id: 'COMPLETED', label: 'Completades', icon: CheckCircle, color: 'border-t-green-500' },
  { id: 'CANCELLED', label: 'Cancel·lades', icon: XCircle, color: 'border-t-slate-500' },
]

const priorityColors: Record<string, string> = {
  URGENT: 'bg-red-100 text-red-700',
  HIGH: 'bg-amber-100 text-amber-700',
  MEDIUM: 'bg-blue-100 text-blue-700',
  LOW: 'bg-slate-100 text-slate-700',
}

export function TaskKanban({
  tasksByStatus,
  onRefresh
}: {
  tasksByStatus: TasksByStatus
  onRefresh: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [draggedTask, setDraggedTask] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId)
  }

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    setDragOverColumn(columnId)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    if (!draggedTask) return

    startTransition(async () => {
      try {
        await moveTaskToStatus(draggedTask, newStatus, 'current-user-id')
        onRefresh()
      } catch (error) {
        console.error('Error movent tasca:', error)
      }
    })

    setDraggedTask(null)
    setDragOverColumn(null)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((column) => {
        const tasks = tasksByStatus[column.id as keyof TasksByStatus] || []
        const Icon = column.icon

        return (
          <div
            key={column.id}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
            className={cn(
              'bg-slate-50 rounded-lg border-t-4 min-h-[400px]',
              column.color,
              dragOverColumn === column.id && 'ring-2 ring-blue-500 ring-inset'
            )}
          >
            {/* Column header */}
            <div className="p-3 border-b border-slate-200 bg-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
                  <span className="font-medium text-slate-900">{column.label}</span>
                </div>
                <span className="text-sm text-slate-500">{tasks.length}</span>
              </div>
            </div>

            {/* Tasks */}
            <div className="p-2 space-y-2">
              {tasks.map((task) => {
                const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'COMPLETED'

                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    className={cn(
                      'bg-white rounded-lg border border-slate-200 p-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow',
                      draggedTask === task.id && 'opacity-50'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="h-4 w-4 text-slate-300 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 text-sm truncate">
                          {task.title}
                        </p>

                        {/* Priority badge */}
                        <span className={cn(
                          'inline-block px-1.5 py-0.5 text-xs font-medium rounded mt-1',
                          priorityColors[task.priority]
                        )}>
                          {task.priority}
                        </span>

                        {/* Due date */}
                        {task.dueDate && (
                          <p className={cn(
                            'text-xs mt-2',
                            isOverdue ? 'text-red-600 font-medium' : 'text-slate-500'
                          )}>
                            {format(new Date(task.dueDate), 'd MMM', { locale: ca })}
                          </p>
                        )}

                        {/* Related entity */}
                        {(task.lead || task.company) && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                            {task.lead ? (
                              <>
                                <Target className="h-3 w-3" strokeWidth={1.5} />
                                <span className="truncate">{task.lead.companyName}</span>
                              </>
                            ) : (
                              <>
                                <Building2 className="h-3 w-3" strokeWidth={1.5} />
                                <span className="truncate">{task.company?.name}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

              {tasks.length === 0 && (
                <div className="p-4 text-center text-sm text-slate-400">
                  Cap tasca
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}