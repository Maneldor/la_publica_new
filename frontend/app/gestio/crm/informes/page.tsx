// app/gestio/crm/informes/page.tsx
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { FileBarChart, Download } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { PageHeader } from '@/components/gestio-empreses/shared/PageHeader'
import { ReportKPIs } from '@/components/gestio-empreses/crm/ReportKPIs'
import { LeadsChart } from '@/components/gestio-empreses/crm/charts/LeadsChart'
import { StatusPieChart } from '@/components/gestio-empreses/crm/charts/StatusPieChart'
import { PipelineChart } from '@/components/gestio-empreses/crm/charts/PipelineChart'
import { SourceChart } from '@/components/gestio-empreses/crm/charts/SourceChart'
import { PerformanceTable } from '@/components/gestio-empreses/crm/PerformanceTable'
import {
  getLeadsPerMonth,
  getLeadsByStatus,
  getLeadsBySource,
  getPipelineValuePerMonth,
  getPerformanceByGestor,
  getReportKPIs,
} from '@/lib/gestio-empreses/reports-actions'

export const metadata = {
  title: 'Informes | Gestió Empreses',
}

export default async function InformesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  // TODO: Verificar que l'usuari té permisos CRM
  // const userType = (session.user as any).userType || 'EMPLOYEE'
  // const canAccessCRM = ['ADMIN'].includes(userType)
  // if (!canAccessCRM) {
  //   redirect('/gestio')
  // }

  const [
    kpis,
    leadsPerMonth,
    leadsByStatus,
    leadsBySource,
    pipelinePerMonth,
    gestorPerformance,
  ] = await Promise.all([
    getReportKPIs(),
    getLeadsPerMonth(),
    getLeadsByStatus(),
    getLeadsBySource(),
    getPipelineValuePerMonth(),
    getPerformanceByGestor(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Informes globals"
        description="Anàlisi del rendiment comercial i tendències"
        icon={FileBarChart}
        actions={
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">
            <Download className="h-4 w-4" strokeWidth={1.5} />
            Exportar
          </button>
        }
      />

      {/* KPIs */}
      <ReportKPIs kpis={kpis} />

      {/* Gràfics principals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeadsChart data={leadsPerMonth} />
        <StatusPieChart data={leadsByStatus} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PipelineChart data={pipelinePerMonth} />
        <SourceChart data={leadsBySource} />
      </div>

      {/* Taula de rendiment */}
      <PerformanceTable data={gestorPerformance} />
    </div>
  )
}