// app/gestio/crm/equip/[id]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  User,
  Target,
  Building2,
  Activity,
  Calendar
} from 'lucide-react'
import { format } from 'date-fns'
import { ca } from 'date-fns/locale'
import { getGestorDetail } from '@/lib/gestio-empreses/team-actions'

interface PageProps {
  params: { id: string }
}

export default async function GestorDetailPage({ params }: PageProps) {
  const gestor = await getGestorDetail(params.id)

  if (!gestor) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/gestio/crm/equip"
          className="p-2 rounded-md hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center">
            {gestor.image ? (
              <img
                src={gestor.image}
                alt={gestor.name || ''}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <User className="h-6 w-6 text-slate-500" strokeWidth={1.5} />
            )}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              {gestor.name || gestor.email}
            </h1>
            <p className="text-sm text-slate-500">
              Membre des de {format(new Date(gestor.createdAt), 'MMMM yyyy', { locale: ca })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads recents */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="p-4 border-b border-slate-100 flex items-center gap-2">
            <Target className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
            <h2 className="font-medium text-slate-900">Leads recents</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {gestor.assignedLeads.length === 0 ? (
              <div className="p-4 text-center text-slate-500">
                No hi ha leads assignats
              </div>
            ) : (
              gestor.assignedLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/gestio/leads/${lead.id}`}
                  className="p-4 flex items-center justify-between hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium text-slate-900">{lead.companyName}</p>
                    <p className="text-sm text-slate-500">{lead.status}</p>
                  </div>
                  <span className="text-sm text-slate-500">
                    {format(new Date(lead.createdAt), 'dd MMM', { locale: ca })}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Empreses gestionades */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="p-4 border-b border-slate-100 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
            <h2 className="font-medium text-slate-900">Empreses gestionades</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {gestor.managedCompanies.length === 0 ? (
              <div className="p-4 text-center text-slate-500">
                No gestiona empreses
              </div>
            ) : (
              gestor.managedCompanies.map((company) => (
                <Link
                  key={company.id}
                  href={`/gestio/empreses/${company.id}`}
                  className="p-4 flex items-center justify-between hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium text-slate-900">{company.name}</p>
                  </div>
                  <span className="text-sm text-slate-500">
                    {format(new Date(company.createdAt), 'dd MMM', { locale: ca })}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Activitat recent */}
        <div className="bg-white rounded-lg border border-slate-200 lg:col-span-2">
          <div className="p-4 border-b border-slate-100 flex items-center gap-2">
            <Activity className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
            <h2 className="font-medium text-slate-900">Activitat recent</h2>
          </div>
          <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
            {gestor.leadActivities.length === 0 ? (
              <div className="p-4 text-center text-slate-500">
                Sense activitat recent
              </div>
            ) : (
              gestor.leadActivities.map((activity) => (
                <div key={activity.id} className="p-4">
                  <p className="text-sm text-slate-700">{activity.description}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {format(new Date(activity.createdAt), "dd MMM 'a les' HH:mm", { locale: ca })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}