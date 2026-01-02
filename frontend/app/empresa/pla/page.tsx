'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Crown,
  TrendingUp,
  Users,
  FileText,
  Ticket,
  CheckCircle2,
  XCircle,
  Zap,
  Shield,
  Sparkles,
  Loader2,
  AlertCircle,
  LucideIcon
} from 'lucide-react'

interface PlanData {
  plan: {
    tier: string
    name: string
    price: number
    limits: {
      maxOffers: number | string
      maxActiveOffers: number | string
      maxCouponsPerMonth: number | string
      maxTeamMembers: number | string
    }
    features: Record<string, boolean>
  }
  config: {
    funcionalidades?: string
    [key: string]: any
  }
  usage: {
    offers: { current: number; limit: number | string; percentage: number }
    activeOffers: { current: number; limit: number | string; percentage: number }
    coupons: { current: number; limit: number | string; percentage: number }
    team: { current: number; limit: number | string; percentage: number }
  }
}

export default function ElMeuPlaPage() {
  const [planData, setPlanData] = useState<PlanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPlanData = async () => {
      try {
        const response = await fetch('/api/empresa/plan')
        const data = await response.json()

        if (data.success) {
          setPlanData(data)
        } else {
          setError(data.error || 'Error carregant el pla')
        }
      } catch (err) {
        console.error('Error:', err)
        setError('Error de connexió')
      } finally {
        setLoading(false)
      }
    }

    loadPlanData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-slate-500">Carregant pla...</p>
        </div>
      </div>
    )
  }

  if (error || !planData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="text-slate-900 font-medium">Error carregant el pla</p>
          <p className="text-slate-500">{error}</p>
        </div>
      </div>
    )
  }

  const { plan, config, usage } = planData

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
            <Crown className="h-6 w-6 text-slate-600" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">El Meu Pla</h1>
            <p className="text-slate-500">Gestiona la teva subscripció i límits</p>
          </div>
        </div>

        {plan.tier !== 'ENTERPRISE' && (
          <Link
            href="/empresa/pla/millorar"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <TrendingUp className="h-4 w-4" strokeWidth={1.5} />
            Millorar pla
          </Link>
        )}
      </div>

      {/* Plan Actual Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-7 h-7" strokeWidth={1.5} />
              <h2 className="text-2xl font-semibold">{plan.name}</h2>
            </div>
            <p className="text-blue-100">El teu pla actual</p>
          </div>

          <div className="text-right">
            <div className="text-3xl font-semibold">
              {plan.price === 0 ? 'Gratis' : `${plan.price}€`}
            </div>
            {plan.price > 0 && (
              <div className="text-blue-100 text-sm">per mes</div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickStat
            icon={FileText}
            label="Ofertes"
            current={usage.offers.current}
            limit={usage.offers.limit}
            percentage={usage.offers.percentage}
          />
          <QuickStat
            icon={Zap}
            label="Ofertes Actives"
            current={usage.activeOffers.current}
            limit={usage.activeOffers.limit}
            percentage={usage.activeOffers.percentage}
          />
          <QuickStat
            icon={Ticket}
            label="Cupons (mes)"
            current={usage.coupons.current}
            limit={usage.coupons.limit}
            percentage={usage.coupons.percentage}
          />
          <QuickStat
            icon={Users}
            label="Equip"
            current={usage.team.current}
            limit={usage.team.limit}
            percentage={usage.team.percentage}
          />
        </div>
      </div>

      {/* Usage Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Límits d'Ús */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
            Límits d'Ús
          </h3>

          <div className="space-y-4">
            <UsageBar
              label="Ofertes Totals"
              current={usage.offers.current}
              limit={usage.offers.limit}
              percentage={usage.offers.percentage}
            />
            <UsageBar
              label="Ofertes Actives"
              current={usage.activeOffers.current}
              limit={usage.activeOffers.limit}
              percentage={usage.activeOffers.percentage}
            />
            <UsageBar
              label="Cupons Aquest Mes"
              current={usage.coupons.current}
              limit={usage.coupons.limit}
              percentage={usage.coupons.percentage}
            />
            <UsageBar
              label="Membres d'Equip"
              current={usage.team.current}
              limit={usage.team.limit}
              percentage={usage.team.percentage}
            />
          </div>
        </div>

        {/* Features Actives */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
            Funcionalitats del Pla
          </h3>

          <div className="space-y-2">
            {Object.entries(plan.features)
              .filter(([key, value]) => {
                if (!value) return false
                if (config?.funcionalidades) {
                  const lines = config.funcionalidades.split('\n').filter((line: string) => line.trim())
                  const index = parseInt(key)
                  return !isNaN(index) && lines[index]
                }
                return true
              })
              .map(([key, value]) => (
                <FeatureItem
                  key={key}
                  label={formatFeatureName(key, { config })}
                  active={!!value}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Components auxiliars

function QuickStat({
  icon: Icon,
  label,
  current,
  limit,
  percentage
}: {
  icon: LucideIcon
  label: string
  current: number
  limit: number | string
  percentage: number
}) {
  const isUnlimited = limit === 'unlimited'
  const isNearLimit = percentage >= 80 && !isUnlimited

  return (
    <div className="bg-white/10 backdrop-blur rounded-lg p-3">
      <Icon className="w-4 h-4 mb-2 text-blue-200" strokeWidth={1.5} />
      <div className="text-xl font-semibold">
        {current}
        {!isUnlimited && <span className="text-base font-normal text-blue-200">/{limit}</span>}
      </div>
      <div className="text-sm text-blue-100">{label}</div>
      {isNearLimit && (
        <div className="text-xs text-amber-300 mt-1">Prop del límit</div>
      )}
    </div>
  )
}

function UsageBar({
  label,
  current,
  limit,
  percentage
}: {
  label: string
  current: number
  limit: number | string
  percentage: number
}) {
  const isUnlimited = limit === 'unlimited'
  const isNearLimit = percentage >= 80 && !isUnlimited
  const isAtLimit = percentage >= 100 && !isUnlimited

  const barColor = isAtLimit
    ? 'bg-red-500'
    : isNearLimit
    ? 'bg-amber-500'
    : 'bg-blue-600'

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-700 font-medium">{label}</span>
        <span className="text-slate-500">
          {current} {!isUnlimited && `/ ${limit}`}
        </span>
      </div>

      {!isUnlimited ? (
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className={`${barColor} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      ) : (
        <div className="text-xs text-slate-400 italic">Il·limitat</div>
      )}
    </div>
  )
}

function formatFeatureName(key: string, planData?: any): string {
  if (planData?.config?.funcionalidades) {
    const lines = planData.config.funcionalidades.split('\n').filter((line: string) => line.trim())
    const index = parseInt(key)
    if (!isNaN(index) && lines[index]) {
      return lines[index].trim()
    }
  }

  const translations: Record<string, string> = {
    canCreateOffers: 'Crear ofertes',
    canManageTeam: 'Gestionar equip',
    canUseAdvancedFilters: 'Filtres avançats',
    canExportData: 'Exportar dades',
    canUsePremiumSupport: 'Suport premium',
    canUseCustomBranding: 'Marca personalitzada',
    canUseAnalytics: 'Analítiques',
    canUseCoupons: 'Cupons',
    canUseFeaturedOffers: 'Ofertes destacades',
    canUseCustomFields: 'Camps personalitzats'
  }

  if (translations[key]) {
    return translations[key]
  }

  const featuresByIndex: Record<string, string> = {
    '0': 'Crear ofertes bàsiques',
    '1': 'Gestió d\'equip',
    '2': 'Analítiques bàsiques',
    '3': 'Suport per email',
    '4': 'Exportar dades CSV',
    '5': 'Filtres avançats',
    '6': 'Ofertes destacades'
  }

  return featuresByIndex[key] || `Funcionalitat ${key}`
}

function FeatureItem({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {active ? (
        <CheckCircle2 className="w-5 h-5 text-green-500" />
      ) : (
        <XCircle className="w-5 h-5 text-slate-300" />
      )}
      <span className={active ? 'text-slate-900' : 'text-slate-400'}>
        {label}
      </span>
    </div>
  )
}
