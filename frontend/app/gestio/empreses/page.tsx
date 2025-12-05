// app/gestio/empreses/page.tsx
import { getGestioSession } from '@/lib/gestio-empreses/auth-helpers'
import { redirect } from 'next/navigation'
import { CompanyFilters, CompanyCard, CompanyStats } from '@/components/gestio-empreses/empreses'
import { getManagedCompanies } from '@/lib/gestio-empreses/company-actions'

export const metadata = {
  title: 'Empreses | Gestió Empreses',
}

interface SearchParams {
  search?: string
  status?: string
  plan?: string
}

export default async function EmpresasPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const session = await getGestioSession()

  if (!session) {
    redirect('/auth/gestio/login')
  }

  // Determinar si és gestor individual o supervisor
  const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'CRM_COMERCIAL'].includes(session.userType)
  const gestorId = isAdmin ? null : session.userId

  const filters = {
    search: searchParams.search,
    status: searchParams.status,
    planTier: searchParams.plan,
  }

  const companies = await getManagedCompanies(gestorId, filters)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">Empreses Gestionades</h1>
          <p className="text-slate-600 mt-1">
            Gestiona les empreses assignades i el seu estat
          </p>
        </div>

        {/* Estadístiques */}
        <div className="mb-8">
          <CompanyStats gestorId={gestorId} />
        </div>

        {/* Filtres */}
        <div className="mb-6">
          <CompanyFilters />
        </div>

        {/* Llista d'empreses */}
        <div className="space-y-4">
          {companies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No s'han trobat empreses</p>
            </div>
          ) : (
            companies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}