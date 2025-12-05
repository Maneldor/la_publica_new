// components/gestio-empreses/pipeline/PipelineCard.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Building2,
  User,
  Euro,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Phone,
  Mail,
  Eye,
  Sparkles,
  GripVertical
} from 'lucide-react'
import { format } from 'date-fns'
import { ca } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { moveLeadToStage } from '@/lib/gestio-empreses/pipeline-actions'
import { getNextStages, PipelineStage } from '@/lib/gestio-empreses/pipeline-utils'
import { AIScoreBadge } from '@/components/gestio-empreses/leads/ai/AIScoreBadge'

interface PipelineCardProps {
  lead: {
    id: string
    companyName: string
    contactName: string
    email: string
    phone: string | null
    status: string
    priority: string
    estimatedRevenue: number | null
    score: number | null
    createdAt: Date
    updatedAt: Date
    assignedTo: {
      id: string
      name: string | null
    } | null
  }
  isSupervisor: boolean
  onMoved?: () => void
}

const priorityColors: Record<string, string> = {
  HIGH: 'border-l-red-500',
  MEDIUM: 'border-l-amber-500',
  LOW: 'border-l-slate-300',
}

export function PipelineCard({ lead, isSupervisor, onMoved }: PipelineCardProps) {
  const [isMoving, setIsMoving] = useState(false)

  const nextStages = getNextStages(lead.status, isSupervisor)
  const canMoveForward = nextStages.length > 0

  const handleMove = async (direction: 'forward' | 'back') => {
    if (direction === 'forward' && nextStages.length === 0) return

    setIsMoving(true)

    const newStatus = direction === 'forward'
      ? nextStages[0] as PipelineStage
      : getPreviousStage(lead.status) as PipelineStage

    if (newStatus) {
      const result = await moveLeadToStage(lead.id, newStatus)
      if (result.success && onMoved) {
        onMoved()
      }
    }

    setIsMoving(false)
  }

  const getPreviousStage = (status: string): string | null => {
    const order = ['NEW', 'CONTACTED', 'NEGOTIATION', 'QUALIFIED', 'PENDING_CRM', 'CRM_APPROVED', 'PENDING_ADMIN', 'WON']
    const currentIndex = order.indexOf(status)
    return currentIndex > 0 ? order[currentIndex - 1] : null
  }

  const formatCurrency = (value: number) => {
    const numValue = typeof value === 'number' ? value : Number(value) || 0
    return new Intl.NumberFormat('ca-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(numValue)
  }

  return (
    <div className={cn(
      "bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow border-l-4",
      priorityColors[lead.priority] || priorityColors.MEDIUM,
      isMoving && "opacity-50"
    )}>
      {/* Contingut principal */}
      <div className="p-3">
        {/* Capçalera */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <Link
              href={`/gestio/leads/${lead.id}`}
              className="font-medium text-slate-800 hover:text-blue-600 truncate block"
            >
              {lead.companyName}
            </Link>
            {lead.contactName && (
              <p className="text-sm text-slate-500 truncate flex items-center gap-1 mt-0.5">
                <User className="h-3 w-3" strokeWidth={1.5} />
                {lead.contactName}
              </p>
            )}
          </div>
          {lead.score && (
            <AIScoreBadge score={lead.score} size="sm" />
          )}
        </div>

        {/* Info */}
        <div className="space-y-1.5 text-xs text-slate-500">
          {lead.estimatedRevenue && (
            <div className="flex items-center gap-1.5">
              <Euro className="h-3 w-3" strokeWidth={1.5} />
              <span className="font-medium text-slate-700">
                {formatCurrency(lead.estimatedRevenue)}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3" strokeWidth={1.5} />
            <span>{format(new Date(lead.updatedAt), "d MMM", { locale: ca })}</span>
          </div>
        </div>

        {/* Accions ràpides */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1">
            <Link
              href={`/gestio/leads/${lead.id}`}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Veure detall"
            >
              <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
            {lead.phone && (
              <a
                href={`tel:${lead.phone}`}
                className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                title="Trucar"
              >
                <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
              </a>
            )}
            {lead.email && (
              <a
                href={`mailto:${lead.email}`}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Enviar email"
              >
                <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
              </a>
            )}
          </div>

          {/* Botons moure */}
          <div className="flex items-center gap-1">
            {getPreviousStage(lead.status) && (
              <button
                onClick={() => handleMove('back')}
                disabled={isMoving}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors disabled:opacity-50"
                title="Retrocedir"
              >
                <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            )}
            {canMoveForward && (
              <button
                onClick={() => handleMove('forward')}
                disabled={isMoving}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                title="Avançar"
              >
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}