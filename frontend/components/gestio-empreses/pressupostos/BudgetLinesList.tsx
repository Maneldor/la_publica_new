// components/gestio-empreses/pressupostos/BudgetLinesList.tsx
'use client'

import { Trash2, Package, Star, PenLine, Percent, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BudgetLine {
  id: string
  itemType: string
  description: string
  quantity: number
  unitPrice: number
  subtotal: number
}

interface BudgetLinesListProps {
  lines: BudgetLine[]
  onRemove: (id: string) => void
}

const typeConfig: Record<string, { icon: any; color: string; label: string }> = {
  PLAN: { icon: Package, color: 'text-blue-600 bg-blue-50', label: 'Pla' },
  EXTRA: { icon: Star, color: 'text-purple-600 bg-purple-50', label: 'Extra' },
  CUSTOM: { icon: PenLine, color: 'text-slate-600 bg-slate-50', label: 'Personalitzat' },
  DISCOUNT: { icon: Percent, color: 'text-green-600 bg-green-50', label: 'Descompte' },
}

export function BudgetLinesList({ lines, onRemove }: BudgetLinesListProps) {
  const formatCurrency = (value: number) => {
    return `${value.toFixed(2)} €`
  }

  if (lines.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center">
        <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" strokeWidth={1.5} />
        <p className="text-slate-500 mb-2">Cap línia afegida</p>
        <p className="text-sm text-slate-400">
          Usa el formulari de dalt per afegir línies al pressupost
        </p>
      </div>
    )
  }

  // Calculate totals
  const subtotal = lines.reduce((sum, line) => sum + line.subtotal, 0)
  const taxAmount = subtotal * 0.21
  const total = subtotal + taxAmount

  return (
    <div className="space-y-4">
      {/* Lines list */}
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {lines.map((line, index) => {
          const config = typeConfig[line.itemType] || typeConfig.CUSTOM
          const Icon = config.icon

          return (
            <div key={line.id} className="p-4 flex items-center gap-4 hover:bg-slate-50">
              {/* Drag handle (visual only) */}
              <GripVertical className="h-5 w-5 text-slate-300 cursor-move" strokeWidth={1.5} />

              {/* Type icon */}
              <div className={cn('p-2 rounded-lg', config.color)}>
                <Icon className="h-4 w-4" strokeWidth={1.5} />
              </div>

              {/* Description */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">{line.description}</p>
                <p className="text-sm text-slate-500">
                  {config.label} · {line.quantity} x {formatCurrency(line.unitPrice)}
                </p>
              </div>

              {/* Subtotal */}
              <div className="text-right">
                <p className={cn(
                  'font-semibold',
                  line.itemType === 'DISCOUNT' ? 'text-green-600' : 'text-slate-900'
                )}>
                  {line.itemType === 'DISCOUNT' ? '-' : ''}{formatCurrency(Math.abs(line.subtotal))}
                </p>
              </div>

              {/* Remove button */}
              <button
                onClick={() => onRemove(line.id)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          )
        })}
      </div>

      {/* Totals */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">IVA (21%)</span>
            <span className="font-medium text-slate-900">{formatCurrency(taxAmount)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-blue-200">
            <span className="text-slate-900">Total</span>
            <span className="text-blue-600">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}