import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
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
    <div className="min-h-screen bg-gray-50">
      <AgendaView userId={session.user.id} userName={session.user.name || 'Usuari'} />
    </div>
  )
}