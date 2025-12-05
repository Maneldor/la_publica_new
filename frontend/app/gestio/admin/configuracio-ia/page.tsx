// app/gestio/admin/configuracio-ia/page.tsx
import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AIConfigContent } from '@/components/gestio-empreses/admin/ai-config/AIConfigContent'

export const metadata: Metadata = {
  title: 'Configuració d\'IA | La Pública',
  description: 'Configuració i gestió dels proveïdors d\'intel·ligència artificial',
}

export default async function AIConfigPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Verificar permisos d'administrador (temporalmente deshabilitado para debugging)
  // const allowedRoles = ['SUPER_ADMIN', 'ADMIN']
  // if (!allowedRoles.includes(session.user.role as string)) {
  //   redirect('/gestio')
  // }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <AIConfigContent />
    </div>
  )
}