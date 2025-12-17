// components/gestio-empreses/unified-pipeline/PipelineCard.tsx
'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Building2, Users, Mail, Phone, Clock, AlertTriangle, User, Euro } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PipelineItem {
  id: string
  type: 'lead' | 'empresa'
  name: string
  contactName?: string
  email?: string
  phone?: string
  stage: string
  status: string
  priority?: string
  estimatedValue?: number
  sector?: string
  createdAt: string
  updatedAt: string
  assignedTo?: { id: string; name: string } | null
  daysInStage: number
}

interface PipelineCardProps {
  item: PipelineItem
  onClick?: () => void
  isDragging?: boolean
}

const priorityColors: Record<string, { border: string; bg: string }> = {
  URGENT: { border: 'border-l-red-500', bg: 'bg-red-50' },
  HIGH: { border: 'border-l-orange-500', bg: 'bg-orange-50' },
  MEDIUM: { border: 'border-l-blue-500', bg: 'bg-white' },
  LOW: { border: 'border-l-green-500', bg: 'bg-white' },
}

function formatValue(value?: number): string {
  if (!value) return ''
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M€`
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K€`
  return `${value}€`
}

export function PipelineCard({ item, onClick, isDragging = false }: PipelineCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const priorityStyle = priorityColors[item.priority || 'MEDIUM'] || priorityColors.MEDIUM
  const isUrgent = item.daysInStage >= 7

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'bg-white rounded-lg border-l-4 border border-slate-200 p-3',
        'cursor-grab active:cursor-grabbing transition-all',
        'hover:shadow-md hover:border-slate-300',
        priorityStyle.border,
        priorityStyle.bg,
        isDragging && 'shadow-lg ring-2 ring-blue-400 opacity-90'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className={cn(
            'p-1.5 rounded-lg',
            item.type === 'lead' ? 'bg-blue-100' : 'bg-purple-100'
          )}>
            {item.type === 'lead' ? (
              <Users className="h-4 w-4 text-blue-600" strokeWidth={1.5} />
            ) : (
              <Building2 className="h-4 w-4 text-purple-600" strokeWidth={1.5} />
            )}
          </div>
          <span className="font-medium text-slate-900 truncate text-sm">
            {item.name}
          </span>
        </div>

        {item.estimatedValue && item.estimatedValue > 0 && (
          <span className="text-xs font-semibold text-green-600 flex items-center gap-0.5">
            <Euro className="h-3 w-3" strokeWidth={1.5} />
            {formatValue(item.estimatedValue)}
          </span>
        )}
      </div>

      {/* Contacto */}
      {item.contactName && (
        <p className="text-xs text-slate-600 mb-1 truncate">
          {item.contactName}
        </p>
      )}

      {/* Email y teléfono */}
      <div className="flex flex-col gap-1 text-xs text-slate-500 mb-2">
        {item.email && (
          <div className="flex items-center gap-1 truncate">
            <Mail className="h-3 w-3 flex-shrink-0" strokeWidth={1.5} />
            <span className="truncate">{item.email}</span>
          </div>
        )}
        {item.phone && (
          <div className="flex items-center gap-1">
            <Phone className="h-3 w-3 flex-shrink-0" strokeWidth={1.5} />
            <span>{item.phone}</span>
          </div>
        )}
      </div>

      {/* Sector */}
      {item.sector && (
        <span className="inline-block px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded mb-2">
          {item.sector}
        </span>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          {item.assignedTo && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <User className="h-3 w-3" strokeWidth={1.5} />
              <span className="truncate max-w-[80px]">{item.assignedTo.name}</span>
            </div>
          )}
        </div>

        <div className={cn(
          'flex items-center gap-1 text-xs',
          isUrgent ? 'text-red-600 font-medium' : 'text-slate-400'
        )}>
          <Clock className="h-3 w-3" strokeWidth={1.5} />
          <span>{item.daysInStage === 0 ? 'Avui' : `${item.daysInStage}d`}</span>
          {isUrgent && <AlertTriangle className="h-3 w-3" strokeWidth={1.5} />}
        </div>
      </div>
    </div>
  )
}
