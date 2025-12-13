
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getGestorsWithLeads, getPipelineLeads } from '@/lib/gestio-empreses/pipeline-actions'
import { getWorkspaceStages } from '@/lib/gestio-empreses/pipeline-config'
import { PipelineClient } from './PipelineClient'

export default async function PipelinePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const userId = session.user.id
  const userRole = (session.user as any).role

  // Determinar stages based on role for initial fetch
  const workspaceStages = getWorkspaceStages(userRole)

  // Fetch initial data in parallel
  const [gestorsData, workspaceLeadsData] = await Promise.all([
    // Solo fetch gestors si es rol adecuado, pero podemos llamar a la acción y dejar que ella decida (devuelve error o vacio)
    // O mejor, condicionar aqui para evitar llamada innecesaria
    ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO', 'CRM_COMERCIAL'].includes(userRole)
      ? getGestorsWithLeads()
      : Promise.resolve({ success: true, data: [] }),

    getPipelineLeads({ stages: workspaceStages, userId })
  ])

  return (
    <PipelineClient
      currentUserId={userId}
      initialGestors={gestorsData.data}
      initialWorkspaceLeads={workspaceLeadsData.data}
    />
  )
}