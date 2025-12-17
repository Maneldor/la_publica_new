// app/welcome/page.tsx
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prismaClient } from '@/lib/prisma'
import { WelcomeExperience } from './WelcomeExperience'

export default async function WelcomePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  // Verificar si ya completó el onboarding
  const user = await prismaClient.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      hasCompletedOnboarding: true
    }
  })

  // Si ya completó, redirigir al dashboard
  if (user?.hasCompletedOnboarding) {
    redirect('/dashboard')
  }

  // Obtener solo el primer nombre
  const firstName = user?.name?.split(' ')[0] || 'company'

  return <WelcomeExperience userName={firstName} userId={user?.id || ''} />
}
