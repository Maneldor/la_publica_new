'use client'

import {
  X, Calendar, User, Euro, Clock, CheckCircle, AlertTriangle,
  Send, FileX, Download, CreditCard, Mail, Phone, MapPin,
  FileText, Edit, Trash2, Copy, Share
} from 'lucide-react'
import { cn } from '@/lib/utils'

type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'
type PaymentMethod = 'TRANSFER' | 'CARD' | 'CASH' | 'CHECK' | 'OTHER'

interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface Payment {
  id: string
  amount: number
  date: Date
  method: PaymentMethod
  reference?: string
}

interface Invoice {
  id: string
  number: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  clientAddress?: string
  amount: number
  paidAmount: number
  issueDate: Date
  dueDate: Date
  status: InvoiceStatus
  description?: string
  items: InvoiceItem[]
  payments: Payment[]
  notes?: string
}

interface InvoicePreviewPanelProps {
  invoice: Invoice | null
  isOpen: boolean
  onClose: () => void
  onDownload?: (invoice: Invoice) => void
  onRegisterPayment?: (invoice: Invoice) => void
  onEdit?: (invoice: Invoice) => void
  onDelete?: (invoice: Invoice) => void
}

const STATUS_CONFIG = {
  DRAFT: {
    label: 'Esborrany',
    icon: FileText,
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-600'
  },
  SENT: {
    label: 'Enviada',
    icon: Send,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600'
  },
  PAID: {
    label: 'Pagada',
    icon: CheckCircle,
    bgColor: 'bg-green-100',
    textColor: 'text-green-600'
  },
  OVERDUE: {
    label: 'Endarrerida',
    icon: AlertTriangle,
    bgColor: 'bg-red-100',
    textColor: 'text-red-600'
  },
  CANCELLED: {
    label: 'Cancel·lada',
    icon: FileX,
    bgColor: 'bg-red-100',
    textColor: 'text-red-600'
  }
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  TRANSFER: 'Transferència',
  CARD: 'Targeta',
  CASH: 'Efectiu',
  CHECK: 'Xec',
  OTHER: 'Altres'
}

export function InvoicePreviewPanel({
  invoice,
  isOpen,
  onClose,
  onDownload,
  onRegisterPayment,
  onEdit,
  onDelete
}: InvoicePreviewPanelProps) {
  if (!isOpen || !invoice) return null

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
  const remainingAmount = invoice.amount - invoice.paidAmount

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white border-l border-slate-200 shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Factura {invoice.number}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn(
              'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full',
              statusConfig.bgColor,
              statusConfig.textColor
            )}>
              <StatusIcon className="h-3 w-3" strokeWidth={1.5} />
              {statusConfig.label}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Client info */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase mb-3">
              Informació del client
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                <span className="text-sm text-slate-900">{invoice.clientName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                <span className="text-sm text-slate-600">{invoice.clientEmail}</span>
              </div>
              {invoice.clientPhone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                  <span className="text-sm text-slate-600">{invoice.clientPhone}</span>
                </div>
              )}
              {invoice.clientAddress && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-slate-400 mt-0.5" strokeWidth={1.5} />
                  <span className="text-sm text-slate-600">{invoice.clientAddress}</span>
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase mb-3">
              Dates
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                  <span className="text-xs text-slate-500 uppercase">Emesa</span>
                </div>
                <p className="text-sm text-slate-900">{formatDate(invoice.issueDate)}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                  <span className="text-xs text-slate-500 uppercase">Venciment</span>
                </div>
                <p className={cn(
                  'text-sm',
                  isOverdue ? 'text-red-600 font-medium' : 'text-slate-900'
                )}>
                  {formatDate(invoice.dueDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase mb-3">
              Articles
            </h3>
            <div className="space-y-3">
              {invoice.items.map((item, index) => (
                <div key={index} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-medium text-slate-900">
                      {item.description}
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatCurrency(item.total)}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500">
                    {item.quantity} x {formatCurrency(item.unitPrice)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment info */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase mb-3">
              Informació de pagament
            </h3>

            <div className="space-y-3">
              {/* Total amount */}
              <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                <span className="text-sm text-emerald-700">Import total</span>
                <span className="text-lg font-bold text-emerald-700">
                  {formatCurrency(invoice.amount)}
                </span>
              </div>

              {/* Payment progress */}
              {paymentProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      Pagat ({paymentProgress.toFixed(0)}%)
                    </span>
                    <span className="text-slate-900 font-medium">
                      {formatCurrency(invoice.paidAmount)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                    ></div>
                  </div>
                  {!isPaid && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Pendent</span>
                      <span className="text-red-600 font-medium">
                        {formatCurrency(remainingAmount)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Payments history */}
          {invoice.payments.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase mb-3">
                Historial de pagaments
              </h3>
              <div className="space-y-2">
                {invoice.payments.map((payment) => (
                  <div key={payment.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-xs text-green-600">
                        {PAYMENT_METHOD_LABELS[payment.method]} • {formatDate(payment.date)}
                      </p>
                      {payment.reference && (
                        <p className="text-xs text-green-600">Ref: {payment.reference}</p>
                      )}
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-600" strokeWidth={1.5} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase mb-3">
                Notes
              </h3>
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                {invoice.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="p-6 border-t border-slate-200 space-y-3">
        {/* Primary actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onDownload?.(invoice)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
          >
            <Download className="h-4 w-4" strokeWidth={1.5} />
            Descarregar
          </button>

          {(invoice.status === 'SENT' || invoice.status === 'OVERDUE' || isPartiallyPaid) && (
            <button
              onClick={() => onRegisterPayment?.(invoice)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <CreditCard className="h-4 w-4" strokeWidth={1.5} />
              {isPartiallyPaid ? 'Completar' : 'Pagament'}
            </button>
          )}
        </div>

        {/* Secondary actions */}
        <div className="flex justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => onEdit?.(invoice)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Editar"
            >
              <Edit className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Copiar">
              <Copy className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Compartir">
              <Share className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          <button
            onClick={() => onDelete?.(invoice)}
            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  )
}