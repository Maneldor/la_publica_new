// components/gestio-empreses/tasques/TaskTimeline.tsx
'use client'

import { useMemo, useState } from 'react'
import {
  Clock,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Target,
  Building2,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Minus,
  Calendar,
  PlayCircle,
  XCircle
} from 'lucide-react'
import {
  format,
  isToday,
  isTomorrow,
  isPast,
  isFuture,
  startOfDay,
  differenceInDays,
  addDays
} from 'date-fns'
import { ca } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Task {
  id: string
  title: string
  description: string | null
  priority: string
  status: string
  dueDate: Date | null
  completedAt: Date | null
  createdAt: Date
  lead?: { id: string; companyName: string } | null
  company?: { id: string; name: string } | null
}

interface TaskTimelineProps {
  tasks: Task[]
  onTaskClick?: (task: Task) => void
}

const priorityConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  URGENT: { label: 'Urgent', color: 'text-red-700', bgColor: 'bg-red-100 border-red-200', icon: ArrowUp },
  HIGH: { label: 'Alta', color: 'text-orange-700', bgColor: 'bg-orange-100 border-orange-200', icon: ArrowUp },
  MEDIUM: { label: 'Mitjana', color: 'text-yellow-700', bgColor: 'bg-yellow-100 border-yellow-200', icon: Minus },
  LOW: { label: 'Baixa', color: 'text-blue-700', bgColor: 'bg-blue-100 border-blue-200', icon: ArrowDown },
}

const statusConfig: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
  PENDING: { label: 'Pendent', icon: Circle, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  IN_PROGRESS: { label: 'En progrés', icon: PlayCircle, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  COMPLETED: { label: 'Completada', icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-100' },
  CANCELLED: { label: 'Cancel·lada', icon: XCircle, color: 'text-slate-500', bgColor: 'bg-slate-100' },
}

interface TimelineGroup {
  label: string
  date: Date | null
  tasks: Task[]
  type: 'overdue' | 'today' | 'tomorrow' | 'upcoming' | 'nodate' | 'completed'
}

export function TaskTimeline({ tasks, onTaskClick }: TaskTimelineProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    overdue: true,
    today: true,
    tomorrow: true,
    upcoming: true,
    nodate: false,
    completed: false,
  })

  const timelineGroups = useMemo(() => {
    const groups: TimelineGroup[] = []
    const today = startOfDay(new Date())

    const overdue: Task[] = []
    const todayTasks: Task[] = []
    const tomorrowTasks: Task[] = []
    const upcomingByDate: Record<string, Task[]> = {}
    const noDateTasks: Task[] = []
    const completedTasks: Task[] = []

    tasks.forEach((task) => {
      if (task.status === 'COMPLETED') {
        completedTasks.push(task)
        return
      }

      if (task.status === 'CANCELLED') {
        return
      }

      if (!task.dueDate) {
        noDateTasks.push(task)
        return
      }

      const dueDate = startOfDay(new Date(task.dueDate))

      if (isPast(dueDate) && !isToday(dueDate)) {
        overdue.push(task)
      } else if (isToday(dueDate)) {
        todayTasks.push(task)
      } else if (isTomorrow(dueDate)) {
        tomorrowTasks.push(task)
      } else if (isFuture(dueDate)) {
        const dateKey = format(dueDate, 'yyyy-MM-dd')
        if (!upcomingByDate[dateKey]) {
          upcomingByDate[dateKey] = []
        }
        upcomingByDate[dateKey].push(task)
      }
    })

    const sortByPriority = (a: Task, b: Task) => {
      const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
      return (priorityOrder[a.priority as keyof typeof priorityOrder] || 4) -
        (priorityOrder[b.priority as keyof typeof priorityOrder] || 4)
    }

    if (overdue.length > 0) {
      groups.push({
        label: 'Endarrerides',
        date: null,
        tasks: overdue.sort(sortByPriority),
        type: 'overdue',
      })
    }

    if (todayTasks.length > 0) {
      groups.push({
        label: 'Avui',
        date: today,
        tasks: todayTasks.sort(sortByPriority),
        type: 'today',
      })
    }

    if (tomorrowTasks.length > 0) {
      groups.push({
        label: 'Demà',
        date: addDays(today, 1),
        tasks: tomorrowTasks.sort(sortByPriority),
        type: 'tomorrow',
      })
    }

    const sortedDates = Object.keys(upcomingByDate).sort()
    sortedDates.forEach((dateKey) => {
      const date = new Date(dateKey)
      const daysUntil = differenceInDays(date, today)

      if (daysUntil <= 14) {
        groups.push({
          label: format(date, "EEEE d MMMM", { locale: ca }),
          date,
          tasks: upcomingByDate[dateKey].sort(sortByPriority),
          type: 'upcoming',
        })
      }
    })

    if (noDateTasks.length > 0) {
      groups.push({
        label: 'Sense data límit',
        date: null,
        tasks: noDateTasks.sort(sortByPriority),
        type: 'nodate',
      })
    }

    if (completedTasks.length > 0) {
      groups.push({
        label: 'Completades recentment',
        date: null,
        tasks: completedTasks
          .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
          .slice(0, 10),
        type: 'completed',
      })
    }

    return groups
  }, [tasks])

  const toggleGroup = (type: string) => {
    setExpandedGroups((prev) => ({ ...prev, [type]: !prev[type] }))
  }

  const getGroupStyles = (type: TimelineGroup['type']) => {
    switch (type) {
      case 'overdue':
        return { headerBg: 'bg-red-50', dotColor: 'bg-red-500', lineColor: 'bg-red-200' }
      case 'today':
        return { headerBg: 'bg-blue-50', dotColor: 'bg-blue-500', lineColor: 'bg-blue-200' }
      case 'tomorrow':
        return { headerBg: 'bg-amber-50', dotColor: 'bg-amber-500', lineColor: 'bg-amber-200' }
      case 'completed':
        return { headerBg: 'bg-green-50', dotColor: 'bg-green-500', lineColor: 'bg-green-200' }
      default:
        return { headerBg: 'bg-slate-50', dotColor: 'bg-slate-400', lineColor: 'bg-slate-200' }
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
        <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" strokeWidth={1.5} />
        <h3 className="text-lg font-medium text-slate-900 mb-2">Cap tasca trobada</h3>
        <p className="text-slate-500">Crea la teva primera tasca per veure el timeline</p>
      </div>
    )
  }

  if (timelineGroups.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
        <CheckCircle2 className="h-12 w-12 text-green-300 mx-auto mb-4" strokeWidth={1.5} />
        <h3 className="text-lg font-medium text-slate-900 mb-2">Tot al dia!</h3>
        <p className="text-slate-500">No tens tasques pendents amb data límit</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Clock className="h-5 w-5 text-slate-500" strokeWidth={1.5} />
          Timeline de Tasques
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Vista cronològica de les teves tasques
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {timelineGroups.map((group) => {
          const styles = getGroupStyles(group.type)
          const isExpanded = expandedGroups[group.type]

          return (
            <div key={group.type + (group.date?.toISOString() || '')}>
              {/* Header del grup */}
              <button
                onClick={() => toggleGroup(group.type)}
                className={cn(
                  'w-full px-4 py-3 flex items-center justify-between hover:bg-opacity-80 transition-colors',
                  styles.headerBg
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn('w-3 h-3 rounded-full', styles.dotColor)} />
                  <div className="text-left">
                    <span className="font-medium text-slate-900">{group.label}</span>
                    {group.date && group.type !== 'today' && group.type !== 'tomorrow' && (
                      <span className="text-sm text-slate-500 ml-2">
                        ({differenceInDays(group.date, new Date())} dies)
                      </span>
                    )}
                  </div>
                  <span className={cn(
                    'px-2 py-0.5 text-xs font-medium rounded-full',
                    group.type === 'overdue' ? 'bg-red-200 text-red-800' : 'bg-slate-200 text-slate-700'
                  )}>
                    {group.tasks.length}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
                )}
              </button>

              {/* Tasques del grup */}
              {isExpanded && (
                <div className="relative pl-8 pr-4 py-2">
                  <div className={cn('absolute left-6 top-0 bottom-0 w-0.5', styles.lineColor)} />

                  <div className="space-y-3 py-2">
                    {group.tasks.map((task) => {
                      const priority = priorityConfig[task.priority]
                      const status = statusConfig[task.status]
                      const PriorityIcon = priority.icon
                      const StatusIcon = status.icon
                      const isOverdue =
                        task.dueDate &&
                        isPast(new Date(task.dueDate)) &&
                        !isToday(new Date(task.dueDate)) &&
                        task.status !== 'COMPLETED'

                      return (
                        <div
                          key={task.id}
                          onClick={() => onTaskClick?.(task)}
                          className={cn(
                            'relative bg-white rounded-lg border p-4 cursor-pointer hover:shadow-md transition-all ml-4',
                            isOverdue ? 'border-red-200 bg-red-50' : 'border-slate-200',
                            task.status === 'COMPLETED' && 'opacity-70'
                          )}
                        >
                          <div className={cn(
                            'absolute -left-6 top-5 w-2 h-2 rounded-full border-2 border-white',
                            styles.dotColor
                          )} />

                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-2">
                                <h4 className={cn(
                                  'font-medium',
                                  task.status === 'COMPLETED'
                                    ? 'text-slate-400 line-through'
                                    : 'text-slate-900'
                                )}>
                                  {task.title}
                                </h4>
                                <span className={cn(
                                  'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded border',
                                  priority.bgColor,
                                  priority.color
                                )}>
                                  <PriorityIcon className="h-3 w-3" strokeWidth={1.5} />
                                  {priority.label}
                                </span>
                                <span className={cn(
                                  'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded',
                                  status.bgColor,
                                  status.color
                                )}>
                                  <StatusIcon className="h-3 w-3" strokeWidth={1.5} />
                                  {status.label}
                                </span>
                              </div>

                              {task.description && (
                                <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                                  {task.description}
                                </p>
                              )}

                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                {task.dueDate && (
                                  <div className={cn(
                                    'flex items-center gap-1',
                                    isOverdue && 'text-red-600 font-medium'
                                  )}>
                                    <Clock className="h-3 w-3" strokeWidth={1.5} />
                                    {format(new Date(task.dueDate), "d MMM 'a les' HH:mm", { locale: ca })}
                                  </div>
                                )}
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

                            {isOverdue && (
                              <div className="flex-shrink-0">
                                <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                                  <AlertTriangle className="h-3 w-3" strokeWidth={1.5} />
                                  Endarrerida
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}