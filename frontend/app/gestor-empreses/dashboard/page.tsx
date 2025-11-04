'use client';

import { useState, useEffect } from 'react';
import {
  Target,
  Phone,
  TrendingUp,
  CheckSquare,
  Eye,
  Calendar,
  Building2,
  User,
  ChevronRight,
  Clock,
  Plus,
  Filter,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { apiGet, apiPatch, apiDelete } from '@/lib/api-client';
import ConversionChart from '@/components/crm/ConversionChart';
import PerformanceMetrics from '@/components/crm/PerformanceMetrics';

interface KPICard {
  title: string;
  value: number;
  change: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface Lead {
  id: string;
  companyName: string;
  contact: string;
  status: string;
  priority: string;
  estimatedValue: number;
  source: string;
  createdAt: string;
}

interface Task {
  id: string;
  description: string;
  companyName: string;
  dueDate: string;
  type: string;
  priority: string;
}

interface Company {
  id: string;
  name: string;
  sector: string;
  convertedAt: string;
  accountManager: string;
  value: number;
}

export default function GestorDashboardPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [kpis, setKpis] = useState<KPICard[]>([]);
  const [pipelineData, setPipelineData] = useState({
    new: 0,
    contacted: 0,
    negotiating: 0,
    converted: 0
  });
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [recentCompanies, setRecentCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Estados para filtros
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'quarter'>('month');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'new' | 'contacted' | 'negotiating' | 'converted'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setError(null);
      console.log('🔄 Cargando datos del dashboard...');

      // Cargar datos reales del backend
      const data = await apiGet('/crm/dashboard', { requireAuth: false });
      console.log('✅ Datos del dashboard recibidos:', data);

      setDashboardData(data);

      // Configurar KPIs con datos reales
      setKpis([
        {
          title: 'Total Leads',
          value: data.totalLeads || 0,
          change: '+12%', // TODO: Calcular cambio real
          icon: Target,
          color: 'blue'
        },
        {
          title: 'Leads Nuevos',
          value: data.newLeads || 0,
          change: '+8%',
          icon: Eye,
          color: 'green'
        },
        {
          title: 'En Progreso',
          value: data.inProgressLeads || 0,
          change: '+5%',
          icon: Clock,
          color: 'yellow'
        },
        {
          title: 'Convertidos',
          value: data.convertedLeads || 0,
          change: '+15%',
          icon: CheckSquare,
          color: 'purple'
        }
      ]);

      // Configurar pipeline con datos reales
      setPipelineData({
        new: data.newLeads || 0,
        contacted: Math.floor((data.inProgressLeads || 0) * 0.6), // Estimación
        negotiating: Math.floor((data.inProgressLeads || 0) * 0.4), // Estimación
        converted: data.convertedLeads || 0
      });

      // Procesar leads recientes
      if (data.recentLeads && Array.isArray(data.recentLeads)) {
        const processedLeads = data.recentLeads.map((lead: any) => ({
          id: lead.id,
          companyName: lead.companyName,
          contact: lead.contacts?.[0] ? `${lead.contacts[0].firstName} ${lead.contacts[0].lastName}` : 'Sin contacto',
          status: lead.status,
          priority: lead.priority || 'medium',
          estimatedValue: lead.estimatedValue || 0,
          source: lead.source || 'unknown',
          createdAt: lead.createdAt
        }));
        setRecentLeads(processedLeads);
      }

      // Mock data para tareas y empresas (hasta que implementemos esos endpoints)
      setPendingTasks([
        {
          id: '1',
          description: 'Hacer seguimiento a leads nuevos',
          companyName: 'Sistema automático',
          dueDate: new Date().toISOString(),
          type: 'call',
          priority: 'high'
        }
      ]);

      setRecentCompanies([
        {
          id: '1',
          name: 'Empresas convertidas',
          sector: 'Varios',
          convertedAt: new Date().toISOString(),
          accountManager: 'Sistema CRM',
          value: data.totalValue || 0
        }
      ]);

    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');

      // Fallback a datos mock en caso de error
      loadMockData();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMockData = () => {
    console.log('🔄 Cargando datos mock como fallback...');

    setKpis([
      { title: 'Total Leads', value: 24, change: '+12%', icon: Target, color: 'blue' },
      { title: 'Contactades', value: 18, change: '+8%', icon: Phone, color: 'green' },
      { title: 'Conversió', value: 25, change: '+5%', icon: TrendingUp, color: 'purple' },
      { title: 'Tasques Pendents', value: 7, change: '-2', icon: CheckSquare, color: 'orange' }
    ]);

    setPipelineData({ new: 8, contacted: 12, negotiating: 6, converted: 4 });

    setRecentLeads([
      {
        id: '1', companyName: 'Tech Solutions BCN', contact: 'Maria García (CEO)',
        status: 'new', priority: 'high', estimatedValue: 15000, source: 'web_form',
        createdAt: '2024-10-29T10:30:00Z'
      }
    ]);
  };

  const handleStatusUpdate = async (leadId: string, newStatus: string) => {
    try {
      console.log(`🔄 Actualizando estado de lead ${leadId} a ${newStatus}...`);

      await apiPatch(`/crm/leads/${leadId}/status`, { status: newStatus }, { requireAuth: false });

      console.log('✅ Estado actualizado exitosamente');

      // Actualizar la lista de leads localmente
      setRecentLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === leadId
            ? { ...lead, status: newStatus }
            : lead
        )
      );

      // Refrescar datos del dashboard
      await loadDashboardData();

    } catch (error) {
      console.error('❌ Error actualizando estado:', error);
      alert('Error al actualizar el estado del lead');
    }
  };

  const handleQuickAction = (action: string, lead: Lead) => {
    switch (action) {
      case 'call':
        console.log(`📞 Preparando llamada a ${lead.companyName}...`);
        // En una implementación real, esto podría:
        // - Abrir un modal con detalles de contacto
        // - Integrar con un sistema telefónico
        // - Registrar la interacción
        alert(`Preparando llamada a ${lead.companyName}\nContacto: ${lead.contact}`);
        break;

      case 'email':
        console.log(`📧 Preparando email para ${lead.companyName}...`);
        // En una implementación real, esto podría:
        // - Abrir el cliente de email por defecto
        // - Abrir un modal de composición de email
        // - Usar un servicio de email integrado
        const subject = `Seguimiento - ${lead.companyName}`;
        const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Estimado/a ${lead.contact},\n\nGracias por su interés en nuestros servicios...\n\nSaludos cordiales`)}`;
        window.open(mailto);
        break;

      default:
        console.log(`Acción no reconocida: ${action}`);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'negotiating': return 'bg-purple-100 text-purple-800';
      case 'converted': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return '📧';
      case 'call': return '📞';
      case 'meeting': return '🤝';
      case 'whatsapp': return '💬';
      default: return '📝';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">Carregant dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header mejorado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Comercial</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-600">Vista general del teu pipeline i activitat</p>
            {error && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                ⚠️ Datos mock
              </span>
            )}
            {!error && dashboardData && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                ✅ Datos reales
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
          <Link
            href="/gestor-empreses/leads/nuevo"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Lead
          </Link>
        </div>
      </div>

      {/* Mensaje de error si existe */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Usando datos de demostración
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>No se pudieron cargar los datos reales del backend. Mostrando datos de ejemplo.</p>
                <p className="mt-1 text-xs">Error: {error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros dinámicos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </button>
            <span className="text-sm text-gray-500">
              Período: {selectedPeriod === 'today' ? 'Hoy' : selectedPeriod === 'week' ? 'Esta semana' : selectedPeriod === 'month' ? 'Este mes' : 'Este trimestre'}
              {selectedStatus !== 'all' && ` • Estado: ${selectedStatus}`}
            </span>
          </div>

          {showFilters && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Período:</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as any)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="today">Hoy</option>
                  <option value="week">Esta semana</option>
                  <option value="month">Este mes</option>
                  <option value="quarter">Este trimestre</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Estado:</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos</option>
                  <option value="new">Nuevos</option>
                  <option value="contacted">Contactados</option>
                  <option value="negotiating">Negociando</option>
                  <option value="converted">Convertidos</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setSelectedPeriod('month');
                  setSelectedStatus('all');
                  loadDashboardData();
                }}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-lg bg-${kpi.color}-100`}>
                <kpi.icon className={`h-6 w-6 text-${kpi.color}-600`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{kpi.value}</p>
                <p className={`text-sm ${kpi.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {kpi.change}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Métricas de Rendimiento */}
      <PerformanceMetrics
        data={{
          totalLeads: dashboardData?.totalLeads || 0,
          convertedLeads: dashboardData?.convertedLeads || 0,
          totalValue: dashboardData?.totalValue || 0,
          avgDealSize: dashboardData?.avgDealSize || 0,
          avgTimeToClose: dashboardData?.avgTimeToClose || 45,
          activeLeads: dashboardData?.inProgressLeads || 0
        }}
      />

      {/* Análisis de Conversión */}
      <ConversionChart
        data={{
          new: pipelineData.new,
          contacted: pipelineData.contacted,
          negotiating: pipelineData.negotiating,
          converted: pipelineData.converted,
          lost: dashboardData?.lostLeads || 0
        }}
      />

      {/* Pipeline Visual (Mantenido para comparación) */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Comercial - Vista Rápida</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="bg-blue-100 rounded-lg p-4 mb-2">
              <div className="text-2xl font-bold text-blue-600">{pipelineData.new}</div>
              <div className="text-sm text-blue-600">Nous</div>
            </div>
            <div className="text-xs text-gray-500">Leads nous</div>
          </div>
          <div className="text-center">
            <div className="bg-yellow-100 rounded-lg p-4 mb-2">
              <div className="text-2xl font-bold text-yellow-600">{pipelineData.contacted}</div>
              <div className="text-sm text-yellow-600">Contactades</div>
            </div>
            <div className="text-xs text-gray-500">Primer contacte fet</div>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 rounded-lg p-4 mb-2">
              <div className="text-2xl font-bold text-purple-600">{pipelineData.negotiating}</div>
              <div className="text-sm text-purple-600">Negociant</div>
            </div>
            <div className="text-xs text-gray-500">En procés comercial</div>
          </div>
          <div className="text-center">
            <div className="bg-green-100 rounded-lg p-4 mb-2">
              <div className="text-2xl font-bold text-green-600">{pipelineData.converted}</div>
              <div className="text-sm text-green-600">Convertides</div>
            </div>
            <div className="text-xs text-gray-500">Empreses actives</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Leads Recents</h2>
            <Link href="/gestor-empreses/leads" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Veure tots <ChevronRight className="inline h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link href={`/gestor-empreses/leads/${lead.id}`} className="block">
                      <h3 className="text-sm font-medium text-gray-900 hover:text-blue-600">{lead.companyName}</h3>
                      <p className="text-sm text-gray-600">{lead.contact}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(lead.priority)}`}>
                          {lead.priority}
                        </span>
                      </div>
                    </Link>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">€{lead.estimatedValue.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{new Date(lead.createdAt).toLocaleDateString('ca-ES')}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleStatusUpdate(lead.id, 'contacted')}
                        disabled={lead.status === 'contacted' || lead.status === 'negotiating' || lead.status === 'converted'}
                        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded transition-colors ${
                          lead.status === 'contacted' || lead.status === 'negotiating' || lead.status === 'converted'
                            ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                            : 'text-green-600 bg-green-50 hover:bg-green-100'
                        }`}
                        title={lead.status === 'new' ? 'Marcar como contactado' : 'Ya contactado'}
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => handleQuickAction('call', lead)}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                        title="Llamar"
                      >
                        📞
                      </button>
                      <button
                        onClick={() => handleQuickAction('email', lead)}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-600 bg-purple-50 rounded hover:bg-purple-100 transition-colors"
                        title="Enviar email"
                      >
                        📧
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Tasques Pendents Avui</h2>
            <Link href="/gestor-empreses/tasques" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Veure totes <ChevronRight className="inline h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {pendingTasks.map((task) => (
              <div key={task.id} className="p-6">
                <div className="flex items-start gap-3">
                  <div className="text-lg">{getTypeIcon(task.type)}</div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{task.description}</h3>
                    <p className="text-sm text-gray-600">{task.companyName}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {new Date(task.dueDate).toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Companies */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Empreses Convertides Recentment</h2>
          <Link href="/gestor-empreses/empreses" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Veure totes <ChevronRight className="inline h-4 w-4" />
          </Link>
        </div>
        <div className="divide-y divide-gray-200">
          {recentCompanies.map((company) => (
            <div key={company.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="h-8 w-8 text-gray-400" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{company.name}</h3>
                    <p className="text-sm text-gray-600">{company.sector}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">€{company.value.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{new Date(company.convertedAt).toLocaleDateString('ca-ES')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}