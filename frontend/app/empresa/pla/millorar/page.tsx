'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Crown,
  TrendingUp,
  CheckCircle2,
  Loader2,
  AlertCircle,
  X,
  Sparkles
} from 'lucide-react'

interface Plan {
  id: string
  slug: string
  tier: string
  name: string
  basePrice: number
  firstYearDiscount: number
  maxActiveOffers: number | null
  maxTeamMembers: number | null
  maxFeaturedOffers: number | null
  maxStorage: number | null
  badge?: string
  badgeColor?: string
  destacado?: boolean
  color?: string
  icono?: string
  funcionalidades?: string
  features: Record<string, boolean>
  isActive?: boolean
  isVisible?: boolean
}

interface CurrentPlanData {
  plan: {
    tier: string
    name: string
    price: number
  }
}

interface UpgradePreview {
  currentPlan: {
    name: string
    basePrice: number
    paidPrice: number
    discount: number
  }
  targetPlan: {
    name: string
    tier: string
    basePrice: number
    discountedPrice: number
    discount: number
  }
  proration?: {
    daysRemaining: number
    dailyRate: number
    remainingCredit: number
    amountToPay: number
  }
  priceDiff?: number
}

const PLAN_HIERARCHY = ['PIONERES', 'STANDARD', 'STRATEGIC', 'ENTERPRISE']

export default function MillorarPlaPage() {
  const router = useRouter()
  const [currentPlan, setCurrentPlan] = useState<CurrentPlanData | null>(null)
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Upgrade modal state
  const [upgradePreview, setUpgradePreview] = useState<UpgradePreview | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [upgrading, setUpgrading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [planRes, plansRes] = await Promise.all([
          fetch('/api/empresa/plan'),
          fetch('/api/plans')
        ])

        const planData = await planRes.json()
        const plansData = await plansRes.json()

        if (!planData.success) {
          setError(planData.error || 'Error carregant el pla actual')
          return
        }

        setCurrentPlan(planData)

        if (plansData.success) {
          setAvailablePlans(plansData.data || [])
        }
      } catch (err) {
        console.error('Error:', err)
        setError('Error de connexió')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Filter upgradeable plans
  const upgradeablePlans = availablePlans
    .filter(plan => {
      if (!currentPlan) return false
      const currentIndex = PLAN_HIERARCHY.indexOf(currentPlan.plan.tier)
      const planIndex = PLAN_HIERARCHY.indexOf(plan.tier)
      return planIndex > currentIndex && plan.isVisible && plan.isActive
    })
    .sort((a, b) => PLAN_HIERARCHY.indexOf(a.tier) - PLAN_HIERARCHY.indexOf(b.tier))

  const handleSelectPlan = async (plan: Plan) => {
    setUpgrading(true)
    try {
      const response = await fetch(`/api/empresa/plan/upgrade?targetTier=${plan.tier}`)
      const data = await response.json()

      if (data.success) {
        setUpgradePreview(data.preview)
        setShowModal(true)
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (err) {
      console.error('Error:', err)
      alert('Error obtenint informació de l\'upgrade')
    } finally {
      setUpgrading(false)
    }
  }

  const handleConfirmUpgrade = async () => {
    if (!upgradePreview) return

    setUpgrading(true)
    try {
      const response = await fetch('/api/empresa/plan/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPlan: upgradePreview.targetPlan.tier })
      })

      const data = await response.json()

      if (data.success) {
        setShowModal(false)
        router.push('/empresa/pla')
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (err) {
      console.error('Error:', err)
      alert('Error confirmant l\'upgrade')
    } finally {
      setUpgrading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-slate-500">Carregant plans...</p>
        </div>
      </div>
    )
  }

  if (error || !currentPlan) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="text-slate-900 font-medium">Error carregant els plans</p>
          <p className="text-slate-500">{error}</p>
          <Link
            href="/empresa/pla"
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tornar
          </Link>
        </div>
      </div>
    )
  }

  const isEnterprise = currentPlan.plan.tier === 'ENTERPRISE'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-4">
          <Link
            href="/empresa/pla"
            className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Millorar el Pla</h1>
            <p className="text-slate-500">Selecciona un pla superior per obtenir més funcionalitats</p>
          </div>
        </div>
      </div>

      {/* Current Plan Summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <Crown className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
          <h2 className="font-semibold text-slate-900">Pla Actual</h2>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-semibold text-slate-900">{currentPlan.plan.name}</span>
          <span className="text-slate-500">
            {currentPlan.plan.price === 0 ? 'Gratis' : `${currentPlan.plan.price}€/any`}
          </span>
        </div>
      </div>

      {/* Upgradeable Plans */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
          <h3 className="font-semibold text-slate-900">Plans Disponibles</h3>
        </div>

        {isEnterprise ? (
          <div className="text-center py-12">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-900 mb-2">
              Ja tens el pla més alt disponible!
            </p>
            <p className="text-slate-500 mb-6">
              Gaudeixes de totes les funcionalitats de La Pública
            </p>
            <Link
              href="/empresa/pla"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tornar al Meu Pla
            </Link>
          </div>
        ) : upgradeablePlans.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              No hi ha plans superiors disponibles en aquest moment
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upgradeablePlans.map((plan) => (
              <PlanUpgradeCard
                key={plan.id}
                plan={plan}
                onSelect={() => handleSelectPlan(plan)}
                loading={upgrading}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      {showModal && upgradePreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Confirmar Actualització</h3>
                <p className="text-sm text-slate-500">Revisa els detalls abans de confirmar</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Plans Comparison */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-1">Pla Actual</p>
                  <p className="font-semibold text-slate-900">{upgradePreview.currentPlan.name}</p>
                  <p className="text-sm text-slate-600">{upgradePreview.currentPlan.paidPrice}€/any</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-xs text-blue-600 mb-1">Nou Pla</p>
                  <p className="font-semibold text-blue-900">{upgradePreview.targetPlan.name}</p>
                  <p className="text-sm text-blue-700">{upgradePreview.targetPlan.discountedPrice}€/any</p>
                </div>
              </div>

              {/* Proration Details */}
              {upgradePreview.proration && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-amber-900 mb-3">Detalls del Prorrateo</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Dies restants:</span>
                      <span className="font-medium">{upgradePreview.proration.daysRemaining} dies</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Crèdit per dies no usats:</span>
                      <span className="font-medium text-green-600">+{upgradePreview.proration.remainingCredit}€</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-amber-200">
                      <span className="font-medium text-slate-900">Import a pagar:</span>
                      <span className="font-semibold text-blue-600">{upgradePreview.proration.amountToPay}€</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={upgrading}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel·lar
                </button>
                <button
                  onClick={handleConfirmUpgrade}
                  disabled={upgrading}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {upgrading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processant...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      Confirmar - {upgradePreview.proration?.amountToPay || upgradePreview.priceDiff}€
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Icon mapping for plan icons
const PLAN_ICONS: Record<string, string> = {
  'package': '📦',
  'target': '🎯',
  'crown': '👑',
  'zap': '⚡',
  'rocket': '🚀',
  'star': '⭐',
  'sparkles': '✨',
  'building': '🏢',
}

// Plan Card Component
function PlanUpgradeCard({
  plan,
  onSelect,
  loading
}: {
  plan: Plan
  onSelect: () => void
  loading: boolean
}) {
  // Normalize discount: if > 1, it's a percentage (50), otherwise it's decimal (0.5)
  const discountDecimal = plan.firstYearDiscount > 1
    ? plan.firstYearDiscount / 100
    : plan.firstYearDiscount
  const discountedPrice = plan.basePrice * (1 - discountDecimal)
  const discountPercent = Math.round(discountDecimal * 100)
  const features = plan.funcionalidades?.split('\n').filter(f => f.trim()) || []

  // Get icon emoji from name or use directly if it's already an emoji
  const iconDisplay = plan.icono
    ? (PLAN_ICONS[plan.icono.toLowerCase()] || plan.icono)
    : null

  return (
    <div className={`bg-white border-2 rounded-xl overflow-hidden flex flex-col ${
      plan.destacado ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'
    }`}>
      {/* Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {iconDisplay && <span className="text-xl">{iconDisplay}</span>}
            <h4 className="text-lg font-semibold text-slate-900">{plan.name}</h4>
          </div>
          {plan.destacado && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
              {plan.badge || 'Recomanat'}
            </span>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="px-5 py-4 bg-slate-50">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-slate-900">
            {discountedPrice === 0 ? 'Gratis' : `${Math.round(discountedPrice)}€`}
          </span>
          {discountedPrice > 0 && <span className="text-slate-500">/any</span>}
        </div>
        {discountPercent > 0 && plan.basePrice > 0 && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-slate-400 line-through">{plan.basePrice}€</span>
            <span className="text-xs text-green-600 font-medium">-{discountPercent}% 1r any</span>
          </div>
        )}
      </div>

      {/* Limits */}
      <div className="px-5 py-4 space-y-2 border-b border-slate-100">
        <LimitRow label="Ofertes actives" value={plan.maxActiveOffers} />
        <LimitRow label="Membres equip" value={plan.maxTeamMembers} />
        <LimitRow label="Ofertes destacades" value={plan.maxFeaturedOffers} />
        <LimitRow label="Emmagatzematge" value={plan.maxStorage} unit=" GB" isStorage />
      </div>

      {/* Features */}
      <div className="px-5 py-4 flex-grow">
        <p className="text-sm font-medium text-slate-700 mb-2">Funcionalitats</p>
        <ul className="text-sm text-slate-600 space-y-1">
          {features.slice(0, 5).map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
          {features.length > 5 && (
            <li className="text-slate-400 text-xs">+{features.length - 5} més</li>
          )}
        </ul>
      </div>

      {/* Action */}
      <div className="p-5 border-t border-slate-100">
        <button
          onClick={onSelect}
          disabled={loading}
          className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <TrendingUp className="w-4 h-4" />
              Canviar a {plan.name}
            </>
          )}
        </button>
      </div>
    </div>
  )
}

function LimitRow({ label, value, unit = '', isStorage = false }: { label: string; value: number | null; unit?: string; isStorage?: boolean }) {
  let displayValue: string

  if (value === null || value === undefined || value === -1) {
    displayValue = 'Il·limitat'
  } else if (isStorage && value === 0) {
    displayValue = 'Il·limitat'
  } else if (value >= 999) {
    displayValue = 'Il·limitat'
  } else {
    displayValue = `${value}${unit}`
  }

  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-600">{label}</span>
      <span className="font-medium text-slate-900">{displayValue}</span>
    </div>
  )
}
