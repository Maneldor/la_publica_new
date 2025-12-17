import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

import { getIALeadStats, getGenerationHistory, getGenerationPerformance } from '@/lib/gestio-empreses/ia-lead-actions'
import { getLeadsAIConfig } from '@/lib/gestio-empreses/actions/ai-config-actions'
import { AILeadsClient } from './AILeadsClient'

export default async function AILeadsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const userRole = session.user.role
  const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO', 'CRM_COMERCIAL', 'CRM_CONTINGUT', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE', 'GESTOR_ESTANDARD']

  if (!allowedRoles.includes(userRole)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Accés denegat</h2>
        <p className="text-gray-600 mb-4">No tens permisos per accedir a aquesta funcionalitat</p>
        <Link
          href="/gestio"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Tornar al Dashboard
        </Link>
      </div>
    )
  }

  const userId = session.user.id

  // Parallel data fetching
  const [stats, history, chartData, leadsConfigResult] = await Promise.all([
    getIALeadStats(userId),
    getGenerationHistory(userId),
    getGenerationPerformance(userId),
    getLeadsAIConfig()
  ])

  // Si no hi ha configuració de LEADS, mostrar avís
  if (!leadsConfigResult.success || !leadsConfigResult.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Configuració d'IA pendent</h2>
        <p className="text-gray-600 mb-4">
          No hi ha configuració de model d'IA per a generació de leads. Contacta amb l'administrador.
        </p>
        <Link
          href="/gestio/admin/configuracio-ia"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Anar a Configuració d'IA
        </Link>
      </div>
    )
  }

  return (
    <AILeadsClient
      userId={userId}
      initialStats={stats}
      initialHistory={history}
      initialChartData={chartData}
      leadsConfig={leadsConfigResult.data}
    />
  )
}
