// components/gestio-empreses/commercial-pipeline/LeadsPipelineBoard.tsx
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
  Inbox,
  UserCheck,
  Briefcase,
  ClipboardCheck,
  BadgeCheck,
  FileSignature,
  CheckCircle2,
  LucideIcon
} from 'lucide-react'
import { PipelineColumn } from './PipelineColumn'
import { LeadCard } from './LeadCard'
import toast from 'react-hot-toast'

export interface LeadItem {
  id: string
  companyName: string
  contactName: string | null
  email: string | null
  phone: string | null
  stage: string
  status: string
  priority: string
  estimatedValue: number
  score: number | null
  createdAt: string
  assignedTo: { id: string; name: string } | null
}

interface Column {
  id: string
  label: string
  description: string
  icon: LucideIcon
  color: string
  allowedTransitions: string[]
}

interface LeadsPipelineBoardProps {
  leads: Record<string, LeadItem[]>
  onStageChange?: (leadId: string, newStage: string, assignedToId?: string) => Promise<void>
  onLeadClick?: (lead: LeadItem) => void
  userRole?: string
}

const COLUMNS: Column[] = [
  {
    id: 'NOU',
    label: 'Nous',
    description: 'Leads sense assignar',
    icon: Inbox,
    color: 'slate',
    allowedTransitions: ['ASSIGNAT'],
  },
  {
    id: 'ASSIGNAT',
    label: 'Assignats',
    description: 'Pendents de gestio',
    icon: UserCheck,
    color: 'blue',
    allowedTransitions: ['TREBALLANT'],
  },
  {
    id: 'TREBALLANT',
    label: 'Treballant',
    description: 'En proces de gestio',
    icon: Briefcase,
    color: 'amber',
    allowedTransitions: ['PER_VERIFICAR'],
  },
  {
    id: 'PER_VERIFICAR',
    label: 'Per Verificar',
    description: 'Pendents de verificacio CRM',
    icon: ClipboardCheck,
    color: 'orange',
    allowedTransitions: ['VERIFICAT'],
  },
  {
    id: 'VERIFICAT',
    label: 'Verificats',
    description: 'Aprovats per CRM',
    icon: BadgeCheck,
    color: 'purple',
    allowedTransitions: ['PRE_CONTRACTE'],
  },
  {
    id: 'PRE_CONTRACTE',
    label: 'Pre-Contracte',
    description: 'Pendents de contractacio',
    icon: FileSignature,
    color: 'indigo',
    allowedTransitions: ['CONTRACTAT'],
  },
  {
    id: 'CONTRACTAT',
    label: 'Contractats',
    description: 'Convertits a empresa',
    icon: CheckCircle2,
    color: 'green',
    allowedTransitions: [],
  },
]

export function LeadsPipelineBoard({
  leads,
  onStageChange,
  onLeadClick,
  userRole = 'GESTOR_ESTANDARD'
}: LeadsPipelineBoardProps) {
  const [activeLead, setActiveLead] = useState<LeadItem | null>(null)
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
      // CRM veu: NOU (per assignar), PER_VERIFICAR, VERIFICAT, PRE_CONTRACTE
      return COLUMNS.filter(c => ['NOU', 'PER_VERIFICAR', 'VERIFICAT', 'PRE_CONTRACTE', 'CONTRACTAT'].includes(c.id))
    }
    // Gestors veuen: ASSIGNAT, TREBALLANT, PER_VERIFICAR
    return COLUMNS.filter(c => ['ASSIGNAT', 'TREBALLANT', 'PER_VERIFICAR'].includes(c.id))
  }

  const visibleColumns = getVisibleColumns()

  const handleDragStart = (event: DragStartEvent) => {
    const leadId = event.active.id as string
    // Trobar el lead en totes les columnes
    for (const stage of Object.keys(leads)) {
      const found = leads[stage]?.find(l => l.id === leadId)
      if (found) {
        setActiveLead(found)
        break
      }
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveLead(null)

    if (!over || !onStageChange) return

    const leadId = active.id as string
    const newStage = over.id as string

    // Trobar el lead actual
    let currentLead: LeadItem | undefined
    let currentStage: string | undefined

    for (const stage of Object.keys(leads)) {
      const found = leads[stage]?.find(l => l.id === leadId)
      if (found) {
        currentLead = found
        currentStage = stage
        break
      }
    }

    if (!currentLead || !currentStage || currentStage === newStage) return

    // Verificar transicio valida
    const currentColumn = COLUMNS.find(c => c.id === currentStage)
    if (!currentColumn?.allowedTransitions.includes(newStage)) {
      toast.error('Transicio no permesa')
      return
    }

    setIsUpdating(true)
    try {
      await onStageChange(leadId, newStage)
      toast.success('Lead actualitzat')
    } catch (error) {
      toast.error('Error actualitzant lead')
    } finally {
      setIsUpdating(false)
    }
  }

  const getLeadsByStage = (stageId: string): LeadItem[] => {
    return leads[stageId] || []
  }

  const getTotalValueByStage = (stageId: string): number => {
    return getLeadsByStage(stageId).reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0)
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
            count={getLeadsByStage(column.id).length}
            totalValue={getTotalValueByStage(column.id)}
          >
            {getLeadsByStage(column.id).map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onClick={() => onLeadClick?.(lead)}
              />
            ))}
          </PipelineColumn>
        ))}
      </div>

      <DragOverlay>
        {activeLead && (
          <div className="opacity-90">
            <LeadCard lead={activeLead} isDragging />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
