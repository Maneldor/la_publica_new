'use client'

import { CompanyCard, CompanyCardData } from '@/components/empreses/CompanyCard'

interface CompanyCardPreviewProps {
  company: CompanyCardData
}

export function CompanyCardPreview({ company }: CompanyCardPreviewProps) {
  return (
    <div className="flex justify-center p-8 bg-slate-50 rounded-lg">
      <CompanyCard company={company} showLink={false} />
    </div>
  )
}
