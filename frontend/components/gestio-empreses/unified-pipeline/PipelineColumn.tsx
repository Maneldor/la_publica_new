// components/gestio-empreses/unified-pipeline/PipelineColumn.tsx
'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { cn } from '@/lib/utils'
import { PipelineCard } from './PipelineCard'

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

interface PipelineColumnProps {
  id: string
  label: string
  items: PipelineItem[]
  color?: string
  onItemClick?: (item: PipelineItem) => void
}

const columnColors: Record<string, { header: string; badge: string }> = {
  slate: { header: 'bg-slate-100', badge: 'bg-slate-200 text-slate-700' },
  blue: { header: 'bg-blue-100', badge: 'bg-blue-200 text-blue-700' },
  cyan: { header: 'bg-cyan-100', badge: 'bg-cyan-200 text-cyan-700' },
  amber: { header: 'bg-amber-100', badge: 'bg-amber-200 text-amber-700' },
  green: { header: 'bg-green-100', badge: 'bg-green-200 text-green-700' },
  purple: { header: 'bg-purple-100', badge: 'bg-purple-200 text-purple-700' },
  red: { header: 'bg-red-100', badge: 'bg-red-200 text-red-700' },
}

export function PipelineColumn({
  id,
  label,
  items,
  color = 'slate',
  onItemClick
}: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const colorStyle = columnColors[color] || columnColors.slate

  return (
    <div className="flex flex-col flex-1 min-w-[200px] bg-slate-50 rounded-xl border border-slate-200">
      {/* Header */}
      <div className={cn('px-3 py-2.5 rounded-t-xl', colorStyle.header)}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">{label}</h3>
          <span className={cn(
            'px-2 py-0.5 rounded-full text-xs font-medium',
            colorStyle.badge
          )}>
            {items.length}
          </span>
        </div>
      </div>

      {/* Items */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 p-2 space-y-2 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto',
          isOver && 'bg-blue-50 ring-2 ring-blue-300 ring-inset rounded-b-xl'
        )}
      >
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {items.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-sm text-slate-400">
              Sense elements
            </div>
          ) : (
            items.map((item) => (
              <PipelineCard
                key={item.id}
                item={item}
                onClick={() => onItemClick?.(item)}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}
