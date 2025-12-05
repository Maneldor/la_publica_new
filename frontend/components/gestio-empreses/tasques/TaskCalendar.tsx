// components/gestio-empreses/tasques/TaskCalendar.tsx
'use client'

import { useState, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Target,
  Building2,
  ArrowUp,
  ArrowDown,
  Minus,
  AlertTriangle
} from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isPast,
  addMonths,
  subMonths
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
  lead?: { id: string; companyName: string } | null
  company?: { id: string; name: string } | null
}

interface TaskCalendarProps {
  tasks: Task[]
  onTaskClick?: (task: Task) => void
}

const priorityConfig: Record<string, { color: string; bgColor: string; icon: any }> = {
  URGENT: { color: 'text-red-700', bgColor: 'bg-red-100 border-red-200', icon: ArrowUp },
  HIGH: { color: 'text-orange-700', bgColor: 'bg-orange-100 border-orange-200', icon: ArrowUp },
  MEDIUM: { color: 'text-yellow-700', bgColor: 'bg-yellow-100 border-yellow-200', icon: Minus },
  LOW: { color: 'text-blue-700', bgColor: 'bg-blue-100 border-blue-200', icon: ArrowDown },
}

const statusColors: Record<string, string> = {
  PENDING: 'border-l-amber-500',
  IN_PROGRESS: 'border-l-blue-500',
  COMPLETED: 'border-l-green-500',
  CANCELLED: 'border-l-slate-400',
}

export function TaskCalendar({ tasks, onTaskClick }: TaskCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentMonth])

  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {}
    tasks.forEach((task) => {
      if (task.dueDate) {
        const dateKey = format(new Date(task.dueDate), 'yyyy-MM-dd')
        if (!grouped[dateKey]) {
          grouped[dateKey] = []
        }
        grouped[dateKey].push(task)
      }
    })
    return grouped
  }, [tasks])

  const selectedDayTasks = useMemo(() => {
    if (!selectedDate) return []
    const dateKey = format(selectedDate, 'yyyy-MM-dd')
    return tasksByDate[dateKey] || []
  }, [selectedDate, tasksByDate])

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const goToToday = () => {
    setCurrentMonth(new Date())
    setSelectedDate(new Date())
  }

  const weekDays = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg']

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Header del calendari */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-900">
              {format(currentMonth, 'MMMM yyyy', { locale: ca })}
            </h2>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              Avui
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Calendari */}
        <div className="flex-1 p-4">
          {/* Dies de la setmana */}
          <div className="grid grid-cols-7 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Dies del mes */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd')
              const dayTasks = tasksByDate[dateKey] || []
              const isCurrentMonth = isSameMonth(day, currentMonth)
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const hasOverdueTasks = dayTasks.some(
                (t) => isPast(new Date(t.dueDate!)) && t.status !== 'COMPLETED' && t.status !== 'CANCELLED'
              )

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    'relative min-h-[80px] p-1 border rounded-lg text-left transition-all',
                    isCurrentMonth ? 'bg-white' : 'bg-slate-50',
                    isSelected
                      ? 'border-blue-500 ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-slate-300',
                    isToday(day) && 'bg-blue-50'
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex items-center justify-center w-6 h-6 text-sm rounded-full',
                      isToday(day) && 'bg-blue-600 text-white font-medium',
                      !isToday(day) && isCurrentMonth && 'text-slate-900',
                      !isCurrentMonth && 'text-slate-400'
                    )}
                  >
                    {format(day, 'd')}
                  </span>

                  {/* Indicadors de tasques */}
                  {dayTasks.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {dayTasks.slice(0, 3).map((task) => {
                        const priority = priorityConfig[task.priority]
                        return (
                          <div
                            key={task.id}
                            className={cn(
                              'text-xs px-1 py-0.5 rounded truncate border-l-2',
                              statusColors[task.status],
                              task.status === 'COMPLETED' ? 'line-through text-slate-400' : priority.color,
                              priority.bgColor
                            )}
                            title={task.title}
                          >
                            {task.title}
                          </div>
                        )
                      })}
                      {dayTasks.length > 3 && (
                        <div className="text-xs text-slate-500 px-1">
                          +{dayTasks.length - 3} més
                        </div>
                      )}
                    </div>
                  )}

                  {/* Indicador d'endarrerides */}
                  {hasOverdueTasks && (
                    <div className="absolute top-1 right-1">
                      <AlertTriangle className="h-3 w-3 text-red-500" strokeWidth={2} />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Panel lateral - Detall del dia */}
        <div className="w-80 border-l border-slate-200 bg-slate-50">
          <div className="p-4 border-b border-slate-200 bg-white">
            <h3 className="font-medium text-slate-900">
              {selectedDate
                ? format(selectedDate, "EEEE, d MMMM", { locale: ca })
                : 'Selecciona un dia'}
            </h3>
            {selectedDate && (
              <p className="text-sm text-slate-500 mt-1">
                {selectedDayTasks.length} tasque{selectedDayTasks.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="p-4 overflow-y-auto max-h-[500px]">
            {!selectedDate ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-10 w-10 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-sm text-slate-500">
                  Clica sobre un dia per veure les tasques
                </p>
              </div>
            ) : selectedDayTasks.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-10 w-10 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-sm text-slate-500">
                  Cap tasca per aquest dia
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayTasks.map((task) => {
                  const priority = priorityConfig[task.priority]
                  const PriorityIcon = priority.icon
                  const isOverdue =
                    task.dueDate &&
                    isPast(new Date(task.dueDate)) &&
                    task.status !== 'COMPLETED' &&
                    task.status !== 'CANCELLED'

                  return (
                    <div
                      key={task.id}
                      onClick={() => onTaskClick?.(task)}
                      className={cn(
                        'bg-white rounded-lg border p-3 cursor-pointer hover:shadow-md transition-shadow border-l-4',
                        statusColors[task.status],
                        isOverdue && 'ring-1 ring-red-200'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={cn(
                          'font-medium text-sm',
                          task.status === 'COMPLETED' ? 'text-slate-400 line-through' : 'text-slate-900'
                        )}>
                          {task.title}
                        </h4>
                        <span className={cn(
                          'inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium rounded',
                          priority.bgColor,
                          priority.color
                        )}>
                          <PriorityIcon className="h-3 w-3" strokeWidth={1.5} />
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        {task.dueDate && (
                          <div className={cn(
                            'flex items-center gap-1',
                            isOverdue && 'text-red-500 font-medium'
                          )}>
                            <Clock className="h-3 w-3" strokeWidth={1.5} />
                            {format(new Date(task.dueDate), 'HH:mm', { locale: ca })}
                          </div>
                        )}
                        {task.lead && (
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" strokeWidth={1.5} />
                            <span className="truncate max-w-[100px]">{task.lead.companyName}</span>
                          </div>
                        )}
                        {task.company && !task.lead && (
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" strokeWidth={1.5} />
                            <span className="truncate max-w-[100px]">{task.company.name}</span>
                          </div>
                        )}
                      </div>

                      {isOverdue && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-red-600 font-medium">
                          <AlertTriangle className="h-3 w-3" strokeWidth={1.5} />
                          Endarrerida
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}