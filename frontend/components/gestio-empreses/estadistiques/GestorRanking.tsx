'use client'

import { Trophy, TrendingUp, TrendingDown, Medal, Award, Crown, Target, DollarSign, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GestorRanking as GestorRankingType } from '@/lib/gestio-empreses/statistics-actions'

interface GestorRankingProps {
  data: GestorRankingType[] | null
  isLoading?: boolean
}

interface RankingItemProps {
  gestor: GestorRankingType
  index: number
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return { icon: Crown, color: 'text-yellow-500', bgColor: 'bg-yellow-100' }
    case 2:
      return { icon: Medal, color: 'text-gray-400', bgColor: 'bg-gray-100' }
    case 3:
      return { icon: Award, color: 'text-orange-500', bgColor: 'bg-orange-100' }
    default:
      return { icon: Trophy, color: 'text-slate-400', bgColor: 'bg-slate-100' }
  }
}

function RankingItem({ gestor, index }: RankingItemProps) {
  const { icon: RankIcon, color, bgColor } = getRankIcon(gestor.rank)

  return (
    <div className={cn(
      'p-4 rounded-lg border transition-all hover:shadow-md',
      gestor.rank <= 3
        ? 'border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-white'
        : 'bg-white border-slate-200'
    )}>
      <div className="flex items-center gap-4">
        {/* Rank and icon */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold', bgColor)}>
            {gestor.rank}
          </div>
          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', bgColor)}>
            <RankIcon className={cn('h-4 w-4', color)} strokeWidth={1.5} />
          </div>
        </div>

        {/* Gestor info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-slate-900 truncate">{gestor.name}</h4>
            <div className="flex items-center gap-1">
              {gestor.change > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" strokeWidth={1.5} />
              ) : gestor.change < 0 ? (
                <TrendingDown className="h-4 w-4 text-red-500" strokeWidth={1.5} />
              ) : null}
              {gestor.change !== 0 && (
                <span className={cn(
                  'text-xs font-medium',
                  gestor.change > 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {Math.abs(gestor.change)}
                </span>
              )}
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="h-3 w-3 text-blue-500" strokeWidth={1.5} />
                <span className="text-xs text-slate-500">Leads</span>
              </div>
              <div className="text-sm font-semibold text-slate-900">
                {gestor.totalLeads}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle className="h-3 w-3 text-green-500" strokeWidth={1.5} />
                <span className="text-xs text-slate-500">Conv.</span>
              </div>
              <div className="text-sm font-semibold text-slate-900">
                {gestor.conversions}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Trophy className="h-3 w-3 text-purple-500" strokeWidth={1.5} />
                <span className="text-xs text-slate-500">Taxa</span>
              </div>
              <div className="text-sm font-semibold text-slate-900">
                {gestor.conversionRate.toFixed(1)}%
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <DollarSign className="h-3 w-3 text-green-600" strokeWidth={1.5} />
                <span className="text-xs text-slate-500">Ingressos</span>
              </div>
              <div className="text-sm font-semibold text-slate-900">
                {(gestor.revenue / 1000).toFixed(0)}K €
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle className="h-3 w-3 text-blue-600" strokeWidth={1.5} />
                <span className="text-xs text-slate-500">Tasques</span>
              </div>
              <div className="text-sm font-semibold text-slate-900">
                {gestor.tasksCompleted}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RankingSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-6 h-6 bg-slate-200 rounded" />
        <div className="h-6 bg-slate-200 rounded w-48" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="w-8 h-8 bg-slate-200 rounded-full" />
            <div className="w-8 h-8 bg-slate-200 rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-slate-200 rounded w-32 mb-2" />
              <div className="grid grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map(j => (
                  <div key={j} className="h-8 bg-slate-200 rounded" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function GestorRanking({ data, isLoading = false }: GestorRankingProps) {
  if (isLoading || !data) {
    return <RankingSkeleton />
  }

  const topPerformers = data.slice(0, 3)
  const totalLeads = data.reduce((sum, gestor) => sum + gestor.totalLeads, 0)
  const totalConversions = data.reduce((sum, gestor) => sum + gestor.conversions, 0)
  const totalRevenue = data.reduce((sum, gestor) => sum + gestor.revenue, 0)

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg flex items-center justify-center">
            <Trophy className="h-5 w-5 text-yellow-600" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Rànking de Gestors</h3>
            <p className="text-sm text-slate-600">Rendiment de l'equip comercial</p>
          </div>
        </div>

        {/* Total team stats */}
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-900">
            {data.length}
          </div>
          <div className="text-xs text-slate-500">gestors actius</div>
        </div>
      </div>

      {/* Top 3 podium */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
        <h4 className="text-sm font-medium text-slate-700 mb-3 text-center">🏆 Podi del Mes</h4>
        <div className="grid grid-cols-3 gap-4">
          {topPerformers.map((gestor) => {
            const { icon: RankIcon, color, bgColor } = getRankIcon(gestor.rank)
            return (
              <div key={gestor.id} className="text-center">
                <div className={cn('w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2', bgColor)}>
                  <RankIcon className={cn('h-6 w-6', color)} strokeWidth={1.5} />
                </div>
                <div className="font-medium text-slate-900 text-sm mb-1">{gestor.name}</div>
                <div className="text-xs text-slate-500">
                  {gestor.conversions} conv. • {gestor.conversionRate.toFixed(1)}%
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Full ranking list */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Rànking Complet</h4>
        {data.map((gestor, index) => (
          <RankingItem key={gestor.id} gestor={gestor} index={index} />
        ))}
      </div>

      {/* Team summary stats */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Resum de l'Equip</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Target className="h-4 w-4 text-blue-600" strokeWidth={1.5} />
              <span className="text-sm font-medium text-blue-800">Total Leads</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {totalLeads.toLocaleString('ca-ES')}
            </div>
            <div className="text-xs text-blue-600">
              {(totalLeads / data.length).toFixed(0)} per gestor
            </div>
          </div>

          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" strokeWidth={1.5} />
              <span className="text-sm font-medium text-green-800">Total Conversions</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {totalConversions.toLocaleString('ca-ES')}
            </div>
            <div className="text-xs text-green-600">
              {((totalConversions / totalLeads) * 100).toFixed(1)}% taxa mitjana
            </div>
          </div>

          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-purple-600" strokeWidth={1.5} />
              <span className="text-sm font-medium text-purple-800">Total Ingressos</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {(totalRevenue / 1000000).toFixed(1)}M €
            </div>
            <div className="text-xs text-purple-600">
              {(totalRevenue / data.length / 1000).toFixed(0)}K € per gestor
            </div>
          </div>
        </div>
      </div>

      {/* Performance insights */}
      <div className="mt-4 p-3 bg-amber-50 rounded-lg">
        <h4 className="text-sm font-medium text-amber-900 mb-1">Insights de Rendiment</h4>
        <p className="text-xs text-amber-700">
          {topPerformers[0]?.name} lidera amb una taxa de conversió del {topPerformers[0]?.conversionRate.toFixed(1)}%.
          L'equip manté una mitjana de {((totalConversions / totalLeads) * 100).toFixed(1)}% de conversió.
        </p>
      </div>
    </div>
  )
}