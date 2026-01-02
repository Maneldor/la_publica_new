'use client'

import { useState } from 'react'
import {
  Building2,
  Check,
  Zap,
  Star,
  Crown,
  Users,
  Megaphone,
  Sparkles,
  HardDrive,
  Bot,
  Palette,
  Shield,
  BarChart3,
  Headphones,
  GraduationCap,
  FileText,
  FolderOpen,
  TrendingUp,
  Package,
  Percent,
  Calculator,
  FileDown,
  Mail,
  Save,
  CheckCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ENTERPRISE_CATALOG,
  BASE_PLANS,
  calculatePricing,
  findFeatureById,
  getCategoryDisplayName,
  type SelectedFeature,
  type EnterpriseFeature,
  type PlanTier
} from '@/lib/enterprise-catalog'
import toast from 'react-hot-toast'

interface PlanConfiguratorProps {
  companyId: string
  companyName: string
  currentPlan?: string
}

// Mapeo de iconos por categoría
const categoryIcons: Record<string, typeof HardDrive> = {
  storage: HardDrive,
  members: Users,
  ai_agents: Bot,
  features: Sparkles,
  support: Headphones,
  content: FileText
}

// Iconos para cada plan
const planIcons: Record<string, typeof Zap> = {
  STANDARD: Zap,
  STRATEGIC: Star,
  ENTERPRISE: Crown
}

export function PlanConfigurator({ companyId, companyName, currentPlan = 'STRATEGIC' }: PlanConfiguratorProps) {
  const [basePlan, setBasePlan] = useState<PlanTier>('STRATEGIC')
  const [selectedFeatures, setSelectedFeatures] = useState<SelectedFeature[]>([])
  const [discountPercent, setDiscountPercent] = useState(0)
  const [loading, setLoading] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['storage', 'members'])

  const pricing = calculatePricing(basePlan, selectedFeatures, discountPercent)

  function toggleFeature(feature: EnterpriseFeature, quantity: number = 1) {
    setSelectedFeatures(prev => {
      const exists = prev.find(f => f.featureId === feature.key)
      if (exists) {
        return prev.filter(f => f.featureId !== feature.key)
      } else {
        return [...prev, {
          featureId: feature.key,
          quantity,
          unitPrice: feature.basePrice,
          totalPrice: feature.basePrice * quantity
        }]
      }
    })
  }

  function isFeatureSelected(featureId: string): boolean {
    return selectedFeatures.some(f => f.featureId === featureId)
  }

  function toggleCategory(category: string) {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  async function saveAsProposal() {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/custom-package`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          basePlan,
          features: selectedFeatures,
          discountPercent,
          status: 'proposed',
          pricing
        })
      })

      if (response.ok) {
        toast.success('Proposta guardada correctament')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error guardant proposta')
      }
    } catch (error) {
      console.error('Error saving proposal:', error)
      toast.error('Error de connexió')
    } finally {
      setLoading(false)
    }
  }

  async function activatePackage() {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/custom-package`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          basePlan,
          features: selectedFeatures,
          discountPercent,
          status: 'active',
          pricing
        })
      })

      if (response.ok) {
        toast.success('Pla activat correctament')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error activant pla')
      }
    } catch (error) {
      console.error('Error activating package:', error)
      toast.error('Error de connexió')
    } finally {
      setLoading(false)
    }
  }

  function generatePDF() {
    toast.loading('Generació de PDF en desenvolupament', { duration: 2000 })
  }

  function sendByEmail() {
    toast.loading('Enviament per email en desenvolupament', { duration: 2000 })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Columna Principal */}
      <div className="lg:col-span-2 space-y-6">

        {/* Selector de Pla Base */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <Package className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
            <h2 className="font-semibold text-slate-900">Pla Base</h2>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.values(BASE_PLANS).map((plan) => {
                const PlanIcon = planIcons[plan.id] || Zap
                const isSelected = basePlan === plan.id
                const discountedPrice = plan.basePrice * (1 - plan.firstYearDiscount / 100)

                return (
                  <button
                    key={plan.id}
                    onClick={() => setBasePlan(plan.id as PlanTier)}
                    className={cn(
                      'relative p-4 rounded-lg border-2 text-left transition-all',
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="p-1.5 rounded-lg"
                        style={{ backgroundColor: plan.color + '20' }}
                      >
                        <PlanIcon className="h-4 w-4" style={{ color: plan.color }} strokeWidth={1.5} />
                      </div>
                      <h3 className="font-semibold text-slate-900">{plan.name}</h3>
                    </div>

                    <p className="text-sm text-slate-500 mb-3">{plan.description}</p>

                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-xl font-bold text-green-600">
                        {discountedPrice.toFixed(0)}€
                      </span>
                      <span className="text-sm text-slate-400 line-through">
                        {plan.basePrice}€
                      </span>
                      <span className="text-xs text-slate-500">/any</span>
                    </div>

                    <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      -{plan.firstYearDiscount}% 1r any
                    </span>

                    <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {plan.limits.maxTeamMembers}
                      </span>
                      <span className="flex items-center gap-1">
                        <Megaphone className="h-3 w-3" />
                        {plan.limits.maxActiveOffers}
                      </span>
                      <span className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        {plan.limits.maxFeaturedOffers}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Catàleg d'Extres */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
            <h2 className="font-semibold text-slate-900">Funcionalitats Extra</h2>
            <span className="ml-auto text-sm text-slate-500">
              {selectedFeatures.length} seleccionades
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {Object.entries(ENTERPRISE_CATALOG).map(([category, features]) => {
              const CategoryIcon = categoryIcons[category] || Package
              const isExpanded = expandedCategories.includes(category)
              const selectedInCategory = features.filter(f => isFeatureSelected(f.key)).length

              return (
                <div key={category}>
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <CategoryIcon className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
                      <span className="font-medium text-slate-700">
                        {getCategoryDisplayName(category)}
                      </span>
                      {selectedInCategory > 0 && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          {selectedInCategory}
                        </span>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-4 space-y-2">
                      {features.map((feature) => {
                        const selected = isFeatureSelected(feature.key)
                        return (
                          <label
                            key={feature.key}
                            className={cn(
                              'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all',
                              selected
                                ? 'border-blue-300 bg-blue-50/50'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => toggleFeature(feature)}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                              <div>
                                <p className="font-medium text-slate-700 text-sm">
                                  {feature.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {feature.description}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-slate-900">
                                {feature.basePrice}€
                                <span className="text-xs font-normal text-slate-500">/mes</span>
                              </p>
                              {feature.setupFee && (
                                <p className="text-xs text-amber-600">
                                  +{feature.setupFee}€ setup
                                </p>
                              )}
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Columna Lateral - Resum */}
      <div className="lg:col-span-1">
        <div className="sticky top-6 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
              <Calculator className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
              <h3 className="font-semibold text-slate-900">Resum del Pressupost</h3>
            </div>

            <div className="p-5 space-y-4">
              {/* Pla base */}
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-sm text-slate-600">Pla {basePlan}</span>
                <span className="font-semibold text-slate-900">
                  {pricing.basePlanPrice.toFixed(0)}€/any
                </span>
              </div>

              {/* Extres */}
              {selectedFeatures.length > 0 && (
                <div className="space-y-2 pb-3 border-b border-slate-100">
                  <p className="text-xs font-medium text-slate-500 uppercase">Extres</p>
                  {selectedFeatures.map(sf => {
                    const feature = findFeatureById(sf.featureId)
                    return (
                      <div key={sf.featureId} className="flex justify-between text-sm">
                        <span className="text-slate-600">{feature?.name}</span>
                        <span className="text-slate-900">{sf.totalPrice}€</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Descompte */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Descompte</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Math.min(50, Math.max(0, Number(e.target.value))))}
                    className="w-14 px-2 py-1 text-sm border border-slate-300 rounded text-right focus:ring-1 focus:ring-blue-500"
                    min="0"
                    max="50"
                  />
                  <span className="text-sm text-slate-500">%</span>
                </div>
              </div>

              {discountPercent > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Estalvi</span>
                  <span>-{pricing.discountAmount.toFixed(2)}€</span>
                </div>
              )}

              {/* Total */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-lg -mx-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">TOTAL 1r ANY</span>
                  <span className="text-xl font-bold">{pricing.totalMonthly.toFixed(0)}€</span>
                </div>
                <div className="flex justify-between items-center text-blue-100 text-sm">
                  <span>A partir del 2n any</span>
                  <span>{pricing.totalAnnual.toFixed(0)}€</span>
                </div>
              </div>

              {/* Setup fees */}
              {pricing.setupFees > 0 && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-700">Fees de setup (únic)</span>
                    <span className="font-semibold text-amber-700">{pricing.setupFees}€</span>
                  </div>
                </div>
              )}
            </div>

            {/* Accions */}
            <div className="p-5 pt-0 space-y-3">
              <button
                onClick={saveAsProposal}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Save className="h-4 w-4" strokeWidth={1.5} />
                Generar Proposta
              </button>

              <button
                onClick={activatePackage}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                Activar Pla
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={generatePDF}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <FileDown className="h-4 w-4" strokeWidth={1.5} />
                  PDF
                </button>
                <button
                  onClick={sendByEmail}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <Mail className="h-4 w-4" strokeWidth={1.5} />
                  Email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
