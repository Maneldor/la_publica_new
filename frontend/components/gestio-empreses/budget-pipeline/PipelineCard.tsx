// components/gestio-empreses/budget-pipeline/PipelineCard.tsx
'use client'

import { ChevronDown, User as UserIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BudgetPipelineStats } from './BudgetPipelineStats'
import { BudgetPipelineBoard } from './BudgetPipelineBoard'

interface PipelineStats {
  draft: { count: number; amount: number }
  sent: { count: number; amount: number }
  approved: { count: number; amount: number }
  invoiced: { count: number; amount: number }
  paid: { count: number; amount: number }
  overdue: { count: number; amount: number }
  conversionRate: number
}

interface PipelineItem {
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
  status: string
}

interface PipelineUser {
  id: string
  name: string
  email: string
  role: string
  image?: string
}

interface PipelineCardProps {
  user: PipelineUser
  stats: PipelineStats
  items: PipelineItem[]
  isExpanded: boolean
  onToggle: () => void
  onTransition?: (itemId: string, fromStatus: string, toStatus: string) => Promise<void>
  onCardClick?: (item: PipelineItem) => void
  isOwn?: boolean
}

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrador',
  ADMIN_GESTIO: 'Admin Gestio',
  CRM_COMERCIAL: 'CRM Comercial',
  CRM_CONTINGUT: 'CRM Contingut',
  GESTOR_ESTANDARD: 'Gestor Estandard',
  GESTOR_ESTRATEGIC: 'Gestor Estrategic',
  GESTOR_ENTERPRISE: 'Gestor Enterprise',
}

function formatAmount(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`
  }
  return amount.toFixed(0)
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function PipelineCard({
  user,
  stats,
  items,
  isExpanded,
  onToggle,
  onTransition,
  onCardClick,
  isOwn = false
}: PipelineCardProps) {
  const totalPipeline = stats.draft.amount + stats.sent.amount + stats.approved.amount + stats.invoiced.amount
  const totalPaid = stats.paid.amount
  const totalPending = stats.invoiced.amount
  const openBudgets = stats.draft.count + stats.sent.count + stats.approved.count

  return (
    <div className={cn(
      'bg-white rounded-xl border overflow-hidden transition-shadow',
      isOwn ? 'border-blue-200 shadow-sm' : 'border-slate-200',
      isExpanded && 'shadow-md'
    )}>
      {/* Header clicable */}
      <button
        onClick={onToggle}
        className={cn(
          'w-full px-4 py-3 flex items-center justify-between transition-colors',
          isOwn ? 'hover:bg-blue-50' : 'hover:bg-slate-50'
        )}
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              isOwn ? 'bg-blue-100' : 'bg-slate-100'
            )}>
              <span className={cn(
                'text-sm font-medium',
                isOwn ? 'text-blue-700' : 'text-slate-700'
              )}>
                {getInitials(user.name)}
              </span>
            </div>
          )}

          {/* Info */}
          <div className="text-left">
            <p className="font-medium text-slate-900 flex items-center gap-2">
              {user.name}
              {isOwn && (
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                  Tu
                </span>
              )}
            </p>
            <p className="text-xs text-slate-500">
              {roleLabels[user.role] || user.role} · {openBudgets} pressupostos oberts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Mini stats cuando colapsado */}
          {!isExpanded && (
            <div className="hidden md:flex items-center gap-4 text-sm">
              <span className="text-slate-600">
                Pipeline: <span className="font-medium">{formatAmount(totalPipeline)}</span>
              </span>
              <span className="text-green-600">
                Cobrat: <span className="font-medium">{formatAmount(totalPaid)}</span>
              </span>
              <span className="text-orange-600">
                Pendent: <span className="font-medium">{formatAmount(totalPending)}</span>
              </span>
            </div>
          )}

          <ChevronDown
            className={cn(
              'h-5 w-5 text-slate-400 transition-transform',
              isExpanded && 'rotate-180'
            )}
            strokeWidth={1.5}
          />
        </div>
      </button>

      {/* Contenido expandible */}
      {isExpanded && (
        <div className="border-t border-slate-100">
          {/* Stats */}
          <div className="p-4 bg-slate-50">
            <BudgetPipelineStats stats={stats} compact />
          </div>

          {/* Board */}
          <div className="p-4">
            {items.length > 0 ? (
              <BudgetPipelineBoard
                items={items}
                onTransition={onTransition}
                onCardClick={onCardClick}
              />
            ) : (
              <div className="text-center py-8 text-slate-500">
                <UserIcon className="h-8 w-8 mx-auto mb-2 text-slate-300" strokeWidth={1.5} />
                <p>No hi ha pressupostos ni factures</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
