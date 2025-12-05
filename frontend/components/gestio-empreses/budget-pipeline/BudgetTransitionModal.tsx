'use client'

import { useState } from 'react'
import {
  X,
  ArrowRight,
  Send,
  CheckCircle,
  XCircle,
  Receipt,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

type TransitionType = 'SEND' | 'APPROVE' | 'REJECT' | 'INVOICE'

interface BudgetTransitionModalProps {
  isOpen: boolean
  onClose: () => void
  item: {
    id: string
    type: 'budget' | 'invoice'
    number: string
    company: { name: string }
    total: number
  } | null
  fromColumn: string
  toColumn: string
  onConfirm: () => Promise<void>
}

const transitionConfig: Record<string, {
  title: string
  description: string
  icon: typeof Send
  color: string
  confirmLabel: string
}> = {
  'DRAFT-SENT': {
    title: 'Enviar pressupost',
    description: 'El pressupost s\'enviarà al client per a la seva aprovació.',
    icon: Send,
    color: 'blue',
    confirmLabel: 'Enviar',
  },
  'SENT-APPROVED': {
    title: 'Aprovar pressupost',
    description: 'El pressupost quedarà marcat com a aprovat pel client.',
    icon: CheckCircle,
    color: 'amber',
    confirmLabel: 'Aprovar',
  },
  'SENT-REJECTED': {
    title: 'Rebutjar pressupost',
    description: 'El pressupost quedarà marcat com a rebutjat.',
    icon: XCircle,
    color: 'red',
    confirmLabel: 'Rebutjar',
  },
  'APPROVED-INVOICED': {
    title: 'Convertir a factura',
    description: 'Es generarà una factura a partir d\'aquest pressupost.',
    icon: Receipt,
    color: 'purple',
    confirmLabel: 'Generar factura',
  },
}

export function BudgetTransitionModal({ isOpen, onClose, item, fromColumn, toColumn, onConfirm }: BudgetTransitionModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen || !item) return null

  const transitionKey = `${fromColumn}-${toColumn}`
  const config = transitionConfig[transitionKey]

  if (!config) {
    // Transició no permesa
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-slate-900/50" onClick={onClose} />
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl p-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="h-6 w-6" strokeWidth={1.5} />
              <h2 className="text-lg font-semibold">Transició no permesa</h2>
            </div>
            <p className="text-slate-600 mb-4">
              No es pot moure directament de "{fromColumn}" a "{toColumn}".
            </p>
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Tancar
            </button>
          </div>
        </div>
      </div>
    )
  }

  const Icon = config.icon

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const colorClasses: Record<string, { bg: string; text: string; button: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', button: 'bg-blue-600 hover:bg-blue-700' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', button: 'bg-amber-600 hover:bg-amber-700' },
    red: { bg: 'bg-red-50', text: 'text-red-600', button: 'bg-red-600 hover:bg-red-700' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', button: 'bg-purple-600 hover:bg-purple-700' },
  }

  const colors = colorClasses[config.color] || colorClasses.blue

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/50" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', colors.bg)}>
                <Icon className={cn('h-5 w-5', colors.text)} strokeWidth={1.5} />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">{config.title}</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100">
              <X className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
            </button>
          </div>

          {/* Content */}
          <div className="p-5">
            <p className="text-slate-600 mb-4">{config.description}</p>

            {/* Item info */}
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-900">{item.number}</span>
                <span className="text-lg font-bold text-slate-900">
                  {(item.total).toFixed(2)}€
                </span>
              </div>
              <p className="text-sm text-slate-500">{item.company.name}</p>
            </div>

            {/* Transition visualization */}
            <div className="flex items-center justify-center gap-3 py-3">
              <span className="px-3 py-1.5 text-sm font-medium bg-slate-100 text-slate-600 rounded-lg">
                {fromColumn}
              </span>
              <ArrowRight className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
              <span className={cn('px-3 py-1.5 text-sm font-medium rounded-lg', colors.bg, colors.text)}>
                {toColumn}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-5 border-t border-slate-200">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50"
            >
              Cancel·lar
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={cn(
                'flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg disabled:opacity-50',
                colors.button
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                  Processant...
                </>
              ) : (
                <>
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                  {config.confirmLabel}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}