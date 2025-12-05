// components/gestio-empreses/crm/VerificationQueue.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle,
  XCircle,
  Eye,
  Building2,
  User,
  Euro,
  Clock,
  AlertTriangle,
  ChevronRight
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ca } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { ApproveRejectModal } from './ApproveRejectModal'

interface Lead {
  id: string
  companyName: string
  contactName: string | null
  email: string | null
  status: string
  priority: string
  estimatedRevenue: number | null
  sector: string | null
  companySize: string | null
  createdAt: Date
  assignedTo: {
    id: string
    name: string | null
    email: string
    image: string | null
  } | null
  activities: Array<{
    id: string
    type: string
    description: string
    createdAt: Date
    user: { name: string | null } | null
  }>
}

interface VerificationQueueProps {
  leads: Lead[]
}

const priorityConfig = {
  HIGH: { label: 'Alta', color: 'text-red-600 bg-red-50 border-red-200' },
  MEDIUM: { label: 'Mitjana', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  LOW: { label: 'Baixa', color: 'text-slate-600 bg-slate-50 border-slate-200' },
}

export function VerificationQueue({ leads }: VerificationQueueProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | null>(null)

  const formatCurrency = (value: number | null) => {
    if (!value) return '-'
    const numValue = typeof value === 'number' ? value : Number(value) || 0
    return new Intl.NumberFormat('ca-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(numValue)
  }

  const openApproveModal = (lead: Lead) => {
    setSelectedLead(lead)
    setModalAction('approve')
  }

  const openRejectModal = (lead: Lead) => {
    setSelectedLead(lead)
    setModalAction('reject')
  }

  const closeModal = () => {
    setSelectedLead(null)
    setModalAction(null)
  }

  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" strokeWidth={1.5} />
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Tot verificat!
        </h3>
        <p className="text-slate-500">
          No hi ha leads pendents de verificació en aquest moment.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {leads.map((lead) => {
          const priority = priorityConfig[lead.priority as keyof typeof priorityConfig] || priorityConfig.MEDIUM
          const waitingTime = formatDistanceToNow(new Date(lead.createdAt), {
            locale: ca,
            addSuffix: true
          })

          return (
            <div
              key={lead.id}
              className="bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
            >
              {/* Capçalera */}
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">{lead.companyName}</h3>
                      <p className="text-sm text-slate-500">{lead.sector || 'Sense sector'}</p>
                    </div>
                  </div>
                  <span className={cn(
                    'px-2.5 py-1 text-xs font-medium rounded-full border',
                    priority.color
                  )}>
                    {priority.label}
                  </span>
                </div>
              </div>

              {/* Cos */}
              <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Contacte</p>
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.5} />
                    <span className="text-sm text-slate-700">{lead.contactName || '-'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Valor estimat</p>
                  <div className="flex items-center gap-1.5">
                    <Euro className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.5} />
                    <span className="text-sm font-medium text-slate-700">
                      {formatCurrency(lead.estimatedRevenue)}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Assignat a</p>
                  <span className="text-sm text-slate-700">
                    {lead.assignedTo?.name || 'Sense assignar'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">En espera</p>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.5} />
                    <span className="text-sm text-slate-700">{waitingTime}</span>
                  </div>
                </div>
              </div>

              {/* Última activitat */}
              {lead.activities.length > 0 && (
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    Última activitat: {lead.activities[0].description}
                    <span className="text-slate-400 ml-2">
                      ({formatDistanceToNow(new Date(lead.activities[0].createdAt), { locale: ca, addSuffix: true })})
                    </span>
                  </p>
                </div>
              )}

              {/* Accions */}
              <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={`/gestio/leads/${lead.id}`}
                  className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
                >
                  <Eye className="h-4 w-4" strokeWidth={1.5} />
                  Veure detall
                  <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </Link>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openRejectModal(lead)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                  >
                    <XCircle className="h-4 w-4" strokeWidth={1.5} />
                    Rebutjar
                  </button>
                  <button
                    onClick={() => openApproveModal(lead)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                    Aprovar
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal Aprovar/Rebutjar */}
      {selectedLead && modalAction && (
        <ApproveRejectModal
          lead={selectedLead}
          action={modalAction}
          onClose={closeModal}
        />
      )}
    </>
  )
}