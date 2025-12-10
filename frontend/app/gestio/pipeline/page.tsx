// app/gestio/pipeline/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LayoutGrid, List, Plus, RefreshCw } from 'lucide-react'
import { PipelineBoard } from '@/components/gestio-empreses/pipeline/PipelineBoard'
import { LeadDetailPanel } from '@/components/gestio-empreses/pipeline/LeadDetailPanel'
import { advanceLeadStage } from '@/lib/gestio-empreses/lead-stage-actions'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

// Tipo de Lead para el panel
interface Lead {
  id: string
  companyName: string
  contactName: string | null
  status: string
  priority: string
  estimatedRevenue: number | null
  sector?: string | null
  email?: string | null
  phone?: string | null
  website?: string | null
  linkedinProfile?: string | null
  city?: string | null
  description?: string | null
  source?: string | null
  score?: number | null
  tags?: string[]
  notes?: string | null
  createdAt: string
  updatedAt: string
  assignedTo?: {
    id: string
    name: string | null
    email?: string | null
  } | null
}

export default function PipelinePage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const leadId = searchParams.get('leadId')

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Si viene un leadId por URL, abrir el panel
  useEffect(() => {
    if (leadId) {
      // Aquí podrías cargar el lead específico si lo necesitas
      setIsPanelOpen(true)
    }
  }, [leadId])

  const handleLeadClick = (lead: any) => {
    const formattedLead: Lead = {
      ...lead,
      createdAt: lead.createdAt?.toString() || new Date().toISOString(),
      updatedAt: lead.updatedAt?.toString() || new Date().toISOString(),
    }
    setSelectedLead(formattedLead)
    setIsPanelOpen(true)
  }

  const handleClosePanel = () => {
    setIsPanelOpen(false)
    setTimeout(() => setSelectedLead(null), 300)
    // Limpiar el leadId de la URL si existe
    if (leadId) {
      router.replace('/gestio/pipeline')
    }
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LayoutGrid className="h-7 w-7 text-slate-600" strokeWidth={1.5} />
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Pipeline</h1>
            <p className="text-sm text-slate-500">Gestió de leads per fases</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" strokeWidth={1.5} />
            Actualitzar
          </button>
          <Link
            href="/gestio/leads"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <List className="h-4 w-4" strokeWidth={1.5} />
            Vista llista
          </Link>
          <Link
            href="/gestio/leads/nou"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Nou lead
          </Link>
        </div>
      </div>

      {/* Pipeline Board con vistas por rol */}
      <PipelineBoard key={refreshKey} />

      {/* Panel de detall del lead */}
      {leadId && (
        <LeadDetailPanel
          leadId={leadId}
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          onAdvanceStage={async (leadId, newStatus) => {
            try {
              const result = await advanceLeadStage(leadId, newStatus, "temp-user-id")
              if (result.success) {
                handleRefresh()
                setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null)
                console.log('✅ Lead avançat correctament a:', newStatus)
              } else {
                console.error('❌ Error avançant lead:', result.error)
              }
            } catch (error) {
              console.error('❌ Error inesperat:', error)
            }
          }}
          currentUserId="temp-user-id"
        />
      )}
    </div>
  )
}