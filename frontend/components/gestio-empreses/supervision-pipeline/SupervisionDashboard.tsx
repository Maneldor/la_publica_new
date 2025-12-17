// components/gestio-empreses/supervision-pipeline/SupervisionDashboard.tsx
'use client'

import { useState } from 'react'
import {
  GitBranch,
  RefreshCw,
  Users,
  Building2,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  LayoutGrid,
  List
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MyWorkStats } from './MyWorkStats'
import { PendingItemsList } from './PendingItemsList'
import { TeamMemberCard } from './TeamMemberCard'
import { StatCard } from './StatCard'

interface MyWorkStatsData {
  leadsAssigned: number
  leadsInProgress: number
  leadsCompleted: number
  empresesAssigned: number
  empresesInProgress: number
  empresesActive: number
  pendingVerification: number
  pendingPreContract: number
  thisMonth: {
    leadsCompleted: number
    empresesActivated: number
    conversionRate: number
  }
}

interface PendingItem {
  id: string
  type: 'lead' | 'empresa'
  name: string
  stage: string
  priority?: string
  estimatedValue?: number
  daysInStage: number
  assignedTo?: { id: string; name: string }
  createdAt: string
}

interface TeamMemberStats {
  id: string
  name: string
  email: string
  role: string
  image?: string
  stats: {
    leadsTotal: number
    leadsInProgress: number
    leadsCompleted: number
    empresesTotal: number
    empresesActive: number
    conversionRate: number
    avgDaysToConvert: number
  }
  recentActivity: {
    lastLeadUpdate?: string
    lastEmpresaUpdate?: string
  }
}

interface SupervisionData {
  myWork: MyWorkStatsData
  pendingItems: PendingItem[]
  teamMembers: TeamMemberStats[]
  roleSpecific: {
    preContractsReceived?: number
    pendingFormalization?: number
    leadsToAssign?: number
    pendingVerificationTotal?: number
    totalLeads?: number
    totalEmpreses?: number
    totalActive?: number
  }
}

interface SupervisionDashboardProps {
  data: SupervisionData | null
  isLoading: boolean
  error: string | null
  onRefresh: () => void
  userRole: string
  onItemClick?: (item: PendingItem) => void
  onMemberClick?: (member: TeamMemberStats) => void
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

export function SupervisionDashboard({
  data,
  isLoading,
  error,
  onRefresh,
  userRole,
  onItemClick,
  onMemberClick
}: SupervisionDashboardProps) {
  const [teamView, setTeamView] = useState<'grid' | 'list'>('grid')
  const [showAllMembers, setShowAllMembers] = useState(false)

  const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO'].includes(userRole)
  const isCRM = ['CRM_COMERCIAL', 'CRM_CONTINGUT'].includes(userRole)
  const hasTeam = data?.teamMembers && data.teamMembers.length > 0

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" strokeWidth={1.5} />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Error carregant dades</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tornar a intentar
          </button>
        </div>
      </div>
    )
  }

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GitBranch className="h-7 w-7 text-slate-600" strokeWidth={1.5} />
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Pipeline de Supervisio</h1>
              <p className="text-sm text-slate-500">
                Vista {roleLabels[userRole] || userRole}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <RefreshCw className="h-8 w-8 text-slate-300 mx-auto mb-4 animate-spin" strokeWidth={1.5} />
          <p className="text-slate-500">Carregant dades...</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  const displayedMembers = showAllMembers
    ? data.teamMembers
    : data.teamMembers.slice(0, 6)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GitBranch className="h-7 w-7 text-slate-600" strokeWidth={1.5} />
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Pipeline de Supervisio</h1>
            <p className="text-sm text-slate-500">
              Vista {roleLabels[userRole] || userRole}
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} strokeWidth={1.5} />
          Actualitzar
        </button>
      </div>

      {/* Role-specific alerts */}
      {(isAdmin || isCRM) && data.roleSpecific && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {isAdmin && data.roleSpecific.preContractsReceived !== undefined && (
            <StatCard
              title="Pre-contractes"
              value={data.roleSpecific.preContractsReceived}
              subtitle="Pendents formalitzar"
              icon={TrendingUp}
              variant={data.roleSpecific.preContractsReceived > 0 ? 'warning' : 'success'}
              size="sm"
            />
          )}
          {isCRM && data.roleSpecific.leadsToAssign !== undefined && (
            <StatCard
              title="Per assignar"
              value={data.roleSpecific.leadsToAssign}
              subtitle="Leads nous"
              icon={Users}
              variant={data.roleSpecific.leadsToAssign > 5 ? 'warning' : 'info'}
              size="sm"
            />
          )}
          {isCRM && data.roleSpecific.pendingVerificationTotal !== undefined && (
            <StatCard
              title="Per verificar"
              value={data.roleSpecific.pendingVerificationTotal}
              subtitle="Leads pendents"
              icon={AlertCircle}
              variant={data.roleSpecific.pendingVerificationTotal > 10 ? 'danger' : 'warning'}
              size="sm"
            />
          )}
          <StatCard
            title="Total leads"
            value={data.roleSpecific.totalLeads || 0}
            icon={Users}
            variant="default"
            size="sm"
          />
          <StatCard
            title="Total empreses"
            value={data.roleSpecific.totalEmpreses || 0}
            icon={Building2}
            variant="default"
            size="sm"
          />
          <StatCard
            title="Empreses actives"
            value={data.roleSpecific.totalActive || 0}
            icon={Building2}
            variant="success"
            size="sm"
          />
        </div>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Work Stats */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <MyWorkStats data={data.myWork} userRole={userRole} />
        </div>

        {/* Pending Items */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 max-h-[500px] overflow-y-auto">
          <PendingItemsList
            items={data.pendingItems}
            onItemClick={onItemClick}
            maxItems={15}
          />
        </div>
      </div>

      {/* Team Section */}
      {hasTeam && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                Equip ({data.teamMembers.length})
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setTeamView('grid')}
                  className={cn(
                    'p-2 transition-colors',
                    teamView === 'grid'
                      ? 'bg-slate-100 text-slate-700'
                      : 'text-slate-400 hover:text-slate-600'
                  )}
                >
                  <LayoutGrid className="h-4 w-4" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => setTeamView('list')}
                  className={cn(
                    'p-2 transition-colors',
                    teamView === 'list'
                      ? 'bg-slate-100 text-slate-700'
                      : 'text-slate-400 hover:text-slate-600'
                  )}
                >
                  <List className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>

          {teamView === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedMembers.map(member => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  onClick={() => onMemberClick?.(member)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {displayedMembers.map(member => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  onClick={() => onMemberClick?.(member)}
                  compact
                />
              ))}
            </div>
          )}

          {data.teamMembers.length > 6 && (
            <button
              onClick={() => setShowAllMembers(!showAllMembers)}
              className="w-full py-2 text-sm text-slate-600 hover:text-slate-800 flex items-center justify-center gap-1"
            >
              {showAllMembers ? 'Mostrar menys' : `Veure tots (${data.teamMembers.length})`}
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  showAllMembers && 'rotate-180'
                )}
                strokeWidth={1.5}
              />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
