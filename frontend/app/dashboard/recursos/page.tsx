import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PageLayout } from '@/components/layout/PageLayout'
import { FolderOpen } from 'lucide-react'
import { RecursosView } from './components/RecursosView'

export const metadata: Metadata = {
  title: 'Recursos | La Pública',
  description: 'Documents, formació i eines per al teu dia a dia',
}

export default async function RecursosPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <PageLayout
      title="Recursos"
      subtitle="Documents, formació i eines per al teu dia a dia"
      icon={
        <FolderOpen className="h-6 w-6" strokeWidth={1.5} />
      }
    >
      <RecursosView userId={session.user.id} />
    </PageLayout>
  )
}
