'use client'

import { useState } from 'react'
import {
  X, CreditCard, Banknote, DollarSign, FileCheck,
  HelpCircle, Calendar, Hash, AlertCircle, CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

type PaymentMethod = 'TRANSFER' | 'CARD' | 'CASH' | 'CHECK' | 'OTHER'

interface PaymentData {
  amount: number
  method: PaymentMethod
  date: Date
  reference?: string
  notes?: string
}

interface Invoice {
  id: string
  number: string
  clientName: string
  amount: number
  paidAmount: number
  remainingAmount: number
}

interface PaymentModalProps {
  invoice: Invoice | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (paymentData: PaymentData) => Promise<void>
}

const PAYMENT_METHODS: {
  value: PaymentMethod
  label: string
  icon: any
  description: string
  requiresReference: boolean
}[] = [
  {
    value: 'TRANSFER',
    label: 'Transferència bancària',
    icon: Banknote,
    description: 'Pagament per transferència',
    requiresReference: true
  },
  {
    value: 'CARD',
    label: 'Targeta de crèdit/dèbit',
    icon: CreditCard,
    description: 'Pagament amb targeta',
    requiresReference: true
  },
  {
    value: 'CASH',
    label: 'Efectiu',
    icon: DollarSign,
    description: 'Pagament en metàl·lic',
    requiresReference: false
  },
  {
    value: 'CHECK',
    label: 'Xec',
    icon: FileCheck,
    description: 'Pagament amb xec',
    requiresReference: true
  },
  {
    value: 'OTHER',
    label: 'Altres',
    icon: HelpCircle,
    description: 'Altre mètode de pagament',
    requiresReference: false
  }
]

export function PaymentModal({ invoice, isOpen, onClose, onSubmit }: PaymentModalProps) {
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: 0,
    method: 'TRANSFER',
    date: new Date(),
    reference: '',
    notes: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isOpen || !invoice) return null

  const selectedMethod = PAYMENT_METHODS.find(m => m.value === paymentData.method)
  const remainingAmount = invoice.amount - invoice.paidAmount

  // Reset form when modal opens
  useState(() => {
    if (isOpen && invoice) {
      setPaymentData({
        amount: remainingAmount,
        method: 'TRANSFER',
        date: new Date(),
        reference: '',
        notes: ''
      })
      setErrors({})
    }
  }, [isOpen])

  const updateField = (field: keyof PaymentData, value: any) => {
    setPaymentData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!paymentData.amount || paymentData.amount <= 0) {
      newErrors.amount = 'L\'import ha de ser major que 0'
    }

    if (paymentData.amount > remainingAmount) {
      newErrors.amount = 'L\'import no pot ser superior al pendent'
    }

    if (selectedMethod?.requiresReference && !paymentData.reference?.trim()) {
      newErrors.reference = 'La referència és obligatòria per aquest mètode'
    }

    if (!paymentData.date) {
      newErrors.date = 'La data és obligatòria'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Hi ha errors al formulari')
      return
    }

    setIsLoading(true)
    try {
      await onSubmit(paymentData)
      toast.success('Pagament registrat correctament')
      onClose()
    } catch (error) {
      console.error('Error registrant pagament:', error)
      toast.error('Error registrant el pagament')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ca-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Registrar Pagament
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Factura {invoice.number} • {invoice.clientName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Invoice summary */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Import total:</span>
              <span className="font-medium text-slate-900">
                {formatCurrency(invoice.amount)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Ja pagat:</span>
              <span className="font-medium text-green-600">
                {formatCurrency(invoice.paidAmount)}
              </span>
            </div>
            <div className="flex justify-between text-sm border-t border-slate-200 pt-2">
              <span className="text-slate-700 font-medium">Import pendent:</span>
              <span className="font-bold text-red-600">
                {formatCurrency(remainingAmount)}
              </span>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Import del pagament <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
              <input
                type="number"
                step="0.01"
                min="0"
                max={remainingAmount}
                value={paymentData.amount}
                onChange={(e) => updateField('amount', parseFloat(e.target.value) || 0)}
                className={cn(
                  'w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:ring-2',
                  errors.amount
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-slate-200 focus:ring-emerald-500 focus:border-emerald-500'
                )}
                placeholder="0.00"
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" strokeWidth={1.5} />
                {errors.amount}
              </p>
            )}
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => updateField('amount', remainingAmount)}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Import complet ({formatCurrency(remainingAmount)})
              </button>
            </div>
          </div>

          {/* Payment method */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Mètode de pagament <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((method) => {
                const IconComponent = method.icon
                const isSelected = paymentData.method === method.value

                return (
                  <label
                    key={method.value}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <input
                      type="radio"
                      name="method"
                      value={method.value}
                      checked={isSelected}
                      onChange={(e) => updateField('method', e.target.value as PaymentMethod)}
                      className="sr-only"
                    />
                    <IconComponent
                      className={cn(
                        'h-5 w-5',
                        isSelected ? 'text-emerald-600' : 'text-slate-400'
                      )}
                      strokeWidth={1.5}
                    />
                    <div className="flex-1">
                      <p className={cn(
                        'text-sm font-medium',
                        isSelected ? 'text-emerald-700' : 'text-slate-700'
                      )}>
                        {method.label}
                      </p>
                      <p className="text-xs text-slate-500">{method.description}</p>
                    </div>
                    {isSelected && (
                      <CheckCircle className="h-5 w-5 text-emerald-600" strokeWidth={1.5} />
                    )}
                  </label>
                )
              })}
            </div>
          </div>

          {/* Reference */}
          {selectedMethod?.requiresReference && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Referència <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
                <input
                  type="text"
                  value={paymentData.reference}
                  onChange={(e) => updateField('reference', e.target.value)}
                  className={cn(
                    'w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:ring-2',
                    errors.reference
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-slate-200 focus:ring-emerald-500 focus:border-emerald-500'
                  )}
                  placeholder="Número de referència, autorització..."
                />
              </div>
              {errors.reference && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" strokeWidth={1.5} />
                  {errors.reference}
                </p>
              )}
            </div>
          )}

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Data del pagament <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
              <input
                type="date"
                value={formatDate(paymentData.date)}
                onChange={(e) => updateField('date', new Date(e.target.value))}
                className={cn(
                  'w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:ring-2',
                  errors.date
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-slate-200 focus:ring-emerald-500 focus:border-emerald-500'
                )}
              />
            </div>
            {errors.date && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" strokeWidth={1.5} />
                {errors.date}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Notes (opcional)
            </label>
            <textarea
              value={paymentData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Comentaris addicionals sobre el pagament..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel·lar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {isLoading ? 'Registrant...' : 'Registrar Pagament'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}