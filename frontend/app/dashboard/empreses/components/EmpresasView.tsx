'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search,
  Building2,
  MapPin,
  Globe,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  BadgeCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CompanyCard } from '@/components/empreses/CompanyCard'

interface Company {
  id: string
  slug?: string | null
  name: string
  description: string | null
  slogan: string | null
  sector: string | null
  address: string | null
  logo: string | null
  coverImage: string | null
  website: string | null
  email: string
  phone: string | null
  size: string | null
  foundingYear: number | null
  isVerified: boolean
  tags: string[]
  currentPlan: {
    tier: string
    name: string
    nombreCorto?: string
  } | null
}

interface EmpresasViewProps {
  userId: string
}

type TabType = 'totes' | 'destacades' | 'noves'

export function EmpresasView({ userId }: EmpresasViewProps) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSector, setSelectedSector] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('totes')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 })
  const [stats, setStats] = useState({ total: 0, verificades: 0, noves: 0 })
  const [sectors, setSectors] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Cargar empresas
  useEffect(() => {
    const loadCompanies = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '12',
          tab: activeTab
        })
        if (searchTerm) params.set('search', searchTerm)
        if (selectedSector) params.set('sector', selectedSector)

        const response = await fetch(`/api/dashboard/empreses?${params}`)
        const data = await response.json()

        if (data.success) {
          setCompanies(data.data)
          setPagination(data.pagination)
          setStats(data.stats)
          if (data.filters?.sectors) {
            setSectors(data.filters.sectors)
          }
        }
      } catch (error) {
        console.error('Error carregant empreses:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCompanies()
  }, [page, activeTab, searchTerm, selectedSector])

  // Debounce para búsqueda
  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(debouncedSearch)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [debouncedSearch])

  const tabs = [
    { id: 'totes' as TabType, label: 'Totes', count: stats.total },
    { id: 'destacades' as TabType, label: 'Destacades', count: stats.verificades },
    { id: 'noves' as TabType, label: 'Noves', count: stats.noves }
  ]

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Empreses" value={stats.total} />
        <StatCard label="Verificades" value={stats.verificades} />
        <StatCard label="Noves (30 dies)" value={stats.noves} />
        <StatCard label="Sectors" value={sectors.length} />
      </div>

      {/* Búsqueda y filtros */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Barra de búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cercar empreses per nom, sector o ubicació..."
              value={debouncedSearch}
              onChange={(e) => setDebouncedSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Botón filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors",
              showFilters || selectedSector
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-slate-200 text-slate-700 hover:bg-slate-50"
            )}
          >
            <Filter className="h-4 w-4" />
            Filtres
            {selectedSector && (
              <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">1</span>
            )}
          </button>
        </div>

        {/* Panel de filtros expandible */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setSelectedSector(''); setPage(1) }}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-full transition-colors",
                  !selectedSector
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                )}
              >
                Tots els sectors
              </button>
              {sectors.map(sector => (
                <button
                  key={sector}
                  onClick={() => { setSelectedSector(sector); setPage(1) }}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-full transition-colors",
                    selectedSector === sector
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  )}
                >
                  {sector}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setPage(1) }}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab.id
                ? "text-blue-600 border-blue-600"
                : "text-slate-500 border-transparent hover:text-slate-700"
            )}
          >
            {tab.label}
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              activeTab === tab.id
                ? "bg-blue-100 text-blue-700"
                : "bg-slate-100 text-slate-600"
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Resultados */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {pagination.total} empresa{pagination.total !== 1 ? 's' : ''} trobada{pagination.total !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">No s'han trobat empreses</h3>
          <p className="text-sm text-slate-500">Prova a ajustar els filtres o el terme de cerca</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-5">
          {companies.map(company => (
            <CompanyCard
              key={company.id}
              company={{
                ...company,
                services: company.tags
              }}
              href={`/dashboard/empreses/${company.slug || company.id}`}
            />
          ))}
        </div>
      )}

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm text-slate-600">
            Pàgina {page} de {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
            className="p-2 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  )
}
