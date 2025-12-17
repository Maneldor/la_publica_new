'use client'

import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import {
  FileText,
  Send,
  CheckCircle,
  Receipt,
  BadgeCheck,
  LucideIcon
} from 'lucide-react'
import { BudgetPipelineColumn } from './BudgetPipelineColumn'
import { BudgetPipelineCard } from './BudgetPipelineCard'
import { BudgetTransitionModal } from './BudgetTransitionModal'
import toast from 'react-hot-toast'

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

interface Column {
  id: string
  label: string
  description: string
  icon: LucideIcon
  color: string
  allowedTransitions: string[]
}

interface BudgetPipelineBoardProps {
  items: BudgetPipelineItem[]
  onTransition?: (itemId: string, fromStatus: string, toStatus: string) => Promise<void>
  onCardClick?: (item: BudgetPipelineItem) => void
}

const COLUMNS: Column[] = [
  {
    id: 'DRAFT',
    label: 'Esborrany',
    description: 'Pressupostos en preparació',
    icon: FileText,
    color: 'slate',
    allowedTransitions: ['SENT'],
  },
  {
    id: 'SENT',
    label: 'Enviat',
    description: 'Pendents de resposta',
    icon: Send,
    color: 'blue',
    allowedTransitions: ['APPROVED', 'REJECTED'],
  },
  {
    id: 'APPROVED',
    label: 'Aprovat',
    description: 'Pendents de facturar',
    icon: CheckCircle,
    color: 'amber',
    allowedTransitions: ['INVOICED'],
  },
  {
    id: 'INVOICED',
    label: 'Facturat',
    description: 'Pendents de cobrament',
    icon: Receipt,
    color: 'purple',
    allowedTransitions: ['PAID'],
  },
  {
    id: 'PAID',
    label: 'Pagat',
    description: 'Completats',
    icon: BadgeCheck,
    color: 'green',
    allowedTransitions: [],
  },
]

export function BudgetPipelineBoard({ items, onTransition, onCardClick }: BudgetPipelineBoardProps) {
  const [activeItem, setActiveItem] = useState<BudgetPipelineItem | null>(null)
  const [transitionModal, setTransitionModal] = useState<{
    isOpen: boolean
    item: BudgetPipelineItem | null
    fromColumn: string
    toColumn: string
  }>({
    isOpen: false,
    item: null,
    fromColumn: '',
    toColumn: '',
  })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const getItemsByStatus = (status: string) => {
    return items.filter(item => item.status === status)
  }

  const getTotalByStatus = (status: string) => {
    return getItemsByStatus(status).reduce((sum, item) => sum + item.total, 0)
  }

  const handleDragStart = (event: DragStartEvent) => {
    const item = items.find(i => i.id === event.active.id)
    setActiveItem(item || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveItem(null)

    if (!over) return

    const item = items.find(i => i.id === active.id)
    if (!item) return

    const fromColumn = item.status
    const toColumn = over.id as string

    if (fromColumn === toColumn) return

    // Verificar si la transició és permesa
    const sourceColumn = COLUMNS.find(c => c.id === fromColumn)
    if (!sourceColumn?.allowedTransitions.includes(toColumn)) {
      toast.error('Aquesta transició no està permesa')
      return
    }

    // Obrir modal de confirmació
    setTransitionModal({
      isOpen: true,
      item,
      fromColumn,
      toColumn,
    })
  }

  const handleConfirmTransition = async () => {
    if (!transitionModal.item || !onTransition) return

    await onTransition(
      transitionModal.item.id,
      transitionModal.fromColumn,
      transitionModal.toColumn
    )
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-5 gap-4">
          {COLUMNS.map((column) => (
            <BudgetPipelineColumn
              key={column.id}
              id={column.id}
              label={column.label}
              description={column.description}
              icon={column.icon}
              color={column.color}
              items={getItemsByStatus(column.id)}
              totalAmount={getTotalByStatus(column.id)}
              onCardClick={onCardClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeItem && (
            <div className="opacity-80">
              <BudgetPipelineCard item={activeItem} onClick={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <BudgetTransitionModal
        isOpen={transitionModal.isOpen}
        onClose={() => setTransitionModal({ isOpen: false, item: null, fromColumn: '', toColumn: '' })}
        item={transitionModal.item}
        fromColumn={transitionModal.fromColumn}
        toColumn={transitionModal.toColumn}
        onConfirm={handleConfirmTransition}
      />
    </>
  )
}