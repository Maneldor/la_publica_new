// components/gestio-empreses/leads/LeadFiltersCompact.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { FilterDropdown } from './FilterDropdown'
import { cn } from '@/lib/utils'

const statusOptions = [
  { value: 'NEW', label: 'Nou', color: 'bg-blue-500' },
  { value: 'CONTACTED', label: 'Contactat', color: 'bg-yellow-500' },
  { value: 'NEGOTIATION', label: 'Negociant', color: 'bg-orange-500' },
  { value: 'QUALIFIED', label: 'Qualificat', color: 'bg-purple-500' },
  { value: 'PROPOSAL_SENT', label: 'Proposta enviada', color: 'bg-indigo-500' },
  { value: 'PENDING_CRM', label: 'Pendent CRM', color: 'bg-amber-500' },
  { value: 'CRM_APPROVED', label: 'Aprovat CRM', color: 'bg-teal-500' },
  { value: 'CRM_REJECTED', label: 'Rebutjat CRM', color: 'bg-red-400' },
  { value: 'PENDING_ADMIN', label: 'Pendent Admin', color: 'bg-cyan-500' },
  { value: 'WON', label: 'Guanyat', color: 'bg-green-500' },
  { value: 'LOST', label: 'Perdut', color: 'bg-slate-500' },
]

const priorityOptions = [
  { value: 'HIGH', label: 'Alta', color: 'bg-red-500' },
  { value: 'MEDIUM', label: 'Mitjana', color: 'bg-amber-500' },
  { value: 'LOW', label: 'Baixa', color: 'bg-slate-400' },
]

const sourceOptions = [
  { value: 'WEB', label: 'Web' },
  { value: 'REFERRAL', label: 'Referit' },
  { value: 'COLD_CALL', label: 'Trucada freda' },
  { value: 'EVENT', label: 'Esdeveniment' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'SOCIAL_MEDIA', label: 'Xarxes socials' },
  { value: 'EMAIL_CAMPAIGN', label: 'Campanya email' },
  { value: 'TRADE_SHOW', label: 'Fira comercial' },
  { value: 'PARTNER', label: 'Soci comercial' },
  { value: 'ADVERTISING', label: 'Publicitat' },
  { value: 'OTHER', label: 'Altres' },
]

const sectorOptions = [
  { value: 'TECHNOLOGY', label: 'Tecnologia' },
  { value: 'FINANCE', label: 'Finances' },
  { value: 'RETAIL', label: 'Comerç al detall' },
  { value: 'CONSTRUCTION', label: 'Construcció' },
  { value: 'LOGISTICS', label: 'Logística' },
  { value: 'MARKETING', label: 'Màrqueting' },
  { value: 'AUTOMOTIVE', label: 'Automoció' },
  { value: 'LEGAL', label: 'Legal' },
  { value: 'ENTERTAINMENT', label: 'Entreteniment' },
  { value: 'GOVERNMENT', label: 'Govern' },
  { value: 'HEALTH', label: 'Salut' },
  { value: 'EDUCATION', label: 'Educació' },
  { value: 'MANUFACTURING', label: 'Manufactures' },
  { value: 'HOSPITALITY', label: 'Hospitalitat' },
  { value: 'CONSULTING', label: 'Consultoria' },
  { value: 'REAL_ESTATE', label: 'Immobiliària' },
  { value: 'ENERGY', label: 'Energia' },
  { value: 'AGRICULTURE', label: 'Agricultura' },
  { value: 'NONPROFIT', label: 'Sense ànim de lucre' },
  { value: 'OTHER', label: 'Altres' },
]

interface LeadFiltersCompactProps {
  gestors: { value: string; label: string }[]
}

export function LeadFiltersCompact({ gestors }: LeadFiltersCompactProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [status, setStatus] = useState<string[]>(searchParams.get('status')?.split(',').filter(Boolean) || [])
  const [priority, setPriority] = useState<string[]>(searchParams.get('priority')?.split(',').filter(Boolean) || [])
  const [source, setSource] = useState<string[]>(searchParams.get('source')?.split(',').filter(Boolean) || [])
  const [sector, setSector] = useState<string[]>(searchParams.get('sector')?.split(',').filter(Boolean) || [])
  const [gestor, setGestor] = useState<string[]>(searchParams.get('gestor')?.split(',').filter(Boolean) || [])

  const updateURL = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (status.length) params.set('status', status.join(','))
    if (priority.length) params.set('priority', priority.join(','))
    if (source.length) params.set('source', source.join(','))
    if (sector.length) params.set('sector', sector.join(','))
    if (gestor.length) params.set('gestor', gestor.join(','))
    router.push(`/gestio/leads?${params.toString()}`)
  }

  useEffect(() => {
    const debounce = setTimeout(updateURL, 300)
    return () => clearTimeout(debounce)
  }, [status, priority, source, sector, gestor])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateURL()
  }

  const allFilters = [
    ...status.map((v) => ({ type: 'status', value: v, label: statusOptions.find((o) => o.value === v)?.label || v })),
    ...priority.map((v) => ({ type: 'priority', value: v, label: priorityOptions.find((o) => o.value === v)?.label || v })),
    ...source.map((v) => ({ type: 'source', value: v, label: sourceOptions.find((o) => o.value === v)?.label || v })),
    ...sector.map((v) => ({ type: 'sector', value: v, label: sectorOptions.find((o) => o.value === v)?.label || v })),
    ...gestor.map((v) => ({ type: 'gestor', value: v, label: gestors.find((o) => o.value === v)?.label || v })),
  ]

  const removeFilter = (type: string, value: string) => {
    switch (type) {
      case 'status': setStatus(status.filter((v) => v !== value)); break
      case 'priority': setPriority(priority.filter((v) => v !== value)); break
      case 'source': setSource(source.filter((v) => v !== value)); break
      case 'sector': setSector(sector.filter((v) => v !== value)); break
      case 'gestor': setGestor(gestor.filter((v) => v !== value)); break
    }
  }

  const clearAllFilters = () => {
    setSearch('')
    setStatus([])
    setPriority([])
    setSource([])
    setSector([])
    setGestor([])
    router.push('/gestio/leads')
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200">
      {/* Barra de cerca i filtres */}
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Cerca */}
          <form onSubmit={handleSearch} className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cercar per empresa, contacte, email, telèfon..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </form>

          {/* Dropdowns de filtres */}
          <FilterDropdown
            label="Estat"
            options={statusOptions}
            selected={status}
            onChange={setStatus}
          />

          <FilterDropdown
            label="Prioritat"
            options={priorityOptions}
            selected={priority}
            onChange={setPriority}
          />

          <FilterDropdown
            label="Font"
            options={sourceOptions}
            selected={source}
            onChange={setSource}
          />

          <FilterDropdown
            label="Sector"
            options={sectorOptions}
            selected={sector}
            onChange={setSector}
          />

          <FilterDropdown
            label="Gestor"
            options={gestors}
            selected={gestor}
            onChange={setGestor}
          />
        </div>
      </div>

      {/* Filtres actius */}
      {allFilters.length > 0 && (
        <div className="px-4 pb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-500">Filtres actius:</span>
          {allFilters.map((filter, index) => (
            <span
              key={`${filter.type}-${filter.value}-${index}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-sm bg-blue-100 text-blue-700 rounded-full"
            >
              {filter.label}
              <button
                onClick={() => removeFilter(filter.type, filter.value)}
                className="hover:text-blue-900"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </span>
          ))}
          <button
            onClick={clearAllFilters}
            className="text-sm text-slate-500 hover:text-slate-700 underline ml-2"
          >
            Netejar tot
          </button>
        </div>
      )}
    </div>
  )
}