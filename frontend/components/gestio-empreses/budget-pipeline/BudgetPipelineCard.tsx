'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Building2,
  Calendar,
  Euro,
  AlertTriangle,
  GripVertical,
  ExternalLink,
  FileText,
  Receipt
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface BudgetPipelineItem {
  id: string
  type: 'budget' | 'invoice'
  number: string // PRE-2024-001 o FAC-2024-001
  company: {
    name: string
  }
  clientName: string
  total: number
  date: string
  dueDate?: string
  isOverdue: boolean
  paidPercentage?: number // Per factures
  linkedInvoice?: string // Per pressupostos facturats
  linkedBudget?: string // Per factures
}

interface BudgetPipelineCardProps {
  item: BudgetPipelineItem
  onClick: () => void
}

export function BudgetPipelineCard({ item, onClick }: BudgetPipelineCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K€`
    return `${amount.toFixed(0)}€`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ca-ES', {
      day: '2-digit',
      month: 'short',
    })
  }

  const daysUntilDue = item.dueDate
    ? Math.ceil((new Date(item.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-white rounded-lg border p-3 cursor-pointer transition-all group',
        isDragging ? 'opacity-50 shadow-lg scale-105' : 'hover:shadow-md',
        item.isOverdue ? 'border-red-300 bg-red-50/50' : 'border-slate-200'
      )}
      onClick={onClick}
    >
      {/* Header amb grip */}
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="p-1 -ml-1 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" strokeWidth={1.5} />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {item.type === 'budget' ? (
              <FileText className="h-3.5 w-3.5 text-blue-500" strokeWidth={1.5} />
            ) : (
              <Receipt className="h-3.5 w-3.5 text-purple-500" strokeWidth={1.5} />
            )}
            <span className="text-sm font-medium text-slate-900 truncate">
              {item.number}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-500">
            <Building2 className="h-3 w-3" strokeWidth={1.5} />
            <span className="truncate">{item.company.name}</span>
          </div>
        </div>
      </div>

      {/* Import */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-lg font-bold text-slate-900">
          {formatCurrency(item.total)}
        </span>

        {/* Progrés pagament (per factures) */}
        {item.type === 'invoice' && item.paidPercentage !== undefined && item.paidPercentage < 100 && (
          <div className="flex items-center gap-1">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${item.paidPercentage}%` }}
              />
            </div>
            <span className="text-xs text-slate-400">{item.paidPercentage}%</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-slate-400">
          <Calendar className="h-3 w-3" strokeWidth={1.5} />
          {formatDate(item.date)}
        </div>

        {/* Venciment o alerta */}
        {item.isOverdue ? (
          <div className="flex items-center gap-1 text-red-600 font-medium">
            <AlertTriangle className="h-3 w-3" strokeWidth={1.5} />
            Vençut
          </div>
        ) : daysUntilDue !== null && daysUntilDue <= 7 && daysUntilDue > 0 ? (
          <div className="flex items-center gap-1 text-amber-600">
            <AlertTriangle className="h-3 w-3" strokeWidth={1.5} />
            {daysUntilDue}d
          </div>
        ) : null}
      </div>

      {/* Link a factura/pressupost relacionat */}
      {(item.linkedInvoice || item.linkedBudget) && (
        <div className="mt-2 pt-2 border-t border-slate-100">
          <a
            href={item.linkedInvoice ? `/gestio/admin/facturacio?id=${item.linkedInvoice}` : `/gestio/admin/pressupostos?id=${item.linkedBudget}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
          >
            <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
            {item.linkedInvoice ? 'Veure factura' : 'Veure pressupost'}
          </a>
        </div>
      )}
    </div>
  )
}