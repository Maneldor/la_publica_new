'use client'

import {
  CreditCard,
  Users,
  Megaphone,
  HardDrive,
  Star,
  Check,
  X,
  Edit,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Zap,
  Crown,
  Rocket
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Plan {
  id: string
  name: string
  slug: string
  tier: string
  basePrice: number
  firstYearDiscount: number
  maxTeamMembers: number
  maxActiveOffers: number
  maxFeaturedOffers: number
  maxStorage: number
  hasFreeTrial: boolean
  trialDurationDays: number
  isActive: boolean
  isVisible: boolean
  destacado: boolean
  color: string
  funcionalidades?: string
}

interface PlanCardProps {
  plan: Plan
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
  PIONERES: 'bg-amber-100 text-amber-700 border-amber-300',
  STANDARD: 'bg-green-100 text-green-700 border-green-300',
  STRATEGIC: 'bg-blue-100 text-blue-700 border-blue-300',
  ENTERPRISE: 'bg-purple-100 text-purple-700 border-purple-300',
}

export function PlanCard({ plan, onEdit, onToggleActive }: PlanCardProps) {
  const TierIcon = tierIcons[plan.tier] || CreditCard
  const tierColor = tierColors[plan.tier] || 'bg-slate-100 text-slate-700 border-slate-300'

  const formatLimit = (value: number) => {
    if (value === -1) return 'Il·limitat'
    return value.toString()
  }

  const funcionalitats = plan.funcionalidades
    ? plan.funcionalidades.split('\n').filter(f => f.trim().length > 0).slice(0, 5)
    : []

  return (
    <div
      className={cn(
        'bg-white rounded-xl border-2 overflow-hidden transition-all hover:shadow-lg',
        'border-slate-200',
        !plan.isActive && 'opacity-60'
      )}
    >
      {/* Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-start justify-between mb-3">
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
              <h3 className="font-semibold text-slate-900">{plan.name}</h3>
              <p className="text-sm text-slate-500">{plan.slug}</p>
            </div>
          </div>
          <span className={cn(
            'px-2.5 py-1 text-xs font-medium rounded-full border',
            tierColor
          )}>
            {plan.tier}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 flex-wrap">
          {plan.firstYearDiscount > 0 ? (
            <>
              <span className="text-3xl font-bold text-green-600">
                {(plan.basePrice * (1 - plan.firstYearDiscount / 100)).toFixed(0)}€
              </span>
              <span className="text-lg text-slate-400 line-through">
                {plan.basePrice.toFixed(0)}€
              </span>
              <span className="text-slate-500">/any</span>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                -{plan.firstYearDiscount.toFixed(0)}% 1r any
              </span>
            </>
          ) : (
            <>
              <span className="text-3xl font-bold text-slate-900">
                {plan.basePrice.toFixed(0)}€
              </span>
              <span className="text-slate-500">/any</span>
            </>
          )}
        </div>
      </div>

      {/* Limits */}
      <div className="p-5 border-b border-slate-100 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <Users className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
            Membres equip
          </div>
          <span className="font-medium text-slate-900">{formatLimit(plan.maxTeamMembers)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <Megaphone className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
            Ofertes actives
          </div>
          <span className="font-medium text-slate-900">{formatLimit(plan.maxActiveOffers)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <Sparkles className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
            Ofertes destacades
          </div>
          <span className="font-medium text-slate-900">{formatLimit(plan.maxFeaturedOffers)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <HardDrive className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
            Emmagatzematge
          </div>
          <span className="font-medium text-slate-900">
            {plan.maxStorage === -1 ? 'Il·limitat' : `${plan.maxStorage} GB`}
          </span>
        </div>
      </div>

      {/* Funcionalitats */}
      {funcionalitats.length > 0 && (
        <div className="p-5 border-b border-slate-100">
          <p className="text-xs font-medium text-slate-500 uppercase mb-3">Funcionalitats</p>
          <ul className="space-y-2">
            {funcionalitats.map((func, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                {func}
              </li>
            ))}
            {plan.funcionalidades && plan.funcionalidades.split('\n').length > 5 && (
              <li className="text-xs text-slate-400 italic">
                +{plan.funcionalidades.split('\n').length - 5} més...
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Status badges */}
      <div className="px-5 py-3 bg-slate-50 flex items-center gap-2 flex-wrap">
        <span className={cn(
          'px-2 py-1 text-xs font-medium rounded-full',
          plan.isActive
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        )}>
          {plan.isActive ? 'Actiu' : 'Inactiu'}
        </span>
        {plan.isVisible && (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
            Visible
          </span>
        )}
        {plan.hasFreeTrial && (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
            Trial {plan.trialDurationDays}d
          </span>
        )}
        {plan.destacado && (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
            Destacat
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-2">
        <button
          onClick={() => onEdit(plan)}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          <Edit className="h-4 w-4" strokeWidth={1.5} />
          Editar
        </button>
        <button
          onClick={() => onToggleActive(plan)}
          className={cn(
            'inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg',
            plan.isActive
              ? 'text-red-600 border border-red-200 hover:bg-red-50'
              : 'text-green-600 border border-green-200 hover:bg-green-50'
          )}
        >
          {plan.isActive ? (
            <>
              <ToggleRight className="h-4 w-4" strokeWidth={1.5} />
              Desactivar
            </>
          ) : (
            <>
              <ToggleLeft className="h-4 w-4" strokeWidth={1.5} />
              Activar
            </>
          )}
        </button>
      </div>
    </div>
  )
}