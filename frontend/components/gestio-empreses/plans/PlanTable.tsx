'use client'

import {
  CreditCard,
  Users,
  Megaphone,
  HardDrive,
  Check,
  X,
  Edit,
  ToggleLeft,
  ToggleRight,
  Rocket,
  Zap,
  Star,
  Crown
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
  maxStorage: number
  hasFreeTrial: boolean
  trialDurationDays: number
  isActive: boolean
  isVisible: boolean
  color: string
}

interface PlanTableProps {
  plans: Plan[]
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
  PIONERES: 'bg-amber-100 text-amber-800',
  STANDARD: 'bg-green-100 text-green-800',
  STRATEGIC: 'bg-blue-100 text-blue-800',
  ENTERPRISE: 'bg-purple-100 text-purple-800',
}

export function PlanTable({ plans, onEdit, onToggleActive }: PlanTableProps) {
  const formatLimit = (value: number) => {
    if (value === -1) return '∞'
    return value.toString()
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Pla
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Tier
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Preu
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Límits
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Trial
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Estat
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
              Accions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {plans.map((plan) => {
            const TierIcon = tierIcons[plan.tier] || CreditCard
            const tierColor = tierColors[plan.tier] || 'bg-slate-100 text-slate-800'

            return (
              <tr key={plan.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div
                      className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-xl"
                      style={{ backgroundColor: plan.color + '20' }}
                    >
                      <TierIcon
                        className="h-5 w-5"
                        style={{ color: plan.color }}
                        strokeWidth={1.5}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-slate-900">
                        {plan.name}
                      </div>
                      <div className="text-sm text-slate-500">
                        {plan.slug}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={cn(
                    'px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                    tierColor
                  )}>
                    {plan.tier}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900">
                    <div className="font-medium">{plan.basePrice}€/any</div>
                    {plan.firstYearDiscount > 0 && (
                      <div className="text-xs text-green-600">
                        -{(plan.firstYearDiscount * 100).toFixed(0)}% 1r any
                      </div>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="text-xs text-slate-500 space-y-1">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" strokeWidth={1.5} />
                      {formatLimit(plan.maxTeamMembers)} membres
                    </div>
                    <div className="flex items-center gap-1">
                      <Megaphone className="h-3 w-3" strokeWidth={1.5} />
                      {formatLimit(plan.maxActiveOffers)} ofertes
                    </div>
                    <div className="flex items-center gap-1">
                      <HardDrive className="h-3 w-3" strokeWidth={1.5} />
                      {formatLimit(plan.maxStorage)} GB
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {plan.hasFreeTrial ? (
                    <span className="inline-flex items-center gap-1 text-green-600">
                      <Check className="h-4 w-4" strokeWidth={2} />
                      {plan.trialDurationDays} dies
                    </span>
                  ) : (
                    <span className="text-slate-400">No</span>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <span className={cn(
                      'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full w-fit',
                      plan.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    )}>
                      {plan.isActive ? 'Actiu' : 'Inactiu'}
                    </span>
                    {!plan.isVisible && (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-800 w-fit">
                        Ocult
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onEdit(plan)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <Edit className="h-4 w-4 inline" strokeWidth={1.5} /> Editar
                  </button>
                  <button
                    onClick={() => onToggleActive(plan)}
                    className={cn(
                      plan.isActive
                        ? 'text-red-600 hover:text-red-900'
                        : 'text-green-600 hover:text-green-900'
                    )}
                  >
                    {plan.isActive ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}