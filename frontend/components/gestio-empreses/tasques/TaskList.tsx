'use client'

// components/gestio-empreses/tasques/TaskList.tsx
import {
  Calendar,
  User,
  Building2,
  Target,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus,
  MoreHorizontal,
  Edit,
  Trash2,
  Play,
  Check,
  X
} from 'lucide-react'
import { format } from 'date-fns'
import { ca } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import type { TaskPriority, TaskStatus } from '@/lib/gestio-empreses/task-actions'

interface Task {
  id: string
  title: string
  description: string | null
  priority: TaskPriority
  status: TaskStatus
  type: string
  category: string
  dueDate: Date | null
  completedAt: Date | null
  createdAt: Date
  lead?: { id: string; companyName: string } | null
  company?: { id: string; name: string } | null
  assignedTo?: { id: string; name: string; email: string } | null
  createdBy?: { id: string; name: string } | null
}

interface TaskListProps {
  tasks: Task[]
  onTaskClick?: (task: Task) => void
  onStatusChange?: (taskId: string, status: TaskStatus) => void
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
  showFilters?: boolean
}

const priorityConfig = {
  URGENT: {
    label: 'Urgent',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: ArrowUp,
    iconColor: 'text-red-600'
  },
  HIGH: {
    label: 'Alta',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: ArrowUp,
    iconColor: 'text-orange-600'
  },
  MEDIUM: {
    label: 'Mitjana',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: Minus,
    iconColor: 'text-yellow-600'
  },
  LOW: {
    label: 'Baixa',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: ArrowDown,
    iconColor: 'text-blue-600'
  }
}

const statusConfig = {
  PENDING: {
    label: 'Pendent',
    color: 'bg-slate-100 text-slate-700',
    icon: Calendar
  },
  IN_PROGRESS: {
    label: 'En progrés',
    color: 'bg-blue-100 text-blue-700',
    icon: Clock
  },
  COMPLETED: {
    label: 'Completada',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle2
  },
  CANCELLED: {
    label: 'Cancel·lada',
    color: 'bg-red-100 text-red-700',
    icon: X
  }
}

export function TaskList({
  tasks,
  onTaskClick,
  onStatusChange,
  onEdit,
  onDelete,
  showFilters = true
}: TaskListProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.status === 'COMPLETED' || task.status === 'CANCELLED') {
      return false
    }
    return new Date(task.dueDate) < new Date()
  }

  const handleMenuClick = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation()
    setOpenMenuId(openMenuId === taskId ? null : taskId)
  }

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    onStatusChange?.(taskId, status)
    setOpenMenuId(null)
  }

  const handleEdit = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation()
    onEdit?.(task)
    setOpenMenuId(null)
  }

  const handleDelete = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation()
    onDelete?.(taskId)
    setOpenMenuId(null)
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
        <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" strokeWidth={1.5} />
        <h3 className="text-lg font-medium text-slate-900 mb-2">Cap tasca trobada</h3>
        <p className="text-slate-500">Crea la teva primera tasca per començar</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="divide-y divide-slate-100">
        {tasks.map((task) => {
          const priority = priorityConfig[task.priority]
          const status = statusConfig[task.status]
          const PriorityIcon = priority.icon
          const StatusIcon = status.icon
          const overdue = isOverdue(task)

          return (
            <div
              key={task.id}
              className={cn(
                'p-4 hover:bg-slate-50 transition-colors cursor-pointer relative',
                overdue && 'bg-red-50 border-l-4 border-l-red-500'
              )}
              onClick={() => onTaskClick?.(task)}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Contingut principal */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Prioritat */}
                      <span className={cn(
                        'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border',
                        priority.color
                      )}>
                        <PriorityIcon className={cn('h-3 w-3', priority.iconColor)} strokeWidth={1.5} />
                        {priority.label}
                      </span>

                      {/* Estat */}
                      <span className={cn(
                        'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded',
                        status.color
                      )}>
                        <StatusIcon className="h-3 w-3" strokeWidth={1.5} />
                        {status.label}
                      </span>

                      {overdue && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-700">
                          <AlertTriangle className="h-3 w-3" strokeWidth={1.5} />
                          Endarrerida
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Títol */}
                  <h3 className="font-medium text-slate-900 mb-1 truncate">{task.title}</h3>

                  {/* Descripció */}
                  {task.description && (
                    <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  {/* Metadades */}
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    {/* Data límit */}
                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" strokeWidth={1.5} />
                        {format(new Date(task.dueDate), "d MMM yyyy", { locale: ca })}
                      </div>
                    )}

                    {/* Assignat a */}
                    {task.assignedTo && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" strokeWidth={1.5} />
                        {task.assignedTo.name}
                      </div>
                    )}

                    {/* Lead o empresa */}
                    {task.lead && (
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" strokeWidth={1.5} />
                        {task.lead.companyName}
                      </div>
                    )}

                    {task.company && !task.lead && (
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" strokeWidth={1.5} />
                        {task.company.name}
                      </div>
                    )}
                  </div>
                </div>

                {/* Menú d'accions */}
                <div className="flex-shrink-0 relative">
                  <button
                    onClick={(e) => handleMenuClick(e, task.id)}
                    className="p-1 rounded-md hover:bg-slate-200 transition-colors"
                  >
                    <MoreHorizontal className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                  </button>

                  {/* Dropdown menu */}
                  {openMenuId === task.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenMenuId(null)}
                      />
                      <div className="absolute right-0 top-8 z-20 w-48 bg-white rounded-md shadow-lg border border-slate-200 py-1">
                        {/* Canvis d'estat */}
                        {task.status === 'PENDING' && (
                          <button
                            onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Play className="h-4 w-4" strokeWidth={1.5} />
                            Iniciar
                          </button>
                        )}

                        {(task.status === 'PENDING' || task.status === 'IN_PROGRESS') && (
                          <button
                            onClick={() => handleStatusChange(task.id, 'COMPLETED')}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Check className="h-4 w-4" strokeWidth={1.5} />
                            Completar
                          </button>
                        )}

                        <div className="border-t border-slate-100 my-1" />

                        {/* Editar */}
                        <button
                          onClick={(e) => handleEdit(e, task)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Edit className="h-4 w-4" strokeWidth={1.5} />
                          Editar
                        </button>

                        {/* Eliminar */}
                        <button
                          onClick={(e) => handleDelete(e, task.id)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                          Eliminar
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}