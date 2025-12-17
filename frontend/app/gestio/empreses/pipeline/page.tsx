// app/gestio/empreses/pipeline/page.tsx
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { EmpresesPipelineClient } from './EmpresesPipelineClient'
import { getEmpresesPipelineData } from '@/lib/gestio-empreses/empreses-pipeline-actions'

export default async function EmpresesPipelinePage() {
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

  // Obtener datos del pipeline
  const data = await getEmpresesPipelineData(userId, userRole)

  return (
    <EmpresesPipelineClient
      initialData={data}
      currentUser={{
        id: userId,
        role: userRole,
        name: session.user.name
      }}
    />
  )
}
