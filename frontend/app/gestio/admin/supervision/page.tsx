// app/gestio/admin/supervision/page.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Toaster } from 'react-hot-toast'
import { SupervisionDashboard } from '@/components/gestio-empreses/supervision-pipeline'
import { useSupervisionData } from '@/hooks/useSupervisionData'

export default function SupervisionPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { data, isLoading, error, refresh } = useSupervisionData()

  const userRole = (session?.user?.role as string) || 'USER'

  const handleItemClick = (item: { id: string; type: 'lead' | 'empresa' }) => {
    if (item.type === 'lead') {
      router.push(`/gestio/admin/leads/${item.id}`)
    } else {
      router.push(`/gestio/admin/empreses/${item.id}`)
    }
  }

  const handleMemberClick = (member: { id: string }) => {
    // Podria navegar a una vista detallada del membre
    // Per ara, no fem res o podriem obrir un modal
    console.log('Member clicked:', member.id)
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <SupervisionDashboard
        data={data}
        isLoading={isLoading}
        error={error}
        onRefresh={refresh}
        userRole={userRole}
        onItemClick={handleItemClick}
        onMemberClick={handleMemberClick}
      />
    </div>
  )
}
