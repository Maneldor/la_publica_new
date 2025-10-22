'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  redirectTo?: string
  requiredRole?: string
}

export function ProtectedRoute({
  children,
  redirectTo = '/login',
  requiredRole
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!session) {
      router.push(redirectTo)
      return
    }

    if (requiredRole && session.user?.role !== requiredRole) {
      router.push('/dashboard') // Redirect to dashboard if role doesn't match
      return
    }
  }, [session, status, router, redirectTo, requiredRole])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (requiredRole && session.user?.role !== requiredRole) {
    return null
  }

  return <>{children}</>
}