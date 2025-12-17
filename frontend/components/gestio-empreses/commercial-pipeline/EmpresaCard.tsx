// components/gestio-empreses/commercial-pipeline/EmpresaCard.tsx
'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Building2, Mail, Phone, Briefcase, User, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmpresaItem {
  id: string
  name: string
  email: string
  phone: string | null
  stage: string
  status: string
  sector: string | null
  createdAt: string
  accountManager: { id: string; name: string } | null
  fromLeadId: string | null
}

interface EmpresaCardProps {
  empresa: EmpresaItem
  onClick?: () => void
  isDragging?: boolean
}

const statusColors: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: 'bg-amber-100', text: 'text-amber-700' },
  APPROVED: { bg: 'bg-green-100', text: 'text-green-700' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-700' },
  SUSPENDED: { bg: 'bg-slate-100', text: 'text-slate-700' },
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

export function EmpresaCard({ empresa, onClick, isDragging = false }: EmpresaCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: empresa.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const statusColor = statusColors[empresa.status] || statusColors.PENDING

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
        isDragging && 'shadow-lg ring-2 ring-blue-400'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-blue-100">
            <Building2 className="h-4 w-4 text-blue-600" strokeWidth={1.5} />
          </div>
          <span className="font-medium text-slate-900 truncate text-sm">
            {empresa.name}
          </span>
        </div>
        {empresa.fromLeadId && (
          <div className="flex items-center gap-0.5 text-xs text-purple-600" title="Convertit de lead">
            <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* Sector */}
      {empresa.sector && (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-1.5">
          <Briefcase className="h-3 w-3 text-slate-400" strokeWidth={1.5} />
          <span className="truncate">{empresa.sector}</span>
        </div>
      )}

      {/* Contact */}
      <div className="flex flex-col gap-1 text-xs text-slate-500 mb-2">
        <div className="flex items-center gap-1 truncate">
          <Mail className="h-3 w-3" strokeWidth={1.5} />
          <span className="truncate">{empresa.email}</span>
        </div>
        {empresa.phone && (
          <div className="flex items-center gap-1">
            <Phone className="h-3 w-3" strokeWidth={1.5} />
            <span>{empresa.phone}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <span className={cn(
          'px-2 py-0.5 rounded-full text-xs font-medium',
          statusColor.bg,
          statusColor.text
        )}>
          {empresa.status}
        </span>

        <div className="flex items-center gap-2">
          {empresa.accountManager && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <User className="h-3 w-3" strokeWidth={1.5} />
              <span className="truncate max-w-[60px]">{empresa.accountManager.name}</span>
            </div>
          )}
          <span className="text-xs text-slate-400">
            {formatDate(empresa.createdAt)}
          </span>
        </div>
      </div>
    </div>
  )
}
