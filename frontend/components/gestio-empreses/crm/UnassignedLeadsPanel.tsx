// components/gestio-empreses/crm/UnassignedLeadsPanel.tsx
'use client'

import { useTransition } from 'react'
import { Wand2, Loader2, AlertCircle } from 'lucide-react'
import { AssignmentPanel } from './AssignmentPanel'
import { autoAssignLeads } from '@/lib/gestio-empreses/assignment-actions'

interface Lead {
  id: string
  companyName: string
  contactName: string | null
  status: string
  priority: string
  estimatedRevenue: number | null
  companySize: string | null
  sector: string | null
  createdAt: Date
  assignedTo: { id: string; name: string | null } | null
}

interface Gestor {
  id: string
  name: string | null
  email: string
  role: string
  activeLeads: number
}

interface UnassignedLeadsPanelProps {
  leads: Lead[]
  gestors: Gestor[]
}

export function UnassignedLeadsPanel({ leads, gestors }: UnassignedLeadsPanelProps) {
  const [isPending, startTransition] = useTransition()

  const handleAutoAssign = () => {
    startTransition(async () => {
      try {
        const result = await autoAssignLeads()
        console.log('Autoassignació completada:', result)
        // Recarregar la pàgina per veure els canvis
        window.location.reload()
      } catch (error) {
        console.error('Error en autoassignació:', error)
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-slate-900">Leads sense assignar</h3>
          <p className="text-sm text-slate-500">
            {leads.length} leads pendents d'assignació
          </p>
        </div>

        {leads.length > 0 && (
          <button
            onClick={handleAutoAssign}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
            ) : (
              <Wand2 className="h-4 w-4" strokeWidth={1.5} />
            )}
            Autoassignar tots
          </button>
        )}
      </div>

      {leads.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-green-600" strokeWidth={1.5} />
          <p className="text-sm text-green-800">
            Tots els leads estan assignats correctament.
          </p>
        </div>
      ) : (
        <AssignmentPanel leads={leads} gestors={gestors} />
      )}
    </div>
  )
}