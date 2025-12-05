'use client'

import { Euro, Percent, Clock, Eye, Star, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

type PriceType = 'FIXED' | 'MONTHLY' | 'ANNUAL' | 'HOURLY' | 'CUSTOM'

interface PricingData {
  basePrice: number
  discount: number
  priceType: PriceType
  active: boolean
  featured: boolean
}

interface PricingStepProps {
  data: PricingData
  onChange: (data: PricingData) => void
}

const PRICE_TYPES: { value: PriceType; label: string; description: string }[] = [
  { value: 'FIXED', label: 'Preu fix', description: 'Pagament únic' },
  { value: 'MONTHLY', label: 'Mensual', description: 'Pagament cada mes' },
  { value: 'ANNUAL', label: 'Anual', description: 'Pagament cada any' },
  { value: 'HOURLY', label: 'Per hores', description: 'Segons hores dedicades' },
  { value: 'CUSTOM', label: 'Personalitzat', description: 'A mida del client' },
]

export function PricingStep({ data, onChange }: PricingStepProps) {
  const updateField = (field: keyof PricingData, value: any) => {
    onChange({ ...data, [field]: value })
  }

  // Calcular preu amb descompte
  const discountedPrice = data.basePrice * (1 - data.discount / 100)

  const formatPrice = (price: number) => {
    const suffix = {
      FIXED: '',
      MONTHLY: '/mes',
      ANNUAL: '/any',
      HOURLY: '/hora',
      CUSTOM: '',
    }[data.priceType]
    return `${price.toFixed(2)}€${suffix}`
  }

  return (
    <div className="space-y-8">
      {/* Tipus de preu */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Tipus de preu <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {PRICE_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => updateField('priceType', type.value)}
              className={cn(
                'p-3 rounded-lg text-left transition-all border',
                data.priceType === type.value
                  ? 'bg-purple-50 border-purple-500'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              )}
            >
              <p className={cn(
                'font-medium text-sm',
                data.priceType === type.value ? 'text-purple-700' : 'text-slate-700'
              )}>
                {type.label}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Preu i Descompte */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Preu base (€) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
            <input
              type="number"
              min="0"
              step="0.01"
              value={data.basePrice}
              onChange={(e) => updateField('basePrice', parseFloat(e.target.value) || 0)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <Info className="h-3 w-3" strokeWidth={1.5} />
            IVA inclòs (21%)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Descompte (%)
          </label>
          <div className="relative">
            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
            <input
              type="number"
              min="0"
              max="100"
              value={data.discount}
              onChange={(e) => updateField('discount', parseFloat(e.target.value) || 0)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Preview preu */}
      {data.basePrice > 0 && (
        <div className={cn(
          'rounded-lg p-4 border',
          data.discount > 0 ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'
        )}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Preu final</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-900">
                  {formatPrice(data.discount > 0 ? discountedPrice : data.basePrice)}
                </span>
                {data.discount > 0 && (
                  <span className="text-sm text-slate-400 line-through">
                    {formatPrice(data.basePrice)}
                  </span>
                )}
              </div>
            </div>
            {data.discount > 0 && (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                -{data.discount}%
              </span>
            )}
          </div>
        </div>
      )}

      {/* Estat */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Estat i visibilitat
        </label>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
            <input
              type="checkbox"
              checked={data.active}
              onChange={(e) => updateField('active', e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <Eye className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium text-slate-700">Servei actiu</p>
              <p className="text-xs text-slate-500">El servei estarà disponible per contractar</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
            <input
              type="checkbox"
              checked={data.featured}
              onChange={(e) => updateField('featured', e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <Star className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium text-slate-700">Servei destacat</p>
              <p className="text-xs text-slate-500">Es mostrarà amb prioritat als clients</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  )
}