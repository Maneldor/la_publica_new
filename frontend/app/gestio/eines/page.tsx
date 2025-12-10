'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function EinesPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir a la página de recursos funcional
    router.replace('/gestio/eines/recursos')
  }, [router])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-slate-600">Redirigint a recursos...</p>
      </div>
    </div>
  )
}