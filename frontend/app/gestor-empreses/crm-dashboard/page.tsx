'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChartBarIcon,
  TrendingUpIcon,
  CurrencyEuroIcon,
  UsersIcon,
  CalendarIcon,
  PlusIcon,
  FunnelIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { ConversionFunnelChart } from '@/components/crm/ConversionFunnelChart';
import { LeadsTrendChart } from '@/components/crm/LeadsTrendChart';
import { LeadsDistributionChart } from '@/components/crm/LeadsDistributionChart';
import { MetricWidget } from '@/components/crm/MetricWidget';

export default function CRMDashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [chartType, setChartType] = useState<'line' | 'area'>('area');
  const [distributionType, setDistributionType] = useState<'source' | 'priority' | 'status' | 'sector'>('source');

  // Datos mock para el dashboard
  const dashboard = {
    totalLeads: 45,
    newLeads: 12,
    inProgressLeads: 18,
    convertedLeads: 8,
    totalValue: 245000,
    conversionRate: 17.8,
    recentLeads: [
      {
        id: '1',
        companyName: 'Tech Solutions SL',
        sector: 'Tecnología',
        source: 'Web',
        priority: 'high',
        status: 'new',
        estimatedValue: 50000,
        createdAt: '2024-10-25T10:00:00Z'
      },
      {
        id: '2',
        companyName: 'Marketing Pro SA',
        sector: 'Marketing',
        source: 'Referido',
        priority: 'medium',
        status: 'contacted',
        estimatedValue: 25000,
        createdAt: '2024-10-24T15:30:00Z'
      },
      {
        id: '3',
        companyName: 'Construcciones García',
        sector: 'Construcción',
        source: 'LinkedIn',
        priority: 'low',
        status: 'new',
        estimatedValue: 15000,
        createdAt: '2024-10-24T12:00:00Z'
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header con filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard CRM</h1>
          <p className="text-gray-600">Resumen de tu actividad comercial</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Selector de período */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
            <option value="quarter">Último trimestre</option>
          </select>

          <Link
            href="/gestor-empreses/leads/nuevo"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nuevo Lead
          </Link>
        </div>
      </div>

      {/* Widgets de métricas mejorados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricWidget
          title="Total Leads"
          value={dashboard?.totalLeads || 0}
          change={12}
          icon={<UsersIcon className="h-6 w-6" />}
          color="blue"
        />
        <MetricWidget
          title="Leads Nuevos"
          value={dashboard?.newLeads || 0}
          change={5}
          icon={<CalendarIcon className="h-6 w-6" />}
          color="green"
        />
        <MetricWidget
          title="En Progreso"
          value={dashboard?.inProgressLeads || 0}
          change={8}
          icon={<ClockIcon className="h-6 w-6" />}
          color="yellow"
        />
        <MetricWidget
          title="Valor Total"
          value={dashboard?.totalValue || 0}
          change={15}
          icon={<CurrencyEuroIcon className="h-6 w-6" />}
          color="purple"
          format="currency"
        />
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Embudo de conversión */}
        <ConversionFunnelChart />

        {/* Tendencia de leads con selector de tipo */}
        <div>
          <div className="flex justify-end mb-2">
            <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
              <button
                onClick={() => setChartType('area')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  chartType === 'area'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Área
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  chartType === 'line'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Línea
              </button>
            </div>
          </div>
          <LeadsTrendChart type={chartType} />
        </div>
      </div>

      {/* Gráficos de distribución */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribución con selector */}
        <div>
          <div className="flex justify-end mb-2">
            <select
              value={distributionType}
              onChange={(e) => setDistributionType(e.target.value as any)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="source">Por Fuente</option>
              <option value="priority">Por Prioridad</option>
              <option value="status">Por Estado</option>
              <option value="sector">Por Sector</option>
            </select>
          </div>
          <LeadsDistributionChart type={distributionType} />
        </div>

        {/* Tasa de conversión mejorada */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Tasa de Conversión
              </h3>
              <ChartBarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="mt-6">
              <div className="flex items-center">
                <div className="text-3xl font-bold text-gray-900">
                  {dashboard?.conversionRate?.toFixed(1) || 0}%
                </div>
                <div className="ml-3 flex items-baseline text-sm font-semibold text-green-600">
                  <TrendingUpIcon className="h-4 w-4 mr-1" />
                  +2.1%
                </div>
              </div>
              <div className="mt-4">
                <div className="relative">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                    <div
                      style={{ width: `${dashboard?.conversionRate || 0}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                    />
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                {dashboard?.convertedLeads || 0} de {dashboard?.totalLeads || 0} leads convertidos
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Actividad Reciente
              </h3>
              <Link
                href="/gestor-empreses/leads"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Ver todos
              </Link>
            </div>
            <div className="mt-6 flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {(dashboard?.recentLeads || []).slice(0, 5).map((lead) => (
                  <li key={lead.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          lead.status === 'new' ? 'bg-blue-100' :
                          lead.status === 'contacted' ? 'bg-green-100' :
                          'bg-yellow-100'
                        }`}>
                          <span className={`text-sm font-medium ${
                            lead.status === 'new' ? 'text-blue-600' :
                            lead.status === 'contacted' ? 'text-green-600' :
                            'text-yellow-600'
                          }`}>
                            {lead.companyName.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {lead.companyName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {lead.sector || 'Sin sector'} • {lead.source}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {lead.estimatedValue && (
                          <span className="text-sm font-semibold text-gray-900">
                            €{lead.estimatedValue.toLocaleString('es-ES')}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions mejoradas */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Acciones Rápidas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/gestor-empreses/leads/nuevo"
              className="relative group rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-blue-400 hover:shadow-md transition-all duration-200"
            >
              <div className="flex-shrink-0">
                <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <PlusIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Crear Lead</p>
                <p className="text-sm text-gray-500 truncate">Nueva oportunidad</p>
              </div>
            </Link>

            <Link
              href="/gestor-empreses/leads?status=new"
              className="relative group rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-green-400 hover:shadow-md transition-all duration-200"
            >
              <div className="flex-shrink-0">
                <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                  <CalendarIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Leads Nuevos</p>
                <p className="text-sm text-gray-500 truncate">Revisar pendientes</p>
              </div>
            </Link>

            <Link
              href="/gestor-empreses/leads?priority=high"
              className="relative group rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-red-400 hover:shadow-md transition-all duration-200"
            >
              <div className="flex-shrink-0">
                <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                  <TrendingUpIcon className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Alta Prioridad</p>
                <p className="text-sm text-gray-500 truncate">Leads urgentes</p>
              </div>
            </Link>

            <Link
              href="/gestor-empreses/pipeline"
              className="relative group rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-purple-400 hover:shadow-md transition-all duration-200"
            >
              <div className="flex-shrink-0">
                <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                  <FunnelIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Pipeline</p>
                <p className="text-sm text-gray-500 truncate">Vista kanban</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}