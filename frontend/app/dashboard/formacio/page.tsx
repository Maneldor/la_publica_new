import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PageLayout } from '@/components/layout/PageLayout'
import { GraduationCap } from 'lucide-react'
import { FormacioView } from './components/FormacioView'

export const metadata: Metadata = {
  title: 'Formació | La Pública',
  description: 'Cursos i programes de desenvolupament en diverses temàtiques',
}

export default async function FormacioPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <PageLayout
      title="Formació"
      subtitle="Cursos i programes de desenvolupament professional en diverses temàtiques"
      icon={
        <GraduationCap className="h-6 w-6" strokeWidth={1.5} />
      }
    >
      <FormacioView userId={session.user.id} />
    </PageLayout>
  )
}
