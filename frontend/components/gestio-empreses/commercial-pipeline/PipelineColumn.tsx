// components/gestio-empreses/commercial-pipeline/PipelineColumn.tsx
'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PipelineColumnProps {
  id: string
  label: string
  description: string
  icon: LucideIcon
  color: string
  count: number
  totalValue?: number
  children: React.ReactNode
}

const colorClasses: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
  slate: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600', iconBg: 'bg-slate-100 text-slate-600' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', iconBg: 'bg-blue-100 text-blue-600' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', iconBg: 'bg-amber-100 text-amber-600' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', iconBg: 'bg-orange-100 text-orange-600' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', iconBg: 'bg-purple-100 text-purple-600' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600', iconBg: 'bg-indigo-100 text-indigo-600' },
  green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', iconBg: 'bg-green-100 text-green-600' },
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toFixed(0)
}

export function PipelineColumn({
  id,
  label,
  description,
  icon: Icon,
  color,
  count,
  totalValue,
  children
}: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const colors = colorClasses[color] || colorClasses.slate

  return (
    <div
      className={cn(
        'flex flex-col min-w-[280px] max-w-[280px] rounded-xl border',
        colors.border,
        isOver && 'ring-2 ring-blue-400 ring-offset-2'
      )}
    >
      {/* Header */}
      <div className={cn('p-3 rounded-t-xl', colors.bg)}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className={cn('p-1.5 rounded-lg', colors.iconBg)}>
              <Icon className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <span className="font-medium text-slate-900">{label}</span>
          </div>
          <span className={cn(
            'px-2 py-0.5 rounded-full text-xs font-medium',
            colors.iconBg
          )}>
            {count}
          </span>
        </div>
        <p className="text-xs text-slate-500">{description}</p>
        {totalValue !== undefined && totalValue > 0 && (
          <p className={cn('text-sm font-semibold mt-1', colors.text)}>
            {formatCurrency(totalValue)}€
          </p>
        )}
      </div>

      {/* Content */}
      <div
        ref={setNodeRef}
        className="flex-1 p-2 space-y-2 overflow-y-auto bg-white rounded-b-xl"
        style={{ minHeight: '200px', maxHeight: '60vh' }}
      >
        <SortableContext items={[]} strategy={verticalListSortingStrategy}>
          {children}
        </SortableContext>

        {count === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400">
            <Icon className="h-8 w-8 mb-2 opacity-50" strokeWidth={1} />
            <p className="text-xs">Cap element</p>
          </div>
        )}
      </div>
    </div>
  )
}
