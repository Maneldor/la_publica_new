
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

import { getIALeadStats, getGenerationHistory, getGenerationPerformance } from '@/lib/gestio-empreses/ia-lead-actions'
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

  // Parallel data fetching for maximum performance
  const [stats, history, chartData] = await Promise.all([
    getIALeadStats(userId),
    getGenerationHistory(userId),
    getGenerationPerformance(userId)
  ])

  return (
    <AILeadsClient
      userId={userId}
      initialStats={stats}
      initialHistory={history}
      initialChartData={chartData}
    />
  )
}