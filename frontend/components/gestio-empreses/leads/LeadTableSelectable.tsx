// components/gestio-empreses/leads/LeadTableSelectable.tsx
'use client'

import { useState, useEffect } from 'react'
import { ArrowUpDown, ChevronDown, ChevronUp, Building2, User, Phone, Mail, Calendar, Trophy, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ca } from 'date-fns/locale'

interface Lead {
  id: string
  company: string
  contact: string
  email: string | null
  phone: string | null
  status: string
  priority: string
  source: string
  sector: string | null
  value: number | null
  assignedTo: string | null
  gestorName: string | null
  createdAt: Date
  updatedAt: Date
}

interface Gestor {
  id: string
  name: string | null
  email: string
}

interface LeadTableSelectableProps {
  leads: Lead[]
  selectedIds: string[]
  onSelectionChange: (selectedIds: string[]) => void
  gestors: Gestor[]
  hideGestorColumn?: boolean
}

type SortField = 'company' | 'contact' | 'status' | 'priority' | 'value' | 'createdAt' | 'updatedAt'
type SortDirection = 'asc' | 'desc'

const statusConfig = {
  'NEW': { label: 'Nou', color: 'bg-blue-500' },
  'CONTACTED': { label: 'Contactat', color: 'bg-yellow-500' },
  'NEGOTIATION': { label: 'Negociant', color: 'bg-orange-500' },
  'QUALIFIED': { label: 'Qualificat', color: 'bg-purple-500' },
  'PROPOSAL_SENT': { label: 'Proposta enviada', color: 'bg-indigo-500' },
  'PENDING_CRM': { label: 'Pendent CRM', color: 'bg-amber-500' },
  'CRM_APPROVED': { label: 'Aprovat CRM', color: 'bg-teal-500' },
  'CRM_REJECTED': { label: 'Rebutjat CRM', color: 'bg-red-400' },
  'PENDING_ADMIN': { label: 'Pendent Admin', color: 'bg-cyan-500' },
  'WON': { label: 'Guanyat', color: 'bg-green-500' },
  'LOST': { label: 'Perdut', color: 'bg-slate-500' },
}

const priorityConfig = {
  'HIGH': { label: 'Alta', color: 'bg-red-500', icon: AlertCircle },
  'MEDIUM': { label: 'Mitjana', color: 'bg-amber-500', icon: null },
  'LOW': { label: 'Baixa', color: 'bg-slate-400', icon: null },
}

export function LeadTableSelectable({ leads, selectedIds, onSelectionChange, gestors, hideGestorColumn = false }: LeadTableSelectableProps) {
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedLeads = [...leads].sort((a, b) => {
    const getValue = (lead: Lead, field: SortField) => {
      switch (field) {
        case 'company': return lead.company.toLowerCase()
        case 'contact': return lead.contact.toLowerCase()
        case 'status': return lead.status
        case 'priority': return lead.priority
        case 'value': return lead.value || 0
        case 'createdAt': return lead.createdAt.getTime()
        case 'updatedAt': return lead.updatedAt.getTime()
        default: return ''
      }
    }

    const aVal = getValue(a, sortField)
    const bVal = getValue(b, sortField)

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }

    return sortDirection === 'asc' ?
      (aVal as number) - (bVal as number) :
      (bVal as number) - (aVal as number)
  })

  const handleSelectAll = () => {
    if (selectedIds.length === leads.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(leads.map(lead => lead.id))
    }
  }

  const handleSelectLead = (leadId: string) => {
    if (selectedIds.includes(leadId)) {
      onSelectionChange(selectedIds.filter(id => id !== leadId))
    } else {
      onSelectionChange([...selectedIds, leadId])
    }
  }

  const isAllSelected = selectedIds.length === leads.length && leads.length > 0
  const isPartialSelected = selectedIds.length > 0 && selectedIds.length < leads.length

  const formatValue = (value: number | null) => {
    if (!value) return '-'
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M €`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K €`
    }
    return `${value} €`
  }

  const SortButton = ({ field, children }: { field: SortField, children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-slate-700 transition-colors"
    >
      {children}
      <div className="flex flex-col">
        <ChevronUp
          className={cn(
            'h-3 w-3 transition-colors',
            sortField === field && sortDirection === 'asc' ? 'text-blue-600' : 'text-slate-400'
          )}
        />
        <ChevronDown
          className={cn(
            'h-3 w-3 transition-colors -mt-1',
            sortField === field && sortDirection === 'desc' ? 'text-blue-600' : 'text-slate-400'
          )}
        />
      </div>
    </button>
  )

  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-12 text-center">
          <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" strokeWidth={1} />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No s'han trobat leads</h3>
          <p className="text-slate-500">No hi ha leads que coincideixin amb els filtres aplicats.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="w-12 px-4 py-3 text-left">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isPartialSelected
                    }}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                </label>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                Empresa
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                Contacte
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                Estat
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                Prioritat
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                Valor
              </th>
              {!hideGestorColumn && (
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Gestor
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                Data creació
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {sortedLeads.map((lead) => {
              const isSelected = selectedIds.includes(lead.id)
              const statusInfo = statusConfig[lead.status as keyof typeof statusConfig]
              const priorityInfo = priorityConfig[lead.priority as keyof typeof priorityConfig]
              const gestor = gestors.find(g => g.id === lead.assignedTo)

              return (
                <tr
                  key={lead.id}
                  className={cn(
                    'hover:bg-slate-50 transition-colors cursor-pointer',
                    isSelected && 'bg-blue-50 hover:bg-blue-100'
                  )}
                  onClick={() => handleSelectLead(lead.id)}
                >
                  <td className="w-12 px-4 py-4">
                    <label className="flex items-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectLead(lead.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                      />
                    </label>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="font-medium text-slate-900">{lead.company}</div>
                      {lead.sector && (
                        <div className="text-sm text-slate-500">{lead.sector}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="font-medium text-slate-900">{lead.contact}</div>
                      <div className="space-y-0.5">
                        {lead.email && (
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Mail className="h-3 w-3" />
                            {lead.email}
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Phone className="h-3 w-3" />
                            {lead.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-white rounded-full">
                      <span className={cn('w-2 h-2 rounded-full', statusInfo?.color || 'bg-slate-500')} />
                      {statusInfo?.label || lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn(
                      'inline-flex items-center px-2.5 py-1 text-xs font-medium text-white rounded-full',
                      priorityInfo?.color || 'bg-slate-500'
                    )}>
                      {priorityInfo?.label || lead.priority}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-medium text-slate-900">
                      {formatValue(lead.value)}
                    </span>
                  </td>
                  {!hideGestorColumn && (
                    <td className="px-4 py-4">
                      {gestor ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-700">
                              {(gestor.name || gestor.email).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm text-slate-900">
                            {gestor.name || gestor.email}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-500">Sense assignar</span>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-4">
                    <div className="text-sm text-slate-500">
                      {format(lead.createdAt, 'dd MMM yyyy', { locale: ca })}
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