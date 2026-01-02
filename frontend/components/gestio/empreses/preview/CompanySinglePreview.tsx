'use client'

import { CompanySingle, CompanySingleData } from '@/components/empreses/CompanySingle'

interface CompanySinglePreviewProps {
  company: CompanySingleData
}

export function CompanySinglePreview({ company }: CompanySinglePreviewProps) {
  return (
    <div className="bg-slate-50 rounded-lg overflow-hidden max-h-[70vh] overflow-y-auto">
      <CompanySingle company={company} isPreview={true} />
    </div>
  )
}
