// components/gestio-empreses/unified-pipeline/PipelineSection.tsx
'use client'

import { useState } from 'react'
import { ChevronDown, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PipelineBoard } from './PipelineBoard'

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

interface PipelineSectionProps {
  user: UserInfo
  pipeline: PipelineData
  isOwn?: boolean
  defaultExpanded?: boolean
  onStageChange?: (itemId: string, itemType: 'lead' | 'empresa', newColumnId: string, newStage: string) => Promise<void>
  onItemClick?: (item: PipelineItem) => void
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

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function PipelineSection({
  user,
  pipeline,
  isOwn = false,
  defaultExpanded = false,
  onStageChange,
  onItemClick
}: PipelineSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className={cn(
      'bg-white rounded-xl border overflow-hidden transition-shadow',
      isOwn ? 'border-blue-200 shadow-sm' : 'border-slate-200',
      isExpanded && 'shadow-md'
    )}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full px-4 py-3 flex items-center justify-between transition-colors',
          isOwn ? 'hover:bg-blue-50' : 'hover:bg-slate-50'
        )}
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              isOwn ? 'bg-blue-100' : 'bg-slate-100'
            )}>
              <span className={cn(
                'text-sm font-medium',
                isOwn ? 'text-blue-700' : 'text-slate-700'
              )}>
                {getInitials(user.name)}
              </span>
            </div>
          )}

          {/* Info */}
          <div className="text-left">
            <p className="font-medium text-slate-900 flex items-center gap-2">
              {user.name}
              {isOwn && (
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                  Tu
                </span>
              )}
            </p>
            <p className="text-xs text-slate-500">
              {roleLabels[user.role] || user.role}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Stats cuando colapsado */}
          {!isExpanded && (
            <div className="hidden md:flex items-center gap-3 text-sm">
              <span className="text-slate-600">
                <span className="font-medium">{pipeline.stats.total}</span> elements
              </span>
            </div>
          )}

          <ChevronDown
            className={cn(
              'h-5 w-5 text-slate-400 transition-transform',
              isExpanded && 'rotate-180'
            )}
            strokeWidth={1.5}
          />
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-slate-100 p-4">
          <PipelineBoard
            columns={pipeline.columns}
            items={pipeline.items}
            onStageChange={onStageChange}
            onItemClick={onItemClick}
          />
        </div>
      )}
    </div>
  )
}
