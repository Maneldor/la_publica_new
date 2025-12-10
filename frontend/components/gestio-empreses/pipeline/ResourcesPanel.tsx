// components/gestio-empreses/pipeline/ResourcesPanel.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  BookOpen,
  Download,
  Eye,
  ChevronDown,
  ChevronRight,
  FileText,
  MessageSquare,
  Video,
  CheckSquare,
  Presentation,
  Sparkles,
  X,
  Copy,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ResourceViewer } from '@/components/gestio-empreses/resources/ResourceViewer'
import {
  CommercialResource,
  ExtractedResource,
  ResourceType,
  PipelinePhase,
  RESOURCE_TYPE_LABELS
} from '@/lib/gestio-empreses/types/resources'
import {
  getResourcesByPhase,
  extractResourceContent
} from '@/lib/gestio-empreses/actions/resources-actions'

interface ResourcesPanelProps {
  leadId: string
  currentPhase: PipelinePhase | string
  userId: string
  userName?: string
  userRole: string
  isOpen: boolean
  onToggle: () => void
}

const typeIcons: Record<ResourceType, any> = {
  [ResourceType.SPEECH]: Presentation,
  [ResourceType.EMAIL_TEMPLATE]: MessageSquare,
  [ResourceType.DOCUMENT]: FileText,
  [ResourceType.GUIDE]: BookOpen,
  [ResourceType.VIDEO]: Video,
  [ResourceType.CHECKLIST]: CheckSquare,
}

const typeColors: Record<ResourceType, string> = {
  [ResourceType.SPEECH]: 'text-blue-600',
  [ResourceType.EMAIL_TEMPLATE]: 'text-green-600',
  [ResourceType.DOCUMENT]: 'text-orange-600',
  [ResourceType.GUIDE]: 'text-purple-600',
  [ResourceType.VIDEO]: 'text-red-600',
  [ResourceType.CHECKLIST]: 'text-indigo-600',
}

export function ResourcesPanel({
  leadId,
  currentPhase,
  userId,
  userName,
  userRole,
  isOpen,
  onToggle
}: ResourcesPanelProps) {
  const [resources, setResources] = useState<CommercialResource[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedResource, setSelectedResource] = useState<CommercialResource | ExtractedResource | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [extractingId, setExtractingId] = useState<string | null>(null)
  const [expandedTypes, setExpandedTypes] = useState<Set<ResourceType>>(new Set())

  useEffect(() => {
    if (isOpen) {
      loadResources()
    }
  }, [isOpen, currentPhase, userRole])

  const loadResources = async () => {
    setLoading(true)
    try {
      const result = await getResourcesByPhase(currentPhase as string, userRole)
      if (result.success && result.data) {
        setResources(result.data)

        // Auto-expandir tipos que tienen recursos
        const typesWithResources = new Set(result.data.map(r => r.type))
        setExpandedTypes(typesWithResources)
      }
    } catch (error) {
      console.error('Error loading resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewResource = (resource: CommercialResource) => {
    setSelectedResource(resource)
    setIsViewerOpen(true)
  }

  const handleExtractResource = async (resource: CommercialResource, customValues?: Record<string, any>) => {
    setExtractingId(resource.id)
    try {
      const result = await extractResourceContent(
        resource.id,
        leadId,
        userId,
        userName,
        customValues
      )

      if (result.success && result.data) {
        setSelectedResource(result.data)
        setIsViewerOpen(true)
      } else {
        alert('Error al extraer contenido: ' + result.error)
      }
    } catch (error) {
      console.error('Error extracting resource:', error)
      alert('Error al extraer el contenido del recurso')
    } finally {
      setExtractingId(null)
    }
  }

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content)
    // Toast notification would be better, but for now:
    const notification = document.createElement('div')
    notification.textContent = 'Contingut copiat!'
    notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50'
    document.body.appendChild(notification)
    setTimeout(() => document.body.removeChild(notification), 2000)
  }

  const toggleTypeExpansion = (type: ResourceType) => {
    const newExpanded = new Set(expandedTypes)
    if (newExpanded.has(type)) {
      newExpanded.delete(type)
    } else {
      newExpanded.add(type)
    }
    setExpandedTypes(newExpanded)
  }

  // Agrupar recursos por tipo
  const resourcesByType = resources.reduce((acc, resource) => {
    if (!acc[resource.type]) {
      acc[resource.type] = []
    }
    acc[resource.type].push(resource)
    return acc
  }, {} as Record<ResourceType, CommercialResource[]>)

  return (
    <>
      {/* Panel toggle button */}
      <div className="mb-4">
        <button
          onClick={onToggle}
          className={cn(
            "w-full flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors",
            isOpen && "border-blue-300 bg-blue-50"
          )}
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-slate-800">
              Eines per a aquesta fase
            </span>
            {resources.length > 0 && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                {resources.length}
              </span>
            )}
          </div>
          {isOpen ? (
            <ChevronDown className="w-5 h-5 text-slate-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-slate-500" />
          )}
        </button>
      </div>

      {/* Resources content */}
      {isOpen && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-6">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">
                No hi ha eines disponibles per a aquesta fase
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-800">
                  Eines disponibles per la fase: {currentPhase}
                </h4>
                <a
                  href="/gestio/eines"
                  target="_blank"
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Veure totes
                </a>
              </div>

              {Object.entries(resourcesByType).map(([type, typeResources]) => {
                const ResourceIcon = typeIcons[type as ResourceType]
                const iconColor = typeColors[type as ResourceType]
                const isExpanded = expandedTypes.has(type as ResourceType)

                return (
                  <div key={type} className="border border-slate-100 rounded-lg">
                    <button
                      onClick={() => toggleTypeExpansion(type as ResourceType)}
                      className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <ResourceIcon className={cn("w-4 h-4", iconColor)} />
                        <span className="text-sm font-medium text-slate-700">
                          {RESOURCE_TYPE_LABELS[type as ResourceType]}
                        </span>
                        <span className="text-xs text-slate-500">
                          ({typeResources.length})
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-25">
                        <div className="p-3 space-y-2">
                          {typeResources.map(resource => (
                            <div
                              key={resource.id}
                              className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded hover:border-slate-200 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <h5 className="text-sm font-medium text-slate-800 truncate">
                                  {resource.title}
                                </h5>
                                <p className="text-xs text-slate-500 truncate">
                                  {resource.description}
                                </p>
                                {resource.tags.length > 0 && (
                                  <div className="flex gap-1 mt-1">
                                    {resource.tags.slice(0, 2).map(tag => (
                                      <span
                                        key={tag}
                                        className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-xs rounded"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                    {resource.tags.length > 2 && (
                                      <span className="text-xs text-slate-400">
                                        +{resource.tags.length - 2}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-1 ml-2">
                                <button
                                  onClick={() => handleViewResource(resource)}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Veure detalls"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => handleExtractResource(resource)}
                                  disabled={extractingId === resource.id}
                                  className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                                  title="Extreure contingut personalitzat"
                                >
                                  {extractingId === resource.id ? (
                                    <div className="w-4 h-4 border-2 border-green-300 border-t-green-600 rounded-full animate-spin" />
                                  ) : (
                                    <Download className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Resource viewer */}
      <ResourceViewer
        resource={selectedResource!}
        isOpen={isViewerOpen}
        onClose={() => {
          setIsViewerOpen(false)
          setSelectedResource(null)
        }}
        onExtract={handleExtractResource}
        onCopy={handleCopyContent}
        showPlaceholderEditor={true}
        leadId={leadId}
      />
    </>
  )
}