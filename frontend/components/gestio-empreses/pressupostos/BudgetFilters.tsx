// components/gestio-empreses/pressupostos/BudgetFilters.tsx
'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, X, Calendar, Euro, Users } from 'lucide-react'
import { getGestors } from '@/lib/gestio-empreses/budget-actions'
import type { BudgetFilters as BudgetFiltersType } from '@/lib/gestio-empreses/budget-actions'

interface BudgetFiltersProps {
  filters: BudgetFiltersType
  onFiltersChange: (filters: BudgetFiltersType) => void
  onClearFilters: () => void
}

interface Gestor {
  id: string
  name: string
}

export function BudgetFilters({ filters, onFiltersChange, onClearFilters }: BudgetFiltersProps) {
  const [gestors, setGestors] = useState<Gestor[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    const loadGestors = async () => {
      try {
        const data = await getGestors()
        setGestors(data)
      } catch (error) {
        console.error('Error loading gestors:', error)
      }
    }

    loadGestors()
  }, [])

  const handleFilterChange = (key: keyof BudgetFiltersType, value: string | number | undefined) => {
    const newFilters = { ...filters, [key]: value || undefined }
    onFiltersChange(newFilters)
  }

  const hasActiveFilters = Object.values(filters).some(value =>
    value !== undefined && value !== '' && value !== 'all'
  )

  const statusOptions = [
    { value: 'all', label: 'Tots els estats' },
    { value: 'draft', label: 'Esborrany' },
    { value: 'pending', label: 'Pendent' },
    { value: 'approved', label: 'Aprovat' },
    { value: 'rejected', label: 'Rebutjat' }
  ]

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      {/* Filtres principals */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Cerca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Cercar pressupostos..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Estat */}
        <div className="relative">
          <select
            value={filters.status || 'all'}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Gestor */}
        <div className="relative">
          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <select
            value={filters.gestor || 'all'}
            onChange={(e) => handleFilterChange('gestor', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
          >
            <option value="all">Tots els gestors</option>
            {gestors.map(gestor => (
              <option key={gestor.id} value={gestor.id}>
                {gestor.name}
              </option>
            ))}
          </select>
        </div>

        {/* Botons d'acció */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showAdvanced
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            Avançat
          </button>

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <X className="h-4 w-4" />
              Netejar
            </button>
          )}
        </div>
      </div>

      {/* Filtres avançats */}
      {showAdvanced && (
        <div className="pt-4 border-t border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Data des de */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Des de
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Data fins */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Fins
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Import mínim */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Import mínim (€)
              </label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="number"
                  min="0"
                  step="100"
                  placeholder="0"
                  value={filters.minAmount || ''}
                  onChange={(e) => handleFilterChange('minAmount', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Import màxim */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Import màxim (€)
              </label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="number"
                  min="0"
                  step="100"
                  placeholder="Sense límit"
                  value={filters.maxAmount || ''}
                  onChange={(e) => handleFilterChange('maxAmount', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tags de filtres actius */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100">
          <span className="text-sm text-slate-500 font-medium">Filtres actius:</span>

          {filters.search && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
              Cerca: "{filters.search}"
              <button
                onClick={() => handleFilterChange('search', '')}
                className="hover:text-blue-900 transition-colors"
              >
                <X className="h-3 w-3" strokeWidth={2} />
              </button>
            </span>
          )}

          {filters.status && filters.status !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
              Estat: {statusOptions.find(s => s.value === filters.status)?.label}
              <button
                onClick={() => handleFilterChange('status', 'all')}
                className="hover:text-blue-900 transition-colors"
              >
                <X className="h-3 w-3" strokeWidth={2} />
              </button>
            </span>
          )}

          {filters.gestor && filters.gestor !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
              Gestor: {gestors.find(g => g.id === filters.gestor)?.name}
              <button
                onClick={() => handleFilterChange('gestor', 'all')}
                className="hover:text-blue-900 transition-colors"
              >
                <X className="h-3 w-3" strokeWidth={2} />
              </button>
            </span>
          )}

          {filters.dateFrom && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
              Des de: {filters.dateFrom}
              <button
                onClick={() => handleFilterChange('dateFrom', undefined)}
                className="hover:text-blue-900 transition-colors"
              >
                <X className="h-3 w-3" strokeWidth={2} />
              </button>
            </span>
          )}

          {filters.dateTo && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
              Fins: {filters.dateTo}
              <button
                onClick={() => handleFilterChange('dateTo', undefined)}
                className="hover:text-blue-900 transition-colors"
              >
                <X className="h-3 w-3" strokeWidth={2} />
              </button>
            </span>
          )}

          {(filters.minAmount || filters.maxAmount) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
              Import: {filters.minAmount || 0}€ - {filters.maxAmount ? `${filters.maxAmount}€` : '∞'}
              <button
                onClick={() => {
                  handleFilterChange('minAmount', undefined)
                  handleFilterChange('maxAmount', undefined)
                }}
                className="hover:text-blue-900 transition-colors"
              >
                <X className="h-3 w-3" strokeWidth={2} />
              </button>
            </span>
          )}

          <button
            onClick={onClearFilters}
            className="text-xs text-slate-500 hover:text-slate-700 underline ml-2"
          >
            Netejar tot
          </button>
        </div>
      )}
    </div>
  )
}