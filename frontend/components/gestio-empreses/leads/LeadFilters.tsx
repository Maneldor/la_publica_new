// components/gestio-empreses/leads/LeadFilters.tsx
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const statusOptions = [
  { value: '', label: 'Tots els estats' },
  { value: 'NEW', label: 'Nou' },
  { value: 'CONTACTED', label: 'Contactat' },
  { value: 'NEGOTIATION', label: 'Negociant' },
  { value: 'QUALIFIED', label: 'Qualificat' },
  { value: 'PROPOSAL_SENT', label: 'Proposta enviada' },
  { value: 'PENDING_CRM', label: 'Pendent CRM' },
  { value: 'CRM_APPROVED', label: 'Aprovat CRM' },
  { value: 'CRM_REJECTED', label: 'Rebutjat CRM' },
  { value: 'PENDING_ADMIN', label: 'Pendent Admin' },
  { value: 'WON', label: 'Guanyat' },
  { value: 'LOST', label: 'Perdut' },
]

const priorityOptions = [
  { value: '', label: 'Totes les prioritats' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'MEDIUM', label: 'Mitjana' },
  { value: 'LOW', label: 'Baixa' },
]

const sourceOptions = [
  { value: '', label: 'Totes les fonts' },
  { value: 'WEBSITE', label: 'Web' },
  { value: 'REFERRAL', label: 'Referit' },
  { value: 'COLD_CALL', label: 'Trucada freda' },
  { value: 'EVENT', label: 'Esdeveniment' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'OTHER', label: 'Altres' },
]

export function LeadFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [status, setStatus] = useState(searchParams.get('status') || '')
  const [priority, setPriority] = useState(searchParams.get('priority') || '')
  const [source, setSource] = useState(searchParams.get('source') || '')

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (status) params.set('status', status)
    if (priority) params.set('priority', priority)
    if (source) params.set('source', source)
    router.push(`/gestio/leads?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearch('')
    setStatus('')
    setPriority('')
    setSource('')
    router.push('/gestio/leads')
  }

  const hasFilters = search || status || priority || source

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Cercador */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Cercar per empresa o contacte..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filtres */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {priorityOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {sourceOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={applyFilters}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Filter className="h-4 w-4" strokeWidth={1.5} />
            Aplicar filtres
          </button>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
              Netejar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}