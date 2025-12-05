// components/gestio-empreses/pressupostos/BudgetCard.tsx
'use client'

import { useState, useTransition } from 'react'
import {
  Building2,
  Calendar,
  Euro,
  User,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
  Clock,
  FileText,
  Edit
} from 'lucide-react'
import { format } from 'date-fns'
import { ca } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { updateBudgetStatus, deleteBudget } from '@/lib/gestio-empreses/budget-actions'
import type { BudgetItem } from '@/lib/gestio-empreses/budget-actions'

interface BudgetCardProps {
  budget: BudgetItem
  isSelected: boolean
  onSelect: (budgetId: string) => void
  onPreview: (budget: BudgetItem) => void
  onRefresh?: () => void
}

export function BudgetCard({
  budget,
  isSelected,
  onSelect,
  onPreview,
  onRefresh
}: BudgetCardProps) {
  const [showActions, setShowActions] = useState(false)
  const [isPending, startTransition] = useTransition()

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ca-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return format(date, 'dd MMM yyyy', { locale: ca })
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'draft':
        return {
          label: 'Esborrany',
          color: 'text-slate-600',
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-200'
        }
      case 'pending':
        return {
          label: 'Pendent',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        }
      case 'approved':
        return {
          label: 'Aprovat',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        }
      case 'rejected':
        return {
          label: 'Rebutjat',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        }
      default:
        return {
          label: 'Desconegut',
          color: 'text-slate-600',
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-200'
        }
    }
  }

  const statusConfig = getStatusConfig(budget.status)

  const handleStatusChange = async (newStatus: 'approved' | 'rejected') => {
    startTransition(async () => {
      try {
        await updateBudgetStatus(budget.id, newStatus)
        onRefresh?.()
      } catch (error) {
        console.error('Error updating budget status:', error)
      }
    })
  }

  const handleDelete = async () => {
    if (confirm('Esteu segur que voleu eliminar aquest pressupost?')) {
      startTransition(async () => {
        try {
          await deleteBudget(budget.id)
          onRefresh?.()
        } catch (error) {
          console.error('Error deleting budget:', error)
        }
      })
    }
  }

  const isOverdue = budget.dueDate && new Date() > budget.dueDate

  return (
    <div
      className={cn(
        'bg-white rounded-xl border transition-all duration-200 hover:shadow-md',
        isSelected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200',
        isPending && 'opacity-60 pointer-events-none'
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(budget.id)}
              className="mt-1 h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />

            {/* Info principal */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-slate-900">{budget.number}</h3>
                <span
                  className={cn(
                    'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
                    statusConfig.color,
                    statusConfig.bgColor,
                    statusConfig.borderColor
                  )}
                >
                  {statusConfig.label}
                </span>
                {isOverdue && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-red-600 bg-red-50 border border-red-200">
                    Vençut
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <Building2 className="h-4 w-4" />
                <span className="font-medium">{budget.client}</span>
              </div>

              {budget.description && (
                <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                  {budget.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{budget.gestorName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(budget.createdAt)}</span>
                </div>
                {budget.dueDate && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span className={isOverdue ? 'text-red-600' : ''}>
                      Venc: {formatDate(budget.dueDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Accions */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {showActions && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-lg border border-slate-200 shadow-lg py-1 z-10 min-w-[180px]">
                <button
                  onClick={() => {
                    onPreview(budget)
                    setShowActions(false)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Eye className="h-4 w-4" />
                  Veure detalls
                </button>

                <button
                  onClick={() => setShowActions(false)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </button>

                {budget.status === 'pending' && (
                  <>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        handleStatusChange('approved')
                        setShowActions(false)
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Aprovar
                    </button>
                    <button
                      onClick={() => {
                        handleStatusChange('rejected')
                        setShowActions(false)
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4" />
                      Rebutjar
                    </button>
                  </>
                )}

                <hr className="my-1" />
                <button
                  onClick={() => {
                    handleDelete()
                    setShowActions(false)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-2xl font-bold text-slate-900">
              <Euro className="h-5 w-5" />
              <span>{formatAmount(budget.amount)}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <FileText className="h-4 w-4" />
              <span>{budget.items.length} conceptes</span>
            </div>
          </div>

          <button
            onClick={() => onPreview(budget)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Eye className="h-4 w-4" />
            Veure
          </button>
        </div>
      </div>

      {/* Click overlay per tancar el menu d'accions */}
      {showActions && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  )
}