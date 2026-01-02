import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PageLayout } from '@/components/layout/PageLayout'
import { Lightbulb } from 'lucide-react'
import { AssessoramentView } from './components/AssessoramentView'

export const metadata: Metadata = {
  title: 'Assessorament | La Pública',
  description: 'Consultes especialitzades ofertes per empreses col·laboradores',
}

export default async function AssessoramentPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <PageLayout
      title="Assessorament"
      subtitle="Consultes especialitzades gratuïtes ofertes per empreses col·laboradores"
      icon={
        <Lightbulb className="h-6 w-6" strokeWidth={1.5} />
      }
    >
      <AssessoramentView userId={session.user.id} />
    </PageLayout>
  )
}
