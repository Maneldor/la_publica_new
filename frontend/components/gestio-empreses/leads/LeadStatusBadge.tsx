// components/gestio-empreses/leads/LeadStatusBadge.tsx
'use client'

import { cn } from '@/lib/utils'

interface LeadStatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
}

const statusConfig: Record<string, { label: string; className: string }> = {
  NEW: { label: 'Nou', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  CONTACTED: { label: 'Contactat', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  NEGOTIATION: { label: 'Negociant', className: 'bg-purple-100 text-purple-700 border-purple-200' },
  QUALIFIED: { label: 'Qualificat', className: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  PROPOSAL_SENT: { label: 'Proposta enviada', className: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  PENDING_CRM: { label: 'Pendent CRM', className: 'bg-orange-100 text-orange-700 border-orange-200' },
  CRM_APPROVED: { label: 'Aprovat CRM', className: 'bg-green-100 text-green-700 border-green-200' },
  CRM_REJECTED: { label: 'Rebutjat CRM', className: 'bg-red-100 text-red-700 border-red-200' },
  PENDING_ADMIN: { label: 'Pendent Admin', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  WON: { label: 'Guanyat', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  LOST: { label: 'Perdut', className: 'bg-slate-100 text-slate-600 border-slate-200' },
}

export function LeadStatusBadge({ status, size = 'md' }: LeadStatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-slate-100 text-slate-700 border-slate-200' }

  return (
    <span className={cn(
      "inline-flex items-center font-medium rounded-full border",
      size === 'sm' ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
      config.className
    )}>
      {config.label}
    </span>
  )
}