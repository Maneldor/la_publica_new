// components/gestio-empreses/commercial-pipeline/LeadCard.tsx
'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Building2, User, Mail, Phone, Star, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeadItem {
  id: string
  companyName: string
  contactName: string | null
  email: string | null
  phone: string | null
  stage: string
  status: string
  priority: string
  estimatedValue: number
  score: number | null
  createdAt: string
  assignedTo: { id: string; name: string } | null
}

interface LeadCardProps {
  lead: LeadItem
  onClick?: () => void
  isDragging?: boolean
}

const priorityColors: Record<string, string> = {
  HIGH: 'border-l-red-500',
  MEDIUM: 'border-l-amber-500',
  LOW: 'border-l-green-500',
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M€`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K€`
  return `${value}€`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Avui'
  if (diffDays === 1) return 'Ahir'
  if (diffDays < 7) return `Fa ${diffDays} dies`
  return date.toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' })
}

export function LeadCard({ lead, onClick, isDragging = false }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: lead.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'bg-white rounded-lg border border-slate-200 p-3 cursor-grab active:cursor-grabbing',
        'hover:border-slate-300 hover:shadow-sm transition-all',
        'border-l-4',
        priorityColors[lead.priority] || 'border-l-slate-300',
        isDragging && 'shadow-lg ring-2 ring-blue-400'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="h-4 w-4 text-slate-400 flex-shrink-0" strokeWidth={1.5} />
          <span className="font-medium text-slate-900 truncate text-sm">
            {lead.companyName}
          </span>
        </div>
        {lead.score !== null && (
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 rounded text-amber-700">
            <Star className="h-3 w-3" strokeWidth={1.5} />
            <span className="text-xs font-medium">{lead.score}</span>
          </div>
        )}
      </div>

      {/* Contact */}
      {lead.contactName && (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-1.5">
          <User className="h-3 w-3 text-slate-400" strokeWidth={1.5} />
          <span className="truncate">{lead.contactName}</span>
        </div>
      )}

      {/* Email/Phone */}
      <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
        {lead.email && (
          <div className="flex items-center gap-1 truncate">
            <Mail className="h-3 w-3" strokeWidth={1.5} />
            <span className="truncate">{lead.email}</span>
          </div>
        )}
        {lead.phone && (
          <div className="flex items-center gap-1">
            <Phone className="h-3 w-3" strokeWidth={1.5} />
            <span>{lead.phone}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        {lead.estimatedValue > 0 ? (
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp className="h-3 w-3" strokeWidth={1.5} />
            <span className="text-xs font-medium">{formatCurrency(lead.estimatedValue)}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-400">-</span>
        )}

        <div className="flex items-center gap-2">
          {lead.assignedTo && (
            <span className="text-xs text-slate-500 truncate max-w-[80px]">
              {lead.assignedTo.name}
            </span>
          )}
          <span className="text-xs text-slate-400">
            {formatDate(lead.createdAt)}
          </span>
        </div>
      </div>
    </div>
  )
}
