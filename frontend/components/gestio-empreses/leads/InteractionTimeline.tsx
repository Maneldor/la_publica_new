// components/gestio-empreses/leads/InteractionTimeline.tsx
'use client'

import { format } from 'date-fns'
import { ca } from 'date-fns/locale'
import {
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  FileText,
  UserPlus,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Minus
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Interaction {
  id: string
  type: string
  subject?: string | null
  notes?: string | null
  outcome?: string | null
  nextAction?: string | null
  nextActionDate?: Date | null
  createdAt: Date
  user?: {
    name: string | null
    email: string | null
  } | null
}

interface InteractionTimelineProps {
  interactions: Interaction[]
}

const typeConfig: Record<string, {
  icon: React.ComponentType<{ className?: string }>,
  label: string,
  color: string
}> = {
  CALL: { icon: Phone, label: 'Trucada', color: 'bg-green-100 text-green-600' },
  EMAIL: { icon: Mail, label: 'Email', color: 'bg-blue-100 text-blue-600' },
  MEETING: { icon: Calendar, label: 'Reunió', color: 'bg-purple-100 text-purple-600' },
  NOTE: { icon: MessageSquare, label: 'Nota', color: 'bg-yellow-100 text-yellow-600' },
  DOCUMENT: { icon: FileText, label: 'Document', color: 'bg-slate-100 text-slate-600' },
  CREATED: { icon: UserPlus, label: 'Creat', color: 'bg-emerald-100 text-emerald-600' },
  STATUS_CHANGE: { icon: ArrowRight, label: 'Canvi estat', color: 'bg-indigo-100 text-indigo-600' },
  FOLLOW_UP: { icon: Clock, label: 'Seguiment', color: 'bg-amber-100 text-amber-600' },
}

const outcomeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>, color: string }> = {
  POSITIVE: { icon: ThumbsUp, color: 'text-green-600' },
  NEGATIVE: { icon: ThumbsDown, color: 'text-red-600' },
  NEUTRAL: { icon: Minus, color: 'text-slate-500' },
}

export function InteractionTimeline({ interactions }: InteractionTimelineProps) {
  if (interactions.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-10 w-10 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
        <p className="text-sm text-slate-500">No hi ha interaccions registrades</p>
        <p className="text-xs text-slate-400 mt-1">Les trucades, emails i reunions apareixeran aquí</p>
      </div>
    )
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {interactions.map((interaction, idx) => {
          const config = typeConfig[interaction.type] || {
            icon: MessageSquare,
            label: interaction.type,
            color: 'bg-slate-100 text-slate-500'
          }
          const Icon = config.icon
          const isLast = idx === interactions.length - 1
          const outcome = interaction.outcome ? outcomeConfig[interaction.outcome] : null

          return (
            <li key={interaction.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute left-5 top-10 -ml-px h-full w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start space-x-4">
                  <div className={cn("p-2.5 rounded-full", config.color)}>
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                  </div>

                  <div className="flex-1 min-w-0 bg-slate-50 rounded-lg p-4">
                    {/* Capçalera */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-800">
                          {config.label}
                        </span>
                        {interaction.subject && (
                          <>
                            <span className="text-slate-300">·</span>
                            <span className="text-sm text-slate-600">{interaction.subject}</span>
                          </>
                        )}
                      </div>
                      {outcome && (
                        <div className={cn("flex items-center gap-1", outcome.color)}>
                          <outcome.icon className="h-4 w-4" strokeWidth={1.5} />
                        </div>
                      )}
                    </div>

                    {/* Contingut */}
                    {interaction.notes && (
                      <p className="text-sm text-slate-600 mb-3">{interaction.notes}</p>
                    )}

                    {/* Resultat */}
                    {interaction.outcome && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-medium text-slate-500">Resultat:</span>
                        <span className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded",
                          interaction.outcome === 'POSITIVE' && "bg-green-100 text-green-700",
                          interaction.outcome === 'NEGATIVE' && "bg-red-100 text-red-700",
                          interaction.outcome === 'NEUTRAL' && "bg-slate-100 text-slate-600"
                        )}>
                          {interaction.outcome === 'POSITIVE' && 'Positiu'}
                          {interaction.outcome === 'NEGATIVE' && 'Negatiu'}
                          {interaction.outcome === 'NEUTRAL' && 'Neutral'}
                        </span>
                      </div>
                    )}

                    {/* Següent acció */}
                    {interaction.nextAction && (
                      <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded mb-3">
                        <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" strokeWidth={1.5} />
                        <div>
                          <p className="text-xs font-medium text-amber-800">Següent acció</p>
                          <p className="text-sm text-amber-700">{interaction.nextAction}</p>
                          {interaction.nextActionDate && (
                            <p className="text-xs text-amber-600 mt-1">
                              {format(new Date(interaction.nextActionDate), "d MMM yyyy", { locale: ca })}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>
                        {format(new Date(interaction.createdAt), "d MMM yyyy, HH:mm", { locale: ca })}
                      </span>
                      {interaction.user?.name && (
                        <>
                          <span>·</span>
                          <span>{interaction.user.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}