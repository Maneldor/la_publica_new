// components/gestio-empreses/leads/LeadsTable.tsx
'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ca } from 'date-fns/locale'
import {
  Building2,
  User,
  Mail,
  Phone,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Lead {
  id: string
  companyName: string
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
  status: string
  priority: string
  source: string | null
  estimatedRevenue: number | null
  createdAt: Date
  assignedTo?: {
    name: string | null
  } | null
}

interface LeadsTableProps {
  leads: Lead[]
}

const statusConfig: Record<string, { label: string; className: string }> = {
  NEW: { label: 'Nou', className: 'bg-blue-100 text-blue-700' },
  CONTACTED: { label: 'Contactat', className: 'bg-yellow-100 text-yellow-700' },
  NEGOTIATION: { label: 'Negociant', className: 'bg-purple-100 text-purple-700' },
  QUALIFIED: { label: 'Qualificat', className: 'bg-indigo-100 text-indigo-700' },
  PROPOSAL_SENT: { label: 'Proposta', className: 'bg-cyan-100 text-cyan-700' },
  PENDING_CRM: { label: 'Pendent CRM', className: 'bg-orange-100 text-orange-700' },
  CRM_APPROVED: { label: 'Aprovat CRM', className: 'bg-green-100 text-green-700' },
  CRM_REJECTED: { label: 'Rebutjat CRM', className: 'bg-red-100 text-red-700' },
  PENDING_ADMIN: { label: 'Pendent Admin', className: 'bg-amber-100 text-amber-700' },
  WON: { label: 'Guanyat', className: 'bg-emerald-100 text-emerald-700' },
  LOST: { label: 'Perdut', className: 'bg-slate-100 text-slate-700' },
}

const priorityConfig: Record<string, { label: string; className: string }> = {
  HIGH: { label: 'Alta', className: 'text-red-600' },
  MEDIUM: { label: 'Mitjana', className: 'text-amber-600' },
  LOW: { label: 'Baixa', className: 'text-slate-500' },
}

function formatCurrency(value: number | null): string {
  if (!value) return '-'
  return new Intl.NumberFormat('ca-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function LeadsTable({ leads }: LeadsTableProps) {
  if (!leads || leads.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
        <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" strokeWidth={1.5} />
        <h3 className="text-lg font-medium text-slate-800 mb-2">No hi ha leads</h3>
        <p className="text-sm text-slate-500 mb-4">Comença afegint el teu primer lead comercial</p>
        <Link
          href="/gestio/leads/nou"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          Crear lead
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">
                Empresa / Contacte
              </th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">
                Estat
              </th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">
                Prioritat
              </th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">
                Valor
              </th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">
                Assignat
              </th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">
                Creat
              </th>
              <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">
                Accions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((lead) => {
              const status = statusConfig[lead.status] || { label: lead.status, className: 'bg-slate-100 text-slate-700' }
              const priority = priorityConfig[lead.priority] || priorityConfig.MEDIUM

              return (
                <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-slate-100 rounded">
                        <Building2 className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
                      </div>
                      <div>
                        <Link
                          href={`/gestio/leads/${lead.id}`}
                          className="font-medium text-slate-800 hover:text-blue-600"
                        >
                          {lead.companyName}
                        </Link>
                        {lead.contactName && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <User className="h-3 w-3 text-slate-400" strokeWidth={1.5} />
                            <span className="text-sm text-slate-500">{lead.contactName}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-1">
                          {lead.contactEmail && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-slate-400" strokeWidth={1.5} />
                              <span className="text-xs text-slate-400">{lead.contactEmail}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex px-2 py-1 text-xs font-medium rounded-full",
                      status.className
                    )}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-sm font-medium", priority.className)}>
                      {priority.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-700">
                      {formatCurrency(lead.estimatedRevenue)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-500">
                      {lead.assignedTo?.name || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-500">
                      {formatDistanceToNow(new Date(lead.createdAt), {
                        addSuffix: true,
                        locale: ca
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/gestio/leads/${lead.id}`}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Veure detall"
                      >
                        <Eye className="h-4 w-4" strokeWidth={1.5} />
                      </Link>
                      <Link
                        href={`/gestio/leads/${lead.id}/editar`}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" strokeWidth={1.5} />
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}