// components/gestio-empreses/empreses/CompanyFilters.tsx
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter, X } from 'lucide-react'

const statusOptions = [
  { value: '', label: 'Tots els estats' },
  { value: 'PENDING', label: 'Pendent' },
  { value: 'APPROVED', label: 'Activa' },
  { value: 'SUSPENDED', label: 'Suspesa' },
  { value: 'CANCELLED', label: 'Cancel·lada' },
]

const planOptions = [
  { value: '', label: 'Tots els plans' },
  { value: 'PIONERES', label: 'Pioneres' },
  { value: 'ESTANDARD', label: 'Estàndard' },
  { value: 'ESTRATEGIC', label: 'Estratègic' },
  { value: 'ENTERPRISE', label: 'Enterprise' },
]

export function CompanyFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [status, setStatus] = useState(searchParams.get('status') || '')
  const [plan, setPlan] = useState(searchParams.get('plan') || '')

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/gestio/empreses?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters('search', search)
  }

  const clearFilters = () => {
    setSearch('')
    setStatus('')
    setPlan('')
    router.push('/gestio/empreses')
  }

  const hasFilters = search || status || plan

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Cerca */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cercar empresa o CIF..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </form>

        {/* Estat */}
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            updateFilters('status', e.target.value)
          }}
          className="px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Pla */}
        <select
          value={plan}
          onChange={(e) => {
            setPlan(e.target.value)
            updateFilters('plan', e.target.value)
          }}
          className="px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          {planOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Netejar */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
            Netejar
          </button>
        )}
      </div>
    </div>
  )
}