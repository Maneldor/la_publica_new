// components/gestio-empreses/resources/ResourceCard.tsx
'use client'

import { useState } from 'react'
import {
  FileText,
  MessageSquare,
  Video,
  CheckSquare,
  Presentation,
  BookOpen,
  MoreVertical,
  Eye,
  Edit,
  Copy,
  Trash2,
  Download,
  Clock,
  Tag,
  Users
} from 'lucide-react'
import { format } from 'date-fns'
import { ca } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import {
  CommercialResource,
  ResourceType,
  RESOURCE_TYPE_LABELS,
  PIPELINE_PHASE_LABELS,
  RESOURCE_CATEGORY_LABELS
} from '@/lib/gestio-empreses/types/resources'

interface ResourceCardProps {
  resource: CommercialResource
  onView?: (resource: CommercialResource) => void
  onEdit?: (resource: CommercialResource) => void
  onDuplicate?: (resource: CommercialResource) => void
  onDelete?: (resource: CommercialResource) => void
  onExtract?: (resource: CommercialResource) => void
  canEdit?: boolean
  canDelete?: boolean
  showActions?: boolean
  compact?: boolean
}

const typeIcons: Record<ResourceType, any> = {
  [ResourceType.SPEECH]: Presentation,
  [ResourceType.EMAIL_TEMPLATE]: MessageSquare,
  [ResourceType.DOCUMENT]: FileText,
  [ResourceType.GUIDE]: BookOpen,
  [ResourceType.VIDEO]: Video,
  [ResourceType.CHECKLIST]: CheckSquare,
}

const typeColors: Record<ResourceType, { bg: string; border: string; text: string }> = {
  [ResourceType.SPEECH]: {
    bg: 'bg-blue-50',
    border: 'border-l-blue-500',
    text: 'text-blue-700'
  },
  [ResourceType.EMAIL_TEMPLATE]: {
    bg: 'bg-green-50',
    border: 'border-l-green-500',
    text: 'text-green-700'
  },
  [ResourceType.DOCUMENT]: {
    bg: 'bg-orange-50',
    border: 'border-l-orange-500',
    text: 'text-orange-700'
  },
  [ResourceType.GUIDE]: {
    bg: 'bg-purple-50',
    border: 'border-l-purple-500',
    text: 'text-purple-700'
  },
  [ResourceType.VIDEO]: {
    bg: 'bg-red-50',
    border: 'border-l-red-500',
    text: 'text-red-700'
  },
  [ResourceType.CHECKLIST]: {
    bg: 'bg-indigo-50',
    border: 'border-l-indigo-500',
    text: 'text-indigo-700'
  },
}

export function ResourceCard({
  resource,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onExtract,
  canEdit = false,
  canDelete = false,
  showActions = true,
  compact = false
}: ResourceCardProps) {
  const [showDropdown, setShowDropdown] = useState(false)

  const IconComponent = typeIcons[resource.type]
  const colors = typeColors[resource.type]

  const handleCardClick = () => {
    onView?.(resource)
  }

  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all border-l-4 cursor-pointer",
        colors.border,
        compact ? "p-3" : "p-4"
      )}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={cn("p-2 rounded-lg", colors.bg)}>
            <IconComponent className={cn("w-5 h-5", colors.text)} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-slate-800 truncate mb-1">
              {resource.title}
            </h3>
            <p className="text-sm text-slate-600 line-clamp-2">
              {resource.description}
            </p>
          </div>
        </div>

        {showActions && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowDropdown(!showDropdown)
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-8 w-48 bg-white rounded-lg border border-slate-200 shadow-lg z-10">
                <div className="py-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onView?.(resource)
                      setShowDropdown(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Veure detalls
                  </button>

                  {onExtract && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onExtract(resource)
                        setShowDropdown(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Extreure contingut
                    </button>
                  )}

                  {canEdit && onEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(resource)
                        setShowDropdown(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                  )}

                  {onDuplicate && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDuplicate(resource)
                        setShowDropdown(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Duplicar
                    </button>
                  )}

                  {canDelete && onDelete && (
                    <>
                      <div className="border-t border-slate-100 my-1" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(resource)
                          setShowDropdown(false)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Metadatos */}
      <div className="space-y-2 text-xs">
        {/* Tipo y fase */}
        <div className="flex items-center gap-4">
          <span className={cn("px-2 py-1 rounded-full font-medium", colors.bg, colors.text)}>
            {RESOURCE_TYPE_LABELS[resource.type]}
          </span>
          <span className="text-slate-500">
            {PIPELINE_PHASE_LABELS[resource.phase]}
          </span>
        </div>

        {/* Categoría */}
        {!compact && (
          <div className="flex items-center gap-1.5 text-slate-500">
            <Tag className="w-3 h-3" />
            <span>{RESOURCE_CATEGORY_LABELS[resource.category]}</span>
          </div>
        )}

        {/* Tags */}
        {!compact && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {resource.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
            {resource.tags.length > 3 && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-xs">
                +{resource.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Roles de acceso */}
        {!compact && (
          <div className="flex items-center gap-1.5 text-slate-500">
            <Users className="w-3 h-3" />
            <span>{resource.accessRoles.length} rol{resource.accessRoles.length > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Fecha de actualización */}
        <div className="flex items-center gap-1.5 text-slate-400 pt-1 border-t border-slate-100">
          <Clock className="w-3 h-3" />
          <span>
            Actualitzat {format(new Date(resource.updatedAt), "d MMM yyyy", { locale: ca })}
          </span>
          {resource.lastModifiedBy && (
            <span>per {resource.lastModifiedBy.name || 'Sistema'}</span>
          )}
        </div>
      </div>

      {/* Indicador de versión */}
      {!compact && (
        <div className="mt-3 pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-400">
            v{resource.version}
          </span>
        </div>
      )}

      {/* Click overlay para cerrar dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-5"
          onClick={(e) => {
            e.stopPropagation()
            setShowDropdown(false)
          }}
        />
      )}
    </div>
  )
}