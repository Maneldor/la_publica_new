'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

interface SignOutButtonProps {
  className?: string
  variant?: 'button' | 'dropdown'
}

export function SignOutButton({ className = '', variant = 'button' }: SignOutButtonProps) {
  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' })
  }

  if (variant === 'dropdown') {
    return (
      <button
        onClick={handleSignOut}
        className={`flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 ${className}`}
      >
        <LogOut className="w-4 h-4" />
        Tancar sessió
      </button>
    )
  }

  return (
    <button
      onClick={handleSignOut}
      className={`flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ${className}`}
    >
      <LogOut className="w-4 h-4" />
      Tancar sessió
    </button>
  )
}