// components/gestio-empreses/pressupostos/BudgetPreviewPanel.tsx
'use client'

import { useState, useTransition } from 'react'
import {
  X,
  Building2,
  Mail,
  Calendar,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Receipt,
  Download,
  Loader2,
  ExternalLink,
  User,
  Euro,
  AlertTriangle
} from 'lucide-react'
import { format } from 'date-fns'
import { ca } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface BudgetItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface Budget {
  id: string
  number: string
  status: string
  createdAt: Date
  dueDate?: Date
  client: string
  amount: number
  description?: string
  gestorId: string
  gestorName: string
  items: BudgetItem[]
}

interface BudgetPreviewPanelProps {
  budget: Budget | null
  onClose: () => void
  onSuccess: () => void
  userId?: string
}

const statusConfig: Record<string, {
  label: string
  icon: any
  color: string
  bgColor: string
}> = {
  draft: { label: 'Esborrany', icon: FileText, color: 'text-slate-600', bgColor: 'bg-slate-100' },
  pending: { label: 'Pendent', icon: AlertTriangle, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  sent: { label: 'Enviat', icon: Send, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  approved: { label: 'Aprovat', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
  rejected: { label: 'Rebutjat', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100' },
  invoiced: { label: 'Facturat', icon: Receipt, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  expired: { label: 'Caducat', icon: FileText, color: 'text-amber-600', bgColor: 'bg-amber-100' },
}

export function BudgetPreviewPanel({ budget, onClose, onSuccess, userId }: BudgetPreviewPanelProps) {
  const [isPending, startTransition] = useTransition()
  const [actionType, setActionType] = useState<string | null>(null)

  if (!budget) {
    return (
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 text-center h-[600px] flex flex-col items-center justify-center">
        <FileText className="h-12 w-12 text-slate-300 mb-4" strokeWidth={1.5} />
        <p className="text-slate-500">Selecciona un pressupost per veure els detalls</p>
      </div>
    )
  }

  const status = statusConfig[budget.status] || statusConfig.draft
  const StatusIcon = status.icon

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ca-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value)
  }

  const formatDate = (date: Date) => {
    return format(date, 'dd MMM yyyy', { locale: ca })
  }

  const isOverdue = budget.dueDate && new Date() > budget.dueDate

  const handleAction = async (action: string) => {
    setActionType(action)
    startTransition(async () => {
      try {
        // Aquí anirien les crides a les server actions
        // await sendBudget(budget.id, userId)
        // await approveBudget(budget.id, userId)
        // etc.
        console.log(`Acció ${action} executada per pressupost ${budget.id}`)

        // Simular delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (onSuccess) onSuccess()
      } catch (error) {
        console.error('Error en acció:', error)
        alert(error instanceof Error ? error.message : 'Error en l\'acció')
      }
      setActionType(null)
    })
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 h-fit flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-semibold text-slate-900">{budget.number}</h2>
            <span className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full',
              status.bgColor,
              status.color
            )}>
              <StatusIcon className="h-3 w-3" strokeWidth={1.5} />
              {status.label}
            </span>
            {isOverdue && (
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-600">
                Vençut
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500">{budget.client}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-100 transition-colors"
        >
          <X className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 max-h-[500px]">
        {/* Info bàsica */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-1">
                Gestor assignat
              </p>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                <p className="font-medium text-slate-900">{budget.gestorName}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-1">
                Data creació
              </p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                <p className="font-medium text-slate-900">
                  {formatDate(budget.createdAt)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-1">
                Import total
              </p>
              <div className="flex items-center gap-2">
                <Euro className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(budget.amount)}
                </p>
              </div>
            </div>

            {budget.dueDate && (
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-1">
                  Data venciment
                </p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                  <p className={cn(
                    'font-medium',
                    isOverdue ? 'text-red-600' : 'text-slate-900'
                  )}>
                    {formatDate(budget.dueDate)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Descripció */}
        {budget.description && (
          <div>
            <h3 className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-2">
              Descripció
            </h3>
            <p className="text-slate-900 bg-slate-50 p-4 rounded-lg text-sm leading-relaxed">
              {budget.description}
            </p>
          </div>
        )}

        {/* Conceptes del pressupost */}
        <div>
          <h3 className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-3">
            Conceptes ({budget.items.length})
          </h3>
          <div className="space-y-3">
            {budget.items.map((item, index) => (
              <div
                key={item.id}
                className="bg-slate-50 rounded-lg p-4 border border-slate-100"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-slate-900 flex-1 text-sm">
                    {item.description}
                  </h4>
                  <span className="text-lg font-bold text-slate-900 ml-4">
                    {formatCurrency(item.total)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span>Quantitat: <span className="font-medium">{item.quantity}</span></span>
                  <span>Preu unitari: <span className="font-medium">{formatCurrency(item.unitPrice)}</span></span>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-slate-900">
                Total Pressupost
              </span>
              <span className="text-2xl font-bold text-blue-600">
                {formatCurrency(budget.amount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer amb accions */}
      <div className="p-4 border-t border-slate-100 space-y-3">
        {/* Descarregar PDF */}
        <button
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          onClick={() => handleAction('download')}
        >
          <Download className="h-4 w-4" strokeWidth={1.5} />
          Descarregar PDF
        </button>

        {/* Accions segons estat */}
        <div className="grid grid-cols-2 gap-2">
          {(budget.status === 'draft' || budget.status === 'pending') && (
            <>
              <button
                onClick={() => handleAction('send')}
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                {isPending && actionType === 'send' ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                ) : (
                  <Send className="h-4 w-4" strokeWidth={1.5} />
                )}
                Enviar
              </button>
              <button
                onClick={() => handleAction('delete')}
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                Eliminar
              </button>
            </>
          )}

          {budget.status === 'pending' && (
            <>
              <button
                onClick={() => handleAction('approve')}
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                {isPending && actionType === 'approve' ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                ) : (
                  <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                )}
                Aprovar
              </button>
              <button
                onClick={() => handleAction('reject')}
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                {isPending && actionType === 'reject' ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                ) : (
                  <XCircle className="h-4 w-4" strokeWidth={1.5} />
                )}
                Rebutjar
              </button>
            </>
          )}

          {budget.status === 'approved' && (
            <button
              onClick={() => handleAction('invoice')}
              disabled={isPending}
              className="col-span-2 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              {isPending && actionType === 'invoice' ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
              ) : (
                <Receipt className="h-4 w-4" strokeWidth={1.5} />
              )}
              Convertir a factura
            </button>
          )}
        </div>

        {/* Enllaços */}
        <div className="flex justify-center pt-2">
          <button
            className="text-xs text-slate-500 hover:text-slate-700 underline"
            onClick={() => handleAction('view_full')}
          >
            Veure complet
          </button>
        </div>
      </div>
    </div>
  )
}