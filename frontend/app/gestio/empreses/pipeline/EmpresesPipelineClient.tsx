// app/gestio/empreses/pipeline/EmpresesPipelineClient.tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2,
  RefreshCw,
  Filter,
  ChevronDown,
  ChevronRight,
  Users,
  User,
  Clock,
  Phone,
  Mail,
  MoreHorizontal
} from 'lucide-react'
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
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { cn } from '@/lib/utils'
import {
  moveEmpresaToColumn,
  assignEmpresaToGestor,
  type EmpresesPipelineColumn,
  type EmpresesPipelineItem,
  type UnifiedEmpresesPipelineData,
  type UserEmpresesPipelineData
} from '@/lib/gestio-empreses/empreses-pipeline-actions'
import toast, { Toaster } from 'react-hot-toast'

interface EmpresesPipelineClientProps {
  initialData: UnifiedEmpresesPipelineData
  currentUser: {
    id: string
    role: string
    name?: string | null
  }
}

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrador',
  ADMIN_GESTIO: 'Admin Gestió',
  CRM_COMERCIAL: 'CRM Comercial',
  CRM_CONTINGUT: 'CRM Contingut',
  GESTOR_ESTANDARD: 'Gestor Estàndard',
  GESTOR_ESTRATEGIC: 'Gestor Estratègic',
  GESTOR_ENTERPRISE: 'Gestor Enterprise',
}

const columnColors: Record<string, { header: string; badge: string }> = {
  slate: { header: 'bg-slate-100', badge: 'bg-slate-200 text-slate-700' },
  blue: { header: 'bg-blue-100', badge: 'bg-blue-200 text-blue-700' },
  cyan: { header: 'bg-cyan-100', badge: 'bg-cyan-200 text-cyan-700' },
  amber: { header: 'bg-amber-100', badge: 'bg-amber-200 text-amber-700' },
  green: { header: 'bg-green-100', badge: 'bg-green-200 text-green-700' },
  purple: { header: 'bg-purple-100', badge: 'bg-purple-200 text-purple-700' },
  red: { header: 'bg-red-100', badge: 'bg-red-200 text-red-700' },
}

// Componente de columna del pipeline
function PipelineColumn({
  id,
  label,
  items,
  color = 'slate',
  onItemClick
}: {
  id: string
  label: string
  items: EmpresesPipelineItem[]
  color?: string
  onItemClick?: (item: EmpresesPipelineItem) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const colorStyle = columnColors[color] || columnColors.slate

  return (
    <div className="flex flex-col flex-1 min-w-[200px] bg-slate-50 rounded-xl border border-slate-200">
      {/* Header */}
      <div className={cn('px-3 py-2.5 rounded-t-xl', colorStyle.header)}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">{label}</h3>
          <span className={cn(
            'px-2 py-0.5 rounded-full text-xs font-medium',
            colorStyle.badge
          )}>
            {items.length}
          </span>
        </div>
      </div>

      {/* Items */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 p-2 space-y-2 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto',
          isOver && 'bg-blue-50 ring-2 ring-blue-300 ring-inset rounded-b-xl'
        )}
      >
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {items.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-sm text-slate-400">
              Sense empreses
            </div>
          ) : (
            items.map((item) => (
              <EmpresaCard
                key={item.id}
                item={item}
                onClick={() => onItemClick?.(item)}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}

// Componente de tarjeta de empresa
function EmpresaCard({
  item,
  onClick,
  isDragging
}: {
  item: EmpresesPipelineItem
  onClick?: () => void
  isDragging?: boolean
}) {
  const isStale = item.daysInStage > 7

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-lg border border-slate-200 p-3 cursor-pointer transition-all hover:shadow-md hover:border-slate-300',
        isDragging && 'shadow-lg border-blue-400 opacity-90 rotate-2',
        isStale && 'border-l-4 border-l-orange-400'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building2 className="h-4 w-4 text-blue-600" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-medium text-slate-900 truncate">
              {item.name}
            </h4>
            {item.cif && (
              <p className="text-xs text-slate-500 truncate">{item.cif}</p>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
          }}
          className="p-1 hover:bg-slate-100 rounded"
        >
          <MoreHorizontal className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
        </button>
      </div>

      {/* Info */}
      <div className="space-y-1.5 mb-2">
        {item.email && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Mail className="h-3 w-3" strokeWidth={1.5} />
            <span className="truncate">{item.email}</span>
          </div>
        )}
        {item.phone && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Phone className="h-3 w-3" strokeWidth={1.5} />
            <span>{item.phone}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          {item.accountManager ? (
            <>
              <User className="h-3 w-3 text-slate-400" strokeWidth={1.5} />
              <span className="text-xs text-slate-500 truncate max-w-[80px]">
                {item.accountManager.name}
              </span>
            </>
          ) : (
            <span className="text-xs text-orange-500 font-medium">Sense gestor</span>
          )}
        </div>
        <div className={cn(
          'flex items-center gap-1 text-xs',
          isStale ? 'text-orange-500' : 'text-slate-400'
        )}>
          <Clock className="h-3 w-3" strokeWidth={1.5} />
          <span>{item.daysInStage}d</span>
        </div>
      </div>

      {/* Sector / Plan badges */}
      {(item.sector || item.planType) && (
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {item.sector && (
            <span className="px-1.5 py-0.5 text-xs bg-slate-100 text-slate-600 rounded">
              {item.sector}
            </span>
          )}
          {item.planType && (
            <span className="px-1.5 py-0.5 text-xs bg-purple-100 text-purple-600 rounded">
              {item.planType}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Componente de sección de pipeline (por usuario)
function PipelineSection({
  user,
  pipeline,
  isOwn,
  defaultExpanded,
  onStageChange,
  onItemClick,
  gestors
}: {
  user: { id: string; name: string; email: string; role: string; image?: string }
  pipeline: {
    columns: EmpresesPipelineColumn[]
    items: Record<string, EmpresesPipelineItem[]>
    stats: { total: number; byColumn: Record<string, number> }
  }
  isOwn: boolean
  defaultExpanded: boolean
  onStageChange?: (itemId: string, newColumnId: string, newStage: string) => Promise<void>
  onItemClick?: (item: EmpresesPipelineItem) => void
  gestors?: { id: string; name: string; role: string }[]
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [activeItem, setActiveItem] = useState<EmpresesPipelineItem | null>(null)

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
    for (const columnId of Object.keys(pipeline.items)) {
      const item = pipeline.items[columnId].find(i => i.id === active.id)
      if (item) {
        setActiveItem(item)
        break
      }
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveItem(null)

    if (!over || !onStageChange) return

    const overColumnId = over.id as string
    const targetColumn = pipeline.columns.find(c => c.id === overColumnId)

    if (!targetColumn) return

    let sourceColumnId: string | null = null
    for (const [colId, colItems] of Object.entries(pipeline.items)) {
      const item = colItems.find(i => i.id === active.id)
      if (item) {
        sourceColumnId = colId
        break
      }
    }

    if (sourceColumnId === overColumnId) return

    const newStage = targetColumn.stages[0]
    await onStageChange(active.id as string, overColumnId, newStage)
  }

  if (!isOwn && !expanded) {
    return (
      <div
        onClick={() => setExpanded(true)}
        className="bg-white rounded-xl border border-slate-200 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChevronRight className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
              <User className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{roleLabels[user.role] || user.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {pipeline.columns.slice(0, 4).map((col) => (
              <div key={col.id} className="text-center">
                <p className="text-lg font-semibold text-slate-700">
                  {pipeline.stats.byColumn[col.id] || 0}
                </p>
                <p className="text-xs text-slate-500 truncate max-w-[80px]">{col.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header colapsable */}
      {!isOwn && (
        <div
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between p-4 border-b border-slate-200 cursor-pointer hover:bg-slate-50"
        >
          <div className="flex items-center gap-3">
            <ChevronDown className={cn(
              'h-5 w-5 text-slate-400 transition-transform',
              !expanded && '-rotate-90'
            )} strokeWidth={1.5} />
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
              <User className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{roleLabels[user.role] || user.role}</p>
            </div>
          </div>
          <p className="text-sm text-slate-500">{pipeline.stats.total} empreses</p>
        </div>
      )}

      {/* Pipeline board */}
      {expanded && (
        <div className="p-4 overflow-x-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${pipeline.columns.length}, minmax(200px, 1fr))` }}
            >
              {pipeline.columns.map((column) => (
                <PipelineColumn
                  key={column.id}
                  id={column.id}
                  label={column.label}
                  items={pipeline.items[column.id] || []}
                  color={column.color}
                  onItemClick={onItemClick}
                />
              ))}
            </div>

            <DragOverlay>
              {activeItem && (
                <EmpresaCard item={activeItem} isDragging />
              )}
            </DragOverlay>
          </DndContext>
        </div>
      )}
    </div>
  )
}

// Componente principal
export function EmpresesPipelineClient({
  initialData,
  currentUser
}: EmpresesPipelineClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [data, setData] = useState(initialData)
  const [showFilters, setShowFilters] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedEmpresa, setSelectedEmpresa] = useState<EmpresesPipelineItem | null>(null)

  const hasTeam = data.teamPipelines.length > 0

  const handleStageChange = async (
    itemId: string,
    newColumnId: string,
    newStage: string
  ) => {
    try {
      const result = await moveEmpresaToColumn(itemId, newColumnId)

      if (result.success) {
        toast.success('Empresa actualitzada')
        startTransition(() => {
          router.refresh()
        })
      } else {
        toast.error(result.error || 'Error actualitzant')
      }
    } catch (error) {
      toast.error('Error actualitzant')
      console.error('Error updating stage:', error)
    }
  }

  const handleItemClick = (item: EmpresesPipelineItem) => {
    window.open(`/gestio/empreses/${item.id}`, '_blank')
  }

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  const handleAssign = async (empresaId: string, gestorId: string) => {
    try {
      const result = await assignEmpresaToGestor(empresaId, gestorId)

      if (result.success) {
        toast.success('Empresa assignada')
        setShowAssignModal(false)
        setSelectedEmpresa(null)
        startTransition(() => {
          router.refresh()
        })
      } else {
        toast.error(result.error || 'Error assignant')
      }
    } catch (error) {
      toast.error('Error assignant empresa')
    }
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-7 w-7 text-slate-600" strokeWidth={1.5} />
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Pipeline d'Empreses</h1>
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
          gestors={data.availableGestors}
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
                gestors={data.availableGestors}
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
          <span className="text-orange-600">Taronja = +7 dies en stage</span>
          <span>-</span>
          <span className="text-orange-500">Sense gestor = Pendent d'assignar</span>
        </div>
      </div>

      {/* Modal de assignación (simple) */}
      {showAssignModal && selectedEmpresa && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Assignar gestor a {selectedEmpresa.name}
            </h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {data.availableGestors.map((gestor) => (
                <button
                  key={gestor.id}
                  onClick={() => handleAssign(selectedEmpresa.id, gestor.id)}
                  className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <p className="font-medium text-slate-900">{gestor.name}</p>
                  <p className="text-xs text-slate-500">{roleLabels[gestor.role] || gestor.role}</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setShowAssignModal(false)
                setSelectedEmpresa(null)
              }}
              className="mt-4 w-full px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Cancel·lar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
