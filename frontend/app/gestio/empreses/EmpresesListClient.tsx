// app/gestio/empreses/EmpresesListClient.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2,
  Plus,
  Search,
  Filter,
  ChevronDown,
  MoreHorizontal,
  Mail,
  Phone,
  User,
  Calendar,
  ExternalLink,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EmpresesListData, EmpresaListItem } from '@/lib/gestio-empreses/empreses-list-actions'

const EMPRESA_TABS = [
  { id: 'noves', label: 'Noves', description: 'Menys d\'1 any', color: 'blue' },
  { id: 'renovades', label: 'Renovades', description: 'Més d\'1 any', color: 'green' },
  { id: 'cancellades', label: 'Cancel·lades', description: 'Inactives', color: 'red' },
]

interface EmpresesListClientProps {
  initialData: EmpresesListData
  currentUser: {
    id: string
    role: string
    name?: string | null
  }
}

export function EmpresesListClient({ initialData, currentUser }: EmpresesListClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('noves')
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const stats = initialData.stats

  // Filtrar por pestaña y búsqueda
  const filteredEmpreses = initialData.empreses.filter(emp => {
    const matchesTab =
      (activeTab === 'noves' && emp.classification === 'nova') ||
      (activeTab === 'renovades' && emp.classification === 'renovada') ||
      (activeTab === 'cancellades' && emp.classification === 'cancellada')

    const searchLower = search.toLowerCase()
    const matchesSearch = !search ||
      emp.name.toLowerCase().includes(searchLower) ||
      emp.email?.toLowerCase().includes(searchLower) ||
      emp.cif?.toLowerCase().includes(searchLower)

    return matchesTab && matchesSearch
  })

  const getCountForTab = (tabId: string) => {
    switch (tabId) {
      case 'noves': return stats.noves
      case 'renovades': return stats.renovades
      case 'cancellades': return stats.cancellades
      default: return 0
    }
  }

  const handleViewEmpresa = (id: string) => {
    window.open(`/gestio/empreses/${id}`, '_blank')
  }

  const handleRefresh = () => {
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-7 w-7 text-slate-600" strokeWidth={1.5} />
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Gestió d'Empreses</h1>
            <p className="text-sm text-slate-500">
              Gestiona les empreses de la plataforma
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" strokeWidth={1.5} />
            Actualitzar
          </button>
          <button
            onClick={() => router.push('/gestio/empreses/pipeline')}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Pipeline
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm font-medium text-slate-500">Total empreses</p>
          <p className="text-2xl font-semibold text-slate-800 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm font-medium text-slate-500">Noves</p>
          <p className="text-2xl font-semibold text-blue-600 mt-1">{stats.noves}</p>
          <p className="text-xs text-slate-400 mt-1">{'< 1 any'}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm font-medium text-slate-500">Renovades</p>
          <p className="text-2xl font-semibold text-green-600 mt-1">{stats.renovades}</p>
          <p className="text-xs text-slate-400 mt-1">{'> 1 any'}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm font-medium text-slate-500">Cancel·lades</p>
          <p className="text-2xl font-semibold text-red-600 mt-1">{stats.cancellades}</p>
          <p className="text-xs text-slate-400 mt-1">Inactives</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cercar per nom, email o CIF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors',
            showFilters
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          )}
        >
          <Filter className="h-4 w-4" strokeWidth={1.5} />
          Filtres
          <ChevronDown className={cn(
            'h-4 w-4 transition-transform',
            showFilters && 'rotate-180'
          )} strokeWidth={1.5} />
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Filtres avançats (pròximament)</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-1">
          {EMPRESA_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              {tab.label}
              <span className={cn(
                'ml-2 px-2 py-0.5 rounded-full text-xs',
                activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
              )}>
                {getCountForTab(tab.id)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                Empresa
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                Contacte
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                Sector
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                Pla
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                Gestor
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                Data alta
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">
                Accions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEmpreses.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                  <Building2 className="h-8 w-8 mx-auto mb-2 text-slate-300" strokeWidth={1.5} />
                  <p>No s'han trobat empreses</p>
                  {search && (
                    <p className="text-sm mt-1">Prova amb una altra cerca</p>
                  )}
                </td>
              </tr>
            ) : (
              filteredEmpreses.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">{emp.name}</p>
                        {emp.cif && (
                          <p className="text-xs text-slate-500">{emp.cif}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      {emp.email && (
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Mail className="h-3 w-3 text-slate-400" strokeWidth={1.5} />
                          <span className="truncate max-w-[180px]">{emp.email}</span>
                        </div>
                      )}
                      {emp.phone && (
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Phone className="h-3 w-3 text-slate-400" strokeWidth={1.5} />
                          <span>{emp.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {emp.sector ? (
                      <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded">
                        {emp.sector}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {emp.planName ? (
                      <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                        {emp.planName}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Sense pla</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {emp.accountManager ? (
                      <div className="flex items-center gap-1.5">
                        <User className="h-3 w-3 text-slate-400" strokeWidth={1.5} />
                        <span className="text-sm text-slate-600">{emp.accountManager.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-orange-500 font-medium">Sense gestor</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Calendar className="h-3 w-3 text-slate-400" strokeWidth={1.5} />
                      {new Date(emp.createdAt).toLocaleDateString('ca-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewEmpresa(emp.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        Veure
                        <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination placeholder */}
        {filteredEmpreses.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-500">
              Mostrant {filteredEmpreses.length} de {filteredEmpreses.length} empreses
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
