// components/gestio-empreses/admin/ai-config/UseCaseCard.tsx
'use client'

import { useState } from 'react'
import {
  Settings,
  Power,
  Users,
  FileText,
  Sparkles,
  ChevronDown,
  Cpu
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  AIConfigurationWithRelations,
  AIProviderWithModels,
  updateAIConfiguration
} from '@/lib/gestio-empreses/actions/ai-config-actions'
import { AIUseCase } from '@prisma/client'

interface UseCaseCardProps {
  config: AIConfigurationWithRelations
  providers: AIProviderWithModels[]
  onUpdate: () => void
}

const useCaseIcons: Record<AIUseCase, React.ReactNode> = {
  LEADS: <Users className="h-5 w-5" strokeWidth={1.5} />,
  CONTENT: <FileText className="h-5 w-5" strokeWidth={1.5} />
}

const useCaseColors: Record<AIUseCase, string> = {
  LEADS: 'bg-purple-100 text-purple-700',
  CONTENT: 'bg-blue-100 text-blue-700'
}

export function UseCaseCard({ config, providers, onUpdate }: UseCaseCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [formData, setFormData] = useState({
    providerId: config.providerId,
    modelId: config.modelId,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
    maxRequestsPerDay: config.maxRequestsPerDay || 0,
    maxTokensPerDay: config.maxTokensPerDay || 0
  })

  // Obtenir proveïdor seleccionat i els seus models actius
  const selectedProvider = providers.find(p => p.id === formData.providerId)
  const availableModels = selectedProvider?.models.filter(m => m.isActive) || []

  // Obtenir el model seleccionat actual
  const selectedModel = availableModels.find(m => m.id === formData.modelId)

  const handleToggleActive = async () => {
    setIsUpdating(true)
    await updateAIConfiguration(config.id, { isActive: !config.isActive })
    onUpdate()
    setIsUpdating(false)
  }

  const handleProviderChange = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId)
    const activeModels = provider?.models.filter(m => m.isActive) || []
    const firstActiveModel = activeModels[0]

    setFormData({
      ...formData,
      providerId,
      modelId: firstActiveModel?.id || ''
    })
  }

  const handleModelChange = (modelId: string) => {
    setFormData({
      ...formData,
      modelId
    })
  }

  const handleSave = async () => {
    if (!formData.modelId) {
      alert('Has de seleccionar un model')
      return
    }

    setIsUpdating(true)
    await updateAIConfiguration(config.id, {
      providerId: formData.providerId,
      modelId: formData.modelId,
      temperature: formData.temperature,
      maxTokens: formData.maxTokens,
      maxRequestsPerDay: formData.maxRequestsPerDay || null,
      maxTokensPerDay: formData.maxTokensPerDay || null
    })
    onUpdate()
    setIsUpdating(false)
    setIsEditing(false)
  }

  const handleCancel = () => {
    // Restaurar valors originals
    setFormData({
      providerId: config.providerId,
      modelId: config.modelId,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      maxRequestsPerDay: config.maxRequestsPerDay || 0,
      maxTokensPerDay: config.maxTokensPerDay || 0
    })
    setIsEditing(false)
  }

  return (
    <div className={cn(
      'bg-white border rounded-lg shadow-sm overflow-hidden',
      config.isActive ? 'border-slate-200' : 'border-slate-200 opacity-60'
    )}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            useCaseColors[config.useCase]
          )}>
            {useCaseIcons[config.useCase]}
          </div>
          <div>
            <h3 className="font-medium text-slate-900">{config.name}</h3>
            <p className="text-xs text-slate-500">{config.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleActive}
            disabled={isUpdating}
            className={cn(
              'p-2 rounded-lg transition-colors',
              config.isActive
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
            )}
            title={config.isActive ? 'Desactivar' : 'Activar'}
          >
            <Power className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              isEditing
                ? 'bg-blue-100 text-blue-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
            title="Configurar"
          >
            <Settings className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Current Config Summary */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 text-sm">
          <Sparkles className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
          <span className="text-slate-600">
            <span className="font-medium">{config.provider.name}</span>
            {' - '}
            <span className="font-medium">{config.model.displayName}</span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">
            Temp: {config.temperature} | Màx: {config.maxTokens.toLocaleString()} tokens
          </span>
        </div>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <div className="border-t border-slate-100 p-4 bg-slate-50">
          {/* SECCIÓ 1: Proveïdor i Model */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Cpu className="h-3.5 w-3.5" strokeWidth={1.5} />
              Proveïdor i Model
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {/* Proveïdor */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Proveïdor d'IA
                </label>
                <div className="relative">
                  <select
                    value={formData.providerId}
                    onChange={(e) => handleProviderChange(e.target.value)}
                    className="w-full h-10 px-3 pr-10 text-sm border border-slate-200 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                  >
                    {providers.filter(p => p.isActive).map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" strokeWidth={1.5} />
                </div>
              </div>

              {/* Model */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Model
                </label>
                <div className="relative">
                  <select
                    value={formData.modelId}
                    onChange={(e) => handleModelChange(e.target.value)}
                    className="w-full h-10 px-3 pr-10 text-sm border border-slate-200 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                  >
                    {availableModels.length === 0 ? (
                      <option value="">No hi ha models actius</option>
                    ) : (
                      availableModels.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.displayName}
                        </option>
                      ))
                    )}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" strokeWidth={1.5} />
                </div>
                {selectedModel && (
                  <p className="mt-1 text-xs text-slate-400">
                    {selectedModel.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SECCIÓ 2: Paràmetres del model */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Settings className="h-3.5 w-3.5" strokeWidth={1.5} />
              Paràmetres del model
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {/* Temperatura */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
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
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Precís (0)</span>
                  <span>Creatiu (1)</span>
                </div>
              </div>

              {/* Max Tokens */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Màx tokens per resposta
                </label>
                <input
                  type="number"
                  value={formData.maxTokens}
                  onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) || 0 })}
                  className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="100"
                  max="16000"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓ 3: Límits d'ús */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
              Límits d'ús diari
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {/* Peticions/dia */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Peticions/dia
                </label>
                <input
                  type="number"
                  value={formData.maxRequestsPerDay}
                  onChange={(e) => setFormData({ ...formData, maxRequestsPerDay: parseInt(e.target.value) || 0 })}
                  placeholder="Sense límit"
                  className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
                <p className="mt-1 text-xs text-slate-400">0 = sense límit</p>
              </div>

              {/* Tokens/dia */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Tokens/dia
                </label>
                <input
                  type="number"
                  value={formData.maxTokensPerDay}
                  onChange={(e) => setFormData({ ...formData, maxTokensPerDay: parseInt(e.target.value) || 0 })}
                  placeholder="Sense límit"
                  className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
                <p className="mt-1 text-xs text-slate-400">0 = sense límit</p>
              </div>
            </div>
          </div>

          {/* Botons d'acció */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel·lar
            </button>
            <button
              onClick={handleSave}
              disabled={isUpdating || !formData.modelId}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? 'Desant...' : 'Desar canvis'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}