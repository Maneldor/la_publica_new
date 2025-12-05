// components/gestio-empreses/pressupostos/BudgetReview.tsx
'use client'

import { Building2, Mail, Calendar, FileText, Package, Star, PenLine, Percent } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Company {
  id: string
  name: string
  cif: string
  email: string
}

interface BudgetLine {
  id: string
  itemType: string
  description: string
  quantity: number
  unitPrice: number
  subtotal: number
}

interface BudgetReviewProps {
  company: Company
  lines: BudgetLine[]
  validUntilDays: number
  notes: string
  onChangeValidDays: (days: number) => void
  onChangeNotes: (notes: string) => void
}

const typeConfig: Record<string, { icon: any; label: string }> = {
  PLAN: { icon: Package, label: 'Pla' },
  EXTRA: { icon: Star, label: 'Extra' },
  CUSTOM: { icon: PenLine, label: 'Personalitzat' },
  DISCOUNT: { icon: Percent, label: 'Descompte' },
}

export function BudgetReview({
  company,
  lines,
  validUntilDays,
  notes,
  onChangeValidDays,
  onChangeNotes,
}: BudgetReviewProps) {
  const formatCurrency = (value: number) => {
    return `${value.toFixed(2)} €`
  }

  const subtotal = lines.reduce((sum, line) => sum + line.subtotal, 0)
  const taxAmount = subtotal * 0.21
  const total = subtotal + taxAmount

  const validUntilDate = new Date()
  validUntilDate.setDate(validUntilDate.getDate() + validUntilDays)

  return (
    <div className="space-y-6">
      {/* Company info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
          Dades de l'empresa
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-500">Empresa</p>
            <p className="font-medium text-slate-900">{company.name}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">CIF</p>
            <p className="font-medium text-slate-900">{company.cif}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-slate-500">Email</p>
            <p className="font-medium text-slate-900">{company.email}</p>
          </div>
        </div>
      </div>

      {/* Lines summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
          Línies del pressupost ({lines.length})
        </h3>
        <div className="space-y-3">
          {lines.map((line) => {
            const config = typeConfig[line.itemType] || typeConfig.CUSTOM
            const Icon = config.icon

            return (
              <div key={line.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                  <div>
                    <p className="font-medium text-slate-900">{line.description}</p>
                    <p className="text-sm text-slate-500">
                      {line.quantity} x {formatCurrency(line.unitPrice)}
                    </p>
                  </div>
                </div>
                <p className={cn(
                  'font-semibold',
                  line.itemType === 'DISCOUNT' ? 'text-green-600' : 'text-slate-900'
                )}>
                  {line.itemType === 'DISCOUNT' ? '-' : ''}{formatCurrency(Math.abs(line.subtotal))}
                </p>
              </div>
            )
          })}
        </div>

        {/* Totals */}
        <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">IVA (21%)</span>
            <span className="font-medium">{formatCurrency(taxAmount)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold pt-2 border-t border-slate-200">
            <span>Total</span>
            <span className="text-blue-600">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
          Opcions del pressupost
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Validesa (dies)
            </label>
            <input
              type="number"
              min="1"
              value={validUntilDays}
              onChange={(e) => onChangeValidDays(parseInt(e.target.value) || 30)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-400 mt-1">
              Vàlid fins: {validUntilDate.toLocaleDateString('ca-ES')}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Notes (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => onChangeNotes(e.target.value)}
              placeholder="Notes internes o condicions especials..."
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}