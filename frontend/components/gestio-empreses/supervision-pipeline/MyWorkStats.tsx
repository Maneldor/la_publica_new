// components/gestio-empreses/supervision-pipeline/MyWorkStats.tsx
'use client'

import { Users, Building2, Clock, CheckCircle2, TrendingUp, AlertCircle, FileCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatCard } from './StatCard'

interface MyWorkStatsData {
  leadsAssigned: number
  leadsInProgress: number
  leadsCompleted: number
  empresesAssigned: number
  empresesInProgress: number
  empresesActive: number
  pendingVerification: number
  pendingPreContract: number
  thisMonth: {
    leadsCompleted: number
    empresesActivated: number
    conversionRate: number
  }
}

interface MyWorkStatsProps {
  data: MyWorkStatsData
  userRole: string
}

export function MyWorkStats({ data, userRole }: MyWorkStatsProps) {
  const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO'].includes(userRole)
  const isCRM = ['CRM_COMERCIAL', 'CRM_CONTINGUT'].includes(userRole)

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
        La meva feina
      </h2>

      {/* Grid principal d'estadistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          title="Leads en progres"
          value={data.leadsInProgress}
          icon={Users}
          variant={data.leadsInProgress > 10 ? 'warning' : 'default'}
          size="sm"
        />
        <StatCard
          title="Leads completats"
          value={data.leadsCompleted}
          icon={CheckCircle2}
          variant="success"
          size="sm"
        />
        <StatCard
          title="Empreses actives"
          value={data.empresesActive}
          icon={Building2}
          variant="success"
          size="sm"
        />
        <StatCard
          title="Conversio"
          value={`${data.thisMonth.conversionRate}%`}
          icon={TrendingUp}
          variant={data.thisMonth.conversionRate >= 20 ? 'success' : 'warning'}
          size="sm"
        />
      </div>

      {/* Alertes i pendents */}
      {(data.pendingVerification > 0 || data.pendingPreContract > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.pendingVerification > 0 && (isCRM || isAdmin) && (
            <div className={cn(
              'flex items-center gap-3 p-3 rounded-lg',
              'bg-amber-50 border border-amber-200'
            )}>
              <AlertCircle className="h-5 w-5 text-amber-600" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  {data.pendingVerification} leads per verificar
                </p>
                <p className="text-xs text-amber-600">Requereix atenció</p>
              </div>
            </div>
          )}
          {data.pendingPreContract > 0 && (isAdmin) && (
            <div className={cn(
              'flex items-center gap-3 p-3 rounded-lg',
              'bg-blue-50 border border-blue-200'
            )}>
              <FileCheck className="h-5 w-5 text-blue-600" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  {data.pendingPreContract} pre-contractes
                </p>
                <p className="text-xs text-blue-600">Pendents de formalitzar</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resum del mes */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Aquest mes
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {data.thisMonth.leadsCompleted}
            </p>
            <p className="text-xs text-slate-500">Leads tancats</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {data.thisMonth.empresesActivated}
            </p>
            <p className="text-xs text-slate-500">Empreses activades</p>
          </div>
          <div>
            <p className={cn(
              'text-2xl font-bold',
              data.thisMonth.conversionRate >= 20 ? 'text-green-600' : 'text-amber-600'
            )}>
              {data.thisMonth.conversionRate}%
            </p>
            <p className="text-xs text-slate-500">Taxa conversio</p>
          </div>
        </div>
      </div>
    </div>
  )
}
