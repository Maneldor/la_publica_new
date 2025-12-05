// components/gestio-empreses/crm/GestorCard.tsx
import {
  User,
  Target,
  Building2,
  TrendingUp,
  Phone,
  Mail,
  Euro,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface GestorMetrics {
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

interface GestorData {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
  metrics: GestorMetrics
}

const roleConfig: Record<string, { label: string; color: string }> = {
  EMPLOYEE: { label: 'Estàndard', color: 'bg-slate-100 text-slate-700' },
  ACCOUNT_MANAGER: { label: 'Estratègic', color: 'bg-blue-100 text-blue-700' },
  ADMIN: { label: 'Enterprise', color: 'bg-purple-100 text-purple-700' },
}

export function GestorCard({ gestor }: { gestor: GestorData }) {
  const role = roleConfig[gestor.role] || roleConfig.EMPLOYEE

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K €`
    }
    return `${value} €`
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
              {gestor.image ? (
                <img
                  src={gestor.image}
                  alt={gestor.name || ''}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <User className="h-6 w-6 text-slate-500" strokeWidth={1.5} />
              )}
            </div>
            <div>
              <h3 className="font-medium text-slate-900">
                {gestor.name || gestor.email}
              </h3>
              <span className={cn(
                'inline-block px-2 py-0.5 text-xs font-medium rounded mt-1',
                role.color
              )}>
                {role.label}
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-2xl font-semibold text-slate-900">
              {gestor.metrics.conversionRate}%
            </p>
            <p className="text-xs text-slate-500">conversió</p>
          </div>
        </div>
      </div>

      {/* Mètriques */}
      <div className="p-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-slate-600">
            <Target className="h-4 w-4" strokeWidth={1.5} />
            <span className="text-lg font-semibold">{gestor.metrics.activeLeads}</span>
          </div>
          <p className="text-xs text-slate-500">Leads actius</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-green-600">
            <TrendingUp className="h-4 w-4" strokeWidth={1.5} />
            <span className="text-lg font-semibold">{gestor.metrics.wonThisMonth}</span>
          </div>
          <p className="text-xs text-slate-500">Guanyats/mes</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-slate-600">
            <Building2 className="h-4 w-4" strokeWidth={1.5} />
            <span className="text-lg font-semibold">{gestor.metrics.activeCompanies}</span>
          </div>
          <p className="text-xs text-slate-500">Empreses</p>
        </div>
      </div>

      {/* Pipeline i activitat */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-slate-600">
              <Euro className="h-3.5 w-3.5 inline mr-1" strokeWidth={1.5} />
              {formatCurrency(gestor.metrics.pipelineValue)}
            </span>
            <span className="text-slate-500">
              <Phone className="h-3.5 w-3.5 inline mr-1" strokeWidth={1.5} />
              {gestor.metrics.callsThisMonth}
            </span>
            <span className="text-slate-500">
              <Mail className="h-3.5 w-3.5 inline mr-1" strokeWidth={1.5} />
              {gestor.metrics.emailsThisMonth}
            </span>
          </div>
          <Link
            href={`/gestio/crm/equip/${gestor.id}`}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Detall
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </div>
  )
}