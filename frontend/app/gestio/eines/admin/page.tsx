// app/gestio/eines/admin/page.tsx - Página de administración de recursos (solo Admin/CRM)
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import {
  Plus,
  Settings,
  BarChart3,
  Upload,
  Download,
  Archive,
  Users,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ResourceCard } from '@/components/gestio-empreses/resources/ResourceCard'
import { ResourceViewer } from '@/components/gestio-empreses/resources/ResourceViewer'
import { ResourceFilters } from '@/components/gestio-empreses/resources/ResourceFilters'
import { CreateResourceModal } from '@/components/gestio-empreses/resources/CreateResourceModal'
import { ResourceEditor } from '@/components/gestio-empreses/resources/ResourceEditor'
import {
  CommercialResource,
  ResourceFilterDTO,
  ResourceStats,
  ResourceType,
  PipelinePhase
} from '@/lib/gestio-empreses/types/resources'
import {
  getResources,
  deleteResource,
  duplicateResource,
  getResourceStats,
  createResource,
  updateResource
} from '@/lib/gestio-empreses/actions/resources-actions'
import { CreateResourceDTO, UpdateResourceDTO } from '@/lib/gestio-empreses/types/resources'

export default function EinesAdminPage() {
  const { data: session, status } = useSession()
  const [resources, setResources] = useState<CommercialResource[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ResourceFilterDTO>({ isActive: true })
  const [selectedResource, setSelectedResource] = useState<CommercialResource | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [stats, setStats] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'resources' | 'stats' | 'settings'>('resources')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<CommercialResource | null>(null)

  // Verificar permisos
  const userRole = session?.user?.role || 'USER'
  const isAdmin = ['ADMIN', 'CRM_MANAGER'].includes(userRole)

  useEffect(() => {
    if (status === 'loading') return

    if (!session || !isAdmin) {
      redirect('/gestio/eines')
    }
  }, [session, status, isAdmin])

  useEffect(() => {
    if (isAdmin) {
      loadResources()
      loadStats()
    }
  }, [filters, isAdmin])

  const loadResources = async () => {
    setLoading(true)
    try {
      const result = await getResources(filters, session?.user?.id, userRole)
      if (result.success && result.data) {
        setResources(result.data)

        // Extraer tags únicos
        const allTags = result.data.flatMap(r => r.tags)
        const uniqueTags = Array.from(new Set(allTags)).sort()
        setAvailableTags(uniqueTags)
      }
    } catch (error) {
      console.error('Error loading resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      // Calcular estadísticas básicas del lado cliente
      const totalResources = resources.length
      const activeResources = resources.filter(r => r.isActive).length
      const inactiveResources = totalResources - activeResources

      const byType = Object.values(ResourceType).reduce((acc, type) => {
        acc[type] = resources.filter(r => r.type === type).length
        return acc
      }, {} as Record<ResourceType, number>)

      const byPhase = Object.values(PipelinePhase).reduce((acc, phase) => {
        acc[phase] = resources.filter(r => r.phase === phase).length
        return acc
      }, {} as Record<PipelinePhase, number>)

      setStats({
        totalResources,
        activeResources,
        inactiveResources,
        byType,
        byPhase
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleViewResource = (resource: CommercialResource) => {
    setSelectedResource(resource)
    setIsViewerOpen(true)
  }

  const handleDuplicateResource = async (resource: CommercialResource) => {
    if (!session?.user?.id) return

    try {
      const result = await duplicateResource(
        resource.id,
        session.user.id,
        `${resource.slug}-copy-${Date.now()}`,
        `${resource.title} (Copia)`
      )

      if (result.success) {
        loadResources()
        alert('Recurs duplicat correctament!')
      } else {
        alert('Error al duplicar el recurs: ' + result.error)
      }
    } catch (error) {
      console.error('Error duplicating resource:', error)
      alert('Error al duplicar el recurs')
    }
  }

  const handleDeleteResource = async (resource: CommercialResource) => {
    if (!session?.user?.id) return
    if (!confirm('Estàs segur que vols eliminar aquest recurs?')) return

    try {
      const result = await deleteResource(resource.id, session.user.id)

      if (result.success) {
        loadResources()
        alert('Recurs eliminat correctament!')
      } else {
        alert('Error al eliminar el recurs: ' + result.error)
      }
    } catch (error) {
      console.error('Error deleting resource:', error)
      alert('Error al eliminar el recurs')
    }
  }

  const handleCreateResource = () => {
    setIsCreateModalOpen(true)
  }

  const handleEditResource = (resource: CommercialResource) => {
    setEditingResource(resource)
    setIsEditorOpen(true)
  }

  const handleSaveResource = async (data: CreateResourceDTO | UpdateResourceDTO) => {
    if (!session?.user?.id) return

    try {
      let result
      if (editingResource) {
        // Editing existing resource
        result = await updateResource(editingResource.id, data as UpdateResourceDTO, session.user.id)
      } else {
        // Creating new resource
        result = await createResource(data as CreateResourceDTO, session.user.id)
      }

      if (result.success) {
        loadResources()
        setIsEditorOpen(false)
        setEditingResource(null)
        alert(editingResource ? 'Recurs actualitzat correctament!' : 'Recurs creat correctament!')
      } else {
        alert('Error al guardar el recurs: ' + result.error)
      }
    } catch (error) {
      console.error('Error saving resource:', error)
      alert('Error al guardar el recurs')
    }
  }

  const handleResourceCreated = () => {
    setIsCreateModalOpen(false)
    loadResources()
  }

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Carregant...</div>
  }

  if (!session || !isAdmin) {
    return null // El redirect s'executarà
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <Settings className="w-7 h-7 text-blue-600" />
                Administració d'Eines
              </h1>
              <p className="text-slate-600 mt-1">
                Gestió i configuració de recursos comercials
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Upload className="w-5 h-5" />
                Importar
              </button>

              <button
                onClick={handleCreateResource}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Nou recurs
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 border-b">
            <button
              onClick={() => setActiveTab('resources')}
              className={cn(
                "pb-3 px-1 border-b-2 font-medium text-sm",
                activeTab === 'resources'
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              Recursos
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={cn(
                "pb-3 px-1 border-b-2 font-medium text-sm",
                activeTab === 'stats'
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              Estadístiques
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={cn(
                "pb-3 px-1 border-b-2 font-medium text-sm",
                activeTab === 'settings'
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              Configuració
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Resources tab */}
        {activeTab === 'resources' && (
          <>
            {/* Filters */}
            <ResourceFilters
              filters={filters}
              onFiltersChange={setFilters}
              availableTags={availableTags}
              className="mb-6"
            />

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <div className="text-2xl font-bold text-slate-900">{resources.length}</div>
                <div className="text-sm text-slate-600">Total recursos</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <div className="text-2xl font-bold text-green-600">
                  {resources.filter(r => r.isActive).length}
                </div>
                <div className="text-sm text-slate-600">Actius</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <div className="text-2xl font-bold text-red-600">
                  {resources.filter(r => !r.isActive).length}
                </div>
                <div className="text-sm text-slate-600">Inactius</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <div className="text-2xl font-bold text-blue-600">{availableTags.length}</div>
                <div className="text-sm text-slate-600">Tags únics</div>
              </div>
            </div>

            {/* Resources grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white p-4 rounded-lg border animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-slate-200 rounded w-full mb-1" />
                    <div className="h-3 bg-slate-200 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : resources.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Cap recurs trobat</h3>
                <p className="text-slate-600 mb-4">
                  {Object.keys(filters).length > 0
                    ? "Prova a ajustar els filtres."
                    : "Comença creant el primer recurs."
                  }
                </p>
                <button
                  onClick={handleCreateResource}
                  className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-5 h-5" />
                  Crear primer recurs
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resources.map(resource => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onView={handleViewResource}
                    onEdit={handleEditResource}
                    onDuplicate={handleDuplicateResource}
                    onDelete={handleDeleteResource}
                    canEdit={true}
                    canDelete={true}
                    showActions={true}
                    compact={false}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Stats tab */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">Estadístiques d'ús</h2>

            {/* Stats overview */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Resources by type */}
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-medium text-slate-900 mb-4">Per tipus de recurs</h3>
                  <div className="space-y-2">
                    {Object.entries(stats.byType).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 capitalize">
                          {type.toLowerCase().replace('_', ' ')}
                        </span>
                        <span className="font-medium">{count as number}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resources by phase */}
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-medium text-slate-900 mb-4">Per fase del pipeline</h3>
                  <div className="space-y-2">
                    {Object.entries(stats.byPhase).map(([phase, count]) => (
                      <div key={phase} className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">{phase}</span>
                        <span className="font-medium">{count as number}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent activity placeholder */}
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-medium text-slate-900 mb-4">Activitat recent</h3>
                  <div className="text-center py-8 text-slate-400">
                    <Clock className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Estadístiques d'ús disponibles aviat</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">Configuració del sistema</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Backup & Export */}
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-medium text-slate-900 mb-4">Còpia de seguretat</h3>
                <div className="space-y-4">
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Download className="w-5 h-5" />
                    Exportar tots els recursos
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">
                    <Archive className="w-5 h-5" />
                    Crear còpia de seguretat
                  </button>
                </div>
              </div>

              {/* Access control */}
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-medium text-slate-900 mb-4">Control d'accés</h3>
                <div className="space-y-4">
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">
                    <Users className="w-5 h-5" />
                    Gestionar permisos
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">
                    <Settings className="w-5 h-5" />
                    Configurar roles
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resource viewer */}
      <ResourceViewer
        resource={selectedResource!}
        isOpen={isViewerOpen}
        onClose={() => {
          setIsViewerOpen(false)
          setSelectedResource(null)
        }}
      />

      {/* Create resource modal */}
      <CreateResourceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onResourceCreated={handleResourceCreated}
      />

      {/* Resource editor */}
      <ResourceEditor
        resource={editingResource}
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false)
          setEditingResource(null)
        }}
        onSave={handleSaveResource}
        mode={editingResource ? 'edit' : 'create'}
      />
    </div>
  )
}