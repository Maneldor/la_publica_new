'use client'

import { CreditCard, Users, Megaphone, Sparkles, HardDrive, Percent, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PricingStepProps {
  formData: {
    basePrice: number
    firstYearDiscount: number
    maxTeamMembers: number
    maxActiveOffers: number
    maxFeaturedOffers: number
    maxStorage: number
  }
  onChange: (data: any) => void
  errors: Record<string, string>
}

export function PricingStep({ formData, onChange, errors }: PricingStepProps) {
  const updateField = (field: string, value: number) => {
    onChange({ [field]: value })
  }

  const formatPrice = (price: number) => {
    return price > 0 ? `${price.toFixed(2)}€` : 'Gratuït'
  }

  const calculateDiscountedPrice = () => {
    if (formData.firstYearDiscount > 0) {
      const discounted = formData.basePrice * (1 - formData.firstYearDiscount)
      return discounted
    }
    return formData.basePrice
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CreditCard className="h-8 w-8 text-green-600" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Preus i Límits
        </h2>
        <p className="text-slate-600">
          Defineix el preu del pla i els límits de funcionalitats
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Secció de preus */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
            <CreditCard className="h-5 w-5 text-green-600" strokeWidth={1.5} />
            Configuració de Preus
          </h3>

          <div className="space-y-4">
            {/* Preu base anual */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Preu base anual
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => updateField('basePrice', Number(e.target.value))}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className={cn(
                    "w-full pl-4 pr-8 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors",
                    errors.basePrice ? "border-red-300" : "border-slate-200"
                  )}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">€</span>
              </div>
              {errors.basePrice && (
                <p className="mt-1 text-sm text-red-600">{errors.basePrice}</p>
              )}
            </div>

            {/* Descompte primer any */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Percent className="h-4 w-4" strokeWidth={1.5} />
                Descompte primer any
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.firstYearDiscount * 100}
                  onChange={(e) => updateField('firstYearDiscount', Number(e.target.value) / 100)}
                  placeholder="0"
                  min="0"
                  max="100"
                  step="1"
                  className={cn(
                    "w-full pl-4 pr-8 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors",
                    errors.firstYearDiscount ? "border-red-300" : "border-slate-200"
                  )}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">%</span>
              </div>
              {errors.firstYearDiscount && (
                <p className="mt-1 text-sm text-red-600">{errors.firstYearDiscount}</p>
              )}
              {formData.firstYearDiscount > 0 && (
                <p className="mt-1 text-xs text-slate-500">
                  Preu primer any: {formatPrice(calculateDiscountedPrice())}
                </p>
              )}
            </div>

            {/* Preview del preu */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="text-sm font-medium text-slate-700 mb-2">Vista prèvia del preu</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">
                  {formatPrice(formData.basePrice)}
                </span>
                <span className="text-slate-500">/any</span>
                {formData.firstYearDiscount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    -{(formData.firstYearDiscount * 100).toFixed(0)}% 1r any
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Secció de límits */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
            <Sparkles className="h-5 w-5 text-blue-600" strokeWidth={1.5} />
            Límits de Funcionalitats
          </h3>

          <div className="space-y-4">
            {/* Membres equip */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Users className="h-4 w-4" strokeWidth={1.5} />
                Màxim membres equip
              </label>
              <input
                type="number"
                value={formData.maxTeamMembers === -1 ? '' : formData.maxTeamMembers}
                onChange={(e) => updateField('maxTeamMembers', e.target.value === '' ? -1 : Number(e.target.value))}
                placeholder="Il·limitat"
                min="-1"
                className={cn(
                  "w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors",
                  errors.maxTeamMembers ? "border-red-300" : "border-slate-200"
                )}
              />
              {errors.maxTeamMembers && (
                <p className="mt-1 text-sm text-red-600">{errors.maxTeamMembers}</p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                Deixa buit o -1 per il·limitat
              </p>
            </div>

            {/* Ofertes actives */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Megaphone className="h-4 w-4" strokeWidth={1.5} />
                Màxim ofertes actives
              </label>
              <input
                type="number"
                value={formData.maxActiveOffers === -1 ? '' : formData.maxActiveOffers}
                onChange={(e) => updateField('maxActiveOffers', e.target.value === '' ? -1 : Number(e.target.value))}
                placeholder="Il·limitat"
                min="-1"
                className={cn(
                  "w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors",
                  errors.maxActiveOffers ? "border-red-300" : "border-slate-200"
                )}
              />
              {errors.maxActiveOffers && (
                <p className="mt-1 text-sm text-red-600">{errors.maxActiveOffers}</p>
              )}
            </div>

            {/* Ofertes destacades */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Sparkles className="h-4 w-4" strokeWidth={1.5} />
                Màxim ofertes destacades
              </label>
              <input
                type="number"
                value={formData.maxFeaturedOffers === -1 ? '' : formData.maxFeaturedOffers}
                onChange={(e) => updateField('maxFeaturedOffers', e.target.value === '' ? -1 : Number(e.target.value))}
                placeholder="Il·limitat"
                min="-1"
                className={cn(
                  "w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors",
                  errors.maxFeaturedOffers ? "border-red-300" : "border-slate-200"
                )}
              />
              {errors.maxFeaturedOffers && (
                <p className="mt-1 text-sm text-red-600">{errors.maxFeaturedOffers}</p>
              )}
            </div>

            {/* Emmagatzematge */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <HardDrive className="h-4 w-4" strokeWidth={1.5} />
                Emmagatzematge (GB)
              </label>
              <input
                type="number"
                value={formData.maxStorage === -1 ? '' : formData.maxStorage}
                onChange={(e) => updateField('maxStorage', e.target.value === '' ? -1 : Number(e.target.value))}
                placeholder="Il·limitat"
                min="-1"
                className={cn(
                  "w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors",
                  errors.maxStorage ? "border-red-300" : "border-slate-200"
                )}
              />
              {errors.maxStorage && (
                <p className="mt-1 text-sm text-red-600">{errors.maxStorage}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info adicional */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
        <div className="text-sm">
          <h4 className="font-medium text-blue-900 mb-1">Configuració de límits</h4>
          <p className="text-blue-700">
            Configura els límits segons el tier del pla. Els plans superiors han de tenir límits més alts que els inferiors.
          </p>
        </div>
      </div>
    </div>
  )
}