'use client'

import {
  Rocket,
  Users,
  Megaphone,
  Sparkles,
  HardDrive,
  Check,
  Edit,
  ToggleLeft,
  ToggleRight,
  Gift
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

interface PioneerPlanCardProps {
  plan: Plan
  onEdit: (plan: Plan) => void
  onToggleActive: (plan: Plan) => void
  onClick: () => void
  isActive: boolean
}

export function PioneerPlanCard({ plan, onEdit, onToggleActive, onClick, isActive }: PioneerPlanCardProps) {
  const formatLimit = (value: number) => {
    if (value === -1) return 'Il·limitat'
    return value.toString()
  }

  const funcionalitats = plan.funcionalidades
    ? plan.funcionalidades.split('\n').filter(f => f.trim().length > 0).slice(0, 4)
    : []

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 p-5 cursor-pointer transition-all hover:shadow-lg',
        isActive ? 'border-amber-500 shadow-lg' : 'border-amber-300',
        !plan.isActive && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-6">
        {/* Icona i info principal */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-amber-100">
              <Rocket className="h-6 w-6 text-amber-600" strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
                <span className="px-2.5 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full uppercase">
                  Pla especial
                </span>
              </div>
              <p className="text-sm text-slate-500">{plan.slug}</p>
            </div>
          </div>

          {/* Preu amb destacat GRATIS */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-green-600" strokeWidth={1.5} />
              <span className="text-2xl font-bold text-green-600">GRATIS</span>
              <span className="text-slate-500">durant 6 mesos</span>
            </div>
            {plan.firstYearDiscount > 0 && (
              <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                després -{(plan.firstYearDiscount * 100).toFixed(0)}% 1r any
              </span>
            )}
          </div>

          {/* Límits en fila */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Users className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
              <span>{formatLimit(plan.maxTeamMembers)} membres</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Megaphone className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
              <span>{formatLimit(plan.maxActiveOffers)} ofertes</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Sparkles className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
              <span>{formatLimit(plan.maxFeaturedOffers)} destacades</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <HardDrive className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
              <span>{plan.maxStorage === -1 ? 'Il·limitat' : `${plan.maxStorage} GB`}</span>
            </div>
          </div>
        </div>

        {/* Funcionalitats i accions */}
        <div className="w-64 flex flex-col">
          {/* Funcionalitats */}
          {funcionalitats.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-slate-500 uppercase mb-2">Funcionalitats</p>
              <ul className="space-y-1">
                {funcionalitats.map((func, idx) => (
                  <li key={idx} className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Check className="h-3 w-3 text-green-500 flex-shrink-0" strokeWidth={2} />
                    {func}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className={cn(
              'px-2 py-0.5 text-xs font-medium rounded-full',
              plan.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            )}>
              {plan.isActive ? 'Actiu' : 'Inactiu'}
            </span>
            {plan.isVisible && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                Visible
              </span>
            )}
            {plan.hasFreeTrial && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                Trial {plan.trialDurationDays}d
              </span>
            )}
          </div>

          {/* Accions */}
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(plan); }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              <Edit className="h-4 w-4" strokeWidth={1.5} />
              Editar
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleActive(plan); }}
              className={cn(
                'inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg',
                plan.isActive
                  ? 'text-red-600 border border-red-200 hover:bg-red-50'
                  : 'text-green-600 border border-green-200 hover:bg-green-50'
              )}
            >
              {plan.isActive ? (
                <ToggleRight className="h-4 w-4" strokeWidth={1.5} />
              ) : (
                <ToggleLeft className="h-4 w-4" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}