'use client'

import {
  Search,
  X,
  ChevronDown,
  Wrench,
  Palette,
  Megaphone,
  FileText,
  Lightbulb,
  GraduationCap,
  Code,
  LifeBuoy,
  Package
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FiltersState {
  search: string
  category: string
  status: string
  priceType: string
}

interface ExtraFiltersProps {
  filters: FiltersState
  onFiltersChange: (filters: FiltersState) => void
}

const categoryOptions = [
  { value: 'ALL', label: 'Totes les categories' },
  { value: 'WEB_MAINTENANCE', label: 'Manteniment Web' },
  { value: 'BRANDING', label: 'Branding' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'SEO', label: 'SEO' },
  { value: 'CONTENT', label: 'Contingut' },
  { value: 'CONSULTING', label: 'Consultoria' },
  { value: 'TRAINING', label: 'Formació' },
  { value: 'DEVELOPMENT', label: 'Desenvolupament' },
  { value: 'SUPPORT', label: 'Suport' },
  { value: 'OTHER', label: 'Altres' },
]

const statusOptions = [
  { value: 'ALL', label: 'Tots els estats' },
  { value: 'ACTIVE', label: 'Actius' },
  { value: 'INACTIVE', label: 'Inactius' },
  { value: 'FEATURED', label: 'Destacats' },
]

const priceTypeOptions = [
  { value: 'ALL', label: 'Tots els preus' },
  { value: 'FIXED', label: 'Preu fix' },
  { value: 'MONTHLY', label: 'Mensual' },
  { value: 'ANNUAL', label: 'Anual' },
  { value: 'HOURLY', label: 'Per hores' },
  { value: 'CUSTOM', label: 'Personalitzat' },
]

export function ExtraFilters({ filters, onFiltersChange }: ExtraFiltersProps) {
  const updateFilter = (key: keyof FiltersState, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({ search: '', category: 'ALL', status: 'ALL', priceType: 'ALL' })
  }

  const hasActiveFilters = filters.search || filters.category !== 'ALL' || filters.status !== 'ALL' || filters.priceType !== 'ALL'

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Cerca */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Cercar per nom o descripció..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* Categoria */}
        <div className="relative w-full md:w-48">
          <select
            value={filters.category}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="w-full appearance-none px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" strokeWidth={1.5} />
        </div>

        {/* Estat */}
        <div className="relative w-full md:w-40">
          <select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="w-full appearance-none px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" strokeWidth={1.5} />
        </div>

        {/* Tipus preu */}
        <div className="relative w-full md:w-40">
          <select
            value={filters.priceType}
            onChange={(e) => updateFilter('priceType', e.target.value)}
            className="w-full appearance-none px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            {priceTypeOptions.map((option) => (
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
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
              Cerca: "{filters.search}"
              <button onClick={() => updateFilter('search', '')} className="hover:text-purple-900">
                <X className="h-3 w-3" strokeWidth={2} />
              </button>
            </span>
          )}
          {filters.category !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
              Categoria: {categoryOptions.find(c => c.value === filters.category)?.label}
              <button onClick={() => updateFilter('category', 'ALL')} className="hover:text-purple-900">
                <X className="h-3 w-3" strokeWidth={2} />
              </button>
            </span>
          )}
          {filters.status !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
              Estat: {statusOptions.find(s => s.value === filters.status)?.label}
              <button onClick={() => updateFilter('status', 'ALL')} className="hover:text-purple-900">
                <X className="h-3 w-3" strokeWidth={2} />
              </button>
            </span>
          )}
          {filters.priceType !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
              Preu: {priceTypeOptions.find(p => p.value === filters.priceType)?.label}
              <button onClick={() => updateFilter('priceType', 'ALL')} className="hover:text-purple-900">
                <X className="h-3 w-3" strokeWidth={2} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}