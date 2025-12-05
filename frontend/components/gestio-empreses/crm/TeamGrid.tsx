// components/gestio-empreses/crm/TeamGrid.tsx
'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { GestorCard } from './GestorCard'

interface GestorData {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
  metrics: {
    activeLeads: number
    totalLeads: number
    wonLeads: number
    lostLeads: number
    wonThisMonth: number
    activeCompanies: number
    pipelineValue: number
    wonValue: number
    conversionRate: number
    activitiesThisMonth: number
    callsThisMonth: number
    emailsThisMonth: number
  }
}

interface TeamGridProps {
  gestors: GestorData[]
}

export function TeamGrid({ gestors }: TeamGridProps) {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('name')

  const filteredGestors = gestors
    .filter((g) => {
      const matchesSearch = !search ||
        g.name?.toLowerCase().includes(search.toLowerCase()) ||
        g.email.toLowerCase().includes(search.toLowerCase())
      const matchesRole = !roleFilter || g.role === roleFilter
      return matchesSearch && matchesRole
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'leads':
          return b.metrics.activeLeads - a.metrics.activeLeads
        case 'conversion':
          return b.metrics.conversionRate - a.metrics.conversionRate
        case 'pipeline':
          return b.metrics.pipelineValue - a.metrics.pipelineValue
        default:
          return (a.name || a.email).localeCompare(b.name || b.email)
      }
    })

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cercar gestor..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tots els rols</option>
          <option value="EMPLOYEE">Estàndard</option>
          <option value="ACCOUNT_MANAGER">Estratègic</option>
          <option value="ADMIN">Enterprise</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="name">Ordenar per nom</option>
          <option value="leads">Per leads actius</option>
          <option value="conversion">Per conversió</option>
          <option value="pipeline">Per pipeline</option>
        </select>
      </div>

      {/* Grid de gestors */}
      {filteredGestors.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-500">No s'han trobat gestors</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGestors.map((gestor) => (
            <GestorCard key={gestor.id} gestor={gestor} />
          ))}
        </div>
      )}
    </div>
  )
}