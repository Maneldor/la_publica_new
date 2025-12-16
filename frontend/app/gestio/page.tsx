// app/(gestio-empreses)/page.tsx
// SUBSTITUIR - Dashboard principal amb dades reals

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import {
  Target,
  Building2,
  TrendingUp,
  CheckSquare,
  Clock,
  Users,
  LayoutDashboard
} from 'lucide-react'

import { authOptions } from '@/lib/auth'
import { UserRole } from '@prisma/client'
import { ROLE_GROUPS, getDataAccessLevel } from '@/lib/gestio-empreses/permissions'
import { PageHeader } from '@/components/gestio-empreses/shared/PageHeader'
import { StatCard } from '@/components/gestio-empreses/ui/StatCard'
import {
  RecentLeadsList,
  PendingTasksList,
  PipelineOverview,
  QuickActions
} from '@/components/gestio-empreses/dashboard'
import {
  EvolutionChart,
  UpcomingEvents,
  RecentMessages,
  AlertsWidget,
  PerformanceWidget
} from '@/components/gestio-empreses/panell'
import { FocusWidget } from '@/components/gestio-empreses/dashboard'
import {
  getDashboardStats,
  getRecentLeads,
  getPendingTasks,
  getPipelineStats
} from '@/lib/gestio-empreses/data'

export default async function GestorDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const userId = session.user.id
  const role = (session.user as any).role as UserRole
  const dataAccess = getDataAccessLevel(role)
  const isSupervisor = dataAccess === 'all' || dataAccess === 'team'

  // Obtenir dades en paral·lel
  const [stats, recentLeads, pendingTasks, pipelineStats] = await Promise.all([
    getDashboardStats(userId, isSupervisor),
    getRecentLeads(userId, isSupervisor, 5),
    getPendingTasks(userId, 5),
    getPipelineStats(userId, isSupervisor),
  ])

  // Formatar valor pipeline per mostrar
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M €`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K €`
    }
    return `${value} €`
  }

  // Preparar dades del pipeline per al component
  const pipelineData = {
    stages: pipelineStats,
    totalValue: stats.pipelineValue
  }

  return (
    <div className="space-y-6">
      {/* Capçalera */}
      <PageHeader
        title="Panell de Control"
        description={isSupervisor ? "Vista de supervisor - Totes les dades" : "Les teves mètriques i activitat"}
        icon={LayoutDashboard}
      />

      {/* Focus del dia - Widget destacat */}
      <div className="col-span-full lg:col-span-2">
        <FocusWidget userId={userId} />
      </div>

      {/* Estadístiques principals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Leads actius"
          value={stats.totalLeads}
          icon={Target}
          trend={stats.conversionsSetmana ? {
            value: stats.conversionsSetmana,
            isPositive: true,
            label: "aquesta setmana"
          } : undefined}
        />
        <StatCard
          title="Empreses actives"
          value={stats.empresesActives}
          icon={Building2}
        />
        <StatCard
          title="Valor pipeline"
          value={formatCurrency(stats.pipelineValue)}
          icon={TrendingUp}
        />
        <StatCard
          title="Tasques pendents"
          value={stats.tasquesPendents}
          icon={CheckSquare}
          trend={stats.tasquesAvui > 0 ? {
            value: stats.tasquesAvui,
            isPositive: false,
            label: "per avui"
          } : undefined}
        />
      </div>

      {/* Stats supervisor addicionals */}
      {isSupervisor && stats.pendentsVerificacio !== undefined && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            title="Pendents verificació"
            value={stats.pendentsVerificacio}
            icon={Clock}
          />
          <StatCard
            title="Gestors actius"
            value={stats.totalGestors || 0}
            icon={Users}
          />
        </div>
      )}

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna esquerra - Leads i Tasques */}
        <div className="lg:col-span-2 space-y-6">
          <RecentLeadsList leads={recentLeads} />
          <PendingTasksList tasks={pendingTasks} />
        </div>

        {/* Columna dreta - Pipeline i Accions */}
        <div className="space-y-6">
          <QuickActions />
          <PipelineOverview
            stages={pipelineData.stages}
            totalValue={pipelineData.totalValue}
          />
        </div>
      </div>

      {/* NOVA SECCIÓ: Gràfic d'Evolució (ample complet) */}
      <div className="mt-6">
        <EvolutionChart userId={userId} />
      </div>

      {/* NOVA SECCIÓ: Grid de 3 columnes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Columna 1: Agenda */}
        <UpcomingEvents userId={userId} />

        {/* Columna 2: Missatges */}
        <RecentMessages userId={userId} />

        {/* Columna 3: Alertes */}
        <AlertsWidget userId={userId} />
      </div>

      {/* NOVA SECCIÓ: Rendiment (sota la graella) */}
      <div className="mt-6">
        <PerformanceWidget userId={userId} />
      </div>
    </div>
  )
}