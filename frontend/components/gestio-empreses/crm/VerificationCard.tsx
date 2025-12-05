// components/gestio-empreses/crm/VerificationCard.tsx
'use client'

import {
  Building2,
  User,
  Euro,
  Clock,
  Check,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Lead {
  id: string
  companyName: string
  sector: string | null
  priority: string
  estimatedRevenue: number | null
  waitingHours: number
  assignedTo: { id: string; name: string | null; email: string } | null
  contacts: { name: string; position: string | null }[]
}

interface VerificationCardProps {
  lead: Lead
  isSelected: boolean
  isActive: boolean
  onSelect: () => void
  onClick: () => void
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  HIGH: { label: 'Alta', color: 'border-red-500 bg-red-50 text-red-700' },
  MEDIUM: { label: 'Mitjana', color: 'border-amber-500 bg-amber-50 text-amber-700' },
  LOW: { label: 'Baixa', color: 'border-slate-300 bg-slate-50 text-slate-700' },
}

export function VerificationCard({
  lead,
  isSelected,
  isActive,
  onSelect,
  onClick,
}: VerificationCardProps) {
  const priority = priorityConfig[lead.priority] || priorityConfig.MEDIUM
  const isOverSLA = lead.waitingHours > 24
  const primaryContact = lead.contacts[0]

  const formatCurrency = (value: number | null) => {
    if (!value) return '-'
    return new Intl.NumberFormat('ca-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatWaitTime = (hours: number) => {
    if (hours < 1) return 'Fa menys d\'1h'
    if (hours < 24) return `Fa ${Math.round(hours)}h`
    const days = Math.floor(hours / 24)
    return `Fa ${days} ${days === 1 ? 'dia' : 'dies'}`
  }

  return (
    <div
      className={cn(
        'bg-white rounded-xl border-2 p-4 cursor-pointer transition-all',
        isActive
          ? 'border-blue-500 shadow-md'
          : isSelected
            ? 'border-blue-300 bg-blue-50'
            : 'border-slate-200 hover:border-slate-300'
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onSelect()
          }}
          className={cn(
            'mt-1 h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors',
            isSelected
              ? 'bg-blue-500 border-blue-500'
              : 'border-slate-300 hover:border-slate-400'
          )}
        >
          {isSelected && <Check className="h-3.5 w-3.5 text-white" strokeWidth={2} />}
        </button>

        {/* Icon */}
        <div className="p-2 rounded-lg bg-slate-100 flex-shrink-0">
          <Building2 className="h-5 w-5 text-slate-500" strokeWidth={1.5} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-slate-900">{lead.companyName}</h3>
              <p className="text-sm text-slate-500">{lead.sector || 'Sense sector'}</p>
            </div>
            <span className={cn(
              'px-2.5 py-1 text-xs font-medium rounded-full border',
              priority.color
            )}>
              {priority.label}
            </span>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
            <div>
              <p className="text-slate-400 text-xs">Contacte</p>
              <p className="text-slate-700 flex items-center gap-1 mt-0.5">
                <User className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.5} />
                {primaryContact?.name || 'Sense contacte'}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Valor estimat</p>
              <p className="text-slate-700 flex items-center gap-1 mt-0.5">
                <Euro className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.5} />
                {formatCurrency(lead.estimatedRevenue)}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Assignat a</p>
              <p className="text-slate-700 mt-0.5 truncate">
                {lead.assignedTo?.name || lead.assignedTo?.email || 'No assignat'}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">En espera</p>
              <p className={cn(
                'flex items-center gap-1 mt-0.5',
                isOverSLA ? 'text-red-600 font-medium' : 'text-slate-700'
              )}>
                {isOverSLA && <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.5} />}
                <Clock className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.5} />
                {formatWaitTime(lead.waitingHours)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}