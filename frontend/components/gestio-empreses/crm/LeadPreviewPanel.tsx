// components/gestio-empreses/crm/LeadPreviewPanel.tsx
'use client'

import { useState, useTransition } from 'react'
import {
  X,
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  Euro,
  Calendar,
  MessageSquare,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Clock
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { ca } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { approveLead, rejectLead } from '@/lib/gestio-empreses/verification-actions'

interface Contact {
  id: string
  name: string
  email: string | null
  phone: string | null
  position: string | null
  isPrimary: boolean
}

interface Activity {
  id: string
  type: string
  description: string
  createdAt: Date
  createdBy: { name: string | null } | null
}

interface Lead {
  id: string
  companyName: string
  sector: string | null
  website: string | null
  phone: string | null
  city: string | null
  priority: string
  estimatedRevenue: number | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  assignedTo: { id: string; name: string | null; email: string } | null
  contacts: Contact[]
  activities: Activity[]
}

interface LeadPreviewPanelProps {
  lead: Lead | null
  onClose: () => void
  onSuccess: () => void
  userId: string
}

export function LeadPreviewPanel({ lead, onClose, onSuccess, userId }: LeadPreviewPanelProps) {
  const [isPending, startTransition] = useTransition()
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)
  const [notes, setNotes] = useState('')

  if (!lead) {
    return (
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 text-center h-full flex flex-col items-center justify-center">
        <Building2 className="h-12 w-12 text-slate-300 mb-4" strokeWidth={1.5} />
        <p className="text-slate-500">Selecciona un lead per veure els detalls</p>
      </div>
    )
  }

  const handleApprove = () => {
    startTransition(async () => {
      await approveLead(lead.id, userId, notes || undefined)
      setNotes('')
      setAction(null)
      onSuccess()
    })
  }

  const handleReject = () => {
    if (!notes.trim()) return

    startTransition(async () => {
      await rejectLead(lead.id, userId, notes)
      setNotes('')
      setAction(null)
      onSuccess()
    })
  }

  const formatCurrency = (value: number | null) => {
    if (!value) return '-'
    return new Intl.NumberFormat('ca-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const activityIcons: Record<string, any> = {
    NOTE: MessageSquare,
    CALL: Phone,
    EMAIL: Mail,
    STATUS_CHANGE: Clock,
    CREATED: Calendar,
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-100">
            <Building2 className="h-5 w-5 text-slate-500" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">{lead.companyName}</h2>
            <p className="text-sm text-slate-500">{lead.sector || 'Sense sector'}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-100"
        >
          <X className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
        </button>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Quick info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-1">Valor estimat</p>
            <p className="font-semibold text-slate-900">{formatCurrency(lead.estimatedRevenue)}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-1">Creat</p>
            <p className="font-semibold text-slate-900">
              {format(new Date(lead.createdAt), 'd MMM yyyy', { locale: ca })}
            </p>
          </div>
        </div>

        {/* Contacts */}
        <div>
          <h3 className="text-sm font-medium text-slate-900 mb-3">
            Contactes ({lead.contacts.length})
          </h3>
          <div className="space-y-2">
            {lead.contacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-slate-50 rounded-lg p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                    <span className="font-medium text-slate-900">{contact.name}</span>
                  </div>
                  {contact.isPrimary && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      Principal
                    </span>
                  )}
                </div>
                {contact.position && (
                  <p className="text-sm text-slate-500 mt-1 ml-6">{contact.position}</p>
                )}
                <div className="flex items-center gap-4 mt-2 ml-6 text-sm">
                  {contact.email && (
                    <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
                      {contact.email}
                    </a>
                  )}
                  {contact.phone && (
                    <span className="text-slate-600 flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
                      {contact.phone}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {lead.notes && (
          <div>
            <h3 className="text-sm font-medium text-slate-900 mb-2">Notes</h3>
            <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
              {lead.notes}
            </p>
          </div>
        )}

        {/* Links */}
        {lead.website && (
          <a
            href={lead.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
          >
            <Globe className="h-4 w-4" strokeWidth={1.5} />
            {lead.website}
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
          </a>
        )}

        {/* Activity Timeline */}
        <div>
          <h3 className="text-sm font-medium text-slate-900 mb-3">
            Activitat recent
          </h3>
          <div className="space-y-3">
            {lead.activities.length === 0 ? (
              <p className="text-sm text-slate-400">Cap activitat registrada</p>
            ) : (
              lead.activities.map((activity) => {
                const Icon = activityIcons[activity.type] || MessageSquare

                return (
                  <div key={activity.id} className="flex gap-3">
                    <div className="p-1.5 rounded-lg bg-slate-100 h-fit">
                      <Icon className="h-3.5 w-3.5 text-slate-500" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-700">{activity.description}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {activity.createdBy?.name || 'Sistema'} · {formatDistanceToNow(new Date(activity.createdAt), { locale: ca, addSuffix: true })}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-slate-100 space-y-3">
        {action === null ? (
          <div className="flex gap-3">
            <button
              onClick={() => setAction('reject')}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <XCircle className="h-4 w-4" strokeWidth={1.5} />
              Rebutjar
            </button>
            <button
              onClick={() => setAction('approve')}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
              Aprovar
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={action === 'approve' ? 'Notes (opcional)...' : 'Motiu del rebuig (obligatori)...'}
              rows={2}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setAction(null)
                  setNotes('')
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel·lar
              </button>
              <button
                onClick={action === 'approve' ? handleApprove : handleReject}
                disabled={isPending || (action === 'reject' && !notes.trim())}
                className={cn(
                  'flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50',
                  action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                )}
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />}
                {action === 'approve' ? 'Confirmar aprovació' : 'Confirmar rebuig'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}