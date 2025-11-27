'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLeads } from '@/hooks/crm/useLeads';
import { apiPatch } from '@/lib/api-client';
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  PhoneIcon,
  EnvelopeIcon,
  CurrencyEuroIcon,
  BuildingOfficeIcon,
  UserIcon,
  CalendarIcon,
  ChevronRightIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';

const statusConfig = {
  new: {
    title: 'Nuevos',
    color: 'bg-blue-50 border-blue-200',
    headerColor: 'bg-blue-100 text-blue-800',
    cardColor: 'bg-blue-50 border-blue-200'
  },
  contacted: {
    title: 'Contactados',
    color: 'bg-yellow-50 border-yellow-200',
    headerColor: 'bg-yellow-100 text-yellow-800',
    cardColor: 'bg-yellow-50 border-yellow-200'
  },
  negotiating: {
    title: 'Negociando',
    color: 'bg-purple-50 border-purple-200',
    headerColor: 'bg-purple-100 text-purple-800',
    cardColor: 'bg-purple-50 border-purple-200'
  },
  converted: {
    title: 'Convertidos',
    color: 'bg-green-50 border-green-200',
    headerColor: 'bg-green-100 text-green-800',
    cardColor: 'bg-green-50 border-green-200'
  },
  lost: {
    title: 'Perdidos',
    color: 'bg-red-50 border-red-200',
    headerColor: 'bg-red-100 text-red-800',
    cardColor: 'bg-red-50 border-red-200'
  }
};

const priorityConfig = {
  high: { color: 'text-red-600', label: 'Alta' },
  medium: { color: 'text-yellow-600', label: 'Media' },
  low: { color: 'text-green-600', label: 'Baja' }
};

export default function PipelinePage() {
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);

  // Cargar todos los leads sin filtros de estado
  const { data: leadsResponse, isLoading, error } = useLeads({
    limit: 100 // Cargar más leads para el pipeline
  });

  const leads = leadsResponse?.leads || [];

  // Organizar leads por estado
  const leadsByStatus = {
    new: leads.filter(lead => lead.status === 'new'),
    contacted: leads.filter(lead => lead.status === 'contacted'),
    negotiating: leads.filter(lead => lead.status === 'negotiating'),
    converted: leads.filter(lead => lead.status === 'converted'),
    lost: leads.filter(lead => lead.status === 'lost')
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      setUpdatingLeadId(leadId);
      console.log(`🔄 Moviendo lead ${leadId} a ${newStatus}...`);

      await apiPatch(`/crm/leads/${leadId}/status`, { status: newStatus }, { requireAuth: false });

      console.log('✅ Lead movido exitosamente');

      // Refrescar la página para mostrar el cambio
      window.location.reload();

    } catch (error) {
      console.error('❌ Error moviendo lead:', error);
      alert('Error al mover el lead');
    } finally {
      setUpdatingLeadId(null);
    }
  };

  const handleQuickAction = (action: string, lead: any) => {
    const contactName = lead.contacts?.[0]?.name || 'Sin contacto';
    const contactEmail = lead.contacts?.[0]?.email || '';
    const contactPhone = lead.contacts?.[0]?.phone || '';

    switch (action) {
      case 'call':
        let callInfo = `Preparando llamada a ${lead.companyName}`;
        if (contactName !== 'Sin contacto') {
          callInfo += `\nContacto: ${contactName}`;
        }
        if (contactPhone) {
          callInfo += `\nTeléfono: ${contactPhone}`;
        }
        alert(callInfo);
        break;

      case 'email':
        const subject = `Seguimiento - ${lead.companyName}`;
        const body = `Estimado/a ${contactName},\n\nGracias por su interés en nuestros servicios...\n\nSaludos cordiales`;

        if (contactEmail) {
          const mailto = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          window.open(mailto);
        } else {
          const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          window.open(mailto);
        }
        break;
    }
  };

  const calculateColumnValue = (leads: any[]) => {
    return leads.reduce((total, lead) => total + (lead.estimatedValue || 0), 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">Cargando pipeline...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline Comercial</h1>
          <p className="text-gray-600">Vista Kanban de tus leads organizados por estado</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/gestor-empreses/leads"
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Vista Lista
          </Link>
          <Link
            href="/gestor-empreses/leads/nuevo"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nuevo Lead
          </Link>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Error cargando leads. Mostrando datos limitados.</p>
        </div>
      )}

      {/* Pipeline Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(statusConfig).map(([status, config]) => {
          const statusLeads = leadsByStatus[status as keyof typeof leadsByStatus];
          const totalValue = calculateColumnValue(statusLeads);

          return (
            <div key={status} className={`p-4 rounded-lg border ${config.color}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">{config.title}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.headerColor}`}>
                  {statusLeads.length}
                </span>
              </div>
              <div className="mt-2">
                <p className="text-2xl font-bold text-gray-900">
                  €{totalValue.toLocaleString('es-ES')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {statusLeads.length} {statusLeads.length === 1 ? 'lead' : 'leads'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-6">
        {Object.entries(statusConfig).map(([status, config]) => {
          const statusLeads = leadsByStatus[status as keyof typeof leadsByStatus];

          return (
            <div key={status} className="flex-shrink-0 w-80">
              {/* Column Header */}
              <div className={`p-4 rounded-t-lg border ${config.color}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{config.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.headerColor}`}>
                    {statusLeads.length}
                  </span>
                </div>
              </div>

              {/* Column Content */}
              <div className={`min-h-96 p-4 rounded-b-lg border-l border-r border-b ${config.color} space-y-3`}>
                {statusLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer"
                  >
                    {/* Lead Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {lead.companyName}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {lead.contacts?.[0]?.name || 'Sin contacto'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`text-xs font-medium ${priorityConfig[lead.priority as keyof typeof priorityConfig]?.color || 'text-gray-600'}`}>
                          ●
                        </span>
                      </div>
                    </div>

                    {/* Lead Info */}
                    <div className="space-y-2 mb-3">
                      {lead.estimatedValue && (
                        <div className="flex items-center text-xs text-gray-600">
                          <CurrencyEuroIcon className="h-3 w-3 mr-1" />
                          €{lead.estimatedValue.toLocaleString('es-ES')}
                        </div>
                      )}

                      <div className="flex items-center text-xs text-gray-600">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {new Date(lead.createdAt).toLocaleDateString('es-ES')}
                      </div>

                      {lead.sector && (
                        <div className="flex items-center text-xs text-gray-600">
                          <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                          {lead.sector}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/gestor-empreses/leads/${lead.id}`}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Ver detalles"
                        >
                          <EyeIcon className="h-3 w-3" />
                        </Link>
                        <Link
                          href={`/gestor-empreses/leads/${lead.id}/editar`}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Editar"
                        >
                          <PencilIcon className="h-3 w-3" />
                        </Link>
                        <button
                          onClick={() => handleQuickAction('call', lead)}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Llamar"
                        >
                          <PhoneIcon className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleQuickAction('email', lead)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Email"
                        >
                          <EnvelopeIcon className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Move buttons */}
                      <div className="flex items-center gap-1">
                        {status !== 'new' && (
                          <button
                            onClick={() => {
                              const statuses = ['new', 'contacted', 'negotiating', 'converted', 'lost'];
                              const currentIndex = statuses.indexOf(status);
                              const prevStatus = statuses[currentIndex - 1];
                              handleStatusChange(lead.id, prevStatus);
                            }}
                            disabled={updatingLeadId === lead.id}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                            title="Mover atrás"
                          >
                            <ChevronLeftIcon className="h-3 w-3" />
                          </button>
                        )}

                        {status !== 'converted' && status !== 'lost' && (
                          <button
                            onClick={() => {
                              const statuses = ['new', 'contacted', 'negotiating', 'converted'];
                              const currentIndex = statuses.indexOf(status);
                              const nextStatus = statuses[currentIndex + 1];
                              handleStatusChange(lead.id, nextStatus);
                            }}
                            disabled={updatingLeadId === lead.id}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                            title="Mover adelante"
                          >
                            <ChevronRightIcon className="h-3 w-3" />
                          </button>
                        )}

                        {updatingLeadId === lead.id && (
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-600"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Empty state */}
                {statusLeads.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No hay leads en esta columna</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}