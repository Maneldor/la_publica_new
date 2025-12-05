'use client'

import { useState, useEffect } from 'react'
import { Users, RefreshCw, Download, Search, Plus } from 'lucide-react'
import { TeamStats } from '@/components/gestio-empreses/equip/TeamStats'
import { MonthlyRanking } from '@/components/gestio-empreses/equip/MonthlyRanking'
import { GestorCardNew } from '@/components/gestio-empreses/equip/GestorCardNew'
import { GestorPreviewPanel } from '@/components/gestio-empreses/equip/GestorPreviewPanel'
import {
  getTeamStatsKPIs,
  getMonthlyRanking,
  getGestorsWithFullStats,
  getGestorDetailWithHistory
} from '@/lib/gestio-empreses/team-actions'

export default function EquipPage() {
  const [stats, setStats] = useState<any>(null)
  const [ranking, setRanking] = useState<any[]>([])
  const [gestors, setGestors] = useState<any[]>([])
  const [selectedGestorId, setSelectedGestorId] = useState<string | null>(null)
  const [gestorDetail, setGestorDetail] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [sortBy, setSortBy] = useState('name')

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [statsData, rankingData, gestorsData] = await Promise.all([
        getTeamStatsKPIs(),
        getMonthlyRanking(),
        getGestorsWithFullStats(),
      ])
      setStats(statsData)
      setRanking(rankingData)
      setGestors(gestorsData)
    } catch (error) {
      console.error('Error carregant dades:', error)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSelectGestor = async (gestorId: string) => {
    setSelectedGestorId(gestorId)
    try {
      const detail = await getGestorDetailWithHistory(gestorId)
      setGestorDetail(detail)
    } catch (error) {
      console.error('Error carregant detall gestor:', error)
    }
  }

  // Filtrar i ordenar gestors
  const filteredGestors = gestors
    .filter((g) => {
      const matchesSearch = (g.name || g.email).toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = !roleFilter || g.role === roleFilter
      return matchesSearch && matchesRole
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'leads':
          return b.activeLeads - a.activeLeads
        case 'conversion':
          return b.conversionRate - a.conversionRate
        case 'pipeline':
          return b.pipeline - a.pipeline
        default:
          return (a.name || a.email).localeCompare(b.name || b.email)
      }
    })

  const topPerformerId = ranking[0]?.id

  const defaultStats = {
    activeGestors: 0,
    activeLeads: 0,
    leadsPerGestor: 0,
    conversionsThisMonth: 0,
    conversionTrend: 0,
    pipelineTotal: 0,
    teamProgress: 0,
    teamTarget: 0,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-7 w-7 text-slate-600" strokeWidth={1.5} />
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Equip comercial</h1>
            <p className="text-sm text-slate-500">
              Visió general del rendiment de l'equip de gestors
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
            Actualitzar
          </button>
          <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
            <Download className="h-4 w-4" strokeWidth={1.5} />
            Exportar
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Nou gestor
          </button>
        </div>
      </div>

      {/* Stats */}
      <TeamStats stats={stats || defaultStats} />

      {/* Monthly Ranking */}
      {ranking.length > 0 && (
        <MonthlyRanking
          ranking={ranking}
          onSelectGestor={handleSelectGestor}
        />
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Cercar gestor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white"
        >
          <option value="">Tots els rols</option>
          <option value="EMPLOYEE">Estàndard</option>
          <option value="ADMIN">Administrador</option>
          <option value="ACCOUNT_MANAGER">Account Manager</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white"
        >
          <option value="name">Ordenar per nom</option>
          <option value="leads">Ordenar per leads</option>
          <option value="conversion">Ordenar per conversió</option>
          <option value="pipeline">Ordenar per pipeline</option>
        </select>
      </div>

      {/* Gestors grid + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gestors list */}
        <div className="lg:col-span-2">
          <h2 className="font-semibold text-slate-900 mb-4">
            Gestors ({filteredGestors.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGestors.map((gestor) => (
              <GestorCardNew
                key={gestor.id}
                gestor={gestor}
                isSelected={selectedGestorId === gestor.id}
                isTopPerformer={gestor.id === topPerformerId}
                onClick={() => handleSelectGestor(gestor.id)}
              />
            ))}
          </div>
        </div>

        {/* Preview panel */}
        <div className="lg:col-span-1 lg:sticky lg:top-6 h-fit">
          <GestorPreviewPanel
            gestor={gestorDetail}
            onClose={() => {
              setSelectedGestorId(null)
              setGestorDetail(null)
            }}
          />
        </div>
      </div>
    </div>
  )
}