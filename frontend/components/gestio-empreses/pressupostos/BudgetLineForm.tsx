// components/gestio-empreses/pressupostos/BudgetLineForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { Plus, Package, Star, PenLine, Percent } from 'lucide-react'
import { cn } from '@/lib/utils'

type BudgetItemType = 'PLAN' | 'EXTRA' | 'CUSTOM' | 'DISCOUNT'
type BillingCycle = 'MONTHLY' | 'ANNUAL' | 'ONE_TIME'

interface Plan {
  id: string
  nombre: string
  nombreCorto: string
  precioMensual: number
  precioAnual: number
  icono?: string
}

interface Extra {
  id: string
  name: string
  basePrice: number
  category: string
}

interface BudgetLine {
  id: string
  itemType: BudgetItemType
  planId?: string
  extraId?: string
  description: string
  quantity: number
  unitPrice: number
  billingCycle?: BillingCycle
  subtotal: number
}

interface BudgetLineFormProps {
  plans: Plan[]
  extras: Extra[]
  onAddLine: (line: Omit<BudgetLine, 'id' | 'subtotal'>) => void
}

const itemTypes = [
  { value: 'PLAN', label: 'Pla', icon: Package, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { value: 'EXTRA', label: 'Extra', icon: Star, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { value: 'CUSTOM', label: 'Personalitzat', icon: PenLine, color: 'text-slate-600 bg-slate-50 border-slate-200' },
  { value: 'DISCOUNT', label: 'Descompte', icon: Percent, color: 'text-green-600 bg-green-50 border-green-200' },
]

export function BudgetLineForm({ plans, extras, onAddLine }: BudgetLineFormProps) {
  const [itemType, setItemType] = useState<BudgetItemType>('PLAN')
  const [planId, setPlanId] = useState('')
  const [extraId, setExtraId] = useState('')
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [unitPrice, setUnitPrice] = useState('')
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('MONTHLY')

  // Auto-fill price when plan/extra selected
  useEffect(() => {
    if (itemType === 'PLAN' && planId) {
      const plan = plans.find((p) => p.id === planId)
      if (plan) {
        const price = billingCycle === 'MONTHLY' ? plan.precioMensual : plan.precioAnual
        setUnitPrice(price.toString())
        setDescription(`Pla ${plan.nombre} - ${billingCycle === 'MONTHLY' ? 'Mensual' : 'Anual'}`)
      }
    } else if (itemType === 'EXTRA' && extraId) {
      const extra = extras.find((e) => e.id === extraId)
      if (extra) {
        setUnitPrice(extra.basePrice.toString())
        setDescription(extra.name)
      }
    }
  }, [planId, extraId, billingCycle, itemType, plans, extras])

  const resetForm = () => {
    setPlanId('')
    setExtraId('')
    setDescription('')
    setQuantity('1')
    setUnitPrice('')
    setBillingCycle('MONTHLY')
  }

  const handleSubmit = () => {
    if (!description.trim()) {
      alert('La descripció és obligatòria')
      return
    }

    const qty = parseFloat(quantity)
    const price = parseFloat(unitPrice)

    if (isNaN(qty) || qty <= 0) {
      alert('La quantitat ha de ser positiva')
      return
    }

    if (isNaN(price)) {
      alert('El preu unitari és obligatori')
      return
    }

    onAddLine({
      itemType,
      planId: planId || undefined,
      extraId: extraId || undefined,
      description: description.trim(),
      quantity: qty,
      unitPrice: itemType === 'DISCOUNT' ? -Math.abs(price) : price,
      billingCycle,
    })

    resetForm()
  }

  const calculatedSubtotal = parseFloat(quantity || '0') * parseFloat(unitPrice || '0')

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
      <h3 className="font-semibold text-slate-900 mb-4">Afegir línia</h3>

      {/* Item type selector */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {itemTypes.map((type) => {
          const Icon = type.icon
          const isSelected = itemType === type.value

          return (
            <button
              key={type.value}
              onClick={() => {
                setItemType(type.value as BudgetItemType)
                resetForm()
              }}
              className={cn(
                'p-3 rounded-xl border-2 text-center transition-all',
                isSelected ? type.color : 'bg-white border-slate-200 hover:border-slate-300'
              )}
            >
              <Icon className={cn('h-5 w-5 mx-auto mb-1', isSelected ? '' : 'text-slate-400')} strokeWidth={1.5} />
              <span className={cn('text-sm font-medium', isSelected ? '' : 'text-slate-600')}>
                {type.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Form fields */}
      <div className="space-y-4">
        {/* Plan selector */}
        {itemType === 'PLAN' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Pla
              </label>
              <select
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona un pla...</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.nombre} - {plan.precioMensual.toFixed(2)}€/mes
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Facturació
              </label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="MONTHLY">Mensual</option>
                <option value="ANNUAL">Anual</option>
              </select>
            </div>
          </div>
        )}

        {/* Extra selector */}
        {itemType === 'EXTRA' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Servei extra
            </label>
            <select
              value={extraId}
              onChange={(e) => setExtraId(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona un extra...</option>
              {extras.map((extra) => (
                <option key={extra.id} value={extra.id}>
                  {extra.name} - {extra.basePrice.toFixed(2)}€
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Descripció
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripció del concepte..."
            rows={2}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Quantity and price */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Quantitat
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Preu unitari (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Subtotal
            </label>
            <div className="px-4 py-2.5 bg-slate-100 rounded-lg text-sm font-semibold text-slate-900">
              {isNaN(calculatedSubtotal) ? '0.00' : calculatedSubtotal.toFixed(2)} €
            </div>
          </div>
        </div>

        {/* Add button */}
        <button
          onClick={handleSubmit}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Afegir línia
        </button>
      </div>
    </div>
  )
}