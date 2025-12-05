// components/gestio-empreses/empreses/CompanyCard.tsx
import Link from 'next/link'
import {
  Building2,
  Users,
  Tag,
  ChevronRight,
  MapPin,
  Globe
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Company {
  id: string
  name: string
  cif: string | null
  status: string
  currentPlanTier: string | null
  sector: string | null
  city: string | null
  website: string | null
  createdAt: Date
  accountManager: {
    id: string
    name: string | null
    email: string
  } | null
  _count: {
    teamMembers: number
    offers: number
  }
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendent', color: 'bg-yellow-100 text-yellow-700' },
  APPROVED: { label: 'Activa', color: 'bg-green-100 text-green-700' },
  SUSPENDED: { label: 'Suspesa', color: 'bg-red-100 text-red-700' },
  CANCELLED: { label: 'Cancel·lada', color: 'bg-slate-100 text-slate-700' },
}

const planConfig: Record<string, { label: string; color: string }> = {
  PIONERES: { label: 'Pioneres', color: 'bg-amber-100 text-amber-700' },
  ESTANDARD: { label: 'Estàndard', color: 'bg-blue-100 text-blue-700' },
  ESTRATEGIC: { label: 'Estratègic', color: 'bg-purple-100 text-purple-700' },
  ENTERPRISE: { label: 'Enterprise', color: 'bg-slate-800 text-white' },
}

export function CompanyCard({ company }: { company: Company }) {
  const status = statusConfig[company.status] || statusConfig.PENDING
  const plan = company.currentPlanTier
    ? planConfig[company.currentPlanTier] || { label: company.currentPlanTier, color: 'bg-slate-100 text-slate-700' }
    : null

  return (
    <Link
      href={`/gestio/empreses/${company.id}`}
      className="block bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-medium text-slate-900">{company.name}</h3>
              {company.cif && (
                <p className="text-sm text-slate-500">{company.cif}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn('px-2 py-0.5 text-xs font-medium rounded', status.color)}>
              {status.label}
            </span>
            {plan && (
              <span className={cn('px-2 py-0.5 text-xs font-medium rounded', plan.color)}>
                {plan.label}
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          {company.sector && (
            <div className="flex items-center gap-1.5 text-slate-600">
              <Tag className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>{company.sector}</span>
            </div>
          )}
          {company.city && (
            <div className="flex items-center gap-1.5 text-slate-600">
              <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>{company.city}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-slate-600">
            <Users className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span>{company._count.teamMembers} usuaris</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Tag className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span>{company._count.offers} ofertes</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-500">
            Gestor: {company.accountManager?.name || 'Sense assignar'}
          </span>
          <ChevronRight className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
        </div>
      </div>
    </Link>
  )
}