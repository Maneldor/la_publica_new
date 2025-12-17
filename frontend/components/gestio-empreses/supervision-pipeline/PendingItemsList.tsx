// components/gestio-empreses/supervision-pipeline/PendingItemsList.tsx
'use client'

import { Users, Building2, Clock, AlertTriangle, ArrowRight, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PendingItem {
  id: string
  type: 'lead' | 'empresa'
  name: string
  stage: string
  priority?: string
  estimatedValue?: number
  daysInStage: number
  assignedTo?: { id: string; name: string }
  createdAt: string
}

interface PendingItemsListProps {
  items: PendingItem[]
  onItemClick?: (item: PendingItem) => void
  maxItems?: number
}

const stageLabels: Record<string, { label: string; color: string }> = {
  // Leads
  NOU: { label: 'Nou', color: 'bg-slate-100 text-slate-700' },
  ASSIGNAT: { label: 'Assignat', color: 'bg-blue-100 text-blue-700' },
  TREBALLANT: { label: 'Treballant', color: 'bg-cyan-100 text-cyan-700' },
  PER_VERIFICAR: { label: 'Per verificar', color: 'bg-amber-100 text-amber-700' },
  VERIFICAT: { label: 'Verificat', color: 'bg-green-100 text-green-700' },
  PRE_CONTRACTE: { label: 'Pre-contracte', color: 'bg-purple-100 text-purple-700' },
  CONTRACTAT: { label: 'Contractat', color: 'bg-green-100 text-green-700' },
  // Empreses
  CREADA: { label: 'Creada', color: 'bg-slate-100 text-slate-700' },
  ASSIGNADA: { label: 'Assignada', color: 'bg-blue-100 text-blue-700' },
  ONBOARDING: { label: 'Onboarding', color: 'bg-cyan-100 text-cyan-700' },
  ACTIVA: { label: 'Activa', color: 'bg-green-100 text-green-700' }
}

const priorityColors: Record<string, { bg: string; border: string }> = {
  HIGH: { bg: 'bg-red-50', border: 'border-l-red-500' },
  MEDIUM: { bg: 'bg-amber-50', border: 'border-l-amber-500' },
  LOW: { bg: 'bg-green-50', border: 'border-l-green-500' },
  NORMAL: { bg: 'bg-white', border: 'border-l-slate-300' }
}

function formatValue(value?: number): string {
  if (!value) return ''
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M€`
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K€`
  return `${value}€`
}

export function PendingItemsList({
  items,
  onItemClick,
  maxItems = 20
}: PendingItemsListProps) {
  const displayItems = items.slice(0, maxItems)

  if (displayItems.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <Clock className="h-10 w-10 mx-auto mb-3 text-slate-300" strokeWidth={1.5} />
        <p>No hi ha items pendents</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
          Pendents ({items.length})
        </h2>
        {items.length > maxItems && (
          <span className="text-xs text-slate-400">
            Mostrant {maxItems} de {items.length}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {displayItems.map((item) => {
          const stageInfo = stageLabels[item.stage] || { label: item.stage, color: 'bg-slate-100 text-slate-700' }
          const priorityStyle = priorityColors[item.priority || 'NORMAL']
          const isUrgent = item.daysInStage >= 7

          return (
            <button
              key={`${item.type}-${item.id}`}
              onClick={() => onItemClick?.(item)}
              className={cn(
                'w-full text-left p-3 rounded-lg border-l-4 transition-all',
                'hover:shadow-sm hover:bg-opacity-80',
                priorityStyle.bg,
                priorityStyle.border
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {item.type === 'lead' ? (
                    <Users className="h-4 w-4 text-slate-400 flex-shrink-0" strokeWidth={1.5} />
                  ) : (
                    <Building2 className="h-4 w-4 text-slate-400 flex-shrink-0" strokeWidth={1.5} />
                  )}
                  <span className="font-medium text-slate-900 truncate">
                    {item.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.estimatedValue && item.estimatedValue > 0 && (
                    <span className="text-xs font-medium text-slate-600">
                      {formatValue(item.estimatedValue)}
                    </span>
                  )}
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    stageInfo.color
                  )}>
                    {stageInfo.label}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  {item.assignedTo && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" strokeWidth={1.5} />
                      {item.assignedTo.name}
                    </span>
                  )}
                  <span className={cn(
                    'flex items-center gap-1',
                    isUrgent && 'text-red-600 font-medium'
                  )}>
                    <Clock className="h-3 w-3" strokeWidth={1.5} />
                    {item.daysInStage === 0 ? 'Avui' : `${item.daysInStage}d`}
                    {isUrgent && (
                      <AlertTriangle className="h-3 w-3" strokeWidth={1.5} />
                    )}
                  </span>
                </div>

                <ArrowRight className="h-4 w-4 text-slate-300" strokeWidth={1.5} />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
