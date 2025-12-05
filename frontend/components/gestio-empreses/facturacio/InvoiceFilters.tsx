'use client'

import { useState } from 'react'
import {
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Filter,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'

type InvoiceStatus = 'ALL' | 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'

interface InvoiceFiltersData {
  search: string
  status: InvoiceStatus
  onlyOverdue: boolean
}

interface InvoiceFiltersProps {
  filters: InvoiceFiltersData
  onChange: (filters: InvoiceFiltersData) => void
  resultsCount?: number
}

const STATUS_OPTIONS: { value: InvoiceStatus; label: string }[] = [
  { value: 'ALL', label: 'Totes' },
  { value: 'DRAFT', label: 'Esborranys' },
  { value: 'SENT', label: 'Enviades' },
  { value: 'PAID', label: 'Pagades' },
  { value: 'OVERDUE', label: 'Endarrerides' },
  { value: 'CANCELLED', label: 'Cancel·lades' },
]

export function InvoiceFilters({ filters, onChange, resultsCount }: InvoiceFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const updateFilter = (key: keyof InvoiceFiltersData, value: any) => {
    onChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onChange({ search: '', status: 'ALL', onlyOverdue: false })
  }

  const hasActiveFilters = filters.search || filters.status !== 'ALL' || filters.onlyOverdue
  const activeFiltersCount = [
    filters.search,
    filters.status !== 'ALL',
    filters.onlyOverdue
  ].filter(Boolean).length

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header col·lapsable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
          <span className="text-sm font-medium text-slate-700">Filtres</span>
          {activeFiltersCount > 0 && (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {resultsCount !== undefined && (
            <span className="text-xs text-slate-400">{resultsCount} resultats</span>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
          )}
        </div>
      </button>

      {/* Contingut expandible */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-slate-100">
          {/* Cerca */}
          <div className="pt-4">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Cercar factura
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Número, client, descripció..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Estat - Pills */}
          <div className="pt-4">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Estat
            </label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateFilter('status', option.value)}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors',
                    filters.status === option.value
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Opcions avançades */}
          <div className="pt-4">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Opcions avançades
            </label>
            <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.onlyOverdue}
                onChange={(e) => updateFilter('onlyOverdue', e.target.checked)}
                className="h-4 w-4 text-red-600 rounded border-slate-300"
              />
              <AlertTriangle className="h-4 w-4 text-red-500" strokeWidth={1.5} />
              <div>
                <span className="text-sm text-slate-700">Només endarrerides</span>
                <p className="text-xs text-slate-400">Mostrar només factures amb pagament vençut</p>
              </div>
            </label>
          </div>

          {/* Netejar filtres */}
          {hasActiveFilters && (
            <div className="pt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                Netejar filtres
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tags actius (sempre visibles quan hi ha filtres) */}
      {!isExpanded && hasActiveFilters && (
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          {filters.search && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
              "{filters.search}"
              <button onClick={() => updateFilter('search', '')} className="hover:text-emerald-900">
                <X className="h-3 w-3" strokeWidth={2} />
              </button>
            </span>
          )}
          {filters.status !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
              {STATUS_OPTIONS.find(s => s.value === filters.status)?.label}
              <button onClick={() => updateFilter('status', 'ALL')} className="hover:text-emerald-900">
                <X className="h-3 w-3" strokeWidth={2} />
              </button>
            </span>
          )}
          {filters.onlyOverdue && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full">
              Endarrerides
              <button onClick={() => updateFilter('onlyOverdue', false)} className="hover:text-red-900">
                <X className="h-3 w-3" strokeWidth={2} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}