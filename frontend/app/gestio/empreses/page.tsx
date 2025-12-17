// app/gestio/empreses/page.tsx
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { EmpresesListClient } from './EmpresesListClient'
import { getEmpresesList } from '@/lib/gestio-empreses/empreses-list-actions'

export default async function EmpresesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const userId = session.user.id
  const userRole = (session.user as any).role

  // Verificar permisos
  const allowedRoles = [
    'SUPER_ADMIN',
    'ADMIN',
    'ADMIN_GESTIO',
    'CRM_COMERCIAL',
    'CRM_CONTINGUT',
    'GESTOR_ESTANDARD',
    'GESTOR_ESTRATEGIC',
    'GESTOR_ENTERPRISE'
  ]

  if (!allowedRoles.includes(userRole)) {
    redirect('/gestio')
  }

  // Obtener datos del listado
  const data = await getEmpresesList(userId, userRole)

  return (
    <EmpresesListClient
      initialData={data}
      currentUser={{
        id: userId,
        role: userRole,
        name: session.user.name
      }}
    />
  )
}
