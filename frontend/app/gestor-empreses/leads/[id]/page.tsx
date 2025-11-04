'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useLeadDetail } from '@/hooks/crm/useLeadDetail';
import { useCompleteInteractionAction } from '@/hooks/crm/useInteractions';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import NewInteractionModal from '@/components/crm/NewInteractionModal';
import {
  ChevronLeftIcon,
  PlusIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  PencilIcon,
  MapPinIcon,
  GlobeAltIcon,
  UsersIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const interactionTypeConfig = {
  email: {
    icon: EnvelopeIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    label: 'Email'
  },
  call: {
    icon: PhoneIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    label: 'Llamada'
  },
  meeting: {
    icon: UserGroupIcon,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    label: 'Reunión'
  },
  whatsapp: {
    icon: ChatBubbleLeftRightIcon,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    label: 'WhatsApp'
  },
  note: {
    icon: PencilIcon,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    label: 'Nota'
  }
};

const statusConfig = {
  new: { color: 'bg-blue-100 text-blue-800', label: 'Nuevo' },
  contacted: { color: 'bg-yellow-100 text-yellow-800', label: 'Contactado' },
  negotiating: { color: 'bg-orange-100 text-orange-800', label: 'Negociando' },
  converted: { color: 'bg-green-100 text-green-800', label: 'Convertido' },
  lost: { color: 'bg-red-100 text-red-800', label: 'Perdido' }
};

const priorityConfig = {
  low: { color: 'bg-gray-100 text-gray-800', label: 'Baja' },
  medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Media' },
  high: { color: 'bg-red-100 text-red-800', label: 'Alta' }
};

export default function LeadDetailPage() {
  const params = useParams();
  const leadId = params.id as string;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: lead, isLoading, error, refetch } = useLeadDetail(leadId);
  const completeAction = useCompleteInteractionAction();

  const handleCompleteAction = async (interactionId: string) => {
    try {
      await completeAction.mutateAsync({ interactionId, leadId });
    } catch (error) {
      console.error('Error completando acción:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando lead...</p>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto" />
          <p className="mt-4 text-gray-600">Error al cargar el lead</p>
          <Link href="/gestor-empreses/leads" className="mt-2 text-blue-600 hover:text-blue-800">
            Volver a leads
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/gestor-empreses/leads"
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <ChevronLeftIcon className="h-5 w-5" />
                <span className="ml-1">Volver</span>
              </Link>
              <div className="h-6 border-l border-gray-300"></div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{lead.companyName}</h1>
                <div className="flex items-center space-x-3 mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[lead.status as keyof typeof statusConfig]?.color || statusConfig.new.color}`}>
                    {statusConfig[lead.status as keyof typeof statusConfig]?.label || 'Nuevo'}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityConfig[lead.priority as keyof typeof priorityConfig]?.color || priorityConfig.medium.color}`}>
                    Prioridad {priorityConfig[lead.priority as keyof typeof priorityConfig]?.label || 'Media'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nova Interacció
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timeline Column - 65% width */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Timeline de Comunicaciones</h2>
                <p className="text-sm text-gray-500">Historial de interacciones con el lead</p>
              </div>

              <div className="px-6 py-4">
                {lead.interactions && lead.interactions.length > 0 ? (
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {lead.interactions.map((interaction, index) => {
                        const config = interactionTypeConfig[interaction.type as keyof typeof interactionTypeConfig] || interactionTypeConfig.note;
                        const IconComponent = config.icon;
                        const isLast = index === lead.interactions.length - 1;

                        return (
                          <li key={interaction.id}>
                            <div className="relative pb-8">
                              {!isLast && (
                                <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                              )}
                              <div className="relative flex items-start space-x-3">
                                <div className={`relative px-1 ${config.bgColor} rounded-full flex items-center justify-center h-10 w-10`}>
                                  <IconComponent className={`h-5 w-5 ${config.color}`} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        <span className="font-medium text-gray-900">{config.label}</span>
                                        {interaction.subject && (
                                          <span className="text-gray-500">• {interaction.subject}</span>
                                        )}
                                      </div>
                                      <time className="text-xs text-gray-500">
                                        {formatDistanceToNow(new Date(interaction.createdAt), {
                                          addSuffix: true,
                                          locale: es
                                        })}
                                      </time>
                                    </div>
                                    <div className="mt-1 text-sm text-gray-700">
                                      {interaction.content}
                                    </div>
                                    {interaction.outcome && (
                                      <div className="mt-2 text-sm">
                                        <span className="font-medium text-gray-900">Resultado:</span>
                                        <span className="ml-1 text-gray-700">{interaction.outcome}</span>
                                      </div>
                                    )}
                                    {interaction.nextAction && (
                                      <div className="mt-2 flex items-center space-x-2">
                                        <div className="flex items-center">
                                          {interaction.nextActionCompleted ? (
                                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                          ) : (
                                            <CalendarIcon className="h-4 w-4 text-orange-500" />
                                          )}
                                          <span className={`ml-1 text-sm ${interaction.nextActionCompleted ? 'text-green-700' : 'text-orange-700'}`}>
                                            {interaction.nextAction}
                                          </span>
                                        </div>
                                        {interaction.nextActionDate && (
                                          <span className="text-xs text-gray-500">
                                            ({new Date(interaction.nextActionDate).toLocaleDateString('es-ES')})
                                          </span>
                                        )}
                                        {!interaction.nextActionCompleted && (
                                          <button
                                            onClick={() => handleCompleteAction(interaction.id)}
                                            disabled={completeAction.isPending}
                                            className="ml-2 text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                                          >
                                            {completeAction.isPending ? 'Completando...' : 'Completar'}
                                          </button>
                                        )}
                                      </div>
                                    )}
                                    {interaction.contact && (
                                      <div className="mt-2 text-xs text-gray-500">
                                        Contacto: {interaction.contact.name}
                                        {interaction.contact.position && ` • ${interaction.contact.position}`}
                                      </div>
                                    )}
                                    <div className="mt-1 text-xs text-gray-400">
                                      Por {interaction.createdBy.email}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Sin interacciones</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Aún no se han registrado comunicaciones con este lead.
                    </p>
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Añadir primera interacción
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info Column - 35% width */}
          <div className="space-y-6">
            {/* Company Info Card */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Información de la Empresa</h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                {lead.cif && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">CIF</label>
                    <p className="mt-1 text-sm text-gray-900">{lead.cif}</p>
                  </div>
                )}

                {lead.sector && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Sector</label>
                    <p className="mt-1 text-sm text-gray-900">{lead.sector}</p>
                  </div>
                )}

                {lead.website && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Website</label>
                    <a
                      href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <GlobeAltIcon className="h-4 w-4 mr-1" />
                      {lead.website}
                    </a>
                  </div>
                )}

                {lead.employees && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Empleados</label>
                    <p className="mt-1 flex items-center text-sm text-gray-900">
                      <UsersIcon className="h-4 w-4 mr-1" />
                      {lead.employees}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500">Fuente</label>
                  <p className="mt-1 text-sm text-gray-900">{lead.source}</p>
                </div>

                {lead.estimatedValue && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Valor Estimado</label>
                    <p className="mt-1 flex items-center text-sm text-gray-900">
                      <CurrencyEuroIcon className="h-4 w-4 mr-1" />
                      {lead.estimatedValue.toLocaleString('es-ES')}
                    </p>
                  </div>
                )}

                {lead.assignedTo && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Asignado a</label>
                    <p className="mt-1 text-sm text-gray-900">{lead.assignedTo.email}</p>
                  </div>
                )}

                {lead.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Notas</label>
                    <p className="mt-1 text-sm text-gray-900">{lead.notes}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Creado: {new Date(lead.createdAt).toLocaleDateString('es-ES')}</span>
                    <span>Actualizado: {new Date(lead.updatedAt).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contacts Card */}
            {lead.contacts && lead.contacts.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Contactos</h3>
                </div>
                <div className="px-6 py-4">
                  <div className="space-y-4">
                    {lead.contacts.map((contact) => (
                      <div key={contact.id} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">{contact.name}</h4>
                          {contact.isPrimary && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Principal
                            </span>
                          )}
                        </div>
                        {contact.position && (
                          <p className="text-sm text-gray-600">{contact.position}</p>
                        )}
                        <div className="mt-2 space-y-1">
                          {contact.email && (
                            <p className="flex items-center text-sm text-gray-500">
                              <EnvelopeIcon className="h-4 w-4 mr-2" />
                              {contact.email}
                            </p>
                          )}
                          {contact.phone && (
                            <p className="flex items-center text-sm text-gray-500">
                              <PhoneIcon className="h-4 w-4 mr-2" />
                              {contact.phone}
                            </p>
                          )}
                        </div>
                        {contact.notes && (
                          <p className="mt-2 text-sm text-gray-600">{contact.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <NewInteractionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        lead={lead}
        onSuccess={() => {
          refetch(); // Recargar datos del lead
        }}
      />
    </div>
  );
}