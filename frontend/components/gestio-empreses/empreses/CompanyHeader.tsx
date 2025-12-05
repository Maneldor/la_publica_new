// components/gestio-empreses/empreses/CompanyHeader.tsx
import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  Globe,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Edit
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Company {
  id: string
  name: string
  cif: string | null
  status: string
  currentPlanTier: string | null
  sector: string | null
  website: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  province: string | null
  postalCode: string | null
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendent', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  APPROVED: { label: 'Activa', color: 'bg-green-100 text-green-700 border-green-200' },
  SUSPENDED: { label: 'Suspesa', color: 'bg-red-100 text-red-700 border-red-200' },
  CANCELLED: { label: 'Cancel·lada', color: 'bg-slate-100 text-slate-700 border-slate-200' },
}

const planConfig: Record<string, { label: string; color: string }> = {
  PIONERES: { label: 'Pioneres', color: 'bg-amber-500' },
  ESTANDARD: { label: 'Estàndard', color: 'bg-blue-500' },
  ESTRATEGIC: { label: 'Estratègic', color: 'bg-purple-500' },
  ENTERPRISE: { label: 'Enterprise', color: 'bg-slate-800' },
}

export function CompanyHeader({ company }: { company: Company }) {
  const status = statusConfig[company.status] || statusConfig.PENDING
  const plan = company.currentPlanTier ? planConfig[company.currentPlanTier] : null

  const fullAddress = [company.address, company.postalCode, company.city, company.province]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="bg-white rounded-lg border border-slate-200">
      {/* Top bar with back button */}
      <div className="p-4 border-b border-slate-100">
        <Link
          href="/gestio/empreses"
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Tornar a empreses
        </Link>
      </div>

      {/* Main header */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-xl bg-slate-100 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-slate-600" strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-slate-900">
                  {company.name}
                </h1>
                <span className={cn(
                  'px-2.5 py-1 text-xs font-medium rounded-full border',
                  status.color
                )}>
                  {status.label}
                </span>
              </div>
              {company.cif && (
                <p className="text-slate-500 mt-1">CIF: {company.cif}</p>
              )}
              {company.sector && (
                <p className="text-sm text-slate-500 mt-0.5">{company.sector}</p>
              )}
              {plan && (
                <div className="mt-2">
                  <span className={cn(
                    'inline-flex items-center px-2.5 py-1 text-xs font-medium text-white rounded',
                    plan.color
                  )}>
                    Pla {plan.label}
                  </span>
                </div>
              )}
            </div>
          </div>

          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">
            <Edit className="h-4 w-4" strokeWidth={1.5} />
            Editar
          </button>
        </div>

        {/* Contact info */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
            >
              <Globe className="h-4 w-4" strokeWidth={1.5} />
              {company.website.replace(/^https?:\/\//, '')}
              <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
            </a>
          )}
          {company.phone && (
            <a
              href={`tel:${company.phone}`}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
            >
              <Phone className="h-4 w-4" strokeWidth={1.5} />
              {company.phone}
            </a>
          )}
          {company.email && (
            <a
              href={`mailto:${company.email}`}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
            >
              <Mail className="h-4 w-4" strokeWidth={1.5} />
              {company.email}
            </a>
          )}
          {fullAddress && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="h-4 w-4" strokeWidth={1.5} />
              <span className="truncate">{fullAddress}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}