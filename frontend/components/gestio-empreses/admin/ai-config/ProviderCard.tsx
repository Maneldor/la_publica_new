// components/gestio-empreses/admin/ai-config/ProviderCard.tsx
'use client'

import { useState } from 'react'
import {
  Settings,
  Power,
  ChevronDown,
  ChevronUp,
  Cpu,
  Eye,
  Wrench,
  Coins
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIProviderWithModels, updateAIProvider, updateAIModel } from '@/lib/gestio-empreses/actions/ai-config-actions'

interface ProviderCardProps {
  provider: AIProviderWithModels
  onUpdate: () => void
}

const providerIcons: Record<string, string> = {
  OPENAI: '/icons/openai.svg',
  ANTHROPIC: '/icons/anthropic.svg',
  GEMINI: '/icons/gemini.svg'
}

const providerColors: Record<string, string> = {
  OPENAI: 'bg-emerald-50 border-emerald-200',
  ANTHROPIC: 'bg-orange-50 border-orange-200',
  GEMINI: 'bg-blue-50 border-blue-200'
}

export function ProviderCard({ provider, onUpdate }: ProviderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [limits, setLimits] = useState({
    maxTokensPerRequest: provider.maxTokensPerRequest,
    maxTokensPerDay: provider.maxTokensPerDay || 0,
    maxTokensPerMonth: provider.maxTokensPerMonth || 0
  })

  const handleToggleActive = async () => {
    setIsUpdating(true)
    await updateAIProvider(provider.id, { isActive: !provider.isActive })
    onUpdate()
    setIsUpdating(false)
  }

  const handleToggleModel = async (modelId: string, currentActive: boolean) => {
    await updateAIModel(modelId, { isActive: !currentActive })
    onUpdate()
  }

  const handleSaveLimits = async () => {
    setIsUpdating(true)
    await updateAIProvider(provider.id, {
      maxTokensPerRequest: limits.maxTokensPerRequest,
      maxTokensPerDay: limits.maxTokensPerDay || null,
      maxTokensPerMonth: limits.maxTokensPerMonth || null
    })
    onUpdate()
    setIsUpdating(false)
    setShowSettings(false)
  }

  const activeModels = provider.models.filter(m => m.isActive).length

  return (
    <div className={cn(
      'bg-white border rounded-lg shadow-sm overflow-hidden',
      provider.isActive ? 'border-slate-200' : 'border-slate-200 opacity-60'
    )}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            providerColors[provider.type] || 'bg-slate-100'
          )}>
            <Cpu className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-medium text-slate-900">{provider.name}</h3>
            <p className="text-xs text-slate-500">
              {activeModels} de {provider.models.length} models actius
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle actiu */}
          <button
            onClick={handleToggleActive}
            disabled={isUpdating}
            className={cn(
              'p-2 rounded-lg transition-colors',
              provider.isActive
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
            )}
            title={provider.isActive ? 'Desactivar proveïdor' : 'Activar proveïdor'}
          >
            <Power className="h-4 w-4" strokeWidth={1.5} />
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <Settings className="h-4 w-4" strokeWidth={1.5} />
          </button>

          {/* Expand */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" strokeWidth={1.5} />
            ) : (
              <ChevronDown className="h-4 w-4" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-4 bg-slate-50">
          <h4 className="text-sm font-medium text-slate-900 mb-3">Límits de tokens</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Per petició</label>
              <input
                type="number"
                value={limits.maxTokensPerRequest}
                onChange={(e) => setLimits({ ...limits, maxTokensPerRequest: parseInt(e.target.value) || 0 })}
                className="w-full h-9 px-3 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Per dia</label>
              <input
                type="number"
                value={limits.maxTokensPerDay}
                onChange={(e) => setLimits({ ...limits, maxTokensPerDay: parseInt(e.target.value) || 0 })}
                placeholder="Sense límit"
                className="w-full h-9 px-3 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Per mes</label>
              <input
                type="number"
                value={limits.maxTokensPerMonth}
                onChange={(e) => setLimits({ ...limits, maxTokensPerMonth: parseInt(e.target.value) || 0 })}
                placeholder="Sense límit"
                className="w-full h-9 px-3 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowSettings(false)}
              className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
            >
              Cancel·lar
            </button>
            <button
              onClick={handleSaveLimits}
              disabled={isUpdating}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Desar canvis
            </button>
          </div>
        </div>
      )}

      {/* Models List */}
      {isExpanded && (
        <div className="border-t border-slate-100">
          <div className="divide-y divide-slate-100">
            {provider.models.map((model) => (
              <div
                key={model.id}
                className={cn(
                  'px-4 py-3 flex items-center justify-between',
                  !model.isActive && 'bg-slate-50 opacity-60'
                )}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-slate-900">
                      {model.displayName}
                    </span>
                    <code className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {model.modelId}
                    </code>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {model.description}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    {model.supportsVision && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <Eye className="h-3 w-3" strokeWidth={1.5} />
                        Visió
                      </span>
                    )}
                    {model.supportsTools && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <Wrench className="h-3 w-3" strokeWidth={1.5} />
                        Eines
                      </span>
                    )}
                    {model.inputCostPer1M && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <Coins className="h-3 w-3" strokeWidth={1.5} />
                        ${model.inputCostPer1M}/${model.outputCostPer1M} per 1M
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleToggleModel(model.id, model.isActive)}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                    model.isActive
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  )}
                >
                  {model.isActive ? 'Actiu' : 'Inactiu'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}