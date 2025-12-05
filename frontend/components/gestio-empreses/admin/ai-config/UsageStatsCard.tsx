// components/gestio-empreses/admin/ai-config/UsageStatsCard.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  Activity,
  TrendingUp,
  Calendar,
  DollarSign,
  Zap,
  Users,
  BarChart3,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIUsageStats, getAIUsageStats } from '@/lib/gestio-empreses/actions/ai-config-actions'

export function UsageStatsCard() {
  const [stats, setStats] = useState<AIUsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'providers' | 'usecases'>('overview')

  const loadStats = async () => {
    setLoading(true)
    setError(null)
    const result = await getAIUsageStats()

    if (result.success && result.data) {
      setStats(result.data)
    } else {
      setError(result.error || 'Error carregant estadístiques')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadStats()
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toLocaleString()
  }

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
        <div className="text-center">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={loadStats}
            className="mt-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Tornar a intentar
          </button>
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border-blue-200 flex items-center justify-center">
            <Activity className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-medium text-slate-900">Estadístiques d'ús</h3>
            <p className="text-xs text-slate-500">Seguiment de l'activitat d'IA</p>
          </div>
        </div>

        <button
          onClick={loadStats}
          className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          title="Actualitzar estadístiques"
        >
          <RefreshCw className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100">
        {[
          { key: 'overview', label: 'Resum', icon: BarChart3 },
          { key: 'providers', label: 'Proveïdors', icon: Users },
          { key: 'usecases', label: 'Casos d\'ús', icon: Zap }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={cn(
              'flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors',
              activeTab === tab.key
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <tab.icon className="h-4 w-4" strokeWidth={1.5} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Calendar className="h-4 w-4 text-orange-500 mr-1" strokeWidth={1.5} />
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {formatNumber(stats.totalTokensToday)}
              </p>
              <p className="text-xs text-slate-500">Tokens avui</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" strokeWidth={1.5} />
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {formatNumber(stats.totalTokensMonth)}
              </p>
              <p className="text-xs text-slate-500">Tokens aquest mes</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Activity className="h-4 w-4 text-blue-500 mr-1" strokeWidth={1.5} />
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {stats.totalRequestsToday}
              </p>
              <p className="text-xs text-slate-500">Peticions avui</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <DollarSign className="h-4 w-4 text-purple-500 mr-1" strokeWidth={1.5} />
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(stats.costEstimateMonth)}
              </p>
              <p className="text-xs text-slate-500">Cost estimat</p>
            </div>
          </div>
        )}

        {activeTab === 'providers' && (
          <div className="space-y-3">
            {stats.byProvider.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                No hi ha dades de proveïdors disponibles
              </p>
            ) : (
              stats.byProvider.map((provider) => (
                <div key={provider.providerId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm text-slate-900">{provider.providerName}</p>
                    <p className="text-xs text-slate-500">
                      {formatNumber(provider.tokens)} tokens · {provider.requests} peticions
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">
                      {formatCurrency(provider.cost)}
                    </p>
                    <p className="text-xs text-slate-500">Cost</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'usecases' && (
          <div className="space-y-3">
            {stats.byUseCase.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                No hi ha dades de casos d'ús disponibles
              </p>
            ) : (
              stats.byUseCase.map((usecase) => (
                <div key={usecase.useCase} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm text-slate-900">
                      {usecase.useCase === 'LEADS' ? 'Generació de Leads' : 'Creació de Contingut'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {usecase.requests} peticions
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">
                      {formatNumber(usecase.tokens)}
                    </p>
                    <p className="text-xs text-slate-500">Tokens</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}