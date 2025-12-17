// components/gestio-empreses/unified-pipeline/PipelineBoard.tsx
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
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { PipelineColumn } from './PipelineColumn'
import { PipelineCard } from './PipelineCard'

interface PipelineColumn {
  id: string
  label: string
  stages: string[]
  type: 'lead' | 'empresa'
  color?: string
}

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

interface PipelineBoardProps {
  columns: PipelineColumn[]
  items: Record<string, PipelineItem[]>
  onStageChange?: (itemId: string, itemType: 'lead' | 'empresa', newColumnId: string, newStage: string) => Promise<void>
  onItemClick?: (item: PipelineItem) => void
}

export function PipelineBoard({
  columns,
  items,
  onStageChange,
  onItemClick
}: PipelineBoardProps) {
  const [activeItem, setActiveItem] = useState<PipelineItem | null>(null)

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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    // Buscar el item en todas las columnas
    for (const columnId of Object.keys(items)) {
      const item = items[columnId].find(i => i.id === active.id)
      if (item) {
        setActiveItem(item)
        break
      }
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveItem(null)

    if (!over) return

    // Encontrar la columna destino
    const overColumnId = over.id as string
    const targetColumn = columns.find(c => c.id === overColumnId)

    if (!targetColumn) return

    // Encontrar el item que se movió
    let movedItem: PipelineItem | null = null
    let sourceColumnId: string | null = null

    for (const [colId, colItems] of Object.entries(items)) {
      const item = colItems.find(i => i.id === active.id)
      if (item) {
        movedItem = item
        sourceColumnId = colId
        break
      }
    }

    if (!movedItem || sourceColumnId === overColumnId) return

    // Verificar que el tipo coincida (no mezclar leads y empresas)
    if (movedItem.type !== targetColumn.type) return

    // Llamar al callback de cambio de stage
    if (onStageChange) {
      const newStage = targetColumn.stages[0]
      await onStageChange(movedItem.id, movedItem.type, overColumnId, newStage)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className="grid gap-4 pb-4"
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(180px, 1fr))` }}
      >
        {columns.map((column) => (
          <PipelineColumn
            key={column.id}
            id={column.id}
            label={column.label}
            items={items[column.id] || []}
            color={column.color}
            onItemClick={onItemClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeItem && (
          <PipelineCard item={activeItem} isDragging />
        )}
      </DragOverlay>
    </DndContext>
  )
}
