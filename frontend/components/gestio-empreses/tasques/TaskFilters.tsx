'use client'

// components/gestio-empreses/tasques/TaskFilters.tsx
import {
  Filter,
  X,
  CheckCircle2,
  Clock,
  Calendar,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus,
  User,
  Building2,
  Target
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TaskPriority, TaskStatus } from '@/lib/gestio-empreses/task-actions'

interface TaskFiltersProps {
  filters: {
    status?: TaskStatus
    priority?: TaskPriority
    leadId?: string
    companyId?: string
    assignedToId?: string
    overdue?: boolean
  }
  onFiltersChange: (filters: TaskFiltersProps['filters']) => void
  availableUsers?: Array<{
    id: string
    name: string
    email: string
  }>
  availableLeads?: Array<{
    id: string
    companyName: string
  }>
  availableCompanies?: Array<{
    id: string
    name: string
  }>
  className?: string
}

const statusOptions = [
  {
    value: 'PENDING' as TaskStatus,
    label: 'Pendent',
    icon: Calendar,
    color: 'bg-slate-100 text-slate-700 border-slate-300'
  },
  {
    value: 'IN_PROGRESS' as TaskStatus,
    label: 'En progrés',
    icon: Clock,
    color: 'bg-blue-100 text-blue-700 border-blue-300'
  },
  {
    value: 'COMPLETED' as TaskStatus,
    label: 'Completada',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-700 border-green-300'
  },
  {
    value: 'CANCELLED' as TaskStatus,
    label: 'Cancel·lada',
    icon: X,
    color: 'bg-red-100 text-red-700 border-red-300'
  }
]

const priorityOptions = [
  {
    value: 'URGENT' as TaskPriority,
    label: 'Urgent',
    icon: ArrowUp,
    color: 'bg-red-100 text-red-700 border-red-300'
  },
  {
    value: 'HIGH' as TaskPriority,
    label: 'Alta',
    icon: ArrowUp,
    color: 'bg-orange-100 text-orange-700 border-orange-300'
  },
  {
    value: 'MEDIUM' as TaskPriority,
    label: 'Mitjana',
    icon: Minus,
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300'
  },
  {
    value: 'LOW' as TaskPriority,
    label: 'Baixa',
    icon: ArrowDown,
    color: 'bg-blue-100 text-blue-700 border-blue-300'
  }
]

export function TaskFilters({
  filters,
  onFiltersChange,
  availableUsers = [],
  availableLeads = [],
  availableCompanies = [],
  className
}: TaskFiltersProps) {
  const hasActiveFilters = Object.values(filters).some(Boolean)

  const updateFilter = (key: keyof TaskFiltersProps['filters'], value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilter = (key: keyof TaskFiltersProps['filters']) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    onFiltersChange(newFilters)
  }

  const clearAllFilters = () => {
    onFiltersChange({})
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-600" strokeWidth={1.5} />
          <span className="text-sm font-medium text-slate-700">Filtres</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
          >
            <X className="h-3 w-3" strokeWidth={1.5} />
            Netejar tot
          </button>
        )}
      </div>

      {/* Quick filters */}
      <div className="flex flex-wrap gap-2">
        {/* Overdue filter */}
        <button
          onClick={() => updateFilter('overdue', filters.overdue ? undefined : true)}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border transition-colors',
            filters.overdue
              ? 'bg-red-100 text-red-700 border-red-300'
              : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
          )}
        >
          <AlertTriangle className="h-3 w-3" strokeWidth={1.5} />
          Endarrerides
          {filters.overdue && (
            <X
              className="h-3 w-3 ml-1 hover:bg-red-200 rounded"
              onClick={(e) => {
                e.stopPropagation()
                clearFilter('overdue')
              }}
            />
          )}
        </button>
      </div>

      {/* Status filter */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Estat
        </label>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((status) => {
            const Icon = status.icon
            const isSelected = filters.status === status.value

            return (
              <button
                key={status.value}
                onClick={() => updateFilter('status', isSelected ? undefined : status.value)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border transition-colors',
                  isSelected
                    ? status.color
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                )}
              >
                <Icon className="h-3 w-3" strokeWidth={1.5} />
                {status.label}
                {isSelected && (
                  <X
                    className="h-3 w-3 ml-1 hover:bg-current/20 rounded"
                    onClick={(e) => {
                      e.stopPropagation()
                      clearFilter('status')
                    }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Priority filter */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Prioritat
        </label>
        <div className="flex flex-wrap gap-2">
          {priorityOptions.map((priority) => {
            const Icon = priority.icon
            const isSelected = filters.priority === priority.value

            return (
              <button
                key={priority.value}
                onClick={() => updateFilter('priority', isSelected ? undefined : priority.value)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border transition-colors',
                  isSelected
                    ? priority.color
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                )}
              >
                <Icon className="h-3 w-3" strokeWidth={1.5} />
                {priority.label}
                {isSelected && (
                  <X
                    className="h-3 w-3 ml-1 hover:bg-current/20 rounded"
                    onClick={(e) => {
                      e.stopPropagation()
                      clearFilter('priority')
                    }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* User filter */}
      {availableUsers.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Assignat a
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
            <select
              value={filters.assignedToId || ''}
              onChange={(e) => updateFilter('assignedToId', e.target.value || undefined)}
              className="w-full pl-9 pr-8 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tots els usuaris</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            {filters.assignedToId && (
              <button
                onClick={() => clearFilter('assignedToId')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded"
              >
                <X className="h-3 w-3 text-slate-400" strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Lead filter */}
      {availableLeads.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Lead relacionat
          </label>
          <div className="relative">
            <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
            <select
              value={filters.leadId || ''}
              onChange={(e) => {
                const leadId = e.target.value || undefined
                updateFilter('leadId', leadId)
                if (leadId) {
                  clearFilter('companyId') // Clear company filter if lead is selected
                }
              }}
              className="w-full pl-9 pr-8 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tots els leads</option>
              {availableLeads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.companyName}
                </option>
              ))}
            </select>
            {filters.leadId && (
              <button
                onClick={() => clearFilter('leadId')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded"
              >
                <X className="h-3 w-3 text-slate-400" strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Company filter (only if no lead selected) */}
      {!filters.leadId && availableCompanies.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Empresa relacionada
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
            <select
              value={filters.companyId || ''}
              onChange={(e) => updateFilter('companyId', e.target.value || undefined)}
              className="w-full pl-9 pr-8 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Totes les empreses</option>
              {availableCompanies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            {filters.companyId && (
              <button
                onClick={() => clearFilter('companyId')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded"
              >
                <X className="h-3 w-3 text-slate-400" strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-slate-600">Filtres actius:</span>

            {filters.status && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                Estat: {statusOptions.find(s => s.value === filters.status)?.label}
                <X
                  className="h-3 w-3 hover:bg-blue-200 rounded cursor-pointer"
                  onClick={() => clearFilter('status')}
                />
              </span>
            )}

            {filters.priority && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                Prioritat: {priorityOptions.find(p => p.value === filters.priority)?.label}
                <X
                  className="h-3 w-3 hover:bg-orange-200 rounded cursor-pointer"
                  onClick={() => clearFilter('priority')}
                />
              </span>
            )}

            {filters.overdue && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                Endarrerides
                <X
                  className="h-3 w-3 hover:bg-red-200 rounded cursor-pointer"
                  onClick={() => clearFilter('overdue')}
                />
              </span>
            )}

            {filters.assignedToId && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                Usuari: {availableUsers.find(u => u.id === filters.assignedToId)?.name}
                <X
                  className="h-3 w-3 hover:bg-purple-200 rounded cursor-pointer"
                  onClick={() => clearFilter('assignedToId')}
                />
              </span>
            )}

            {filters.leadId && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                Lead: {availableLeads.find(l => l.id === filters.leadId)?.companyName}
                <X
                  className="h-3 w-3 hover:bg-green-200 rounded cursor-pointer"
                  onClick={() => clearFilter('leadId')}
                />
              </span>
            )}

            {filters.companyId && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">
                Empresa: {availableCompanies.find(c => c.id === filters.companyId)?.name}
                <X
                  className="h-3 w-3 hover:bg-indigo-200 rounded cursor-pointer"
                  onClick={() => clearFilter('companyId')}
                />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}