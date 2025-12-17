'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BudgetPipelineCard } from './BudgetPipelineCard'

interface BudgetPipelineItem {
  id: string
  type: 'budget' | 'invoice'
  number: string
  company: { name: string }
  clientName: string
  total: number
  date: string
  dueDate?: string
  isOverdue: boolean
  paidPercentage?: number
  linkedInvoice?: string
  linkedBudget?: string
  status: string
}

interface BudgetPipelineColumnProps {
  id: string
  label: string
  description: string
  icon: LucideIcon
  color: string
  items: BudgetPipelineItem[]
  totalAmount: number
  onCardClick?: (item: BudgetPipelineItem) => void
}

const colorClasses: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
  slate: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600', iconBg: 'bg-slate-100 text-slate-600' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', iconBg: 'bg-blue-100 text-blue-600' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', iconBg: 'bg-amber-100 text-amber-600' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', iconBg: 'bg-purple-100 text-purple-600' },
  green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', iconBg: 'bg-green-100 text-green-600' },
}

export function BudgetPipelineColumn({
  id,
  label,
  description,
  icon: Icon,
  color,
  items,
  totalAmount,
  onCardClick
}: BudgetPipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const colors = colorClasses[color] || colorClasses.slate

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M€`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K€`
    return `${value.toFixed(0)}€`
  }

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border min-h-[500px]',
        colors.border,
        isOver && 'ring-2 ring-blue-400 ring-offset-2'
      )}
    >
      {/* Header */}
      <div className={cn('p-3 rounded-t-xl border-b', colors.bg, colors.border)}>
        <div className="flex items-center gap-2 mb-1">
          <div className={cn('p-1.5 rounded-lg', colors.iconBg)}>
            <Icon className="h-4 w-4" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">{label}</h3>
              <span className={cn(
                'px-1.5 py-0.5 text-xs font-medium rounded-full',
                colors.iconBg
              )}>
                {items.length}
              </span>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-500">{description}</p>
        <div className="mt-2 pt-2 border-t border-slate-200/50">
          <span className={cn('text-sm font-bold', colors.text)}>
            {formatCurrency(totalAmount)}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div
        ref={setNodeRef}
        className="flex-1 p-2 space-y-2 overflow-y-auto"
      >
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <BudgetPipelineCard
              key={item.id}
              item={item}
              onClick={() => onCardClick?.(item)}
            />
          ))}
        </SortableContext>

        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400">
            <Icon className="h-8 w-8 mb-2 opacity-50" strokeWidth={1} />
            <p className="text-xs">Cap element</p>
          </div>
        )}
      </div>
    </div>
  )
}