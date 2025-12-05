// app/gestio/admin/pressupostos/page.tsx
'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Download, CheckSquare, Square, MoreHorizontal, RefreshCw, FileText, Send, Trash2 } from 'lucide-react'
import { BudgetStats } from '@/components/gestio-empreses/pressupostos/BudgetStats'
import { BudgetFilters } from '@/components/gestio-empreses/pressupostos/BudgetFilters'
import { BudgetCard } from '@/components/gestio-empreses/pressupostos/BudgetCard'
import { BudgetPreviewPanel } from '@/components/gestio-empreses/pressupostos/BudgetPreviewPanel'
import {
  getBudgets,
  bulkUpdateBudgets,
  type BudgetItem,
  type BudgetFilters as BudgetFiltersType
} from '@/lib/gestio-empreses/budget-actions'

export default function PressupostosPage() {
  const router = useRouter()
  const [budgets, setBudgets] = useState<BudgetItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<BudgetFiltersType>({})
  const [selectedBudgets, setSelectedBudgets] = useState<string[]>([])
  const [previewBudget, setPreviewBudget] = useState<BudgetItem | null>(null)
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Carregar pressupostos
  useEffect(() => {
    const loadBudgets = async () => {
      try {
        setLoading(true)
        const data = await getBudgets(filters)
        setBudgets(data)
        // Si hi ha un pressupost seleccionat per previsualització, actualitzar-lo
        if (previewBudget) {
          const updatedBudget = data.find(b => b.id === previewBudget.id)
          if (updatedBudget) {
            setPreviewBudget(updatedBudget)
          } else {
            setPreviewBudget(null) // El pressupost ja no existeix
          }
        }
      } catch (error) {
        console.error('Error loading budgets:', error)
      } finally {
        setLoading(false)
      }
    }

    loadBudgets()
  }, [filters, refreshTrigger])

  // Neteja la selecció quan canvien els filtres
  useEffect(() => {
    setSelectedBudgets([])
  }, [filters])

  const handleFiltersChange = (newFilters: BudgetFiltersType) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({})
  }

  const handleSelectBudget = (budgetId: string) => {
    setSelectedBudgets(prev =>
      prev.includes(budgetId)
        ? prev.filter(id => id !== budgetId)
        : [...prev, budgetId]
    )
  }

  const handleSelectAll = () => {
    if (selectedBudgets.length === budgets.length && budgets.length > 0) {
      setSelectedBudgets([])
    } else {
      setSelectedBudgets(budgets.map(b => b.id))
    }
  }

  const handlePreview = (budget: BudgetItem) => {
    setPreviewBudget(budget)
  }

  const handleClosePreview = () => {
    setPreviewBudget(null)
  }

  const handleBulkAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (selectedBudgets.length === 0) return

    const confirmMessage = {
      approve: 'Aprovar els pressupostos seleccionats?',
      reject: 'Rebutjar els pressupostos seleccionats?',
      delete: 'Eliminar els pressupostos seleccionats? Aquesta acció no es pot desfer.'
    }

    if (confirm(confirmMessage[action])) {
      startTransition(async () => {
        try {
          await bulkUpdateBudgets(selectedBudgets, action)
          setSelectedBudgets([])
          setShowBulkActions(false)
          setRefreshTrigger(prev => prev + 1)
        } catch (error) {
          console.error('Error in bulk action:', error)
        }
      })
    }
  }

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleBudgetSuccess = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const isAllSelected = budgets.length > 0 && selectedBudgets.length === budgets.length
  const isSomeSelected = selectedBudgets.length > 0 && selectedBudgets.length < budgets.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-7 w-7 text-slate-600" strokeWidth={1.5} />
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Pressupostos</h1>
            <p className="text-sm text-slate-500">
              Gestiona i supervisa tots els pressupostos de l'empresa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
            Actualitzar
          </button>
          <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            <Download className="h-4 w-4" strokeWidth={1.5} />
            Exportar
          </button>
          <button
            onClick={() => router.push('/gestio/admin/pressupostos/crear')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Nou Pressupost
          </button>
        </div>
      </div>

      {/* Estadístiques */}
      <BudgetStats />

      {/* Filtres */}
      <BudgetFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

      {/* Barra d'accions en bloc */}
      {selectedBudgets.length > 0 && (
        <div className="flex items-center gap-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
          <span className="text-sm font-medium text-blue-700">
            {selectedBudgets.length} pressupost{selectedBudgets.length !== 1 ? 's' : ''} seleccionat{selectedBudgets.length !== 1 ? 's' : ''}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction('approve')}
              disabled={isPending}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <CheckSquare className="h-4 w-4" strokeWidth={1.5} />
              Aprovar
            </button>
            <button
              onClick={() => handleBulkAction('reject')}
              disabled={isPending}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Rebutjar
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              disabled={isPending}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
              Eliminar
            </button>
          </div>

          <button
            onClick={() => setSelectedBudgets([])}
            className="ml-auto text-sm text-blue-600 hover:text-blue-700"
          >
            Cancel·lar selecció
          </button>
        </div>
      )}

      {/* LAYOUT 2 COLUMNES: Llista + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Llista de pressupostos - 3 columnes */}
        <div className="lg:col-span-3 space-y-4">
          {/* Header de la llista */}
          {budgets.length > 0 && (
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSelectAll}
                  className="p-1 rounded hover:bg-slate-50 transition-colors"
                >
                  {isAllSelected ? (
                    <CheckSquare className="h-4 w-4 text-blue-600" strokeWidth={1.5} />
                  ) : isSomeSelected ? (
                    <div className="h-4 w-4 border border-blue-600 bg-blue-100 rounded flex items-center justify-center">
                      <div className="h-2 w-2 bg-blue-600 rounded"></div>
                    </div>
                  ) : (
                    <Square className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                  )}
                </button>
                <span className="text-sm text-slate-600">
                  {loading ? 'Carregant...' : `${budgets.length} pressupost${budgets.length !== 1 ? 's' : ''}`}
                </span>
              </div>

              <button
                onClick={() => setSelectedBudgets(selectedBudgets.length === budgets.length ? [] : budgets.map(b => b.id))}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {selectedBudgets.length === budgets.length ? 'Deseleccionar tot' : 'Seleccionar tot'}
              </button>
            </div>
          )}

          {/* Contingut */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-slate-100 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : budgets.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-slate-400" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Cap pressupost trobat
              </h3>
              <p className="text-slate-500 mb-4">
                {Object.keys(filters).some(key => filters[key as keyof BudgetFiltersType] !== undefined && filters[key as keyof BudgetFiltersType] !== '' && filters[key as keyof BudgetFiltersType] !== 'all')
                  ? 'No hi ha pressupostos que compleixin els filtres aplicats.'
                  : 'Comença creant el teu primer pressupost.'}
              </p>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="h-4 w-4" strokeWidth={1.5} />
                Crear Pressupost
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {budgets.map((budget) => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  isSelected={selectedBudgets.includes(budget.id)}
                  onSelect={handleSelectBudget}
                  onPreview={handlePreview}
                  onRefresh={handleRefresh}
                />
              ))}
            </div>
          )}
        </div>

        {/* Preview lateral - 2 columnes */}
        <div className="lg:col-span-2 lg:sticky lg:top-6 h-fit">
          <BudgetPreviewPanel
            budget={previewBudget}
            onClose={handleClosePreview}
            onSuccess={handleBudgetSuccess}
            userId="current-user-id"
          />
        </div>
      </div>
    </div>
  )
}