'use client'

import { User, Target, TrendingUp, Euro, Building2, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Gestor {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
  activeLeads: number
  wonThisMonth: number
  pipeline: number
  conversionRate: number
  monthlyProgress: number
  trend: number
  companiesCount: number
}

interface GestorCardProps {
  gestor: Gestor
  isSelected: boolean
  isTopPerformer: boolean
  onClick: () => void
}

const roleLabels: Record<string, string> = {
  EMPLOYEE: 'Estàndard',
  ADMIN: 'Administrador',
  ACCOUNT_MANAGER: 'Account Manager',
}

const roleColors: Record<string, string> = {
  EMPLOYEE: 'bg-blue-100 text-blue-700',
  ADMIN: 'bg-purple-100 text-purple-700',
  ACCOUNT_MANAGER: 'bg-amber-100 text-amber-700',
}

export function GestorCardNew({ gestor, isSelected, isTopPerformer, onClick }: GestorCardProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M €`
    if (value >= 1000) return `${Math.round(value / 1000)}K €`
    return `${value} €`
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl border-2 p-4 cursor-pointer transition-all',
        isSelected
          ? 'border-blue-500 shadow-md'
          : 'border-slate-200 hover:border-slate-300',
        isTopPerformer && !isSelected && 'border-amber-200'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {gestor.image ? (
            <img
              src={gestor.image}
              alt={gestor.name || ''}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
              <User className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-900 truncate">
                {gestor.name || gestor.email}
              </p>
              {isTopPerformer && (
                <Trophy className="h-4 w-4 text-amber-500" strokeWidth={1.5} />
              )}
            </div>
            <span className={cn(
              'inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-0.5',
              roleColors[gestor.role] || 'bg-slate-100 text-slate-700'
            )}>
              {roleLabels[gestor.role] || gestor.role}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-slate-900">{gestor.conversionRate}%</p>
          <p className="text-xs text-slate-500">conversió</p>
        </div>
      </div>

      {/* Monthly progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-slate-500">Objectiu mensual</span>
          <span className={cn(
            'font-medium',
            gestor.monthlyProgress >= 80 ? 'text-green-600' :
            gestor.monthlyProgress >= 50 ? 'text-amber-600' : 'text-red-600'
          )}>
            {gestor.monthlyProgress}%
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              gestor.monthlyProgress >= 80 ? 'bg-gradient-to-r from-green-400 to-green-500' :
              gestor.monthlyProgress >= 50 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
              'bg-gradient-to-r from-red-400 to-red-500'
            )}
            style={{ width: `${gestor.monthlyProgress}%` }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-slate-50 rounded-lg p-2">
          <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
            <Target className="h-3.5 w-3.5" strokeWidth={1.5} />
          </div>
          <p className="font-semibold text-slate-900">{gestor.activeLeads}</p>
          <p className="text-xs text-slate-500">Leads</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2">
          <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
            <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.5} />
          </div>
          <p className="font-semibold text-slate-900 flex items-center justify-center gap-1">
            {gestor.wonThisMonth}
            {gestor.trend !== 0 && (
              <span className={cn(
                'text-xs',
                gestor.trend > 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {gestor.trend > 0 ? '↑' : '↓'}
              </span>
            )}
          </p>
          <p className="text-xs text-slate-500">Guanyats/mes</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2">
          <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
            <Building2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          </div>
          <p className="font-semibold text-slate-900">{gestor.companiesCount}</p>
          <p className="text-xs text-slate-500">Empreses</p>
        </div>
      </div>

      {/* Pipeline footer */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-slate-500">
          <Euro className="h-4 w-4" strokeWidth={1.5} />
          <span className="font-medium text-slate-900">{formatCurrency(gestor.pipeline)}</span>
          <span>pipeline</span>
        </div>
      </div>
    </div>
  )
}