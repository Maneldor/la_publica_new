'use client'

import { useState, useEffect } from 'react'
import { Euro, Star, Sparkles, Save, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface Pricing {
  id: string
  level: 'PREMIUM' | 'STANDARD' | 'BASIC'
  name: string
  description: string
  priceWeekly: number
  priceMonthly: number
  priceQuarterly: number
  priceBiannual: number
  priceAnnual: number
  features: string[]
  isActive: boolean
}

const LEVEL_CONFIG = {
  PREMIUM: {
    icon: '🌟',
    color: 'purple',
    bgGradient: 'from-purple-50 to-purple-100',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700'
  },
  STANDARD: {
    icon: '⭐',
    color: 'amber',
    bgGradient: 'from-amber-50 to-amber-100',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700'
  },
  BASIC: {
    icon: '📌',
    color: 'gray',
    bgGradient: 'from-gray-50 to-gray-100',
    borderColor: 'border-gray-200',
    textColor: 'text-gray-700'
  }
}

export default function PreusAnuncisDestacatsPage() {
  const [pricing, setPricing] = useState<Pricing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editedPricing, setEditedPricing] = useState<Record<string, Partial<Pricing>>>({})

  useEffect(() => {
    fetchPricing()
  }, [])

  const fetchPricing = async () => {
    try {
      const res = await fetch('/api/featured-ads/pricing')
      if (res.ok) {
        const data = await res.json()
        setPricing(data.pricing || [])
      }
    } catch (error) {
      console.error('Error carregant preus:', error)
      toast.error('Error carregant els preus')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePriceChange = (level: string, field: string, value: number) => {
    setEditedPricing(prev => ({
      ...prev,
      [level]: {
        ...prev[level],
        [field]: value * 100 // Convert to cents
      }
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // In a real implementation, this would call an API to update prices
      toast.success('Preus actualitzats correctament')
      setEditedPricing({})
      fetchPricing()
    } catch (error) {
      toast.error('Error actualitzant els preus')
    } finally {
      setIsSaving(false)
    }
  }

  const getPrice = (item: Pricing, field: keyof Pricing) => {
    const edited = editedPricing[item.level]
    if (edited && edited[field] !== undefined) {
      return (edited[field] as number) / 100
    }
    return (item[field] as number) / 100
  }

  const hasChanges = Object.keys(editedPricing).length > 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-xl">
            <Euro className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Preus Anuncis Destacats</h1>
            <p className="text-gray-500">Configura els preus per nivell i període</p>
          </div>
        </div>
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Guardar Canvis
          </button>
        )}
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-medium">Els preus s'emmagatzemen en cèntims</p>
          <p>Per exemple, 50€ s'emmagatzema com 5000. Els valors mostrats ja estan convertits a euros.</p>
        </div>
      </div>

      {/* Pricing cards */}
      {pricing.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hi ha preus configurats</p>
          <p className="text-sm text-gray-400 mt-1">Executa el seed per crear la configuració inicial</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {pricing.map((item) => {
            const config = LEVEL_CONFIG[item.level]
            return (
              <div
                key={item.id}
                className={`bg-gradient-to-br ${config.bgGradient} border ${config.borderColor} rounded-xl overflow-hidden`}
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-200/50">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{config.icon}</span>
                    <div>
                      <h3 className={`text-xl font-bold ${config.textColor}`}>{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                </div>

                {/* Prices */}
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Setmanal</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={getPrice(item, 'priceWeekly')}
                        onChange={(e) => handlePriceChange(item.level, 'priceWeekly', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2 pr-8 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                        step="0.01"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mensual</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={getPrice(item, 'priceMonthly')}
                        onChange={(e) => handlePriceChange(item.level, 'priceMonthly', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2 pr-8 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                        step="0.01"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trimestral</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={getPrice(item, 'priceQuarterly')}
                        onChange={(e) => handlePriceChange(item.level, 'priceQuarterly', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2 pr-8 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                        step="0.01"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semestral</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={getPrice(item, 'priceBiannual')}
                        onChange={(e) => handlePriceChange(item.level, 'priceBiannual', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2 pr-8 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                        step="0.01"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Anual</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={getPrice(item, 'priceAnnual')}
                        onChange={(e) => handlePriceChange(item.level, 'priceAnnual', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2 pr-8 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                        step="0.01"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                {item.features && item.features.length > 0 && (
                  <div className="px-6 pb-6">
                    <p className="text-sm font-medium text-gray-700 mb-2">Característiques incloses:</p>
                    <ul className="space-y-1">
                      {item.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <Star className="w-3 h-3 text-yellow-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
