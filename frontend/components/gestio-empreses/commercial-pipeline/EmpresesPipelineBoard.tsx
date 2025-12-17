// components/gestio-empreses/commercial-pipeline/EmpresesPipelineBoard.tsx
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
  Building2,
  UserCheck,
  GraduationCap,
  CheckCircle2,
  LucideIcon
} from 'lucide-react'
import { PipelineColumn } from './PipelineColumn'
import { EmpresaCard } from './EmpresaCard'
import toast from 'react-hot-toast'

export interface EmpresaItem {
  id: string
  name: string
  email: string
  phone: string | null
  stage: string
  status: string
  sector: string | null
  createdAt: string
  accountManager: { id: string; name: string } | null
  fromLeadId: string | null
}

interface Column {
  id: string
  label: string
  description: string
  icon: LucideIcon
  color: string
  allowedTransitions: string[]
}

interface EmpresesPipelineBoardProps {
  empreses: Record<string, EmpresaItem[]>
  onStageChange?: (empresaId: string, newStage: string, assignedToId?: string) => Promise<void>
  onEmpresaClick?: (empresa: EmpresaItem) => void
  userRole?: string
}

const COLUMNS: Column[] = [
  {
    id: 'CREADA',
    label: 'Creades',
    description: 'Noves empreses',
    icon: Building2,
    color: 'slate',
    allowedTransitions: ['ASSIGNADA'],
  },
  {
    id: 'ASSIGNADA',
    label: 'Assignades',
    description: 'Amb gestor assignat',
    icon: UserCheck,
    color: 'blue',
    allowedTransitions: ['ONBOARDING'],
  },
  {
    id: 'ONBOARDING',
    label: 'Onboarding',
    description: 'En proces d\'activacio',
    icon: GraduationCap,
    color: 'amber',
    allowedTransitions: ['ACTIVA'],
  },
  {
    id: 'ACTIVA',
    label: 'Actives',
    description: 'Empreses actives',
    icon: CheckCircle2,
    color: 'green',
    allowedTransitions: [],
  },
]

export function EmpresesPipelineBoard({
  empreses,
  onStageChange,
  onEmpresaClick,
  userRole = 'GESTOR_ESTANDARD'
}: EmpresesPipelineBoardProps) {
  const [activeEmpresa, setActiveEmpresa] = useState<EmpresaItem | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  // Filtrar columnes segons rol
  const getVisibleColumns = () => {
    if (['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO'].includes(userRole)) {
      return COLUMNS // Veuen tot
    }
    if (['CRM_COMERCIAL', 'CRM_CONTINGUT'].includes(userRole)) {
      // CRM veu tot per assignar
      return COLUMNS
    }
    // Gestors veuen: ASSIGNADA, ONBOARDING, ACTIVA (les seves)
    return COLUMNS.filter(c => ['ASSIGNADA', 'ONBOARDING', 'ACTIVA'].includes(c.id))
  }

  const visibleColumns = getVisibleColumns()

  const handleDragStart = (event: DragStartEvent) => {
    const empresaId = event.active.id as string
    for (const stage of Object.keys(empreses)) {
      const found = empreses[stage]?.find(e => e.id === empresaId)
      if (found) {
        setActiveEmpresa(found)
        break
      }
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveEmpresa(null)

    if (!over || !onStageChange) return

    const empresaId = active.id as string
    const newStage = over.id as string

    // Trobar l'empresa actual
    let currentEmpresa: EmpresaItem | undefined
    let currentStage: string | undefined

    for (const stage of Object.keys(empreses)) {
      const found = empreses[stage]?.find(e => e.id === empresaId)
      if (found) {
        currentEmpresa = found
        currentStage = stage
        break
      }
    }

    if (!currentEmpresa || !currentStage || currentStage === newStage) return

    // Verificar transicio valida
    const currentColumn = COLUMNS.find(c => c.id === currentStage)
    if (!currentColumn?.allowedTransitions.includes(newStage)) {
      toast.error('Transicio no permesa')
      return
    }

    setIsUpdating(true)
    try {
      await onStageChange(empresaId, newStage)
      toast.success('Empresa actualitzada')
    } catch (error) {
      toast.error('Error actualitzant empresa')
    } finally {
      setIsUpdating(false)
    }
  }

  const getEmpresesByStage = (stageId: string): EmpresaItem[] => {
    return empreses[stageId] || []
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className="flex gap-3 overflow-x-auto pb-4"
        style={{ minHeight: '400px' }}
      >
        {visibleColumns.map((column) => (
          <PipelineColumn
            key={column.id}
            id={column.id}
            label={column.label}
            description={column.description}
            icon={column.icon}
            color={column.color}
            count={getEmpresesByStage(column.id).length}
          >
            {getEmpresesByStage(column.id).map((empresa) => (
              <EmpresaCard
                key={empresa.id}
                empresa={empresa}
                onClick={() => onEmpresaClick?.(empresa)}
              />
            ))}
          </PipelineColumn>
        ))}
      </div>

      <DragOverlay>
        {activeEmpresa && (
          <div className="opacity-90">
            <EmpresaCard empresa={activeEmpresa} isDragging />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
