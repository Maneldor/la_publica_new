// components/gestio-empreses/admin/ai-config/AIConfigContent.tsx
'use client'

import { useState, useEffect } from 'react'
import { Brain, RefreshCw, AlertCircle } from 'lucide-react'
import { ProviderCard } from './ProviderCard'
import { UseCaseCard } from './UseCaseCard'
import { UsageStatsCard } from './UsageStatsCard'
import {
  AIProviderWithModels,
  AIConfigurationWithRelations,
  getAIProviders,
  getAIConfigurations
} from '@/lib/gestio-empreses/actions/ai-config-actions'

export function AIConfigContent() {
  const [providers, setProviders] = useState<AIProviderWithModels[]>([])
  const [configurations, setConfigurations] = useState<AIConfigurationWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [providersResult, configurationsResult] = await Promise.all([
        getAIProviders(),
        getAIConfigurations()
      ])

      if (providersResult.success && providersResult.data) {
        setProviders(providersResult.data)
      } else {
        throw new Error(providersResult.error || 'Error carregant proveïdors')
      }

      if (configurationsResult.success && configurationsResult.data) {
        setConfigurations(configurationsResult.data)
      } else {
        throw new Error(configurationsResult.error || 'Error carregant configuracions')
      }

      setLastUpdate(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconegut')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleUpdate = () => {
    loadData()
  }

  if (loading && providers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregant configuració d'IA...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <AlertCircle className="h-5 w-5 text-red-600" strokeWidth={1.5} />
          <h3 className="font-medium text-red-900">Error de càrrega</h3>
        </div>
        <p className="text-red-700 text-sm mb-4">{error}</p>
        <button
          onClick={loadData}
          className="w-full px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
        >
          Tornar a intentar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Brain className="h-5 w-5 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Configuració d'Intel·ligència Artificial</h1>
            <p className="text-slate-600">Gestió de proveïdors, models i configuracions d'IA</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-sm text-slate-500">
            <p>Última actualització</p>
            <p>{lastUpdate.toLocaleTimeString('ca-ES')}</p>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50"
            title="Actualitzar dades"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Estadístiques d'ús */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Estadístiques d'ús</h2>
        <UsageStatsCard />
      </section>

      {/* Proveïdors d'IA */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Proveïdors d'IA</h2>
          <span className="text-sm text-slate-500">
            {providers.filter(p => p.isActive).length} de {providers.length} actius
          </span>
        </div>

        <div className="grid gap-4">
          {providers.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              onUpdate={handleUpdate}
            />
          ))}
        </div>

        {providers.length === 0 && !loading && (
          <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
            <Brain className="h-12 w-12 text-slate-400 mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="font-medium text-slate-900 mb-2">No hi ha proveïdors configurats</h3>
            <p className="text-slate-500 text-sm">
              Contacta amb l'administrador del sistema per configurar els proveïdors d'IA.
            </p>
          </div>
        )}
      </section>

      {/* Configuracions per cas d'ús */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Configuracions per cas d'ús</h2>
          <span className="text-sm text-slate-500">
            {configurations.filter(c => c.isActive).length} de {configurations.length} actius
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {configurations.map((configuration) => (
            <UseCaseCard
              key={configuration.id}
              config={configuration}
              providers={providers}
              onUpdate={handleUpdate}
            />
          ))}
        </div>

        {configurations.length === 0 && !loading && (
          <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
            <Brain className="h-12 w-12 text-slate-400 mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="font-medium text-slate-900 mb-2">No hi ha configuracions d'ús</h3>
            <p className="text-slate-500 text-sm">
              Contacta amb l'administrador del sistema per configurar els casos d'ús d'IA.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}