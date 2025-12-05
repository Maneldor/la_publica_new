'use client'

import {
  FileText, Calendar, User, Euro, Clock, CheckCircle,
  AlertTriangle, Send, FileX, Eye, Download, CreditCard,
  MoreHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'

type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'

interface Invoice {
  id: string
  number: string
  clientName: string
  clientEmail: string
  amount: number
  paidAmount: number
  issueDate: Date
  dueDate: Date
  status: InvoiceStatus
  description?: string
  paymentProgress?: number
}

interface InvoiceCardProps {
  invoice: Invoice
  onView?: (invoice: Invoice) => void
  onDownload?: (invoice: Invoice) => void
  onRegisterPayment?: (invoice: Invoice) => void
  isSelected?: boolean
}

const STATUS_CONFIG = {
  DRAFT: {
    label: 'Esborrany',
    icon: FileText,
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-600',
    borderColor: 'border-slate-300'
  },
  SENT: {
    label: 'Enviada',
    icon: Send,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-300'
  },
  PAID: {
    label: 'Pagada',
    icon: CheckCircle,
    bgColor: 'bg-green-100',
    textColor: 'text-green-600',
    borderColor: 'border-green-300'
  },
  OVERDUE: {
    label: 'Endarrerida',
    icon: AlertTriangle,
    bgColor: 'bg-red-100',
    textColor: 'text-red-600',
    borderColor: 'border-red-300'
  },
  CANCELLED: {
    label: 'Cancel·lada',
    icon: FileX,
    bgColor: 'bg-red-100',
    textColor: 'text-red-600',
    borderColor: 'border-red-300'
  }
}

export function InvoiceCard({
  invoice,
  onView,
  onDownload,
  onRegisterPayment,
  isSelected = false
}: InvoiceCardProps) {
  const statusConfig = STATUS_CONFIG[invoice.status]
  const StatusIcon = statusConfig.icon

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ca-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ca-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const getPaymentProgress = () => {
    if (invoice.status === 'PAID') return 100
    if (invoice.paidAmount > 0) return (invoice.paidAmount / invoice.amount) * 100
    return 0
  }

  const paymentProgress = getPaymentProgress()
  const isOverdue = invoice.status === 'OVERDUE'
  const isPaid = invoice.status === 'PAID'
  const isPartiallyPaid = invoice.paidAmount > 0 && invoice.paidAmount < invoice.amount

  return (
    <div
      className={cn(
        'bg-white rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer',
        isSelected
          ? 'border-emerald-500 ring-2 ring-emerald-100'
          : 'border-slate-200 hover:border-slate-300',
        isOverdue && !isSelected && 'border-red-200 bg-red-50/30'
      )}
      onClick={() => onView?.(invoice)}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-900">{invoice.number}</h3>
              <span className={cn(
                'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full',
                statusConfig.bgColor,
                statusConfig.textColor
              )}>
                <StatusIcon className="h-3 w-3" strokeWidth={1.5} />
                {statusConfig.label}
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <User className="h-3 w-3" strokeWidth={1.5} />
              <span>{invoice.clientName}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onView?.(invoice)
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Veure detalls"
            >
              <Eye className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDownload?.(invoice)
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Descarregar PDF"
            >
              <Download className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Descripció */}
        {invoice.description && (
          <p className="text-sm text-slate-600 line-clamp-2">
            {invoice.description}
          </p>
        )}

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
            <div>
              <span className="text-slate-500">Emesa:</span>
              <p className="text-slate-900">{formatDate(invoice.issueDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
            <div>
              <span className="text-slate-500">Venciment:</span>
              <p className={cn(
                'font-medium',
                isOverdue ? 'text-red-600' : 'text-slate-900'
              )}>
                {formatDate(invoice.dueDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Import i progrés de pagament */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Euro className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />
              <span className="text-sm text-slate-500">Import:</span>
            </div>
            <span className="font-semibold text-slate-900">
              {formatCurrency(invoice.amount)}
            </span>
          </div>

          {/* Barra de progrés de pagament */}
          {paymentProgress > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">
                  {isPaid ? 'Pagat' : `Pagat ${paymentProgress.toFixed(0)}%`}
                </span>
                <span className="text-slate-600">
                  {formatCurrency(invoice.paidAmount)} / {formatCurrency(invoice.amount)}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className={cn(
                    'h-2 rounded-full transition-all',
                    isPaid ? 'bg-green-500' : 'bg-emerald-500'
                  )}
                  style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer actions */}
      {(invoice.status === 'SENT' || invoice.status === 'OVERDUE' || isPartiallyPaid) && (
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRegisterPayment?.(invoice)
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors"
          >
            <CreditCard className="h-4 w-4" strokeWidth={1.5} />
            {isPartiallyPaid ? 'Completar pagament' : 'Registrar pagament'}
          </button>
        </div>
      )}
    </div>
  )
}