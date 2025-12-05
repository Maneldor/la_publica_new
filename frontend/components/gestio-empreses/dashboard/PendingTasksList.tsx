// components/gestio-empreses/dashboard/PendingTasksList.tsx
// FITXER NOU - Llista de tasques pendents per dashboard

'use client'

import Link from 'next/link'
import { format, isToday, isTomorrow, isPast } from 'date-fns'
import { ca } from 'date-fns/locale'
import {
  CheckSquare,
  Clock,
  ArrowRight,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Task {
  id: string
  title: string
  description: string | null
  type: string
  priority: string
  dueDate: Date | null
  lead?: {
    id: string
    companyName: string
  } | null
}

interface PendingTasksListProps {
  tasks: Task[]
  className?: string
}

const taskTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Calendar,
  FOLLOW_UP: Clock,
  OTHER: FileText,
}

const priorityStyles: Record<string, string> = {
  HIGH: 'border-l-red-500',
  URGENT: 'border-l-red-500',
  MEDIUM: 'border-l-amber-500',
  LOW: 'border-l-slate-300',
}

function formatDueDate(date: Date): { text: string; className: string } {
  if (isToday(date)) {
    return { text: 'Avui', className: 'text-amber-600 font-medium' }
  }
  if (isTomorrow(date)) {
    return { text: 'Demà', className: 'text-blue-600' }
  }
  if (isPast(date)) {
    return { text: 'Endarrerit', className: 'text-red-600 font-medium' }
  }
  return {
    text: format(date, "d MMM", { locale: ca }),
    className: 'text-slate-500'
  }
}

export function PendingTasksList({ tasks, className }: PendingTasksListProps) {
  if (tasks.length === 0) {
    return (
      <div className={cn("bg-white rounded-lg border border-slate-200", className)}>
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-medium text-slate-800">Tasques pendents</h3>
        </div>
        <div className="p-8 text-center">
          <CheckSquare className="h-10 w-10 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-slate-500">No hi ha tasques pendents</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("bg-white rounded-lg border border-slate-200", className)}>
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-medium text-slate-800">Tasques pendents</h3>
        <Link
          href="/gestor-empreses/tasques"
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          Veure totes
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </Link>
      </div>
      <div className="divide-y divide-slate-100">
        {tasks.map((task) => {
          const Icon = taskTypeIcons[task.type] || taskTypeIcons.OTHER
          const priorityClass = priorityStyles[task.priority] || priorityStyles.LOW
          const dueInfo = task.dueDate ? formatDueDate(new Date(task.dueDate)) : null

          return (
            <div
              key={task.id}
              className={cn(
                "flex items-start gap-3 p-4 border-l-2 hover:bg-slate-50 transition-colors",
                priorityClass
              )}
            >
              {/* Icona tipus */}
              <div className="p-1.5 bg-slate-100 rounded">
                <Icon className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
              </div>

              {/* Info tasca */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {task.title}
                </p>
                {task.lead && (
                  <Link
                    href={`/gestor-empreses/leads/${task.lead.id}`}
                    className="text-xs text-slate-500 hover:text-blue-600 truncate block mt-0.5"
                  >
                    {task.lead.companyName}
                  </Link>
                )}
              </div>

              {/* Data límit */}
              {dueInfo && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  {isPast(new Date(task.dueDate!)) && !isToday(new Date(task.dueDate!)) && (
                    <AlertCircle className="h-3.5 w-3.5 text-red-500" strokeWidth={1.5} />
                  )}
                  <span className={cn("text-xs", dueInfo.className)}>
                    {dueInfo.text}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}