// components/gestio-empreses/commercial-pipeline/CommercialPipelineCard.tsx
'use client'

import { useState } from 'react'
import { ChevronDown, Users, Building2, User as UserIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LeadsPipelineBoard, LeadItem } from './LeadsPipelineBoard'
import { EmpresesPipelineBoard, EmpresaItem } from './EmpresesPipelineBoard'

interface PipelineStats {
  total: number
  pendents: number
  enProces: number
  completats: number
}

interface PipelineUser {
  id: string
  name: string
  email: string
  role: string
  image?: string
}

interface CommercialPipelineCardProps {
  user: PipelineUser
  leads: {
    byStage: Record<string, LeadItem[]>
    stats: PipelineStats
  }
  empreses: {
    byStage: Record<string, EmpresaItem[]>
    stats: PipelineStats & { actives: number }
  }
  isExpanded: boolean
  onToggle: () => void
  onLeadStageChange?: (leadId: string, newStage: string, assignedToId?: string) => Promise<void>
  onEmpresaStageChange?: (empresaId: string, newStage: string, assignedToId?: string) => Promise<void>
  onLeadClick?: (lead: LeadItem) => void
  onEmpresaClick?: (empresa: EmpresaItem) => void
  isOwn?: boolean
}

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrador',
  ADMIN_GESTIO: 'Admin Gestio',
  CRM_COMERCIAL: 'CRM Comercial',
  CRM_CONTINGUT: 'CRM Contingut',
  GESTOR_ESTANDARD: 'Gestor Estandard',
  GESTOR_ESTRATEGIC: 'Gestor Estrategic',
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

export function CommercialPipelineCard({
  user,
  leads,
  empreses,
  isExpanded,
  onToggle,
  onLeadStageChange,
  onEmpresaStageChange,
  onLeadClick,
  onEmpresaClick,
  isOwn = false
}: CommercialPipelineCardProps) {
  const [activeTab, setActiveTab] = useState<'leads' | 'empreses'>('leads')

  const totalLeads = leads.stats.total
  const totalEmpreses = empreses.stats.total

  return (
    <div className={cn(
      'bg-white rounded-xl border overflow-hidden transition-shadow',
      isOwn ? 'border-blue-200 shadow-sm' : 'border-slate-200',
      isExpanded && 'shadow-md'
    )}>
      {/* Header clicable */}
      <button
        onClick={onToggle}
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
          {/* Mini stats cuando colapsado */}
          {!isExpanded && (
            <div className="hidden md:flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-slate-600">
                <Users className="h-4 w-4" strokeWidth={1.5} />
                <span className="font-medium">{totalLeads}</span> leads
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <Building2 className="h-4 w-4" strokeWidth={1.5} />
                <span className="font-medium">{totalEmpreses}</span> empreses
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

      {/* Contenido expandible */}
      {isExpanded && (
        <div className="border-t border-slate-100">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('leads')}
              className={cn(
                'flex-1 px-4 py-2.5 text-sm font-medium transition-colors',
                activeTab === 'leads'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              )}
            >
              <span className="flex items-center justify-center gap-2">
                <Users className="h-4 w-4" strokeWidth={1.5} />
                Leads
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs',
                  activeTab === 'leads'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 text-slate-600'
                )}>
                  {totalLeads}
                </span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('empreses')}
              className={cn(
                'flex-1 px-4 py-2.5 text-sm font-medium transition-colors',
                activeTab === 'empreses'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              )}
            >
              <span className="flex items-center justify-center gap-2">
                <Building2 className="h-4 w-4" strokeWidth={1.5} />
                Empreses
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs',
                  activeTab === 'empreses'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 text-slate-600'
                )}>
                  {totalEmpreses}
                </span>
              </span>
            </button>
          </div>

          {/* Stats */}
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            {activeTab === 'leads' ? (
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Pendents:</span>{' '}
                  <span className="font-medium text-amber-600">{leads.stats.pendents}</span>
                </div>
                <div>
                  <span className="text-slate-500">En proces:</span>{' '}
                  <span className="font-medium text-blue-600">{leads.stats.enProces}</span>
                </div>
                <div>
                  <span className="text-slate-500">Completats:</span>{' '}
                  <span className="font-medium text-green-600">{leads.stats.completats}</span>
                </div>
              </div>
            ) : (
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Pendents:</span>{' '}
                  <span className="font-medium text-amber-600">{empreses.stats.pendents}</span>
                </div>
                <div>
                  <span className="text-slate-500">Onboarding:</span>{' '}
                  <span className="font-medium text-blue-600">{empreses.stats.enProces}</span>
                </div>
                <div>
                  <span className="text-slate-500">Actives:</span>{' '}
                  <span className="font-medium text-green-600">{empreses.stats.actives}</span>
                </div>
              </div>
            )}
          </div>

          {/* Board */}
          <div className="p-4">
            {activeTab === 'leads' ? (
              totalLeads > 0 ? (
                <LeadsPipelineBoard
                  leads={leads.byStage}
                  onStageChange={onLeadStageChange}
                  onLeadClick={onLeadClick}
                  userRole={user.role}
                />
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Users className="h-10 w-10 mx-auto mb-3 text-slate-300" strokeWidth={1.5} />
                  <p>No hi ha leads</p>
                </div>
              )
            ) : (
              totalEmpreses > 0 ? (
                <EmpresesPipelineBoard
                  empreses={empreses.byStage}
                  onStageChange={onEmpresaStageChange}
                  onEmpresaClick={onEmpresaClick}
                  userRole={user.role}
                />
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Building2 className="h-10 w-10 mx-auto mb-3 text-slate-300" strokeWidth={1.5} />
                  <p>No hi ha empreses</p>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  )
}
