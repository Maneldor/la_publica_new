// components/gestio-empreses/tasques/TaskFiltersAdvanced.tsx
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter, ChevronDown, ChevronUp, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const statusOptions = [
  { value: '', label: 'Tots els estats' },
  { value: 'PENDING', label: 'Pendents' },
  { value: 'IN_PROGRESS', label: 'En progrés' },
  { value: 'COMPLETED', label: 'Completades' },
  { value: 'CANCELLED', label: 'Cancel·lades' },
]

const priorityOptions = [
  { value: '', label: 'Totes les prioritats' },
  { value: 'URGENT', label: 'Urgent' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'MEDIUM', label: 'Mitjana' },
  { value: 'LOW', label: 'Baixa' },
]

const typeOptions = [
  { value: '', label: 'Tots els tipus' },
  { value: 'lead', label: 'Vinculades a leads' },
  { value: 'company', label: 'Vinculades a empreses' },
  { value: 'general', label: 'Generals' },
]

export function TaskFiltersAdvanced() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isExpanded, setIsExpanded] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')

  const status = searchParams.get('status') || ''
  const priority = searchParams.get('priority') || ''
  const type = searchParams.get('type') || ''

  const hasFilters = status || priority || type || search

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/gestio/tasques?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilter('search', search)
  }

  const clearFilters = () => {
    setSearch('')
    router.push('/gestio/tasques')
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
          <span className="font-medium text-slate-900">Filtres</span>
          <span className="text-sm text-slate-500">
            Filtra tasques per estat, prioritat i tipus
          </span>
        </div>
        <div className="flex items-center gap-2">
          {hasFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                clearFilters()
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Netejar
            </button>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
          )}
        </div>
      </button>

      {/* Filters */}
      {isExpanded && (
        <div className="p-4 border-t border-slate-100 space-y-4">
          {/* Search */}
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar tasques per títol, descripció..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </form>

          {/* Filter dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Estat
              </label>
              <select
                value={status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Prioritat
              </label>
              <select
                value={priority}
                onChange={(e) => updateFilter('priority', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {priorityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Tipus
              </label>
              <select
                value={type}
                onChange={(e) => updateFilter('type', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}