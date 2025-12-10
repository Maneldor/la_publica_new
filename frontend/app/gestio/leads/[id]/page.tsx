// app/gestio/leads/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect, notFound, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2, Edit, Phone, Mail, Calendar, User, Tag, TrendingUp, Clock, MessageCircle } from 'lucide-react'

import { PageHeader } from '@/components/gestio-empreses/shared/PageHeader'
import { LeadStatusBadge, LeadTimeline, LeadActions } from '@/components/gestio-empreses/leads'

interface PageProps {
  params: {
    id: string
  }
}

export default function LeadDetailPage({ params }: PageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [lead, setLead] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user) {
      router.push('/login')
      return
    }

    // Fetch lead data
    fetchLead()
  }, [session, status, params.id])

  const fetchLead = async () => {
    try {
      const response = await fetch(`/api/leads/${params.id}`)
      if (!response.ok) {
        router.push('/gestio/leads')
        return
      }
      const data = await response.json()
      setLead(data)
    } catch (error) {
      console.error('Error fetching lead:', error)
      router.push('/gestio/leads')
    } finally {
      setLoading(false)
    }
  }

  if (loading || !lead) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb i header */}
      <div className="flex items-center gap-4">
        <Link
          href="/gestio/leads"
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
        </Link>

        <PageHeader
          title={lead.companyName}
          description={lead.contacts?.[0]?.firstName
            ? `Contacte: ${lead.contacts[0].firstName} ${lead.contacts[0].lastName || ''}`.trim()
            : "Lead comercial"}
          icon={Building2}
          actions={
            <div className="flex items-center gap-3">
              <LeadStatusBadge status={lead.status} />

              {/* Accions ràpides */}
              <div className="flex items-center gap-2">
                {lead.contacts?.[0]?.phone && (
                  <a
                    href={`tel:${lead.contacts[0].phone}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Phone className="h-3 w-3" strokeWidth={1.5} />
                    Trucar
                  </a>
                )}

                {lead.contacts?.[0]?.email && (
                  <a
                    href={`mailto:${lead.contacts[0].email}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Mail className="h-3 w-3" strokeWidth={1.5} />
                    Email
                  </a>
                )}

                <button className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors">
                  <Calendar className="h-3 w-3" strokeWidth={1.5} />
                  Reunió
                </button>
              </div>

              <Link
                href={`/gestio/leads/${lead.id}/editar`}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
              >
                <Edit className="h-4 w-4" strokeWidth={1.5} />
                Editar
              </Link>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informació principal del lead */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-slate-500" strokeWidth={1.5} />
              Informació del Lead
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informació de l'empresa */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Empresa</label>
                  <p className="text-slate-800 font-medium">{lead.companyName}</p>
                </div>

                {lead.cif && (
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">CIF</label>
                    <p className="text-slate-800">{lead.cif}</p>
                  </div>
                )}

                {lead.sector && (
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Sector</label>
                    <p className="text-slate-800">{lead.sector}</p>
                  </div>
                )}

                {lead.email && (
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Email empresa</label>
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {lead.email}
                    </a>
                  </div>
                )}
              </div>

              {/* Informació comercial */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1 flex items-center gap-1">
                    <Tag className="h-3 w-3" strokeWidth={1.5} />
                    Prioritat
                  </label>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    lead.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                    lead.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {lead.priority === 'HIGH' ? 'Alta' :
                     lead.priority === 'MEDIUM' ? 'Mitjana' :
                     lead.priority === 'LOW' ? 'Baixa' : lead.priority}
                  </span>
                </div>

                {lead.source && (
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Font</label>
                    <p className="text-slate-800">{lead.source}</p>
                  </div>
                )}

                {lead.score && (
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" strokeWidth={1.5} />
                      Score
                    </label>
                    <div className="flex items-center gap-2">
                      <div className={`text-lg font-bold ${
                        lead.score >= 80 ? 'text-green-600' :
                        lead.score >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {lead.score}
                      </div>
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            lead.score >= 80 ? 'bg-green-500' :
                            lead.score >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${lead.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {lead.estimatedRevenue && (
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Valor estimat</label>
                    <p className="text-slate-800 font-medium">
                      {new Intl.NumberFormat('ca-ES', {
                        style: 'currency',
                        currency: 'EUR',
                        maximumFractionDigits: 0,
                      }).format(lead.estimatedRevenue)}
                    </p>
                  </div>
                )}

                {lead.assignedTo && (
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1 flex items-center gap-1">
                      <User className="h-3 w-3" strokeWidth={1.5} />
                      Assignat a
                    </label>
                    <p className="text-slate-800">{lead.assignedTo.name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {lead.notes && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <label className="block text-sm font-medium text-slate-500 mb-2 flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" strokeWidth={1.5} />
                  Notes
                </label>
                <p className="text-slate-700 whitespace-pre-wrap bg-slate-50 p-3 rounded-md">{lead.notes}</p>
              </div>
            )}
          </div>

          {/* Contactes */}
          {lead.contacts && lead.contacts.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-slate-500" strokeWidth={1.5} />
                Contactes ({lead.contacts.length})
              </h3>

              <div className="space-y-4">
                {lead.contacts.map((contact, index) => (
                  <div key={contact.id || index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">
                        {contact.firstName} {contact.lastName || ''}
                        {contact.isPrimary && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                            Principal
                          </span>
                        )}
                      </p>
                      {contact.email && (
                        <p className="text-sm text-slate-500">{contact.email}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone}`}
                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                        >
                          <Phone className="h-4 w-4" strokeWidth={1.5} />
                        </a>
                      )}
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        >
                          <Mail className="h-4 w-4" strokeWidth={1.5} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Historial d'activitat */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-500" strokeWidth={1.5} />
              Historial d'Activitat
            </h3>
            <LeadTimeline activities={lead.interactions || []} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Accions ràpides */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Accions Ràpides</h3>
            <LeadActions lead={lead} />
          </div>

          {/* Estadístiques */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Estadístiques</h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Creat fa</span>
                <span className="text-slate-800">
                  {new Intl.RelativeTimeFormat('ca', { numeric: 'auto' }).format(
                    Math.floor((new Date(lead.createdAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
                    'day'
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Última actualització</span>
                <span className="text-slate-800">
                  {new Intl.RelativeTimeFormat('ca', { numeric: 'auto' }).format(
                    Math.floor((new Date(lead.updatedAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
                    'day'
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Contactes</span>
                <span className="text-slate-800">{lead.contacts?.length || 0}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Interaccions</span>
                <span className="text-slate-800">{lead.interactions?.length || 0}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Tasques pendents</span>
                <span className="text-slate-800">{lead.tasks?.length || 0}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Documents</span>
                <span className="text-slate-800">{lead.documents?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Lead convertit */}
          {lead.convertedCompany && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Lead Convertit</h3>
              <p className="text-sm text-green-700 mb-3">
                Aquest lead s'ha convertit exitosament en empresa.
              </p>
              <Link
                href={`/gestio/empreses/${lead.convertedCompany.id}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
              >
                <Building2 className="h-4 w-4" strokeWidth={1.5} />
                Veure Empresa
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}