// components/gestio-empreses/empreses/AdminPendingBanner.tsx
import { Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface AdminPendingBannerProps {
  pendingCount: number
}

export function AdminPendingBanner({ pendingCount }: AdminPendingBannerProps) {
  if (pendingCount === 0) return null

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-100">
          <Clock className="h-5 w-5 text-amber-600" strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-amber-900">
            {pendingCount} {pendingCount === 1 ? 'empresa pendent' : 'empreses pendents'} d'aprovació
          </h3>
          <p className="text-sm text-amber-700 mt-1">
            Aquestes empreses han estat convertides des de leads i esperen que l'Admin les revisi i completi la contractació.
          </p>
        </div>
        <Link
          href="/gestio/empreses?status=PENDING"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-100 rounded-md hover:bg-amber-200 transition-colors"
        >
          Veure
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </Link>
      </div>
    </div>
  )
}