'use client'

import { Target, TrendingUp, Users, DollarSign, CheckCircle, Clock, Trophy, BarChart } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { KPIData } from '@/lib/gestio-empreses/statistics-actions'

interface KPICardsProps {
  data: KPIData | null
  isLoading?: boolean
}

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: any
  color: string
  bgColor: string
  trend?: {
    value: number
    isPositive: boolean
    label: string
  }
}

function KPICard({ title, value, subtitle, icon: Icon, color, bgColor, trend }: KPICardProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', bgColor)}>
              <Icon className={cn('h-5 w-5', color)} strokeWidth={1.5} />
            </div>
            <h3 className="font-medium text-slate-700 text-sm">{title}</h3>
          </div>

          <div className="space-y-1">
            <p className="text-2xl font-bold text-slate-900">
              {typeof value === 'number' && value > 999
                ? value.toLocaleString('ca-ES')
                : value}
            </p>
            {subtitle && (
              <p className="text-xs text-slate-500">{subtitle}</p>
            )}
          </div>

          {trend && (
            <div className="flex items-center gap-1 mt-3">
              <div className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                trend.isPositive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              )}>
                <TrendingUp className={cn(
                  'h-3 w-3',
                  trend.isPositive ? '' : 'rotate-180'
                )} strokeWidth={1.5} />
                {trend.value}%
              </div>
              <span className="text-xs text-slate-500">{trend.label}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function KPICardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-slate-200" />
        <div className="h-4 bg-slate-200 rounded w-24" />
      </div>
      <div className="space-y-2">
        <div className="h-8 bg-slate-200 rounded w-20" />
        <div className="h-3 bg-slate-200 rounded w-16" />
      </div>
    </div>
  )
}

export function KPICards({ data, isLoading = false }: KPICardsProps) {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }, (_, i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Primera fila - KPIs principales */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">KPIs Principals</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Leads"
            value={data.totalLeads}
            icon={Target}
            color="text-blue-600"
            bgColor="bg-blue-100"
            trend={{
              value: 12.5,
              isPositive: true,
              label: "vs mes anterior"
            }}
          />
          <KPICard
            title="Conversions"
            value={data.totalConversions}
            icon={CheckCircle}
            color="text-green-600"
            bgColor="bg-green-100"
            trend={{
              value: 8.2,
              isPositive: true,
              label: "vs mes anterior"
            }}
          />
          <KPICard
            title="Taxa de Conversió"
            value={`${data.conversionRate}%`}
            icon={Trophy}
            color="text-purple-600"
            bgColor="bg-purple-100"
            trend={{
              value: 2.1,
              isPositive: false,
              label: "vs mes anterior"
            }}
          />
          <KPICard
            title="Temps Mitjà de Tancament"
            value={`${data.averageTimeToClose} dies`}
            icon={Clock}
            color="text-amber-600"
            bgColor="bg-amber-100"
            trend={{
              value: 5.3,
              isPositive: false,
              label: "millor que abans"
            }}
          />
        </div>
      </div>

      {/* Segunda fila - Métricas financieras */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Mètriques Financeres</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Valor Pipeline"
            value={`${(data.pipelineValue / 1000000).toFixed(1)}M €`}
            subtitle="valor total en curs"
            icon={BarChart}
            color="text-indigo-600"
            bgColor="bg-indigo-100"
            trend={{
              value: 15.7,
              isPositive: true,
              label: "vs mes anterior"
            }}
          />
          <KPICard
            title="Deals Actius"
            value={data.activeDeals}
            subtitle="oportunitats obertes"
            icon={Target}
            color="text-cyan-600"
            bgColor="bg-cyan-100"
          />
          <KPICard
            title="Ingressos Totals"
            value={`${(data.totalRevenue / 1000000).toFixed(1)}M €`}
            subtitle="ingressos confirmats"
            icon={DollarSign}
            color="text-emerald-600"
            bgColor="bg-emerald-100"
            trend={{
              value: 22.8,
              isPositive: true,
              label: "vs mes anterior"
            }}
          />
          <KPICard
            title="Creixement Mensual"
            value={`${data.monthlyGrowth}%`}
            subtitle="creixement d'ingressos"
            icon={TrendingUp}
            color="text-rose-600"
            bgColor="bg-rose-100"
            trend={{
              value: 3.2,
              isPositive: true,
              label: "acceleració"
            }}
          />
        </div>
      </div>
    </div>
  )
}