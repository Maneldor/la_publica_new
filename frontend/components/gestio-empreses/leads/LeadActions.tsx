// components/gestio-empreses/leads/LeadActions.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Phone, Mail, MessageSquare, UserCheck, FileText, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ConvertLeadModal } from './ConvertLeadModal'

interface Lead {
  id: string
  companyName: string
  contactName: string | null
  email: string | null
  phone: string | null
  cif: string | null
  estimatedRevenue: number | null
  employees: number | null
  sector: string | null
  status: string
  assignedTo: {
    id: string
    name: string | null
  } | null
}

interface LeadActionsProps {
  lead: Lead
}

const statusWorkflow: Record<string, { nextStatus: string; label: string; className: string }[]> = {
  NEW: [
    { nextStatus: 'CONTACTED', label: 'Marcar com contactat', className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
    { nextStatus: 'QUALIFIED', label: 'Qualificar directament', className: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' }
  ],
  CONTACTED: [
    { nextStatus: 'NEGOTIATION', label: 'Iniciar negociació', className: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
    { nextStatus: 'QUALIFIED', label: 'Qualificar', className: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' },
    { nextStatus: 'LOST', label: 'Marcar com perdut', className: 'bg-red-100 text-red-700 hover:bg-red-200' }
  ],
  NEGOTIATION: [
    { nextStatus: 'PROPOSAL_SENT', label: 'Enviar proposta', className: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200' },
    { nextStatus: 'QUALIFIED', label: 'Qualificar', className: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' },
    { nextStatus: 'LOST', label: 'Marcar com perdut', className: 'bg-red-100 text-red-700 hover:bg-red-200' }
  ],
  QUALIFIED: [
    { nextStatus: 'PENDING_CRM', label: 'Enviar a CRM', className: 'bg-orange-100 text-orange-700 hover:bg-orange-200' }
  ],
  PROPOSAL_SENT: [
    { nextStatus: 'PENDING_CRM', label: 'Enviar a CRM', className: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
    { nextStatus: 'WON', label: 'Marcar com guanyat', className: 'bg-green-100 text-green-700 hover:bg-green-200' },
    { nextStatus: 'LOST', label: 'Marcar com perdut', className: 'bg-red-100 text-red-700 hover:bg-red-200' }
  ],
  PENDING_CRM: [
    { nextStatus: 'CRM_APPROVED', label: 'Aprovar CRM', className: 'bg-green-100 text-green-700 hover:bg-green-200' },
    { nextStatus: 'CRM_REJECTED', label: 'Rebutjar CRM', className: 'bg-red-100 text-red-700 hover:bg-red-200' }
  ],
  CRM_APPROVED: [
    { nextStatus: 'WON', label: 'Finalitzar com guanyat', className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' }
  ]
}

export function LeadActions({ lead }: LeadActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [showConvertModal, setShowConvertModal] = useState(false)

  const handleQuickAction = async (action: string) => {
    setIsLoading(action)

    try {
      switch (action) {
        case 'call':
          if (lead.phone) {
            window.location.href = `tel:${lead.phone}`
          }
          break
        case 'email':
          if (lead.email) {
            window.location.href = `mailto:${lead.email}?subject=Referent a ${lead.companyName}`
          }
          break
        case 'note':
          console.log('Obrir modal de notes')
          break
      }
    } finally {
      setIsLoading(null)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading('status')

    try {
      const response = await fetch(`/api/leads/${lead.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Error canviant estat:', error)
    } finally {
      setIsLoading(null)
      setShowStatusMenu(false)
    }
  }

  const availableActions = statusWorkflow[lead.status] || []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {lead.phone && (
          <button
            onClick={() => handleQuickAction('call')}
            disabled={isLoading === 'call'}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors disabled:opacity-50"
          >
            <Phone className="h-4 w-4" strokeWidth={1.5} />
            Trucar
          </button>
        )}

        {lead.email && (
          <button
            onClick={() => handleQuickAction('email')}
            disabled={isLoading === 'email'}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors disabled:opacity-50"
          >
            <Mail className="h-4 w-4" strokeWidth={1.5} />
            Email
          </button>
        )}

        <button
          onClick={() => handleQuickAction('note')}
          disabled={isLoading === 'note'}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-amber-700 bg-amber-100 rounded-md hover:bg-amber-200 transition-colors disabled:opacity-50"
        >
          <MessageSquare className="h-4 w-4" strokeWidth={1.5} />
          Afegir nota
        </button>
      </div>

      {availableActions.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-slate-700 mb-3">Canviar estat</h4>
          <div className="flex flex-wrap gap-2">
            {availableActions.map((action) => (
              <button
                key={action.nextStatus}
                onClick={() => handleStatusChange(action.nextStatus)}
                disabled={isLoading === 'status'}
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50",
                  action.className
                )}
              >
                <UserCheck className="h-4 w-4" strokeWidth={1.5} />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t pt-4">
        <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors">
          <FileText className="h-4 w-4" strokeWidth={1.5} />
          Generar proposta
        </button>
      </div>

      {/* Botó de conversió - només visible si el lead està guanyat */}
      {lead.status === 'WON' && (
        <div className="border-t pt-4">
          <button
            onClick={() => setShowConvertModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
          >
            <Building2 className="h-4 w-4" strokeWidth={1.5} />
            Convertir a empresa
          </button>
        </div>
      )}

      {/* Modal de conversió */}
      {showConvertModal && (
        <ConvertLeadModal
          lead={lead}
          onClose={() => setShowConvertModal(false)}
          onSuccess={(companyId) => {
            setShowConvertModal(false)
            router.push(`/gestio/empreses/${companyId}`)
          }}
        />
      )}
    </div>
  )
}