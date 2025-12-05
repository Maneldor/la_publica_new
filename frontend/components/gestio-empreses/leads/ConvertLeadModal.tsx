// components/gestio-empreses/leads/ConvertLeadModal.tsx
'use client'

import { useState, useTransition, useEffect } from 'react'
import {
  X,
  Building2,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Euro,
  Users
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  convertLeadToCompany,
  getAvailablePlans,
  canConvertLead
} from '@/lib/gestio-empreses/conversion-actions'

interface Lead {
  id: string
  companyName: string
  cif: string | null
  contactName: string | null
  email: string | null
  estimatedRevenue: number | null
  employees: number | null
  sector: string | null
  assignedTo: {
    id: string
    name: string | null
  } | null
}

interface Plan {
  id: string
  name: string
  tier: string
  price: number
  features: string[]
}

interface ConvertLeadModalProps {
  lead: Lead
  onClose: () => void
  onSuccess: (companyId: string) => void
}

export function ConvertLeadModal({ lead, onClose, onSuccess }: ConvertLeadModalProps) {
  const [isPending, startTransition] = useTransition()
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [canConvert, setCanConvert] = useState<boolean | null>(null)
  const [cannotConvertReason, setCannotConvertReason] = useState<string>('')
  const [step, setStep] = useState<'check' | 'form' | 'success'>('check')

  useEffect(() => {
    // Verificar si es pot convertir
    canConvertLead(lead.id).then((result) => {
      setCanConvert(result.canConvert)
      if (!result.canConvert) {
        setCannotConvertReason(result.reason || 'No es pot convertir')
      } else {
        setStep('form')
      }
    }).catch((error) => {
      setCanConvert(false)
      setCannotConvertReason('Error verificant el lead')
    })

    // Carregar plans
    getAvailablePlans().then(setPlans)
  }, [lead.id])

  const handleConvert = () => {
    if (!selectedPlan) return

    startTransition(async () => {
      try {
        const company = await convertLeadToCompany(
          lead.id,
          {
            planTier: selectedPlan,
            notes: notes || undefined,
            assignToGestorId: lead.assignedTo?.id,
          }
        )
        setStep('success')
        setTimeout(() => {
          onSuccess(company.id)
        }, 2000)
      } catch (error) {
        console.error('Error convertint lead:', error)
        alert('Error convertint el lead. Torna-ho a provar.')
      }
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ca-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-green-50">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-green-600" strokeWidth={1.5} />
            <h2 className="text-lg font-medium text-green-900">
              Convertir lead a empresa
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
        <div className="p-4">
          {/* Comprovació inicial */}
          {step === 'check' && canConvert === null && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" strokeWidth={1.5} />
            </div>
          )}

          {step === 'check' && canConvert === false && (
            <div className="py-4">
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="font-medium text-red-900">No es pot convertir</p>
                  <p className="text-sm text-red-700 mt-1">{cannotConvertReason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Formulari de conversió */}
          {step === 'form' && (
            <div className="space-y-4">
              {/* Resum del lead */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="font-medium text-slate-900 mb-2">{lead.companyName}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-slate-500">CIF:</span>{' '}
                    <span className="text-slate-700">{lead.cif || 'No definit'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Sector:</span>{' '}
                    <span className="text-slate-700">{lead.sector || 'No definit'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Empleats:</span>{' '}
                    <span className="text-slate-700">{lead.employees || 'No definit'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Valor:</span>{' '}
                    <span className="text-slate-700">
                      {lead.estimatedRevenue ? formatCurrency(lead.estimatedRevenue) : 'No definit'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Selecció de pla */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Pla de subscripció *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlan(plan.tier)}
                      className={cn(
                        'p-3 border rounded-lg text-left transition-colors',
                        selectedPlan === plan.tier
                          ? 'border-green-500 bg-green-50'
                          : 'border-slate-200 hover:border-slate-300'
                      )}
                    >
                      <p className="font-medium text-slate-900">{plan.name}</p>
                      <p className="text-sm text-slate-500">
                        {formatCurrency(plan.price)}/mes
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Notes de conversió (opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Condicions especials, observacions..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Info */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" strokeWidth={1.5} />
                <p className="text-sm text-blue-800">
                  L'empresa es crearà amb estat <strong>Pendent</strong> fins que l'Admin l'aprovi i completi el registre.
                </p>
              </div>
            </div>
          )}

          {/* Èxit */}
          {step === 'success' && (
            <div className="py-8 text-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Lead convertit correctament!
              </h3>
              <p className="text-slate-500">
                L'empresa s'ha creat i està pendent d'aprovació.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'form' && (
          <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200 bg-slate-50">
            <button
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel·lar
            </button>
            <button
              onClick={handleConvert}
              disabled={isPending || !selectedPlan}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
              ) : (
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              )}
              Convertir a empresa
            </button>
          </div>
        )}

        {step === 'check' && canConvert === false && (
          <div className="flex items-center justify-end p-4 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
            >
              Tancar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}