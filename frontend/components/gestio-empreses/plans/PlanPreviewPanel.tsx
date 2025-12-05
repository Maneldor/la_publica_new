'use client'

import {
  X,
  CreditCard,
  Users,
  Megaphone,
  Sparkles,
  HardDrive,
  Check,
  Edit,
  ToggleLeft,
  ToggleRight,
  Clock,
  Eye,
  EyeOff,
  Star,
  Rocket,
  Zap,
  Crown,
  Percent,
  Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Plan {
  id: string
  name: string
  slug: string
  tier: string
  description?: string
  basePrice: number
  precioMensual?: number
  precioAnual?: number
  firstYearDiscount: number
  maxTeamMembers: number
  maxActiveOffers: number
  maxFeaturedOffers: number
  maxStorage: number
  hasFreeTrial: boolean
  trialDurationDays: number
  durationMonths?: number
  isActive: boolean
  isVisible: boolean
  destacado: boolean
  color: string
  funcionalidades?: string
}

interface PlanPreviewPanelProps {
  plan: Plan | null
  onClose: () => void
  onEdit: (plan: Plan) => void
  onToggleActive: (plan: Plan) => void
}

const tierIcons: Record<string, any> = {
  PIONERES: Rocket,
  STANDARD: Zap,
  STRATEGIC: Star,
  ENTERPRISE: Crown,
}

const tierColors: Record<string, string> = {
  PIONERES: 'text-amber-600 bg-amber-100',
  STANDARD: 'text-green-600 bg-green-100',
  STRATEGIC: 'text-blue-600 bg-blue-100',
  ENTERPRISE: 'text-purple-600 bg-purple-100',
}

export function PlanPreviewPanel({ plan, onClose, onEdit, onToggleActive }: PlanPreviewPanelProps) {
  if (!plan) {
    return (
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 text-center h-[600px] flex flex-col items-center justify-center">
        <CreditCard className="h-12 w-12 text-slate-300 mb-4" strokeWidth={1.5} />
        <p className="text-slate-500">Selecciona un pla per veure els detalls</p>
      </div>
    )
  }

  const TierIcon = tierIcons[plan.tier] || CreditCard
  const tierColor = tierColors[plan.tier] || 'text-slate-600 bg-slate-100'

  const formatLimit = (value: number) => {
    if (value === -1) return 'Il·limitat'
    return value.toString()
  }

  const funcionalitats = plan.funcionalidades
    ? plan.funcionalidades.split('\n').filter(f => f.trim().length > 0)
    : []

  return (
    <div className="bg-white rounded-xl border border-slate-200 h-fit flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl"
              style={{ backgroundColor: plan.color + '20' }}
            >
              <TierIcon
                className="h-5 w-5"
                style={{ color: plan.color }}
                strokeWidth={1.5}
              />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">{plan.name}</h2>
              <p className="text-sm text-slate-500">{plan.slug}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
          </button>
        </div>

        {/* Tier badge */}
        <div className="mt-3">
          <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full', tierColor)}>
            {plan.tier}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 max-h-[500px]">
        {/* Descripció */}
        {plan.description && (
          <div>
            <p className="text-sm text-slate-600">{plan.description}</p>
          </div>
        )}

        {/* Preus */}
        <div className="bg-slate-50 rounded-lg p-4">
          <h3 className="text-xs font-medium text-slate-500 uppercase mb-3">Preus</h3>
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-slate-600">Preu base anual</span>
              <span className="text-2xl font-bold text-slate-900">{plan.basePrice}€</span>
            </div>
            {plan.precioMensual && plan.precioMensual > 0 && (
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-slate-600">Preu mensual</span>
                <span className="font-medium text-slate-700">{plan.precioMensual}€/mes</span>
              </div>
            )}
            {plan.firstYearDiscount > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <div className="flex items-center gap-1.5 text-green-600">
                  <Percent className="h-4 w-4" strokeWidth={1.5} />
                  <span className="text-sm">Descompte 1r any</span>
                </div>
                <span className="font-medium text-green-600">-{(plan.firstYearDiscount * 100).toFixed(0)}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Límits */}
        <div>
          <h3 className="text-xs font-medium text-slate-500 uppercase mb-3">Límits</h3>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Users className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                Membres d'equip
              </div>
              <span className="font-medium text-slate-900">{formatLimit(plan.maxTeamMembers)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Megaphone className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                Ofertes actives
              </div>
              <span className="font-medium text-slate-900">{formatLimit(plan.maxActiveOffers)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Sparkles className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                Ofertes destacades
              </div>
              <span className="font-medium text-slate-900">{formatLimit(plan.maxFeaturedOffers)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <HardDrive className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                Emmagatzematge
              </div>
              <span className="font-medium text-slate-900">
                {plan.maxStorage === -1 ? 'Il·limitat' : `${plan.maxStorage} GB`}
              </span>
            </div>
          </div>
        </div>

        {/* Trial */}
        {plan.hasFreeTrial && (
          <div className="bg-amber-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-amber-600" strokeWidth={1.5} />
              <h3 className="text-sm font-medium text-amber-800">Prova gratuïta</h3>
            </div>
            <p className="text-sm text-amber-700">
              {plan.trialDurationDays} dies de prova sense compromís
            </p>
          </div>
        )}

        {/* Funcionalitats */}
        {funcionalitats.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-slate-500 uppercase mb-3">Funcionalitats</h3>
            <ul className="space-y-2">
              {funcionalitats.map((func, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                  {func}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Estat */}
        <div>
          <h3 className="text-xs font-medium text-slate-500 uppercase mb-3">Estat</h3>
          <div className="flex flex-wrap gap-2">
            <span className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full',
              plan.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            )}>
              {plan.isActive ? (
                <><Check className="h-3 w-3" strokeWidth={2} /> Actiu</>
              ) : (
                <><X className="h-3 w-3" strokeWidth={2} /> Inactiu</>
              )}
            </span>
            <span className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full',
              plan.isVisible ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
            )}>
              {plan.isVisible ? (
                <><Eye className="h-3 w-3" strokeWidth={1.5} /> Visible</>
              ) : (
                <><EyeOff className="h-3 w-3" strokeWidth={1.5} /> Ocult</>
              )}
            </span>
            {plan.destacado && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                <Star className="h-3 w-3" strokeWidth={1.5} /> Destacat
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer - Accions */}
      <div className="p-4 border-t border-slate-100 space-y-2">
        <button
          onClick={() => onEdit(plan)}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <Edit className="h-4 w-4" strokeWidth={1.5} />
          Editar pla
        </button>
        <button
          onClick={() => onToggleActive(plan)}
          className={cn(
            'w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border',
            plan.isActive
              ? 'text-red-600 border-red-200 hover:bg-red-50'
              : 'text-green-600 border-green-200 hover:bg-green-50'
          )}
        >
          {plan.isActive ? (
            <><ToggleRight className="h-4 w-4" strokeWidth={1.5} /> Desactivar pla</>
          ) : (
            <><ToggleLeft className="h-4 w-4" strokeWidth={1.5} /> Activar pla</>
          )}
        </button>
      </div>
    </div>
  )
}