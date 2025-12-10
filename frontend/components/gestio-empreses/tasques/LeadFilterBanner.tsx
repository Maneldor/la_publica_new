// components/gestio-empreses/tasques/LeadFilterBanner.tsx
'use client'

import { X, Building2, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface LeadFilterBannerProps {
  leadInfo: {
    id: string
    companyName: string
  }
  onClear: () => void
}

export function LeadFilterBanner({ leadInfo, onClear }: LeadFilterBannerProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building2 className="h-5 w-5 text-blue-600" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-medium text-blue-900">
              Filtrant tasques de: {leadInfo.companyName}
            </h3>
            <p className="text-sm text-blue-700">
              Mostrant només les tasques relacionades amb aquest lead
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/gestio/pipeline?highlight=${leadInfo.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
            Veure al Pipeline
          </Link>
          <button
            onClick={onClear}
            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-lg transition-colors"
            title="Eliminar filtre"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  )
}