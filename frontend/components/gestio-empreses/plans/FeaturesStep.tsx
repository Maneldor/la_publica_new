'use client'

import { Check, ClipboardCheck, FileText, CreditCard, Users, HardDrive, Sparkles, Megaphone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DynamicFeatureList } from './DynamicFeatureList'

interface Feature {
  id: string
  text: string
}

interface FeaturesStepProps {
  formData: {
    name: string
    slug: string
    tier: string
    description: string
    basePrice: number
    firstYearDiscount: number
    maxTeamMembers: number
    maxActiveOffers: number
    maxFeaturedOffers: number
    maxStorage: number
    color: string
    isActive: boolean
    isVisible: boolean
    destacado: boolean
    hasFreeTrial: boolean
    trialDurationDays: number
    features: Feature[]
  }
  onChange: (data: any) => void
  errors: Record<string, string>
}

export function FeaturesStep({ formData, onChange, errors }: FeaturesStepProps) {
  const updateFeatures = (features: Feature[]) => {
    onChange({ features })
  }

  const formatLimit = (value: number) => {
    if (value === -1) return 'Il·limitat'
    return value.toString()
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

  const getTierColor = (tier: string) => {
    const colors = {
      PIONERES: 'text-amber-600 bg-amber-50 border-amber-200',
      STANDARD: 'text-green-600 bg-green-50 border-green-200',
      STRATEGIC: 'text-blue-600 bg-blue-50 border-blue-200',
      ENTERPRISE: 'text-purple-600 bg-purple-50 border-purple-200',
    }
    return colors[tier as keyof typeof colors] || 'text-slate-600 bg-slate-50 border-slate-200'
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ClipboardCheck className="h-8 w-8 text-emerald-600" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Funcionalitats i Revisió
        </h2>
        <p className="text-slate-600">
          Configura les funcionalitats del pla i revisa tota la informació abans de crear-lo
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Secció de funcionalitats */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <DynamicFeatureList
              features={formData.features || []}
              onChange={updateFeatures}
              placeholder="Ex: Gestió completa d'ofertes"
              maxFeatures={15}
            />
            {errors.features && (
              <p className="mt-2 text-sm text-red-600">{errors.features}</p>
            )}
          </div>
        </div>

        {/* Secció de revisió */}
        <div className="space-y-6">
          {/* Informació bàsica */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
              <FileText className="h-5 w-5 text-blue-600" strokeWidth={1.5} />
              Informació Bàsica
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: formData.color + '20' }}
                >
                  <CreditCard className="h-4 w-4" style={{ color: formData.color }} strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">{formData.name || 'Nom del pla'}</h4>
                  <p className="text-sm text-slate-500">{formData.slug || 'slug-del-pla'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full border', getTierColor(formData.tier))}>
                  {formData.tier || 'TIER'}
                </span>
                {formData.destacado && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                    Destacat
                  </span>
                )}
              </div>

              {formData.description && (
                <p className="text-sm text-slate-600">{formData.description}</p>
              )}
            </div>
          </div>

          {/* Preu */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
              <CreditCard className="h-5 w-5 text-green-600" strokeWidth={1.5} />
              Preu
            </h3>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold text-slate-900">
                {formatPrice(formData.basePrice)}
              </span>
              <span className="text-slate-500">/any</span>
            </div>

            {formData.firstYearDiscount > 0 && (
              <div className="text-sm text-slate-600">
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  -{(formData.firstYearDiscount * 100).toFixed(0)}% primer any
                </span>
                <p className="mt-1">
                  Preu primer any: <span className="font-medium">{formatPrice(calculateDiscountedPrice())}</span>
                </p>
              </div>
            )}
          </div>

          {/* Límits */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
              <Sparkles className="h-5 w-5 text-purple-600" strokeWidth={1.5} />
              Límits
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Users className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                  Membres equip
                </div>
                <span className="font-medium text-slate-900">{formatLimit(formData.maxTeamMembers)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Megaphone className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                  Ofertes actives
                </div>
                <span className="font-medium text-slate-900">{formatLimit(formData.maxActiveOffers)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Sparkles className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                  Ofertes destacades
                </div>
                <span className="font-medium text-slate-900">{formatLimit(formData.maxFeaturedOffers)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <HardDrive className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                  Emmagatzematge
                </div>
                <span className="font-medium text-slate-900">
                  {formData.maxStorage === -1 ? 'Il·limitat' : `${formData.maxStorage} GB`}
                </span>
              </div>
            </div>
          </div>

          {/* Estat i visibilitat */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Estat</h3>

            <div className="flex flex-wrap gap-2">
              <span className={cn(
                'px-2 py-1 text-xs font-medium rounded-full',
                formData.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              )}>
                {formData.isActive ? 'Actiu' : 'Inactiu'}
              </span>
              {formData.isVisible && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                  Visible
                </span>
              )}
              {formData.hasFreeTrial && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                  Trial {formData.trialDurationDays}d
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resum final */}
      {formData.features.length > 0 && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <h4 className="font-medium text-green-900 mb-1">
                Pla configurat correctament
              </h4>
              <p className="text-sm text-green-700">
                Has afegit {formData.features.length} funcionalitat{formData.features.length !== 1 ? 's' : ''} al pla.
                Revisa tota la informació i fes clic a "Crear Pla" per finalitzar.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}