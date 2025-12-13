
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import {
  getTeamStatsKPIs,
  getMonthlyRanking,
  getGestorsWithFullStats
} from '@/lib/gestio-empreses/team-actions'
import { EquipClient } from './EquipClient'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default async function EquipPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const userRole = (session.user as any).role

  // Verificar permisos (solo Admin, Admin Gestio, SuperAdmin, CRM Comercial)
  // Aunque en el original no había check explícito, es mejor consistencia
  const allowedRoles = ['ADMIN', 'ADMIN_GESTIO', 'SUPER_ADMIN', 'CRM_COMERCIAL']

  if (!allowedRoles.includes(userRole)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Accés denegat</h2>
        <p className="text-gray-600 mb-4">No tens permisos per accedir a l'equip comercial</p>
        <Link
          href="/gestio"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Tornar al Dashboard
        </Link>
      </div>
    )
  }

  // Carga paralela de dades
  const [stats, ranking, gestors] = await Promise.all([
    getTeamStatsKPIs(),
    getMonthlyRanking(),
    getGestorsWithFullStats(),
  ])

  return (
    <EquipClient
      initialStats={stats}
      initialRanking={ranking}
      initialGestors={gestors}
    />
  )
}