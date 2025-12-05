// components/gestio-empreses/crm/ApproveRejectModal.tsx
'use client'

import { useState, useTransition } from 'react'
import { X, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { approveLead, rejectLead } from '@/lib/gestio-empreses/crm-actions'

interface Lead {
  id: string
  companyName: string
}

interface ApproveRejectModalProps {
  lead: Lead
  action: 'approve' | 'reject'
  onClose: () => void
}

const rejectionReasons = [
  { value: 'INCOMPLETE_INFO', label: 'Informació incompleta' },
  { value: 'INVALID_CONTACT', label: 'Contacte no vàlid' },
  { value: 'DUPLICATE', label: 'Empresa duplicada' },
  { value: 'NOT_QUALIFIED', label: 'No qualificat pel segment' },
  { value: 'PRICING_ISSUE', label: 'Problema amb preus/condicions' },
  { value: 'OTHER', label: 'Altre motiu' },
]

export function ApproveRejectModal({ lead, action, onClose }: ApproveRejectModalProps) {
  const [isPending, startTransition] = useTransition()
  const [notes, setNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [returnStatus, setReturnStatus] = useState<'NEGOTIATION' | 'CONTACTED'>('NEGOTIATION')

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        if (action === 'approve') {
          await approveLead(lead.id, notes || undefined)
        } else {
          const reason = rejectionReason === 'OTHER' ? notes :
            rejectionReasons.find(r => r.value === rejectionReason)?.label || notes
          await rejectLead(lead.id, reason, returnStatus)
        }
        onClose()
      } catch (error) {
        console.error('Error:', error)
      }
    })
  }

  const isApprove = action === 'approve'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className={cn(
          'flex items-center justify-between p-4 border-b',
          isApprove ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
        )}>
          <div className="flex items-center gap-2">
            {isApprove ? (
              <CheckCircle className="h-5 w-5 text-green-600" strokeWidth={1.5} />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" strokeWidth={1.5} />
            )}
            <h2 className={cn(
              'text-lg font-medium',
              isApprove ? 'text-green-900' : 'text-red-900'
            )}>
              {isApprove ? 'Aprovar lead' : 'Rebutjar lead'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-white/50 transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500">Empresa</p>
            <p className="font-medium text-slate-900">{lead.companyName}</p>
          </div>

          {isApprove ? (
            <>
              <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" strokeWidth={1.5} />
                <div className="text-sm text-green-800">
                  <p className="font-medium">El lead passarà a:</p>
                  <p>Guanyat → Contractat</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Notes (opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Comentaris per l'equip d'Admin..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" strokeWidth={1.5} />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">El lead tornarà al gestor comercial</p>
                  <p>Ha de corregir els problemes indicats</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Motiu del rebuig *
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Selecciona un motiu...</option>
                  {rejectionReasons.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              {rejectionReason === 'OTHER' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Descriu el motiu *
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Explica per què es rebutja..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Retornar a l'estat
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="NEGOTIATION"
                      checked={returnStatus === 'NEGOTIATION'}
                      onChange={(e) => setReturnStatus(e.target.value as 'NEGOTIATION')}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-slate-700">Negociant</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="CONTACTED"
                      checked={returnStatus === 'CONTACTED'}
                      onChange={(e) => setReturnStatus(e.target.value as 'CONTACTED')}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-slate-700">Contactat</span>
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel·lar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || (!isApprove && !rejectionReason) || (rejectionReason === 'OTHER' && !notes.trim())}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md transition-colors disabled:opacity-50',
              isApprove
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            )}
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />}
            {isApprove ? 'Aprovar i contractar' : 'Rebutjar i retornar'}
          </button>
        </div>
      </div>
    </div>
  )
}