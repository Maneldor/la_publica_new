// components/gestio-empreses/assignacions/GestorLeadsList.tsx
'use client'

import { useState, useTransition } from 'react'
import {
  Building2,
  User,
  Euro,
  Check,
  ArrowRightLeft,
  UserMinus,
  Loader2,
  ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { reassignLead, unassignLead } from '@/lib/gestio-empreses/assignment-actions'

interface Lead {
  id: string
  companyName: string
  contactName: string | null
  estimatedRevenue: number | null
  priority: string
  status: string
}

interface Gestor {
  id: string
  name: string | null
  email: string
  load: number
}

interface GestorLeadsListProps {
  gestorName: string
  leads: Lead[]
  gestors: Gestor[]
  currentGestorId: string
  onSuccess: () => void
  userId: string
}

const priorityColors: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  LOW: 'bg-slate-100 text-slate-700',
}

const statusLabels: Record<string, string> = {
  NEW: 'Nou',
  CONTACTED: 'Contactat',
  QUALIFIED: 'Qualificat',
  NEGOTIATION: 'Negociant',
  PROPOSAL_SENT: 'Proposta',
  DOCUMENTATION: 'Documentació',
  WON: 'Guanyat',
}

export function GestorLeadsList({
  gestorName,
  leads,
  gestors,
  currentGestorId,
  onSuccess,
  userId
}: GestorLeadsListProps) {
  const [isPending, startTransition] = useTransition()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showReassign, setShowReassign] = useState<string | null>(null)

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleReassign = (leadId: string, newGestorId: string) => {
    startTransition(async () => {
      await reassignLead(leadId, newGestorId, userId)
      setShowReassign(null)
      onSuccess()
    })
  }

  const handleUnassign = (leadId: string) => {
    startTransition(async () => {
      await unassignLead(leadId, userId)
      onSuccess()
    })
  }

  const formatCurrency = (value: number | null) => {
    if (!value) return '-'
    if (value >= 1000) return `${Math.round(value / 1000)}K €`
    return `${value} €`
  }

  const otherGestors = gestors.filter((g) => g.id !== currentGestorId)

  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <Building2 className="h-10 w-10 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
        <p className="text-slate-500">Aquest gestor no té leads assignats</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">Leads de {gestorName}</h3>
            <p className="text-sm text-slate-500">{leads.length} leads assignats</p>
          </div>
        </div>
      </div>

      {/* Leads list */}
      <div className="divide-y divide-slate-100">
        {leads.map((lead) => (
          <div
            key={lead.id}
            className="p-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              {/* Checkbox */}
              <button
                onClick={() => toggleSelect(lead.id)}
                className={cn(
                  'h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0',
                  selectedIds.includes(lead.id)
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-slate-300 hover:border-slate-400'
                )}
              >
                {selectedIds.includes(lead.id) && (
                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={2} />
                )}
              </button>

              {/* Lead info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-slate-900">{lead.companyName}</p>
                  <span className={cn(
                    'px-2 py-0.5 text-xs font-medium rounded-full',
                    priorityColors[lead.priority]
                  )}>
                    {lead.priority === 'HIGH' ? 'Alta' : lead.priority === 'MEDIUM' ? 'Mitj.' : 'Baixa'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500 mt-0.5">
                  {lead.contactName && (
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" strokeWidth={1.5} />
                      {lead.contactName}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Euro className="h-3.5 w-3.5" strokeWidth={1.5} />
                    {formatCurrency(lead.estimatedRevenue)}
                  </span>
                </div>
              </div>

              {/* Status */}
              <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-full">
                {statusLabels[lead.status] || lead.status}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {/* Reassign dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowReassign(showReassign === lead.id ? null : lead.id)}
                    disabled={isPending}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                    title="Reassignar"
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                    ) : (
                      <ArrowRightLeft className="h-4 w-4" strokeWidth={1.5} />
                    )}
                  </button>

                  {showReassign === lead.id && (
                    <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-10">
                      <p className="px-4 py-1 text-xs font-medium text-slate-400 uppercase">
                        Reassignar a
                      </p>
                      {otherGestors.map((gestor) => (
                        <button
                          key={gestor.id}
                          onClick={() => handleReassign(lead.id, gestor.id)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center justify-between"
                        >
                          <span>{gestor.name || gestor.email}</span>
                          <span className={cn(
                            'text-xs px-2 py-0.5 rounded-full',
                            gestor.load > 80 ? 'bg-red-100 text-red-700' :
                            gestor.load > 50 ? 'bg-amber-100 text-amber-700' :
                            'bg-green-100 text-green-700'
                          )}>
                            {gestor.load}%
                          </span>
                        </button>
                      ))}
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={() => handleUnassign(lead.id)}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <UserMinus className="h-4 w-4" strokeWidth={1.5} />
                          Desassignar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}