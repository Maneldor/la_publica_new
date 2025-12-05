// components/gestio-empreses/crm/AssignmentPanel.tsx
'use client'

import { useState, useTransition } from 'react'
import {
  ArrowRight,
  Check,
  Loader2,
  Building2,
  Euro,
  Calendar
} from 'lucide-react'
import { format } from 'date-fns'
import { ca } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { assignLeadToGestor, bulkReassignLeads } from '@/lib/gestio-empreses/assignment-actions'

interface Lead {
  id: string
  companyName: string
  contactName: string | null
  status: string
  priority: string
  estimatedRevenue: number | null
  createdAt: Date
}

interface Gestor {
  id: string
  name: string | null
  email: string
  role: string
  activeLeads: number
}

interface AssignmentPanelProps {
  leads: Lead[]
  gestors: Gestor[]
  currentGestorId?: string
}

const statusLabels: Record<string, string> = {
  NEW: 'Nou',
  CONTACTED: 'Contactat',
  NEGOTIATION: 'Negociant',
  QUALIFIED: 'Qualificat',
  DOCUMENTATION: 'Documentació',
}

const priorityColors: Record<string, string> = {
  HIGH: 'border-l-red-500',
  MEDIUM: 'border-l-yellow-500',
  LOW: 'border-l-slate-300',
}

export function AssignmentPanel({ leads, gestors, currentGestorId }: AssignmentPanelProps) {
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [targetGestor, setTargetGestor] = useState<string>('')
  const [isPending, startTransition] = useTransition()

  const toggleLead = (leadId: string) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId)
        ? prev.filter((id) => id !== leadId)
        : [...prev, leadId]
    )
  }

  const toggleAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(leads.map((l) => l.id))
    }
  }

  const handleAssign = () => {
    if (!targetGestor || selectedLeads.length === 0) return

    startTransition(async () => {
      try {
        await bulkReassignLeads(selectedLeads, targetGestor)
        setSelectedLeads([])
        setTargetGestor('')
        // Recarregar la pàgina per veure els canvis
        window.location.reload()
      } catch (error) {
        console.error('Error assignant leads:', error)
      }
    })
  }

  const formatCurrency = (value: number | null) => {
    if (!value) return '-'
    const numValue = typeof value === 'number' ? value : Number(value) || 0
    return new Intl.NumberFormat('ca-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(numValue)
  }

  const availableGestors = gestors.filter((g) => g.id !== currentGestorId)

  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <Building2 className="h-10 w-10 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
        <p className="text-slate-500">No hi ha leads per mostrar</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200">
      {/* Header amb accions */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedLeads.length === leads.length}
              onChange={toggleAll}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-600">
              {selectedLeads.length > 0
                ? `${selectedLeads.length} seleccionats`
                : `${leads.length} leads`}
            </span>
          </div>

          {selectedLeads.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                value={targetGestor}
                onChange={(e) => setTargetGestor(e.target.value)}
                className="px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Assignar a...</option>
                {availableGestors.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name || g.email} ({g.activeLeads} leads)
                  </option>
                ))}
              </select>

              <button
                onClick={handleAssign}
                disabled={!targetGestor || isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                ) : (
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                )}
                Assignar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Llista de leads */}
      <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
        {leads.map((lead) => (
          <div
            key={lead.id}
            className={cn(
              'p-4 flex items-center gap-4 border-l-2',
              priorityColors[lead.priority] || priorityColors.LOW,
              selectedLeads.includes(lead.id) && 'bg-blue-50'
            )}
          >
            <input
              type="checkbox"
              checked={selectedLeads.includes(lead.id)}
              onChange={() => toggleLead(lead.id)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />

            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">
                {lead.companyName}
              </p>
              <p className="text-sm text-slate-500 truncate">
                {lead.contactName || 'Sense contacte'}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm font-medium text-slate-700">
                {formatCurrency(lead.estimatedRevenue)}
              </p>
              <p className="text-xs text-slate-500">
                {format(new Date(lead.createdAt), 'dd MMM', { locale: ca })}
              </p>
            </div>

            <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded">
              {statusLabels[lead.status] || lead.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}