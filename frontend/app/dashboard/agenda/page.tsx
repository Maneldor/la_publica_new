import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PageLayout } from '@/components/layout/PageLayout'
import { CalendarDaysIcon } from '@/components/icons'
import { AgendaView } from './components/AgendaView'

export const metadata: Metadata = {
  title: 'Agenda | La Pública',
  description: 'La teva agenda personal a La Pública',
}

export default async function AgendaPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <PageLayout
      title="La Meva Agenda"
      subtitle="Organitza el teu dia de manera eficient"
      icon={<CalendarDaysIcon size="lg" />}
    >
      <AgendaView userId={session.user.id} userName={session.user.name || 'Usuari'} />
    </PageLayout>
  )
}