import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PageLayout } from '@/components/layout/PageLayout'
import { Building2 } from 'lucide-react'
import { EmpresasView } from './components/EmpresasView'

export const metadata: Metadata = {
  title: 'Empreses Col·laboradores | La Pública',
  description: 'Directori d\'empreses i proveïdors verificats per al sector públic',
}

export default async function EmpresasPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <PageLayout
      title="Empreses Col·laboradores"
      subtitle="Directori d'empreses i proveïdors verificats per al sector públic"
      icon={
        <Building2 className="h-6 w-6" strokeWidth={1.5} />
      }
    >
      <EmpresasView userId={session.user.id} />
    </PageLayout>
  )
}
