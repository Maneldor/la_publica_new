// app/dashboard/OnboardingCheck.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface OnboardingCheckProps {
  children: React.ReactNode
}

export function OnboardingCheck({ children }: OnboardingCheckProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isChecking, setIsChecking] = useState(true)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null)

  useEffect(() => {
    async function checkOnboarding() {
      if (status === 'loading') return

      if (!session?.user?.id) {
        setIsChecking(false)
        return
      }

      // Solo verificar para usuarios con rol USER (empleados públicos)
      const userRole = (session.user as any).role
      if (userRole !== 'USER') {
        setIsChecking(false)
        setHasCompletedOnboarding(true)
        return
      }

      try {
        const response = await fetch(`/api/user/onboarding-status`)
        const data = await response.json()

        if (!data.hasCompletedOnboarding) {
          router.push('/welcome')
          return
        }

        setHasCompletedOnboarding(true)
      } catch (error) {
        console.error('Error checking onboarding:', error)
        setHasCompletedOnboarding(true) // En caso de error, permitir acceso
      } finally {
        setIsChecking(false)
      }
    }

    checkOnboarding()
  }, [session, status, router])

  // Mientras verifica, mostrar loading
  if (isChecking || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Carregant...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
