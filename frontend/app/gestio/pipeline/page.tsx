// app/gestio/pipeline/page.tsx
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { UnifiedPipelineClient } from './UnifiedPipelineClient'
import { getUnifiedPipelineData } from '@/lib/gestio-empreses/unified-pipeline-actions'

export default async function PipelinePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const userId = session.user.id
  const userRole = (session.user as any).role

  // Obtener datos del pipeline unificado
  const data = await getUnifiedPipelineData(userId, userRole)

  return (
    <UnifiedPipelineClient
      initialData={data}
      currentUser={{
        id: userId,
        role: userRole,
        name: session.user.name
      }}
    />
  )
}
