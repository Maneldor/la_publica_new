'use client'

import { useState, useEffect } from 'react'
import {
  CreditCard,
  RefreshCw,
  Plus,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PlanStats } from '@/components/gestio-empreses/plans/PlanStats'
import { PlanFilters } from '@/components/gestio-empreses/plans/PlanFilters'
import { PlanCard } from '@/components/gestio-empreses/plans/PlanCard'
import { PlanTable } from '@/components/gestio-empreses/plans/PlanTable'
import { PioneerPlanCard } from '@/components/gestio-empreses/plans/PioneerPlanCard'
import { PlanPreviewPanel } from '@/components/gestio-empreses/plans/PlanPreviewPanel'
import { PlanEditModal } from '@/components/gestio-empreses/plans/PlanEditModal'
import toast, { Toaster } from 'react-hot-toast'

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
  isActive: boolean
  isVisible: boolean
  destacado: boolean
  color: string
  funcionalidades?: string
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    tier: 'ALL',
    status: 'ALL',
  })

  // Modals i preview
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const loadPlans = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/plans')
      const data = await response.json()
      if (data.success) {
        setPlans(data.data || [])
      }
    } catch (error) {
      console.error('Error carregant plans:', error)
      toast.error('Error carregant plans')
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadPlans()
  }, [])

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan)
    setShowEditModal(true)
  }

  const handleToggleActive = async (plan: Plan) => {
    try {
      const newStatus = !plan.isActive

      const response = await fetch(`/api/admin/plans/${plan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus })
      })

      const data = await response.json()

      if (data.success) {
        setPlans(prevPlans =>
          prevPlans.map(p =>
            p.id === plan.id ? { ...p, isActive: newStatus } : p
          )
        )
        // Actualitzar preview si està seleccionat
        if (selectedPlan?.id === plan.id) {
          setSelectedPlan({ ...selectedPlan, isActive: newStatus })
        }
        toast.success(newStatus ? 'Pla activat' : 'Pla desactivat')
      } else {
        toast.error(data.error || 'Error al canviar l\'estat')
      }
    } catch (error) {
      console.error('Error toggling plan:', error)
      toast.error('Error al canviar l\'estat del pla')
    }
  }

  // Filtrar plans
  const filteredPlans = plans.filter(plan => {
    // Cerca
    if (filters.search) {
      const search = filters.search.toLowerCase()
      if (!plan.name.toLowerCase().includes(search) &&
          !plan.slug.toLowerCase().includes(search)) {
        return false
      }
    }

    // Tier
    if (filters.tier !== 'ALL' && plan.tier !== filters.tier) {
      return false
    }

    // Status
    if (filters.status === 'ACTIVE' && !plan.isActive) return false
    if (filters.status === 'INACTIVE' && plan.isActive) return false
    if (filters.status === 'VISIBLE' && !plan.isVisible) return false
    if (filters.status === 'HIDDEN' && plan.isVisible) return false

    return true
  })

  // Ordenar plans
  const sortedPlans = [...filteredPlans].sort((a, b) => {
    const order = ['PIONERES', 'STANDARD', 'STRATEGIC', 'ENTERPRISE']
    return order.indexOf(a.tier) - order.indexOf(b.tier)
  })

  const pionerPlan = sortedPlans.find(p => p.tier === 'PIONERES')
  const regularPlans = sortedPlans.filter(p => p.tier !== 'PIONERES')

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CreditCard className="h-7 w-7 text-slate-600" strokeWidth={1.5} />
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Plans de subscripció</h1>
            <p className="text-sm text-slate-500">
              Gestiona els plans disponibles per a les empreses
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            <button
              onClick={() => setViewMode('cards')}
              className={cn(
                'px-3 py-2 text-sm font-medium flex items-center gap-2 transition-colors',
                viewMode === 'cards'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              )}
            >
              <LayoutGrid className="h-4 w-4" strokeWidth={1.5} />
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'px-3 py-2 text-sm font-medium flex items-center gap-2 transition-colors',
                viewMode === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              )}
            >
              <TableIcon className="h-4 w-4" strokeWidth={1.5} />
              Taula
            </button>
          </div>

          <button
            onClick={loadPlans}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} strokeWidth={1.5} />
            Actualitzar
          </button>

          <a
            href="/gestio/admin/plans/crear"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Nou pla
          </a>
        </div>
      </div>

      {/* Stats */}
      <PlanStats plans={plans} totalSubscriptions={0} />

      {/* Filters */}
      <PlanFilters filters={filters} onFiltersChange={setFilters} />

      {/* Content */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <RefreshCw className="h-8 w-8 text-slate-300 mx-auto mb-4 animate-spin" strokeWidth={1.5} />
          <p className="text-slate-500">Carregant plans...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Plans list */}
          <div className="lg:col-span-3 space-y-6">
            {viewMode === 'cards' ? (
              <>
                {/* Pla Pioneres compacte */}
                {pionerPlan && (
                  <PioneerPlanCard
                    plan={pionerPlan}
                    onEdit={handleEdit}
                    onToggleActive={handleToggleActive}
                    onClick={() => setSelectedPlan(pionerPlan)}
                    isActive={selectedPlan?.id === pionerPlan.id}
                  />
                )}

                {/* Plans regulars */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {regularPlans.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={cn(
                        'cursor-pointer transition-all',
                        selectedPlan?.id === plan.id && 'ring-2 ring-blue-500 rounded-xl'
                      )}
                    >
                      <PlanCard
                        plan={plan}
                        onEdit={handleEdit}
                        onToggleActive={handleToggleActive}
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <PlanTable
                plans={sortedPlans}
                onEdit={handleEdit}
                onToggleActive={handleToggleActive}
              />
            )}

            {filteredPlans.length === 0 && !isLoading && (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Cap pla trobat
                </h3>
                <p className="text-slate-500">
                  No hi ha plans que coincideixin amb els filtres seleccionats.
                </p>
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <PlanPreviewPanel
                plan={selectedPlan}
                onClose={() => setSelectedPlan(null)}
                onEdit={handleEdit}
                onToggleActive={handleToggleActive}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <PlanEditModal
        plan={editingPlan}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingPlan(null)
        }}
        onSave={() => {
          loadPlans()
          if (selectedPlan && editingPlan && selectedPlan.id === editingPlan.id) {
            // Actualitzar preview
            loadPlans().then(() => {
              const updated = plans.find(p => p.id === editingPlan.id)
              if (updated) setSelectedPlan(updated)
            })
          }
        }}
      />
    </div>
  )
}