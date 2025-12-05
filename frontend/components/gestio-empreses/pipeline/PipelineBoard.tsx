// components/gestio-empreses/pipeline/PipelineBoard.tsx
'use client'

import { useRouter } from 'next/navigation'
import { PipelineColumn } from './PipelineColumn'

interface Lead {
  id: string
  companyName: string
  contactName: string
  email: string
  phone: string | null
  status: string
  priority: string
  estimatedRevenue: number | null
  score: number | null
  createdAt: Date
  updatedAt: Date
  assignedTo: {
    id: string
    name: string | null
  } | null
}

interface Stage {
  id: string
  label: string
  color: string
  leads: Lead[]
  totalValue: number
  count: number
}

interface PipelineBoardProps {
  stages: Stage[]
  isSupervisor: boolean
}

export function PipelineBoard({ stages, isSupervisor }: PipelineBoardProps) {
  const router = useRouter()

  const handleLeadMoved = () => {
    router.refresh()
  }

  // Filtrar columnes buides opcionals (CRM_REJECTED només si té leads)
  const visibleStages = stages.filter(stage => {
    // Sempre mostrar les columnes principals
    if (['NEW', 'CONTACTED', 'NEGOTIATION', 'QUALIFIED', 'WON', 'LOST'].includes(stage.id)) {
      return true
    }
    // Mostrar columnes CRM si és supervisor o si tenen leads
    if (isSupervisor) return true
    return stage.count > 0
  })

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {visibleStages.map((stage) => (
        <PipelineColumn
          key={stage.id}
          {...stage}
          isSupervisor={isSupervisor}
          onLeadMoved={handleLeadMoved}
        />
      ))}
    </div>
  )
}