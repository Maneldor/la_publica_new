// components/gestio-empreses/resources/ResourceFilters.tsx
'use client'

import { useState } from 'react'
import {
  Filter,
  Search,
  X,
  ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ResourceType,
  PipelinePhase,
  ResourceCategory,
  ResourceFilterDTO,
  RESOURCE_TYPE_LABELS,
  PIPELINE_PHASE_LABELS,
  RESOURCE_CATEGORY_LABELS
} from '@/lib/gestio-empreses/types/resources'

interface ResourceFiltersProps {
  filters: ResourceFilterDTO
  onFiltersChange: (filters: ResourceFilterDTO) => void
  availableTags?: string[]
  className?: string
}

export function ResourceFilters({
  filters,
  onFiltersChange,
  availableTags = [],
  className
}: ResourceFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const updateFilter = (key: keyof ResourceFilterDTO, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilter = (key: keyof ResourceFilterDTO) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    onFiltersChange(newFilters)
  }

  const clearAllFilters = () => {
    onFiltersChange({})
  }

  const activeFiltersCount = Object.keys(filters).length

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Cercar recursos..."
          value={filters.search || ''}
          onChange={(e) => updateFilter('search', e.target.value || undefined)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Quick filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
            showAdvanced
              ? "bg-blue-100 text-blue-700"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          )}
        >
          <Filter className="w-4 h-4" />
          Filtres
          {activeFiltersCount > 0 && (
            <span className="bg-blue-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
          <ChevronDown className={cn(
            "w-4 h-4 transition-transform",
            showAdvanced && "rotate-180"
          )} />
        </button>

        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 px-2 py-1 text-sm text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4" />
            Netejar tot
          </button>
        )}
      </div>

      {/* Active filters display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.type && (
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              <span>Tipus: {RESOURCE_TYPE_LABELS[filters.type]}</span>
              <button
                onClick={() => clearFilter('type')}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {filters.phase && (
            <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              <span>Fase: {PIPELINE_PHASE_LABELS[filters.phase]}</span>
              <button
                onClick={() => clearFilter('phase')}
                className="text-purple-600 hover:text-purple-800"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {filters.category && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              <span>Categoria: {RESOURCE_CATEGORY_LABELS[filters.category]}</span>
              <button
                onClick={() => clearFilter('category')}
                className="text-green-600 hover:text-green-800"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {filters.tags && filters.tags.length > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
              <span>Tags: {filters.tags.join(', ')}</span>
              <button
                onClick={() => clearFilter('tags')}
                className="text-amber-600 hover:text-amber-800"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {filters.isActive === false && (
            <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
              <span>Inactius</span>
              <button
                onClick={() => clearFilter('isActive')}
                className="text-red-600 hover:text-red-800"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border">
          {/* Type filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tipus de recurs
            </label>
            <select
              value={filters.type || ''}
              onChange={(e) => updateFilter('type', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Tots els tipus</option>
              {Object.entries(RESOURCE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Phase filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Fase del pipeline
            </label>
            <select
              value={filters.phase || ''}
              onChange={(e) => updateFilter('phase', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Totes les fases</option>
              {Object.entries(PIPELINE_PHASE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Categoria
            </label>
            <select
              value={filters.category || ''}
              onChange={(e) => updateFilter('category', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Totes les categories</option>
              {Object.entries(RESOURCE_CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Estat
            </label>
            <select
              value={filters.isActive === undefined ? '' : filters.isActive ? 'true' : 'false'}
              onChange={(e) => {
                const value = e.target.value
                if (value === '') {
                  updateFilter('isActive', undefined)
                } else {
                  updateFilter('isActive', value === 'true')
                }
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Tots els recursos</option>
              <option value="true">Actius</option>
              <option value="false">Inactius</option>
            </select>
          </div>

          {/* Tags filter */}
          {availableTags.length > 0 && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {availableTags.map(tag => {
                  const isSelected = filters.tags?.includes(tag)
                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        const currentTags = filters.tags || []
                        if (isSelected) {
                          const newTags = currentTags.filter(t => t !== tag)
                          updateFilter('tags', newTags.length > 0 ? newTags : undefined)
                        } else {
                          updateFilter('tags', [...currentTags, tag])
                        }
                      }}
                      className={cn(
                        "px-2 py-1 rounded text-xs transition-colors",
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      )}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}