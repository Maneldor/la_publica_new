// components/gestio-empreses/supervision-pipeline/TeamMemberCard.tsx
'use client'

import { Users, Building2, TrendingUp, Clock, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PerformanceBar } from './PerformanceBar'

interface TeamMemberStats {
  id: string
  name: string
  email: string
  role: string
  image?: string
  stats: {
    leadsTotal: number
    leadsInProgress: number
    leadsCompleted: number
    empresesTotal: number
    empresesActive: number
    conversionRate: number
    avgDaysToConvert: number
  }
  recentActivity: {
    lastLeadUpdate?: string
    lastEmpresaUpdate?: string
  }
}

interface TeamMemberCardProps {
  member: TeamMemberStats
  onClick?: () => void
  compact?: boolean
}

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrador',
  ADMIN_GESTIO: 'Admin Gestio',
  CRM_COMERCIAL: 'CRM Comercial',
  CRM_CONTINGUT: 'CRM Contingut',
  GESTOR_ESTANDARD: 'Gestor Estandard',
  GESTOR_ESTRATEGIC: 'Gestor Estrategic',
  GESTOR_ENTERPRISE: 'Gestor Enterprise',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatLastActivity(dateStr?: string): string {
  if (!dateStr) return 'Mai'
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 5) return 'Ara'
  if (diffMins < 60) return `Fa ${diffMins}m`
  if (diffHours < 24) return `Fa ${diffHours}h`
  if (diffDays === 1) return 'Ahir'
  if (diffDays < 7) return `Fa ${diffDays}d`
  return date.toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' })
}

export function TeamMemberCard({ member, onClick, compact = false }: TeamMemberCardProps) {
  const lastActivity = member.recentActivity.lastLeadUpdate || member.recentActivity.lastEmpresaUpdate

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={cn(
          'w-full text-left p-3 rounded-lg border border-slate-200 bg-white',
          'hover:border-slate-300 hover:shadow-sm transition-all'
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {member.image ? (
              <img
                src={member.image}
                alt={member.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <span className="text-xs font-medium text-slate-600">
                  {getInitials(member.name)}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium text-slate-900 text-sm">{member.name}</p>
              <p className="text-xs text-slate-500">{roleLabels[member.role] || member.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className={cn(
                'text-sm font-semibold',
                member.stats.conversionRate >= 20 ? 'text-green-600' : 'text-amber-600'
              )}>
                {member.stats.conversionRate}%
              </p>
              <p className="text-xs text-slate-500">conversio</p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300" strokeWidth={1.5} />
          </div>
        </div>
      </button>
    )
  }

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-slate-200 overflow-hidden',
        onClick && 'cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all'
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {member.image ? (
              <img
                src={member.image}
                alt={member.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <span className="text-sm font-medium text-slate-600">
                  {getInitials(member.name)}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium text-slate-900">{member.name}</p>
              <p className="text-xs text-slate-500">{roleLabels[member.role] || member.role}</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-500">Ultima activitat</p>
            <p className="text-sm font-medium text-slate-700">
              {formatLastActivity(lastActivity)}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 space-y-4">
        {/* Leads */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-slate-600">
              <Users className="h-4 w-4" strokeWidth={1.5} />
              Leads
            </span>
            <span className="font-medium text-slate-900">
              {member.stats.leadsCompleted} / {member.stats.leadsTotal}
            </span>
          </div>
          <PerformanceBar
            value={member.stats.leadsCompleted}
            max={Math.max(member.stats.leadsTotal, 1)}
            showPercentage={false}
            size="sm"
          />
        </div>

        {/* Empreses */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-slate-600">
              <Building2 className="h-4 w-4" strokeWidth={1.5} />
              Empreses
            </span>
            <span className="font-medium text-slate-900">
              {member.stats.empresesActive} / {member.stats.empresesTotal}
            </span>
          </div>
          <PerformanceBar
            value={member.stats.empresesActive}
            max={Math.max(member.stats.empresesTotal, 1)}
            showPercentage={false}
            size="sm"
          />
        </div>

        {/* Metriques */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div className="text-center">
            <p className={cn(
              'text-lg font-bold',
              member.stats.conversionRate >= 20 ? 'text-green-600' : 'text-amber-600'
            )}>
              {member.stats.conversionRate}%
            </p>
            <p className="text-xs text-slate-500">Conversio</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-slate-700">
              {member.stats.avgDaysToConvert || '-'}
            </p>
            <p className="text-xs text-slate-500">Dies mitja</p>
          </div>
        </div>
      </div>
    </div>
  )
}
