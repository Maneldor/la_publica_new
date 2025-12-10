// components/gestio-empreses/assignacions/UnassignedLeads.tsx
'use client'

import { useState } from 'react'
import {
  UserX,
  Check,
  Building2,
  Euro,
  ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Lead {
  id: string
  companyName: string
  contactName: string | null
  estimatedRevenue: number | null
  priority: string
  status: string
  sector: string | null
}

interface Gestor {
  id: string
  name: string | null
  email: string
  load: number
}

interface UnassignedLeadsProps {
  leads: Lead[]
  gestors: Gestor[]
  onAssign: (leadIds: string[], gestorId: string) => void
}

const priorityColors: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700 border-red-200',
  MEDIUM: 'bg-amber-100 text-amber-700 border-amber-200',
  LOW: 'bg-slate-100 text-slate-700 border-slate-200',
}

const priorityLabels: Record<string, string> = {
  HIGH: 'Alta',
  MEDIUM: 'Mitjana',
  LOW: 'Baixa',
}

export function UnassignedLeads({ leads, gestors, onAssign }: UnassignedLeadsProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showDropdown, setShowDropdown] = useState(false)

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const selectAll = () => {
    if (selectedIds.length === leads.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(leads.map((l) => l.id))
    }
  }

  const handleAssign = (gestorId: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    onAssign(selectedIds, gestorId)
    setSelectedIds([])
    setShowDropdown(false)
  }

  const formatCurrency = (value: number | null) => {
    if (!value) return '-'
    if (value >= 1000) return `${Math.round(value / 1000)}K €`
    return `${value} €`
  }

  if (leads.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-100">
            <Check className="h-5 w-5 text-green-600" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-medium text-green-800">Tots els leads estan assignats</p>
            <p className="text-sm text-green-600">No hi ha leads pendents d'assignació</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-amber-200">
      {/* Header */}
      <div className="p-4 border-b border-amber-100 bg-amber-50/50 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100">
              <UserX className="h-5 w-5 text-amber-600" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Leads sense assignar</h2>
              <p className="text-sm text-slate-500">{leads.length} leads pendents d'assignació</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={selectAll}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {selectedIds.length === leads.length ? 'Deseleccionar' : 'Seleccionar tots'}
            </button>

            {selectedIds.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Assignar {selectedIds.length}
                  <ChevronDown className="h-4 w-4" strokeWidth={1.5} />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-10">
                    <p className="px-4 py-2 text-xs font-medium text-slate-400 uppercase">
                      Selecciona gestor
                    </p>
                    {gestors.map((gestor) => (
                      <button
                        key={gestor.id}
                        onClick={(e) => handleAssign(gestor.id, e)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center justify-between"
                      >
                        <span className="font-medium text-slate-700">
                          {gestor.name || gestor.email}
                        </span>
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
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Leads grid */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {leads.map((lead) => (
          <div
            key={lead.id}
            onClick={() => toggleSelect(lead.id)}
            className={cn(
              'p-3 rounded-lg border-2 cursor-pointer transition-all',
              selectedIds.includes(lead.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 hover:border-slate-300'
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                'h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                selectedIds.includes(lead.id)
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-slate-300'
              )}>
                {selectedIds.includes(lead.id) && (
                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={2} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-slate-900 truncate">{lead.companyName}</p>
                  <span className={cn(
                    'px-2 py-0.5 text-xs font-medium rounded-full border flex-shrink-0',
                    priorityColors[lead.priority]
                  )}>
                    {priorityLabels[lead.priority]}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Euro className="h-3.5 w-3.5" strokeWidth={1.5} />
                    {formatCurrency(lead.estimatedRevenue)}
                  </span>
                  {lead.sector && (
                    <span className="truncate">{lead.sector}</span>
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