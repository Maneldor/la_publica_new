// hooks/usePipelineData.ts
'use client'

import { useState, useEffect, useCallback } from 'react'

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
  linkedInvoice?: string
  linkedBudget?: string
}

interface PipelineUser {
  id: string
  name: string
  email: string
  role: string
  image?: string
}

interface UserPipeline {
  user: PipelineUser
  stats: PipelineStats
  items: PipelineItem[]
}

interface PipelineData {
  myPipeline: UserPipeline | null
  teamPipelines: UserPipeline[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function usePipelineData(): PipelineData {
  const [myPipeline, setMyPipeline] = useState<UserPipeline | null>(null)
  const [teamPipelines, setTeamPipelines] = useState<UserPipeline[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/gestio/pipeline')

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error carregant dades')
      }

      const data = await response.json()

      setMyPipeline(data.myPipeline)
      setTeamPipelines(data.teamPipelines || [])

    } catch (err) {
      console.error('Error carregant pipeline:', err)
      setError(err instanceof Error ? err.message : 'Error desconegut')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    myPipeline,
    teamPipelines,
    isLoading,
    error,
    refresh: loadData
  }
}
