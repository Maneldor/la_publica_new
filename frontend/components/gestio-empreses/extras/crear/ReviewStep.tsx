'use client'

import {
  Check,
  Euro,
  Percent,
  Tag,
  Eye,
  EyeOff,
  Star,
  FileText,
  Clock
} from 'lucide-react'
import { SERVICE_ICONS } from './IconSelector'
import { cn } from '@/lib/utils'

type ExtraCategory =
  | 'WEB_MAINTENANCE' | 'BRANDING' | 'MARKETING' | 'SEO'
  | 'CONTENT' | 'CONSULTING' | 'TRAINING' | 'DEVELOPMENT'
  | 'SUPPORT' | 'OTHER'

type PriceType = 'FIXED' | 'MONTHLY' | 'ANNUAL' | 'HOURLY' | 'CUSTOM'

interface ReviewStepProps {
  basicInfo: {
    name: string
    slug: string
    description: string
    category: ExtraCategory
    icon: string
  }
  pricing: {
    basePrice: number
    discount: number
    priceType: PriceType
    active: boolean
    featured: boolean
  }
}

const CATEGORY_LABELS: Record<ExtraCategory, string> = {
  WEB_MAINTENANCE: 'Manteniment Web',
  BRANDING: 'Branding',
  MARKETING: 'Marketing',
  SEO: 'SEO',
  CONTENT: 'Contingut',
  CONSULTING: 'Consultoria',
  TRAINING: 'Formació',
  DEVELOPMENT: 'Desenvolupament',
  SUPPORT: 'Suport',
  OTHER: 'Altres',
}

const PRICE_TYPE_LABELS: Record<PriceType, string> = {
  FIXED: 'Preu fix',
  MONTHLY: 'Mensual',
  ANNUAL: 'Anual',
  HOURLY: 'Per hores',
  CUSTOM: 'Personalitzat',
}

export function ReviewStep({ basicInfo, pricing }: ReviewStepProps) {
  const IconComponent = SERVICE_ICONS.find(i => i.name === basicInfo.icon)?.icon || FileText
  const discountedPrice = pricing.basePrice * (1 - pricing.discount / 100)

  const formatPrice = (price: number) => {
    const suffix = {
      FIXED: '',
      MONTHLY: '/mes',
      ANNUAL: '/any',
      HOURLY: '/hora',
      CUSTOM: '',
    }[pricing.priceType]
    return `${price.toFixed(2)}€${suffix}`
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-100 mb-4">
          <IconComponent className="h-8 w-8 text-purple-600" strokeWidth={1.5} />
        </div>
        <h3 className="text-xl font-semibold text-slate-900">{basicInfo.name || 'Nom del servei'}</h3>
        <p className="text-slate-500 mt-1">{basicInfo.slug || 'slug-del-servei'}</p>
      </div>

      {/* Card resum */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Informació bàsica */}
        <div className="p-6 border-b border-slate-100">
          <h4 className="text-sm font-semibold text-slate-900 uppercase mb-4">Informació bàsica</h4>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-slate-400 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="text-sm text-slate-500">Descripció</p>
                <p className="text-sm text-slate-900">{basicInfo.description || 'Sense descripció'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Tag className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
              <div>
                <p className="text-sm text-slate-500">Categoria</p>
                <p className="text-sm text-slate-900">{CATEGORY_LABELS[basicInfo.category]}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Preus */}
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h4 className="text-sm font-semibold text-slate-900 uppercase mb-4">Preus</h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Euro className="h-4 w-4" strokeWidth={1.5} />
                <span className="text-xs">Preu base</span>
              </div>
              <p className="text-xl font-bold text-slate-900">{formatPrice(pricing.basePrice)}</p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Clock className="h-4 w-4" strokeWidth={1.5} />
                <span className="text-xs">Tipus</span>
              </div>
              <p className="text-xl font-bold text-slate-900">{PRICE_TYPE_LABELS[pricing.priceType]}</p>
            </div>
          </div>

          {pricing.discount > 0 && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Percent className="h-5 w-5 text-green-600" strokeWidth={1.5} />
                  <span className="text-sm font-medium text-green-700">Descompte aplicat</span>
                </div>
                <span className="text-lg font-bold text-green-700">-{pricing.discount}%</span>
              </div>
              <p className="text-sm text-green-600 mt-2">
                Preu final: <span className="font-bold">{formatPrice(discountedPrice)}</span>
              </p>
            </div>
          )}
        </div>

        {/* Estat */}
        <div className="p-6">
          <h4 className="text-sm font-semibold text-slate-900 uppercase mb-4">Estat</h4>

          <div className="flex flex-wrap gap-2">
            <span className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full',
              pricing.active
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            )}>
              {pricing.active ? (
                <><Eye className="h-4 w-4" strokeWidth={1.5} /> Actiu</>
              ) : (
                <><EyeOff className="h-4 w-4" strokeWidth={1.5} /> Inactiu</>
              )}
            </span>

            {pricing.featured && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full bg-amber-100 text-amber-700">
                <Star className="h-4 w-4" strokeWidth={1.5} /> Destacat
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Confirmació */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start gap-3">
          <Check className="h-5 w-5 text-blue-600 mt-0.5" strokeWidth={2} />
          <div>
            <p className="text-sm font-medium text-blue-800">Llest per crear</p>
            <p className="text-sm text-blue-600 mt-1">
              Revisa la informació i clica "Crear Extra" per confirmar.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}