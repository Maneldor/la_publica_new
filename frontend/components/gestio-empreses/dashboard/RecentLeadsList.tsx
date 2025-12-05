// components/gestio-empreses/dashboard/RecentLeadsList.tsx
// FITXER NOU - Llista de leads recents per dashboard

'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ca } from 'date-fns/locale'
import {
  Building2,
  Mail,
  Phone,
  ArrowRight,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Lead {
  id: string
  companyName: string
  contactName: string | null
  email: string | null
  status: string
  priority: string
  createdAt: Date
  assignedTo?: {
    id: string
    name: string | null
  } | null
}

interface RecentLeadsListProps {
  leads: Lead[]
  className?: string
}

const statusLabels: Record<string, { label: string; color: string }> = {
  NEW: { label: 'Nou', color: 'bg-blue-100 text-blue-700' },
  CONTACTED: { label: 'Contactat', color: 'bg-yellow-100 text-yellow-700' },
  NEGOTIATION: { label: 'Negociant', color: 'bg-purple-100 text-purple-700' },
  QUALIFIED: { label: 'Qualificat', color: 'bg-green-100 text-green-700' },
  PROPOSAL_SENT: { label: 'Proposta', color: 'bg-indigo-100 text-indigo-700' },
  WON: { label: 'Guanyat', color: 'bg-emerald-100 text-emerald-700' },
  LOST: { label: 'Perdut', color: 'bg-red-100 text-red-700' },
}

const priorityIndicator: Record<string, string> = {
  HIGH: 'bg-red-500',
  URGENT: 'bg-red-500',
  MEDIUM: 'bg-amber-500',
  LOW: 'bg-slate-400',
}

export function RecentLeadsList({ leads, className }: RecentLeadsListProps) {
  if (leads.length === 0) {
    return (
      <div className={cn("bg-white rounded-lg border border-slate-200", className)}>
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-medium text-slate-800">Leads recents</h3>
        </div>
        <div className="p-8 text-center">
          <Building2 className="h-10 w-10 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-slate-500">No hi ha leads recents</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("bg-white rounded-lg border border-slate-200", className)}>
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-medium text-slate-800">Leads recents</h3>
        <Link
          href="/gestor-empreses/leads"
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          Veure tots
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </Link>
      </div>
      <div className="divide-y divide-slate-100">
        {leads.map((lead) => {
          const status = statusLabels[lead.status] || { label: lead.status, color: 'bg-slate-100 text-slate-700' }
          const priorityColor = priorityIndicator[lead.priority] || priorityIndicator.LOW

          return (
            <Link
              key={lead.id}
              href={`/gestor-empreses/leads/${lead.id}`}
              className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
            >
              {/* Indicador prioritat */}
              <div className={cn("w-1 h-12 rounded-full", priorityColor)} />

              {/* Info lead */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-400 flex-shrink-0" strokeWidth={1.5} />
                  <span className="font-medium text-slate-800 truncate">
                    {lead.companyName}
                  </span>
                </div>
                {lead.contactName && (
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-3.5 w-3.5 text-slate-300" strokeWidth={1.5} />
                    <span className="text-sm text-slate-500 truncate">
                      {lead.contactName}
                    </span>
                  </div>
                )}
              </div>

              {/* Estat i temps */}
              <div className="text-right flex-shrink-0">
                <span className={cn(
                  "inline-flex px-2 py-0.5 text-xs font-medium rounded-full",
                  status.color
                )}>
                  {status.label}
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  {formatDistanceToNow(new Date(lead.createdAt), {
                    addSuffix: true,
                    locale: ca
                  })}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}