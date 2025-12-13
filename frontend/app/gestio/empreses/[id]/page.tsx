// app/gestio/empreses/[id]/page.tsx
import { notFound } from 'next/navigation'
import { CompanyHeader } from '@/components/gestio-empreses/empreses/CompanyHeader'
import { CompanyTimeline } from '@/components/gestio-empreses/empreses/CompanyTimeline'
import { CompanyUsers } from '@/components/gestio-empreses/empreses/CompanyUsers'
import { CompanySubscription } from '@/components/gestio-empreses/empreses/CompanySubscription'
import { getCompanyDetail, getCompanyActivity } from '@/lib/gestio-empreses/company-actions'

interface PageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: PageProps) {
  try {
    const company = await getCompanyDetail(params.id)
    return {
      title: company ? `${company.name} | Gestió Empreses` : 'Empresa no trobada',
    }
  } catch {
    return {
      title: 'Empresa no trobada',
    }
  }
}

export default async function CompanyDetailPage({ params }: PageProps) {
  try {
    const [company, activities] = await Promise.all([
      getCompanyDetail(params.id),
      getCompanyActivity(params.id),
    ])

    if (!company) {
      notFound()
    }

    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <CompanyHeader company={company} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main content - 2 columns */}
              <div className="lg:col-span-2 space-y-6">
                <CompanyTimeline companyId={company.id} activities={activities} />
              </div>

              {/* Sidebar - 1 column */}
              <div className="space-y-6">
                <CompanySubscription subscription={company.activeSubscription || null} />
                <CompanyUsers users={company.teamMembers || []} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading company:', error)
    notFound()
  }
}