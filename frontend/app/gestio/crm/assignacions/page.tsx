
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import {
  getAssignmentStats,
  getUnassignedLeads,
  getGestorsWithStats
} from '@/lib/gestio-empreses/assignment-actions'
import { AssignacionsClient } from './AssignacionsClient'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default async function AssignacionsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const userId = session.user.id
  const userRole = (session.user as any).role

  // Verificar permisos (solo Admin, Admin Gestio, SuperAdmin, CRM Comercial)
  // Nota: Esto debe coincidir con la lista en page.tsx original
  const allowedRoles = ['ADMIN', 'ADMIN_GESTIO', 'SUPER_ADMIN', 'CRM_COMERCIAL']

  if (!allowedRoles.includes(userRole)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Accés denegat</h2>
        <p className="text-gray-600 mb-4">No tens permisos per accedir a les assignacions</p>
        <Link
          href="/gestio"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Tornar al Dashboard
        </Link>
      </div>
    )
  }

  console.log('🔍 [AssignacionsPage] Debugging imports:')
  console.log('Type of getAssignmentStats:', typeof getAssignmentStats)
  console.log('Type of getUnassignedLeads:', typeof getUnassignedLeads)
  console.log('Type of getGestorsWithStats:', typeof getGestorsWithStats)

  try {
    // Carga paralela de dades
    const [stats, unassigned, gestors] = await Promise.all([
      getAssignmentStats(),
      getUnassignedLeads(),
      getGestorsWithStats(),
    ])

    return (
      <AssignacionsClient
        initialStats={stats}
        initialUnassigned={unassigned}
        initialGestors={gestors}
        currentUserId={userId}
      />
    )
  } catch (error) {
    console.error('❌ [AssignacionsPage] Error fetching data:', error)
    throw error // Re-throw to show error page or handle gracefully
  }
}
