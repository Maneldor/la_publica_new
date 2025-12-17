// hooks/useCommercialPipelineData.ts
'use client'

import { useState, useEffect, useCallback } from 'react'

interface LeadItem {
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

interface EmpresaItem {
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

interface PipelineStats {
  total: number
  pendents: number
  enProces: number
  completats: number
}

interface PipelineUser {
  id: string
  name: string
  email: string
  role: string
  image?: string
}

interface UserPipelineData {
  user: PipelineUser
  leads: {
    byStage: Record<string, LeadItem[]>
    stats: PipelineStats
  }
  empreses: {
    byStage: Record<string, EmpresaItem[]>
    stats: PipelineStats & { actives: number }
  }
}

interface CommercialPipelineData {
  myPipeline: UserPipelineData | null
  teamPipelines: UserPipelineData[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  updateLeadStage: (leadId: string, newStage: string, assignedToId?: string) => Promise<void>
  updateEmpresaStage: (empresaId: string, newStage: string, assignedToId?: string) => Promise<void>
}

export function useCommercialPipelineData(): CommercialPipelineData {
  const [myPipeline, setMyPipeline] = useState<UserPipelineData | null>(null)
  const [teamPipelines, setTeamPipelines] = useState<UserPipelineData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/gestio/pipeline-comercial')

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error carregant dades')
      }

      const data = await response.json()

      setMyPipeline(data.myPipeline)
      setTeamPipelines(data.teamPipelines || [])

    } catch (err) {
      console.error('Error carregant pipeline comercial:', err)
      setError(err instanceof Error ? err.message : 'Error desconegut')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateLeadStage = useCallback(async (leadId: string, newStage: string, assignedToId?: string) => {
    const response = await fetch('/api/gestio/pipeline-comercial', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'lead',
        id: leadId,
        newStage,
        assignedToId
      })
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Error actualitzant lead')
    }

    // Recarregar dades
    await loadData()
  }, [loadData])

  const updateEmpresaStage = useCallback(async (empresaId: string, newStage: string, assignedToId?: string) => {
    const response = await fetch('/api/gestio/pipeline-comercial', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'empresa',
        id: empresaId,
        newStage,
        assignedToId
      })
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Error actualitzant empresa')
    }

    // Recarregar dades
    await loadData()
  }, [loadData])

  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    myPipeline,
    teamPipelines,
    isLoading,
    error,
    refresh: loadData,
    updateLeadStage,
    updateEmpresaStage
  }
}
