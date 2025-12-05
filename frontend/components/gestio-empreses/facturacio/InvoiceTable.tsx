'use client'

import {
  FileText, Calendar, User, Euro, CheckCircle, Clock,
  AlertTriangle, Send, FileX, Eye, Download, CreditCard,
  MoreHorizontal, ArrowUpDown
} from 'lucide-react'
import { cn } from '@/lib/utils'

type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'
type SortField = 'number' | 'clientName' | 'amount' | 'issueDate' | 'dueDate' | 'status'
type SortDirection = 'asc' | 'desc'

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
}

interface InvoiceTableProps {
  invoices: Invoice[]
  selectedInvoiceId?: string
  onSelectInvoice: (invoice: Invoice) => void
  onViewInvoice?: (invoice: Invoice) => void
  onDownloadInvoice?: (invoice: Invoice) => void
  onRegisterPayment?: (invoice: Invoice) => void
  sortField?: SortField
  sortDirection?: SortDirection
  onSort?: (field: SortField) => void
  isLoading?: boolean
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

export function InvoiceTable({
  invoices,
  selectedInvoiceId,
  onSelectInvoice,
  onViewInvoice,
  onDownloadInvoice,
  onRegisterPayment,
  sortField,
  sortDirection,
  onSort,
  isLoading = false
}: InvoiceTableProps) {
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

  const getPaymentProgress = (invoice: Invoice) => {
    if (invoice.status === 'PAID') return 100
    if (invoice.paidAmount > 0) return (invoice.paidAmount / invoice.amount) * 100
    return 0
  }

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => onSort?.(field)}
      className="flex items-center gap-1 text-left hover:text-slate-900 transition-colors"
    >
      {children}
      <ArrowUpDown className={cn(
        'h-3 w-3 transition-colors',
        sortField === field ? 'text-emerald-500' : 'text-slate-400'
      )} strokeWidth={1.5} />
    </button>
  )

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Número</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Import</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Emesa</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Venciment</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Estat</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Accions</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="px-4 py-4">
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-20"></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-32"></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-16"></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-20"></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-20"></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-6 bg-slate-200 rounded-full animate-pulse w-20"></div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <div className="h-8 w-8 bg-slate-200 rounded animate-pulse"></div>
                      <div className="h-8 w-8 bg-slate-200 rounded animate-pulse"></div>
                      <div className="h-8 w-8 bg-slate-200 rounded animate-pulse"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (invoices.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" strokeWidth={1.5} />
        <h3 className="text-lg font-medium text-slate-500 mb-2">No hi ha factures</h3>
        <p className="text-slate-400">No s'han trobat factures amb els criteris especificats.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                {onSort ? (
                  <SortButton field="number">Número</SortButton>
                ) : (
                  'Número'
                )}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                {onSort ? (
                  <SortButton field="clientName">Client</SortButton>
                ) : (
                  'Client'
                )}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                {onSort ? (
                  <SortButton field="amount">Import</SortButton>
                ) : (
                  'Import'
                )}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                {onSort ? (
                  <SortButton field="issueDate">Emesa</SortButton>
                ) : (
                  'Emesa'
                )}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                {onSort ? (
                  <SortButton field="dueDate">Venciment</SortButton>
                ) : (
                  'Venciment'
                )}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                {onSort ? (
                  <SortButton field="status">Estat</SortButton>
                ) : (
                  'Estat'
                )}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">
                Accions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map((invoice) => {
              const statusConfig = STATUS_CONFIG[invoice.status]
              const StatusIcon = statusConfig.icon
              const paymentProgress = getPaymentProgress(invoice)
              const isOverdue = invoice.status === 'OVERDUE'
              const isSelected = selectedInvoiceId === invoice.id
              const isPartiallyPaid = invoice.paidAmount > 0 && invoice.paidAmount < invoice.amount

              return (
                <tr
                  key={invoice.id}
                  onClick={() => onSelectInvoice(invoice)}
                  className={cn(
                    'cursor-pointer transition-colors hover:bg-slate-50',
                    isSelected && 'bg-emerald-50 border-emerald-200',
                    isOverdue && !isSelected && 'bg-red-50/30'
                  )}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">
                        {invoice.number}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div>
                      <div className="font-medium text-slate-900">
                        {invoice.clientName}
                      </div>
                      <div className="text-sm text-slate-500">
                        {invoice.clientEmail}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div>
                      <div className="font-medium text-slate-900">
                        {formatCurrency(invoice.amount)}
                      </div>
                      {paymentProgress > 0 && (
                        <div className="mt-1">
                          <div className="text-xs text-slate-500 mb-0.5">
                            {paymentProgress.toFixed(0)}% pagat
                          </div>
                          <div className="w-16 bg-slate-100 rounded-full h-1">
                            <div
                              className={cn(
                                'h-1 rounded-full transition-all',
                                invoice.status === 'PAID' ? 'bg-green-500' : 'bg-emerald-500'
                              )}
                              style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="h-3 w-3 text-slate-400" strokeWidth={1.5} />
                      {formatDate(invoice.issueDate)}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className={cn(
                      'flex items-center gap-2 text-sm',
                      isOverdue ? 'text-red-600 font-medium' : 'text-slate-600'
                    )}>
                      <Clock className={cn(
                        'h-3 w-3',
                        isOverdue ? 'text-red-500' : 'text-slate-400'
                      )} strokeWidth={1.5} />
                      {formatDate(invoice.dueDate)}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <span className={cn(
                      'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full',
                      statusConfig.bgColor,
                      statusConfig.textColor
                    )}>
                      <StatusIcon className="h-3 w-3" strokeWidth={1.5} />
                      {statusConfig.label}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onViewInvoice?.(invoice)
                        }}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Veure detalls"
                      >
                        <Eye className="h-4 w-4" strokeWidth={1.5} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDownloadInvoice?.(invoice)
                        }}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Descarregar PDF"
                      >
                        <Download className="h-4 w-4" strokeWidth={1.5} />
                      </button>

                      {(invoice.status === 'SENT' || invoice.status === 'OVERDUE' || isPartiallyPaid) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onRegisterPayment?.(invoice)
                          }}
                          className="p-2 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title={isPartiallyPaid ? 'Completar pagament' : 'Registrar pagament'}
                        >
                          <CreditCard className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                      )}

                      <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}