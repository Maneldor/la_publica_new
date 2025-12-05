'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  GitBranch,
  RefreshCw,
  Filter,
  ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { BudgetPipelineStats } from '@/components/gestio-empreses/budget-pipeline/BudgetPipelineStats'
import { BudgetPipelineBoard } from '@/components/gestio-empreses/budget-pipeline/BudgetPipelineBoard'
import toast, { Toaster } from 'react-hot-toast'

interface BudgetPipelineItem {
  id: string
  type: 'budget' | 'invoice'
  number: string
  company: { name: string }
  clientName: string
  total: number
  date: string
  dueDate?: string
  isOverdue: boolean
  paidPercentage?: number
  linkedInvoice?: string
  linkedBudget?: string
  status: string
}

export default function PipelinePage() {
  const [items, setItems] = useState<BudgetPipelineItem[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      // Carregar pressupostos
      const budgetsRes = await fetch('/api/admin/budgets')
      const budgetsData = await budgetsRes.json()

      // Carregar factures
      const invoicesRes = await fetch('/api/admin/invoices')
      const invoicesData = await invoicesRes.json()

      // Transformar pressupostos a BudgetPipelineItems
      const budgetItems: BudgetPipelineItem[] = (budgetsData.budgets || []).map((b: any) => ({
        id: `budget-${b.id}`,
        type: 'budget' as const,
        number: b.budgetNumber || `PRE-${b.id}`,
        company: { name: b.company?.name || 'Sense empresa' },
        clientName: b.clientName || '',
        total: b.total || 0,
        date: b.createdAt,
        dueDate: b.validUntil,
        isOverdue: new Date(b.validUntil || '') < new Date() && !['APPROVED', 'INVOICED'].includes(b.status),
        status: b.status === 'INVOICED' ? 'INVOICED' : b.status || 'DRAFT',
        linkedInvoice: b.invoice?.id,
      }))

      // Transformar factures a BudgetPipelineItems
      const invoiceItems: BudgetPipelineItem[] = (invoicesData.invoices || []).map((i: any) => ({
        id: `invoice-${i.id}`,
        type: 'invoice' as const,
        number: i.invoiceNumber || `FAC-${i.id}`,
        company: { name: i.company?.name || 'Sense empresa' },
        clientName: i.clientName || '',
        total: i.totalAmount || 0,
        date: i.issueDate,
        dueDate: i.dueDate,
        isOverdue: i.isOverdue || false,
        paidPercentage: i.totalAmount > 0 ? Math.round(((i.totalPaid || 0) / i.totalAmount) * 100) : 0,
        status: i.status === 'PAID' ? 'PAID' : 'INVOICED',
        linkedBudget: i.budget?.id,
      }))

      // Combinar i filtrar (evitar duplicats de pressupostos ja facturats)
      const allItems = [
        ...budgetItems.filter(b => b.status !== 'INVOICED'),
        ...invoiceItems,
      ]

      setItems(allItems)

      // Calcular stats
      const calcStats = {
        draft: {
          count: budgetItems.filter(i => i.status === 'DRAFT').length,
          amount: budgetItems.filter(i => i.status === 'DRAFT').reduce((s, i) => s + i.total, 0)
        },
        sent: {
          count: budgetItems.filter(i => i.status === 'SENT').length,
          amount: budgetItems.filter(i => i.status === 'SENT').reduce((s, i) => s + i.total, 0)
        },
        approved: {
          count: budgetItems.filter(i => i.status === 'APPROVED').length,
          amount: budgetItems.filter(i => i.status === 'APPROVED').reduce((s, i) => s + i.total, 0)
        },
        invoiced: {
          count: invoiceItems.filter(i => i.status === 'INVOICED').length,
          amount: invoiceItems.filter(i => i.status === 'INVOICED').reduce((s, i) => s + i.total, 0)
        },
        paid: {
          count: invoiceItems.filter(i => i.status === 'PAID').length,
          amount: invoiceItems.filter(i => i.status === 'PAID').reduce((s, i) => s + i.total, 0)
        },
        overdue: {
          count: allItems.filter(i => i.isOverdue).length,
          amount: allItems.filter(i => i.isOverdue).reduce((s, i) => s + i.total, 0)
        },
        conversionRate: 0,
      }

      setStats(calcStats)

    } catch (error) {
      console.error('Error carregant dades:', error)
      toast.error('Error carregant el pipeline')
      // Mock data per desenvolupament
      generateMockData()
    }
    setIsLoading(false)
  }, [])

  const generateMockData = () => {
    const mockItems: BudgetPipelineItem[] = [
      {
        id: 'budget-1',
        type: 'budget',
        number: 'PRE-2024-001',
        company: { name: 'Empresa XYZ S.L.' },
        clientName: 'Joan Garcia',
        total: 1200,
        date: '2024-12-01',
        dueDate: '2024-12-15',
        isOverdue: false,
        status: 'DRAFT'
      },
      {
        id: 'budget-2',
        type: 'budget',
        number: 'PRE-2024-002',
        company: { name: 'StartUp ABC' },
        clientName: 'Maria Pérez',
        total: 800,
        date: '2024-12-02',
        dueDate: '2024-12-20',
        isOverdue: false,
        status: 'SENT'
      },
      {
        id: 'budget-3',
        type: 'budget',
        number: 'PRE-2024-003',
        company: { name: 'Botiga Online DEF' },
        clientName: 'Pere Martí',
        total: 1500,
        date: '2024-12-03',
        dueDate: '2024-12-25',
        isOverdue: false,
        status: 'APPROVED'
      },
      {
        id: 'invoice-1',
        type: 'invoice',
        number: 'FAC-2024-001',
        company: { name: 'Consultoria GHI' },
        clientName: 'Anna López',
        total: 2000,
        date: '2024-11-15',
        dueDate: '2024-12-15',
        isOverdue: false,
        status: 'INVOICED',
        paidPercentage: 60
      },
      {
        id: 'invoice-2',
        type: 'invoice',
        number: 'FAC-2024-002',
        company: { name: 'Empresa Pagada' },
        clientName: 'Carles Vila',
        total: 3000,
        date: '2024-11-01',
        dueDate: '2024-11-30',
        isOverdue: false,
        status: 'PAID',
        paidPercentage: 100
      }
    ]

    setItems(mockItems)
    setStats({
      draft: { count: 1, amount: 1200 },
      sent: { count: 1, amount: 800 },
      approved: { count: 1, amount: 1500 },
      invoiced: { count: 1, amount: 2000 },
      paid: { count: 1, amount: 3000 },
      overdue: { count: 0, amount: 0 },
      conversionRate: 75
    })
  }

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleTransition = async (itemId: string, fromStatus: string, toStatus: string) => {
    const [type, id] = itemId.split('-')

    try {
      if (type === 'budget') {
        let endpoint = ''
        let method = 'PATCH'
        let body: any = {}

        switch (toStatus) {
          case 'SENT':
            endpoint = `/api/admin/budgets/${id}`
            body = { status: 'SENT' }
            break
          case 'APPROVED':
            endpoint = `/api/admin/budgets/${id}/approve`
            method = 'POST'
            break
          case 'REJECTED':
            endpoint = `/api/admin/budgets/${id}/reject`
            method = 'POST'
            break
          case 'INVOICED':
            endpoint = `/api/admin/budgets/${id}/convert-to-invoice`
            method = 'POST'
            break
        }

        const res = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: method === 'PATCH' ? JSON.stringify(body) : undefined,
        })

        if (!res.ok) throw new Error('Error en la transició')
      }

      toast.success('Transició completada')
      loadData() // Recarregar dades

    } catch (error) {
      console.error('Error:', error)
      toast.error('Error en la transició')
      throw error
    }
  }

  const handleCardClick = (item: BudgetPipelineItem) => {
    const [type, id] = item.id.split('-')
    const url = type === 'budget'
      ? `/gestio/admin/pressupostos?id=${id}`
      : `/gestio/admin/facturacio?id=${id}`
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GitBranch className="h-7 w-7 text-slate-600" strokeWidth={1.5} />
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Pipeline Comercial</h1>
            <p className="text-sm text-slate-500">
              Flux complet de pressupostos i factures
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
              showFilters
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            )}
          >
            <Filter className="h-4 w-4" strokeWidth={1.5} />
            Filtres
            <ChevronDown className={cn(
              'h-4 w-4 transition-transform',
              showFilters && 'rotate-180'
            )} strokeWidth={1.5} />
          </button>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} strokeWidth={1.5} />
            Actualitzar
          </button>
        </div>
      </div>

      {/* Stats */}
      <BudgetPipelineStats stats={stats} />

      {/* Filtres (expandible) */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Filtres avançats (pròximament)</p>
        </div>
      )}

      {/* Pipeline Board */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <RefreshCw className="h-8 w-8 text-slate-300 mx-auto mb-4 animate-spin" strokeWidth={1.5} />
          <p className="text-slate-500">Carregant pipeline...</p>
        </div>
      ) : (
        <BudgetPipelineBoard
          items={items}
          onTransition={handleTransition}
          onCardClick={handleCardClick}
        />
      )}

      {/* Llegenda */}
      <div className="bg-slate-50 rounded-lg p-4">
        <p className="text-xs font-medium text-slate-500 mb-2">Llegenda</p>
        <div className="flex flex-wrap gap-4 text-xs text-slate-600">
          <span>Arrossega les targetes per canviar l'estat</span>
          <span>•</span>
          <span className="text-red-600">Vermell = Vençut</span>
          <span>•</span>
          <span className="text-amber-600">Taronja = Vença aviat</span>
        </div>
      </div>
    </div>
  )
}