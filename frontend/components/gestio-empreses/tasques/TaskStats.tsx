// components/gestio-empreses/tasques/TaskStats.tsx
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskStatsProps {
  stats: {
    pending: number
    inProgress: number
    overdue: number
    completedThisMonth: number
    byPriority: Array<{
      priority: string
      count: number
    }>
  }
}

const priorityColors = {
  URGENT: 'text-red-600',
  HIGH: 'text-orange-600',
  MEDIUM: 'text-yellow-600',
  LOW: 'text-blue-600'
}

const priorityIcons = {
  URGENT: ArrowUp,
  HIGH: ArrowUp,
  MEDIUM: Minus,
  LOW: ArrowDown
}

export function TaskStats({ stats }: TaskStatsProps) {
  const totalActive = stats.pending + stats.inProgress

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Pendents */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Pendents</p>
            <p className="text-2xl font-semibold text-slate-900">{stats.pending}</p>
          </div>
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="h-5 w-5 text-blue-600" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* En progrés */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">En progrés</p>
            <p className="text-2xl font-semibold text-slate-900">{stats.inProgress}</p>
          </div>
          <div className="p-2 bg-orange-100 rounded-lg">
            <Clock className="h-5 w-5 text-orange-600" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* Endarrerides */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Endarrerides</p>
            <p className="text-2xl font-semibold text-red-600">{stats.overdue}</p>
          </div>
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-600" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* Completades aquest mes */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Completades</p>
            <p className="text-2xl font-semibold text-green-600">{stats.completedThisMonth}</p>
            <p className="text-xs text-slate-500">Aquest mes</p>
          </div>
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-600" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* Per prioritat */}
      {stats.byPriority.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-4 col-span-full lg:col-span-2">
          <h3 className="font-medium text-slate-900 mb-3">Per prioritat</h3>
          <div className="space-y-2">
            {stats.byPriority.map((priority) => {
              const Icon = priorityIcons[priority.priority as keyof typeof priorityIcons] || Minus
              return (
                <div key={priority.priority} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon
                      className={cn(
                        'h-4 w-4',
                        priorityColors[priority.priority as keyof typeof priorityColors]
                      )}
                      strokeWidth={1.5}
                    />
                    <span className="text-sm text-slate-600 capitalize">
                      {priority.priority.toLowerCase()}
                    </span>
                  </div>
                  <span className="font-medium text-slate-900">{priority.count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Resum total */}
      <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 col-span-full lg:col-span-2">
        <h3 className="font-medium text-slate-900 mb-3">Resum</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-600">Total actives</p>
            <p className="text-xl font-semibold text-slate-900">{totalActive}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Total completades</p>
            <p className="text-xl font-semibold text-green-600">{stats.completedThisMonth}</p>
          </div>
        </div>
        {stats.overdue > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-200">
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" strokeWidth={1.5} />
              {stats.overdue} tasques endarrerides
            </p>
          </div>
        )}
      </div>
    </div>
  )
}