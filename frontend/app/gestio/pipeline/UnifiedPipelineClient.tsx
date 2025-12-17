// app/gestio/pipeline/UnifiedPipelineClient.tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  GitBranch,
  RefreshCw,
  Filter,
  ChevronDown,
  Users,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PipelineSection } from '@/components/gestio-empreses/unified-pipeline'
import { updateItemStage } from '@/lib/gestio-empreses/unified-pipeline-actions'
import toast, { Toaster } from 'react-hot-toast'

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

interface PipelineData {
  columns: PipelineColumn[]
  items: Record<string, PipelineItem[]>
  stats: {
    total: number
    byColumn: Record<string, number>
  }
}

interface UserInfo {
  id: string
  name: string
  email: string
  role: string
  image?: string
}

interface UserPipelineData {
  user: UserInfo
  pipeline: PipelineData
}

interface UnifiedPipelineData {
  myPipeline: UserPipelineData
  teamPipelines: UserPipelineData[]
}

interface UnifiedPipelineClientProps {
  initialData: UnifiedPipelineData
  currentUser: {
    id: string
    role: string
    name?: string | null
  }
}

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrador',
  ADMIN_GESTIO: 'Admin Gestio',
  CRM_COMERCIAL: 'CRM Comercial',
  CRM_CONTINGUT: 'CRM Contingut',
  GESTOR_ESTANDARD: 'Gestor Estàndard',
  GESTOR_ESTRATEGIC: 'Gestor Estratègic',
  GESTOR_ENTERPRISE: 'Gestor Enterprise',
}

export function UnifiedPipelineClient({
  initialData,
  currentUser
}: UnifiedPipelineClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [data, setData] = useState(initialData)
  const [showFilters, setShowFilters] = useState(false)

  const hasTeam = data.teamPipelines.length > 0

  const handleStageChange = async (
    itemId: string,
    itemType: 'lead' | 'empresa',
    newColumnId: string,
    newStage: string
  ) => {
    try {
      await updateItemStage(itemId, itemType, newStage)
      toast.success(itemType === 'lead' ? 'Lead actualitzat' : 'Empresa actualitzada')

      // Recargar la página para obtener datos actualizados
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      toast.error('Error actualitzant')
      console.error('Error updating stage:', error)
    }
  }

  const handleItemClick = (item: PipelineItem) => {
    if (item.type === 'lead') {
      window.open(`/gestio/leads/${item.id}`, '_blank')
    } else {
      window.open(`/gestio/empreses/${item.id}`, '_blank')
    }
  }

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GitBranch className="h-7 w-7 text-slate-600" strokeWidth={1.5} />
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Pipeline</h1>
            <p className="text-sm text-slate-500">
              Vista {roleLabels[currentUser.role] || currentUser.role}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
              showFilters
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            )}
          >
            <Filter className="h-4 w-4" strokeWidth={1.5} />
            Filtres
            <ChevronDown className={cn(
              'h-4 w-4 transition-transform',
              showFilters && 'rotate-180'
            )} strokeWidth={1.5} />
          </button>

          <button
            onClick={handleRefresh}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <RefreshCw className={cn('h-4 w-4', isPending && 'animate-spin')} strokeWidth={1.5} />
            Actualitzar
          </button>
        </div>
      </div>

      {/* Filtres */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Filtres avançats (pròximament)</p>
        </div>
      )}

      {/* El meu pipeline */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <h2 className="text-sm font-semibold text-slate-700">
            El meu pipeline
          </h2>
        </div>

        <PipelineSection
          user={data.myPipeline.user}
          pipeline={data.myPipeline.pipeline}
          isOwn={true}
          defaultExpanded={true}
          onStageChange={handleStageChange}
          onItemClick={handleItemClick}
        />
      </div>

      {/* Pipeline de l'equip */}
      {hasTeam && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Users className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
              Equip ({data.teamPipelines.length})
            </h2>
          </div>

          <div className="space-y-3">
            {data.teamPipelines.map((member) => (
              <PipelineSection
                key={member.user.id}
                user={member.user}
                pipeline={member.pipeline}
                isOwn={false}
                defaultExpanded={false}
                onStageChange={handleStageChange}
                onItemClick={handleItemClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Llegenda */}
      <div className="bg-slate-50 rounded-lg p-4">
        <p className="text-xs font-medium text-slate-500 mb-2">Llegenda</p>
        <div className="flex flex-wrap gap-4 text-xs text-slate-600">
          <span>Arrossega les targetes per canviar l'stage</span>
          <span>-</span>
          <span className="text-red-600">Vermell = Prioritat urgent/alta</span>
          <span>-</span>
          <span className="text-orange-600">Taronja = +7 dies en stage</span>
        </div>
      </div>
    </div>
  )
}
