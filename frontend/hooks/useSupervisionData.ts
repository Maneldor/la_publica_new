// hooks/useSupervisionData.ts
'use client'

import { useState, useEffect, useCallback } from 'react'

interface MyWorkStats {
  leadsAssigned: number
  leadsInProgress: number
  leadsCompleted: number
  empresesAssigned: number
  empresesInProgress: number
  empresesActive: number
  pendingVerification: number
  pendingPreContract: number
  thisMonth: {
    leadsCompleted: number
    empresesActivated: number
    conversionRate: number
  }
}

interface PendingItem {
  id: string
  type: 'lead' | 'empresa'
  name: string
  stage: string
  priority?: string
  estimatedValue?: number
  daysInStage: number
  assignedTo?: { id: string; name: string }
  createdAt: string
}

interface TeamMemberStats {
  id: string
  name: string
  email: string
  role: string
  image?: string
  stats: {
    leadsTotal: number
    leadsInProgress: number
    leadsCompleted: number
    empresesTotal: number
    empresesActive: number
    conversionRate: number
    avgDaysToConvert: number
  }
  recentActivity: {
    lastLeadUpdate?: string
    lastEmpresaUpdate?: string
  }
}

interface SupervisionData {
  myWork: MyWorkStats
  pendingItems: PendingItem[]
  teamMembers: TeamMemberStats[]
  roleSpecific: {
    preContractsReceived?: number
    pendingFormalization?: number
    leadsToAssign?: number
    pendingVerificationTotal?: number
    totalLeads?: number
    totalEmpreses?: number
    totalActive?: number
  }
}

interface UseSupervisionDataReturn {
  data: SupervisionData | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useSupervisionData(): UseSupervisionDataReturn {
  const [data, setData] = useState<SupervisionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/gestio/supervision-pipeline')

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error carregant dades')
      }

      const result = await response.json()
      setData(result)

    } catch (err) {
      console.error('Error carregant supervision data:', err)
      setError(err instanceof Error ? err.message : 'Error desconegut')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    data,
    isLoading,
    error,
    refresh: loadData
  }
}
