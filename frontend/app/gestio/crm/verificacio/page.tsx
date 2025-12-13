
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getVerificationStats, getPendingVerificationLeads } from '@/lib/gestio-empreses/verification-actions'
import { VerificacioClient } from './VerificacioClient'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default async function VerificacioPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const userId = session.user.id
  const userRole = (session.user as any).role

  // Verificar permisos (solo CRM, Admin, SuperAdmin)
  const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO', 'CRM_COMERCIAL', 'CRM_CONTINGUT']

  if (!allowedRoles.includes(userRole)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Accés denegat</h2>
        <p className="text-gray-600 mb-4">No tens permisos per accedir a la verificació CRM</p>
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
  const [stats, leads] = await Promise.all([
    getVerificationStats(),
    getPendingVerificationLeads(),
  ])

  return (
    <VerificacioClient
      initialStats={stats}
      initialLeads={leads}
      currentUserId={userId}
    />
  )
}