// components/gestio-empreses/assignacions/GestorCard.tsx
'use client'

import { User, Briefcase, Trophy, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Gestor {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
  activeLeadsCount: number
  wonCount: number
  pipeline: number
  load: number
  maxLeads: number
}

interface GestorCardProps {
  gestor: Gestor
  isSelected: boolean
  onClick: () => void
}

const roleLabels: Record<string, string> = {
  EMPLOYEE: 'Estàndard',
  ACCOUNT_MANAGER: 'Estratègic',
  ADMIN: 'Enterprise',
  GESTOR_CRM: 'CRM',
}

const roleColors: Record<string, string> = {
  EMPLOYEE: 'bg-blue-100 text-blue-700',
  ACCOUNT_MANAGER: 'bg-purple-100 text-purple-700',
  ADMIN: 'bg-amber-100 text-amber-700',
  GESTOR_CRM: 'bg-green-100 text-green-700',
}

export function GestorCard({ gestor, isSelected, onClick }: GestorCardProps) {
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
          : 'border-slate-200 hover:border-slate-300'
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
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
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 truncate">
            {gestor.name || gestor.email}
          </p>
          <span className={cn(
            'inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-1',
            roleColors[gestor.role] || 'bg-slate-100 text-slate-700'
          )}>
            {roleLabels[gestor.role] || gestor.role}
          </span>
        </div>
      </div>

      {/* Load bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-slate-500">Càrrega</span>
          <span className={cn(
            'font-medium',
            gestor.load > 80 ? 'text-red-600' :
            gestor.load > 50 ? 'text-amber-600' :
            'text-green-600'
          )}>
            {gestor.activeLeadsCount}/{gestor.maxLeads} leads ({gestor.load}%)
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              gestor.load > 80 ? 'bg-red-500' :
              gestor.load > 50 ? 'bg-amber-500' :
              'bg-green-500'
            )}
            style={{ width: `${gestor.load}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-lg p-2">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-0.5">
            <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.5} />
            Pipeline
          </div>
          <p className="font-semibold text-slate-900">{formatCurrency(gestor.pipeline)}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-0.5">
            <Trophy className="h-3.5 w-3.5" strokeWidth={1.5} />
            Guanyats
          </div>
          <p className="font-semibold text-slate-900">{gestor.wonCount}</p>
        </div>
      </div>
    </div>
  )
}