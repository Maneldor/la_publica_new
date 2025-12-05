'use client'

import { Search, Filter, X, ChevronDown, Rocket, Zap, Star, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FiltersState {
  search: string
  tier: string
  status: string
}

interface PlanFiltersProps {
  filters: FiltersState
  onFiltersChange: (filters: FiltersState) => void
}

const tierOptions = [
  { value: 'ALL', label: 'Tots els plans', icon: null },
  { value: 'PIONERES', label: 'Pioneres', icon: Rocket, color: 'text-amber-600' },
  { value: 'STANDARD', label: 'Estàndard', icon: Zap, color: 'text-green-600' },
  { value: 'STRATEGIC', label: 'Estratègic', icon: Star, color: 'text-blue-600' },
  { value: 'ENTERPRISE', label: 'Enterprise', icon: Crown, color: 'text-purple-600' },
]

const statusOptions = [
  { value: 'ALL', label: 'Tots els estats' },
  { value: 'ACTIVE', label: 'Actius' },
  { value: 'INACTIVE', label: 'Inactius' },
  { value: 'VISIBLE', label: 'Visibles' },
  { value: 'HIDDEN', label: 'Ocults' },
]

export function PlanFilters({ filters, onFiltersChange }: PlanFiltersProps) {
  const updateFilter = (key: keyof FiltersState, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({ search: '', tier: 'ALL', status: 'ALL' })
  }

  const hasActiveFilters = filters.search || filters.tier !== 'ALL' || filters.status !== 'ALL'

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Cerca */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Cercar per nom o slug..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Tier */}
        <div className="relative w-full md:w-48">
          <select
            value={filters.tier}
            onChange={(e) => updateFilter('tier', e.target.value)}
            className="w-full appearance-none px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {tierOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" strokeWidth={1.5} />
        </div>

        {/* Estat */}
        <div className="relative w-full md:w-44">
          <select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="w-full appearance-none px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" strokeWidth={1.5} />
        </div>

        {/* Netejar */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
            Netejar
          </button>
        )}
      </div>

      {/* Tags actius */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
          {filters.search && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
              Cerca: "{filters.search}"
              <button onClick={() => updateFilter('search', '')} className="hover:text-blue-900">
                <X className="h-3 w-3" strokeWidth={2} />
              </button>
            </span>
          )}
          {filters.tier !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
              Pla: {tierOptions.find(t => t.value === filters.tier)?.label}
              <button onClick={() => updateFilter('tier', 'ALL')} className="hover:text-blue-900">
                <X className="h-3 w-3" strokeWidth={2} />
              </button>
            </span>
          )}
          {filters.status !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
              Estat: {statusOptions.find(s => s.value === filters.status)?.label}
              <button onClick={() => updateFilter('status', 'ALL')} className="hover:text-blue-900">
                <X className="h-3 w-3" strokeWidth={2} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}