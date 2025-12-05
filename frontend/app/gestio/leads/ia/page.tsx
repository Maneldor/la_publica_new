// app/gestio/leads/ia/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Sparkles } from 'lucide-react'

import { PageHeader } from '@/components/gestio-empreses/shared/PageHeader'
import { IALeadStats } from '@/components/gestio-empreses/ia-leads/IALeadStats'
import { IALeadGenerator } from '@/components/gestio-empreses/ia-leads/IALeadGenerator'
import { IALeadHistory } from '@/components/gestio-empreses/ia-leads/IALeadHistory'
import { IALeadPreview } from '@/components/gestio-empreses/ia-leads/IALeadPreview'
import { IALeadChart } from '@/components/gestio-empreses/ia-leads/IALeadChart'
import { getIALeadStats, GeneratedLead } from '@/lib/gestio-empreses/ia-lead-actions'

export default function AILeadsPage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<any>(null)
  const [generatedLeads, setGeneratedLeads] = useState<GeneratedLead[]>([])
  const [currentGenerationId, setCurrentGenerationId] = useState<string | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  const userId = session?.user?.id

  const loadStats = async () => {
    if (!userId) return
    try {
      const data = await getIALeadStats(userId)
      setStats(data)
    } catch (error) {
      console.error('Error carregant estadístiques:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      loadStats()
    }
  }, [userId])

  const handleGenerated = (generationId: string, leads: GeneratedLead[]) => {
    setCurrentGenerationId(generationId)
    setGeneratedLeads(leads)
    loadStats()
  }

  const handleSaved = () => {
    setCurrentGenerationId(null)
    setGeneratedLeads([])
    loadStats()
  }

  if (status === 'loading') {
    return <div>Carregant...</div>
  }

  if (!session?.user) {
    redirect('/login')
    return null
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="IA Leads Enterprise"
        description="Generador avançat amb historial i previsualització"
        icon={Sparkles}
      />

      {/* Estadístiques */}
      {stats && !statsLoading && (
        <IALeadStats stats={stats} />
      )}

      {/* Generador o Previsualització - amplada completa */}
      {currentGenerationId && generatedLeads.length > 0 ? (
        <IALeadPreview
          generationId={currentGenerationId}
          leads={generatedLeads}
          userId={userId!}
          onSaved={handleSaved}
        />
      ) : (
        <IALeadGenerator
          onGenerated={handleGenerated}
          userId={userId!}
        />
      )}

      {/* Gràfic de rendiment - amplada completa */}
      <IALeadChart userId={userId!} />

      {/* Historial de generacions - amplada completa */}
      <IALeadHistory
        userId={userId!}
        onGenerated={handleGenerated}
      />
    </div>
  )
}