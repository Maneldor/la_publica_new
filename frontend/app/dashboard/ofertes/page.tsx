import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PageLayout } from '@/components/layout/PageLayout'
import { Tag } from 'lucide-react'
import { OfertesView } from './components/OfertesView'

export const metadata: Metadata = {
  title: 'Ofertes Exclusives | La Pública',
  description: 'Descobreix descomptes i avantatges exclusius per a empleats públics',
}

export default async function OfertesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <PageLayout
      title="Ofertes"
      subtitle="Descobreix descomptes i avantatges exclusius per a empleats públics"
      icon={
        <Tag className="h-6 w-6" strokeWidth={1.5} />
      }
    >
      <OfertesView userId={session.user.id} />
    </PageLayout>
  )
}
