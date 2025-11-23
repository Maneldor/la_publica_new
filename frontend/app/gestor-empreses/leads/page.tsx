'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLeads, type LeadsFilters } from '@/hooks/crm/useLeads';
import { apiDelete, apiPatch } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { Bot, BarChart3 } from 'lucide-react';

// Importar nuevos componentes
import LeadFilters from './components/LeadFilters';
import AIReviewTab from './components/AIReviewTab';

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

export default function LeadsPage() {
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [deletingLeadId, setDeletingLeadId] = useState<string | null>(null);
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);

  // Estado para tabs
  const [activeTab, setActiveTab] = useState('todos');

  // Preparar filtros para el API
  const filters: LeadsFilters = {
    search: searchTerm || undefined,
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
    priority: selectedPriority !== 'all' ? selectedPriority : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage
  };

  // Usar el hook useLeads con filtros
  const { data: leadsResponse, isLoading, error } = useLeads(filters);

  const leads = leadsResponse?.leads || [];
  const totalLeads = leadsResponse?.total || 0;
  const totalPages = Math.ceil(totalLeads / itemsPerPage);

  // Reset page when filters change
  const resetPage = () => setCurrentPage(1);

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedPriority, dateFrom, dateTo]);

  // Handler para limpiar filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedPriority('all');
    setDateFrom('');
    setDateTo('');
    resetPage();
  };

  // Calcular contadores para tabs (mock por ahora)
  const tabCounts = {
    todos: totalLeads,
    aiReview: 5, // Mock: leads pendientes de revisión IA
    pipeline: leads.filter(l => ['contacted', 'negotiating'].includes(l.status)).length
  };

  // Export leads to CSV
  const exportToCSV = () => {
    if (!leads.length) return;

    const headers = [
      'Empresa',
      'CIF',
      'Sector',
      'Estado',
      'Prioridad',
      'Valor Estimado',
      'Fuente',
      'Contactos',
      'Interacciones',
      'Fecha Creación'
    ];

    const csvData = leads.map(lead => [
      lead.companyName,
      lead.cif || '',
      lead.sector || '',
      statusConfig[lead.status as keyof typeof statusConfig]?.label || lead.status,
      priorityConfig[lead.priority as keyof typeof priorityConfig]?.label || lead.priority,
      lead.estimatedValue ? `€${lead.estimatedValue.toLocaleString('es-ES')}` : '',
      lead.source,
      lead._count?.contacts || 0,
      lead._count?.interactions || 0,
      new Date(lead.createdAt).toLocaleDateString('es-ES')
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row =>
        row.map(cell => {
          // Escape commas and quotes in CSV
          const stringCell = String(cell);
          if (stringCell.includes(',') || stringCell.includes('"') || stringCell.includes('\n')) {
            return `"${stringCell.replace(/"/g, '""')}"`;
          }
          return stringCell;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle lead deletion
  const handleDeleteLead = async (leadId: string, companyName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el lead "${companyName}"?\n\nEsta acción no se puede deshacer y eliminará también todos los contactos e interacciones relacionados.`)) {
      return;
    }

    try {
      setDeletingLeadId(leadId);
      console.log(`🗑️ Eliminando lead ${leadId}...`);

      await apiDelete(`/crm/leads/${leadId}`, { requireAuth: false });

      console.log('✅ Lead eliminado exitosamente');

      // Force refresh of the leads list
      // The useLeads hook should automatically refetch
      window.location.reload();

    } catch (error) {
      console.error('❌ Error eliminando lead:', error);
      alert('Error al eliminar el lead. Por favor, inténtalo de nuevo.');
    } finally {
      setDeletingLeadId(null);
    }
  };

  const handleQuickAction = (action: string, lead: any) => {
    const contactName = lead.contacts?.[0]?.name || 'Sin contacto';
    const contactEmail = lead.contacts?.[0]?.email || '';
    const contactPhone = lead.contacts?.[0]?.phone || '';

    switch (action) {
      case 'call':
        console.log(`📞 Preparando llamada a ${lead.companyName}...`);
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
        console.log(`📧 Preparando email para ${lead.companyName}...`);
        const subject = `Seguimiento - ${lead.companyName}`;
        let body = `Estimado/a ${contactName},\n\nGracias por su interés en nuestros servicios...\n\nSaludos cordiales`;

        if (contactEmail) {
          const mailto = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          window.open(mailto);
        } else {
          const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          window.open(mailto);
        }
        break;

      default:
        console.log(`Acción no reconocida: ${action}`);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      setUpdatingLeadId(leadId);
      console.log(`🔄 Actualizando estado de lead ${leadId} a ${newStatus}...`);

      await apiPatch(`/crm/leads/${leadId}/status`, { status: newStatus }, { requireAuth: false });

      console.log('✅ Estado actualizado exitosamente');

      // Refrescar la lista
      window.location.reload();

    } catch (error) {
      console.error('❌ Error actualizando estado:', error);
      alert('Error al actualizar el estado del lead');
    } finally {
      setUpdatingLeadId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600">Gestiona tus oportunidades de negocio</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportToCSV}
            disabled={!leads.length}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Exportar CSV
          </button>
          <Link
            href="/gestor-empreses/leads/nuevo"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nuevo Lead
          </Link>
        </div>
      </div>

      {/* Sistema de Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="todos" className="data-[state=active]:bg-white relative">
            <div className="flex items-center gap-2">
              <span>Tots</span>
              {tabCounts.todos > 0 && (
                <Badge variant="secondary" className="bg-gray-600 text-white text-xs">
                  {tabCounts.todos}
                </Badge>
              )}
            </div>
          </TabsTrigger>

          <TabsTrigger value="ai-review" className="data-[state=active]:bg-white relative">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              <span>Revisió IA</span>
              {tabCounts.aiReview > 0 && (
                <Badge variant="secondary" className="bg-purple-600 text-white text-xs">
                  {tabCounts.aiReview}
                </Badge>
              )}
            </div>
          </TabsTrigger>

          <TabsTrigger value="pipeline" className="data-[state=active]:bg-white relative">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Pipeline</span>
              {tabCounts.pipeline > 0 && (
                <Badge variant="secondary" className="bg-blue-600 text-white text-xs">
                  {tabCounts.pipeline}
                </Badge>
              )}
            </div>
          </TabsTrigger>
        </TabsList>

        {/* Contenido del Tab "Todos" */}
        <TabsContent value="todos" className="space-y-6">
          {/* Filtros rediseñados */}
          <LeadFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            selectedPriority={selectedPriority}
            setSelectedPriority={setSelectedPriority}
            dateFrom={dateFrom}
            setDateFrom={setDateFrom}
            dateTo={dateTo}
            setDateTo={setDateTo}
            onClearFilters={handleClearFilters}
          />

          {/* Tabla de Leads */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Cargando leads...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Error al cargar los leads</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {error.message || 'Ha ocurrido un error inesperado'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Empresa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prioridad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contactos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Interacciones
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{lead.companyName}</div>
                            <div className="text-sm text-gray-500">{lead.cif}</div>
                            <div className="text-sm text-gray-500">{lead.sector} • {lead.source}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                            disabled={updatingLeadId === lead.id}
                            className={`text-xs font-medium rounded-full px-2.5 py-0.5 border-0 focus:ring-2 focus:ring-blue-500 transition-all ${
                              statusConfig[lead.status as keyof typeof statusConfig]?.color || statusConfig.new.color
                            } ${updatingLeadId === lead.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:brightness-90'}`}
                          >
                            <option value="new">Nuevo</option>
                            <option value="contacted">Contactado</option>
                            <option value="negotiating">Negociando</option>
                            <option value="converted">Convertido</option>
                            <option value="lost">Perdido</option>
                          </select>
                          {updatingLeadId === lead.id && (
                            <div className="ml-2 inline-block">
                              <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-600"></div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityConfig[lead.priority as keyof typeof priorityConfig]?.color || priorityConfig.medium.color}`}>
                            {priorityConfig[lead.priority as keyof typeof priorityConfig]?.label || 'Media'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {lead.estimatedValue ? `€${lead.estimatedValue.toLocaleString('es-ES')}` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {lead._count?.contacts || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-900">{lead._count?.interactions || 0}</span>
                            {(lead._count?.interactions || 0) === 0 && (
                              <ExclamationTriangleIcon className="ml-1 h-4 w-4 text-orange-500" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(lead.createdAt).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              href={`/gestor-empreses/leads/${lead.id}`}
                              className="text-blue-600 hover:text-blue-900"
                              title="Ver detalles"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/gestor-empreses/leads/${lead.id}/editar`}
                              className="text-gray-600 hover:text-gray-900"
                              title="Editar"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleQuickAction('call', lead)}
                              className="text-green-600 hover:text-green-900 transition-colors"
                              title="Llamar"
                            >
                              <PhoneIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleQuickAction('email', lead)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title="Enviar email"
                            >
                              <EnvelopeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteLead(lead.id, lead.companyName)}
                              disabled={deletingLeadId === lead.id}
                              className={`transition-colors ${
                                deletingLeadId === lead.id
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-red-600 hover:text-red-900'
                              }`}
                              title={deletingLeadId === lead.id ? 'Eliminando...' : 'Eliminar lead'}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {leads.length === 0 && !isLoading && !error && (
                  <div className="text-center py-12">
                    <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron leads</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm || selectedStatus !== 'all' || selectedPriority !== 'all'
                        ? 'Prueba a ajustar los filtros de búsqueda.'
                        : 'Empieza creando tu primer lead.'}
                    </p>
                    {!(searchTerm || selectedStatus !== 'all' || selectedPriority !== 'all') && (
                      <div className="mt-6">
                        <Link
                          href="/gestor-empreses/leads/nuevo"
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Crear primer lead
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Paginación */}
          {!isLoading && !error && totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalLeads)}</span> de{' '}
                    <span className="font-medium">{totalLeads}</span> resultados
                  </p>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      resetPage();
                    }}
                    className="ml-4 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={10}>10 por página</option>
                    <option value={20}>20 por página</option>
                    <option value={50}>50 por página</option>
                    <option value={100}>100 por página</option>
                  </select>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Anterior</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNumber
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Siguiente</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}

          {/* Pie de página con estadísticas */}
          {!isLoading && !error && (
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Mostrando {leads.length} de {totalLeads} leads</span>
                <div className="flex items-center space-x-4">
                  <span>Nuevos: {leads.filter(l => l.status === 'new').length}</span>
                  <span>En progreso: {leads.filter(l => ['contacted', 'negotiating'].includes(l.status)).length}</span>
                  <span>Convertidos: {leads.filter(l => l.status === 'converted').length}</span>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Contenido del Tab "Revisió IA" */}
        <TabsContent value="ai-review">
          <AIReviewTab />
        </TabsContent>

        {/* Contenido del Tab "Pipeline" */}
        <TabsContent value="pipeline">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-8">
            <div className="text-center">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Pipeline de leads
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Vista de pipeline en desenvolupament. Aquí es mostrarà el funnel de conversió dels leads.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  <strong>Proximament:</strong> Vista Kanban del pipeline amb leads en diferents etapes de conversió.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}