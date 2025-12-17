// components/gestio-empreses/admin/ai-config/AIConfigContent.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  Brain,
  RefreshCw,
  AlertCircle,
  Database,
  Plus,
  X,
  FileText,
  MessageSquare,
  Search,
  Zap,
  Globe,
  FileSearch,
  Bot,
  Sparkles,
  ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProviderCard } from './ProviderCard'
import { UseCaseCard } from './UseCaseCard'
import { UsageStatsCard } from './UsageStatsCard'
import {
  AIProviderWithModels,
  AIConfigurationWithRelations,
  getAIProviders,
  getAIConfigurations,
  seedAIProvidersAndQuotas,
  createAIConfiguration
} from '@/lib/gestio-empreses/actions/ai-config-actions'

const useCaseOptions = [
  { value: 'DOCUMENTS', label: 'Anàlisi de documents' },
  { value: 'CHAT', label: 'Assistència / Chat' },
  { value: 'TRANSLATION', label: 'Traducció' },
  { value: 'SUMMARY', label: 'Resum de textos' },
  { value: 'ANALYSIS', label: 'Anàlisi de dades' },
  { value: 'AUTOMATION', label: 'Automatització' },
  { value: 'CUSTOM', label: 'Personalitzat' },
]

const iconOptions = [
  { value: 'FileText', label: 'Document', icon: FileText },
  { value: 'MessageSquare', label: 'Missatge', icon: MessageSquare },
  { value: 'Search', label: 'Cerca', icon: Search },
  { value: 'Zap', label: 'Automatització', icon: Zap },
  { value: 'Globe', label: 'Traducció', icon: Globe },
  { value: 'FileSearch', label: 'Anàlisi', icon: FileSearch },
  { value: 'Bot', label: 'Bot', icon: Bot },
  { value: 'Sparkles', label: 'IA', icon: Sparkles },
]

const colorOptions = [
  { value: 'purple', label: 'Porpra', class: 'bg-purple-100 text-purple-700' },
  { value: 'blue', label: 'Blau', class: 'bg-blue-100 text-blue-700' },
  { value: 'green', label: 'Verd', class: 'bg-green-100 text-green-700' },
  { value: 'orange', label: 'Taronja', class: 'bg-orange-100 text-orange-700' },
  { value: 'pink', label: 'Rosa', class: 'bg-pink-100 text-pink-700' },
  { value: 'cyan', label: 'Cian', class: 'bg-cyan-100 text-cyan-700' },
  { value: 'amber', label: 'Ambre', class: 'bg-amber-100 text-amber-700' },
  { value: 'indigo', label: 'Índigo', class: 'bg-indigo-100 text-indigo-700' },
]

export function AIConfigContent() {
  const [providers, setProviders] = useState<AIProviderWithModels[]>([])
  const [configurations, setConfigurations] = useState<AIConfigurationWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [seeding, setSeeding] = useState(false)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    useCase: 'CUSTOM',
    name: '',
    description: '',
    icon: 'Sparkles',
    color: 'purple',
    providerId: '',
    modelId: '',
    temperature: 0.7,
    maxTokens: 2000,
  })

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
        // Set default provider
        if (providersResult.data.length > 0 && !formData.providerId) {
          const firstActive = providersResult.data.find(p => p.isActive)
          if (firstActive) {
            setFormData(prev => ({
              ...prev,
              providerId: firstActive.id,
              modelId: firstActive.models.find(m => m.isActive)?.id || ''
            }))
          }
        }
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

  const handleSeed = async () => {
    if (!confirm('Crear/actualitzar proveïdors d\'IA (Anthropic, OpenAI, Gemini, DeepSeek) amb els seus models i quotes per rol?')) return

    setSeeding(true)
    try {
      const result = await seedAIProvidersAndQuotas()

      if (result.success) {
        alert(result.message)
        loadData()
      } else {
        alert(result.error || 'Error')
      }
    } catch (err) {
      console.error('Error:', err)
      alert('Error creant configuració')
    } finally {
      setSeeding(false)
    }
  }

  const handleProviderChange = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId)
    const activeModels = provider?.models.filter(m => m.isActive) || []

    setFormData({
      ...formData,
      providerId,
      modelId: activeModels[0]?.id || ''
    })
  }

  const handleCreateConfig = async () => {
    if (!formData.name.trim()) {
      alert('El nom és obligatori')
      return
    }
    if (!formData.providerId || !formData.modelId) {
      alert('Has de seleccionar un proveïdor i model')
      return
    }

    setCreating(true)
    try {
      const result = await createAIConfiguration({
        useCase: formData.useCase,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        icon: formData.icon,
        color: formData.color,
        providerId: formData.providerId,
        modelId: formData.modelId,
        temperature: formData.temperature,
        maxTokens: formData.maxTokens,
      })

      if (result.success) {
        setShowModal(false)
        setFormData({
          useCase: 'CUSTOM',
          name: '',
          description: '',
          icon: 'Sparkles',
          color: 'purple',
          providerId: providers.find(p => p.isActive)?.id || '',
          modelId: '',
          temperature: 0.7,
          maxTokens: 2000,
        })
        loadData()
      } else {
        alert(result.error || 'Error creant configuració')
      }
    } catch (err) {
      console.error('Error:', err)
      alert('Error creant configuració')
    } finally {
      setCreating(false)
    }
  }

  const selectedProvider = providers.find(p => p.id === formData.providerId)
  const availableModels = selectedProvider?.models.filter(m => m.isActive) || []

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
          <button
            onClick={handleSeed}
            disabled={seeding || loading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-300 rounded-lg hover:bg-amber-100 disabled:opacity-50"
          >
            <Database className={`h-4 w-4 ${seeding ? 'animate-pulse' : ''}`} strokeWidth={1.5} />
            {seeding ? 'Creant...' : 'Generar Configuració'}
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
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">
              {configurations.filter(c => c.isActive).length} de {configurations.length} actius
            </span>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              Nou cas d'ús
            </button>
          </div>
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
            <p className="text-slate-500 text-sm mb-4">
              Crea la primera configuració per començar a usar IA.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              Crear configuració
            </button>
          </div>
        )}
      </section>

      {/* Modal per crear nou cas d'ús */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Nou cas d'ús d'IA</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Form */}
            <div className="p-4 space-y-4">
              {/* Tipus de cas d'ús */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Tipus de cas d'ús
                </label>
                <div className="relative">
                  <select
                    value={formData.useCase}
                    onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
                    className="w-full h-10 px-3 pr-10 text-sm text-slate-900 border border-slate-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {useCaseOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" strokeWidth={1.5} />
                </div>
              </div>

              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Anàlisi de contractes"
                  className="w-full h-10 px-3 text-sm text-slate-900 placeholder-slate-400 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Descripció */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Descripció
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripció breu del cas d'ús..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm text-slate-900 placeholder-slate-400 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              {/* Icona i Color */}
              <div className="grid grid-cols-2 gap-4">
                {/* Icona */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Icona
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {iconOptions.map((option) => {
                      const Icon = option.icon
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon: option.value })}
                          className={cn(
                            'p-2 rounded-lg border transition-colors',
                            formData.icon === option.value
                              ? 'border-blue-500 bg-blue-50 text-blue-600'
                              : 'border-slate-200 text-slate-500 hover:border-slate-300'
                          )}
                          title={option.label}
                        >
                          <Icon className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {colorOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: option.value })}
                        className={cn(
                          'w-8 h-8 rounded-lg border-2 transition-colors',
                          option.class,
                          formData.color === option.value
                            ? 'ring-2 ring-offset-1 ring-blue-500'
                            : 'border-transparent'
                        )}
                        title={option.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Proveïdor i Model */}
              <div className="grid grid-cols-2 gap-4">
                {/* Proveïdor */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Proveïdor *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.providerId}
                      onChange={(e) => handleProviderChange(e.target.value)}
                      className="w-full h-10 px-3 pr-10 text-sm text-slate-900 border border-slate-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Selecciona...</option>
                      {providers.filter(p => p.isActive).map((provider) => (
                        <option key={provider.id} value={provider.id}>{provider.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" strokeWidth={1.5} />
                  </div>
                </div>

                {/* Model */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Model *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.modelId}
                      onChange={(e) => setFormData({ ...formData, modelId: e.target.value })}
                      className="w-full h-10 px-3 pr-10 text-sm text-slate-900 border border-slate-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={!formData.providerId}
                    >
                      <option value="">Selecciona...</option>
                      {availableModels.map((model) => (
                        <option key={model.id} value={model.id}>{model.displayName}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" strokeWidth={1.5} />
                  </div>
                </div>
              </div>

              {/* Temperatura i Tokens */}
              <div className="grid grid-cols-2 gap-4">
                {/* Temperatura */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Temperatura ({formData.temperature})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>Precís</span>
                    <span>Creatiu</span>
                  </div>
                </div>

                {/* Màx tokens */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Màx tokens
                  </label>
                  <input
                    type="number"
                    value={formData.maxTokens}
                    onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) || 2000 })}
                    min={100}
                    max={16000}
                    className="w-full h-10 px-3 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel·lar
              </button>
              <button
                onClick={handleCreateConfig}
                disabled={creating || !formData.name || !formData.providerId || !formData.modelId}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creant...' : 'Crear cas d\'ús'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
