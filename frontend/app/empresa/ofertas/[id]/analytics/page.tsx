'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Heart,
  Ticket,
  CheckCircle,
  DollarSign,
  Calendar,
  Download,
  RefreshCw,
  ArrowLeft,
  BarChart3,
  Activity,
  Clock,
  MapPin,
  User,
  Mail
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Lazy load de recharts para evitar SSR
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });
import { format, parseISO } from 'date-fns';
import { ca } from 'date-fns/locale';

interface Analytics {
  offer: {
    id: string;
    title: string;
    status: string;
    category: string;
    publishedAt: string;
  };
  metrics: {
    views: number;
    favorites: number;
    totalCoupons: number;
    activeCoupons: number;
    expiredCoupons: number;
    cancelledCoupons: number;
    totalRedemptions: number;
    conversionRate: number;
    totalRevenue: number;
    avgTicket: number;
    totalEvents: number;
    eventsByType: Record<string, number>;
  };
  charts: {
    daily: Array<{
      date: string;
      coupons_generated: number;
      coupons_used: number;
    }>;
    conversionFunnel: Array<{
      stage: string;
      value: number;
    }>;
  };
  coupons: Array<{
    id: string;
    code: string;
    status: string;
    generatedAt: string;
    expiresAt: string;
    usedAt: string | null;
    user: {
      name: string;
      email: string;
    };
    redemption: {
      redeemedAt: string;
      finalPrice: number;
      location: string;
      receiptNumber: string;
    } | null;
  }>;
  timeline: Array<{
    id: string;
    type: string;
    timestamp: string;
    user: {
      name: string;
      email: string;
    } | null;
    metadata: {
      deviceType: string;
      browser: string;
      city: string;
    };
  }>;
}

export default function OfferAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const offerId = params.id as string;

  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30'); // días

  useEffect(() => {
    loadAnalytics();
  }, [offerId, dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/empresa/ofertas/${offerId}/analytics?days=${dateRange}`
      );

      if (!response.ok) {
        throw new Error('Error al carregar analytics');
      }

      const data = await response.json();
      setAnalytics(data);

    } catch (err) {
      console.error('Error loading analytics:', err);
      setError(err instanceof Error ? err.message : 'Error desconegut');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!analytics) return;

    // Crear CSV simple de cupones
    const csvData = [
      ['Código', 'Estado', 'Usuario', 'Email', 'Generado', 'Usado', 'Importe'],
      ...analytics.coupons.map(c => [
        c.code,
        c.status,
        c.user.name,
        c.user.email,
        c.generatedAt.split('T')[0],
        c.usedAt ? c.usedAt.split('T')[0] : '',
        c.redemption?.finalPrice?.toString() || ''
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${analytics.offer.title}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregant analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">❌ {error || 'Error al carregar dades'}</p>
          <button
            onClick={loadAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tornar a intentar
          </button>
        </div>
      </div>
    );
  }

  const { metrics, charts, coupons, timeline } = analytics;

  // Colores para gráficos
  const COLORS = {
    primary: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6',
    gray: '#6B7280',
    indigo: '#6366F1',
    pink: '#EC4899'
  };

  // Datos para pie chart de estados cupones
  const couponStatusData = [
    { name: 'Actius', value: metrics.activeCoupons, color: COLORS.success },
    { name: 'Usats', value: metrics.totalRedemptions, color: COLORS.primary },
    { name: 'Caducats', value: metrics.expiredCoupons, color: COLORS.warning },
    { name: 'Cancel·lats', value: metrics.cancelledCoupons, color: COLORS.danger }
  ].filter(item => item.value > 0);

  // Función para formatear eventos
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'DETAIL_VIEW': return <Eye className="w-4 h-4" />;
      case 'COUPON_GENERATED': return <Ticket className="w-4 h-4" />;
      case 'COUPON_USED': return <CheckCircle className="w-4 h-4" />;
      case 'FAVORITE_ADDED': return <Heart className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'DETAIL_VIEW': return 'text-blue-600 bg-blue-100';
      case 'COUPON_GENERATED': return 'text-purple-600 bg-purple-100';
      case 'COUPON_USED': return 'text-green-600 bg-green-100';
      case 'FAVORITE_ADDED': return 'text-pink-600 bg-pink-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Actiu</span>;
      case 'USED':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Usat</span>;
      case 'EXPIRED':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Caducat</span>;
      case 'CANCELLED':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Cancel·lat</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/empresa/ofertas')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Analytics: {analytics.offer.title}
                </h1>
                <p className="text-gray-600 text-sm">
                  {analytics.offer.category} • {analytics.offer.status}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Selector rango fechas */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="7">Últims 7 dies</option>
                <option value="30">Últims 30 dies</option>
                <option value="90">Últims 90 dies</option>
                <option value="365">Últim any</option>
              </select>

              <button
                onClick={loadAnalytics}
                className="p-2 border rounded-lg hover:bg-gray-50"
                title="Actualitzar"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              <button
                onClick={handleExport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Exportar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* KPIs principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Vistas */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.views.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Vistes</p>
              </div>
            </div>
          </div>

          {/* Cupones generados */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Ticket className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.totalCoupons}
                </p>
                <p className="text-sm text-gray-600">Cupons Generats</p>
              </div>
            </div>
          </div>

          {/* Tasa conversión */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.conversionRate}%
                </p>
                <p className="text-sm text-gray-600">Taxa Conversió</p>
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${Math.min(metrics.conversionRate, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Ingresos */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.totalRevenue.toFixed(0)}€
                </p>
                <p className="text-sm text-gray-600">Ingressos Totals</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Ticket mig: {metrics.avgTicket.toFixed(2)}€
            </p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gráfico temporal */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Evolució Cupons
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => format(new Date(value), 'dd/MM')}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => format(new Date(value), 'dd MMMM yyyy')}
                    formatter={(value, name) => [
                      value,
                      name === 'coupons_generated' ? 'Generats' : 'Usats'
                    ]}
                  />
                  <Legend
                    formatter={(value) => value === 'coupons_generated' ? 'Generats' : 'Usats'}
                  />
                  <Area
                    type="monotone"
                    dataKey="coupons_generated"
                    stackId="1"
                    stroke={COLORS.purple}
                    fill={COLORS.purple}
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="coupons_used"
                    stackId="1"
                    stroke={COLORS.success}
                    fill={COLORS.success}
                    fillOpacity={0.8}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribución estados cupones */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Distribució Cupons</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={couponStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) =>
                      `${name}: ${value} (${((percent || 0) * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {couponStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Funnel de conversión */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Funnel de Conversió</h3>
          <div className="grid grid-cols-3 gap-4">
            {charts.conversionFunnel.map((stage, index) => (
              <div key={stage.stage} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{
                      backgroundColor: index === 0 ? COLORS.primary :
                                     index === 1 ? COLORS.purple :
                                     COLORS.success
                    }}
                  >
                    {stage.value}
                  </div>
                </div>
                <p className="font-medium text-gray-900">{stage.stage}</p>
                {index > 0 && (
                  <p className="text-sm text-gray-500">
                    {((stage.value / charts.conversionFunnel[index - 1].value) * 100).toFixed(1)}% de l'anterior
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sección inferior con tablas */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Tabla de cupones */}
          <div className="xl:col-span-2 bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Cupons Recents</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Codi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Usuari
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Estat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Generat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Import
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {coupons.slice(0, 10).map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm">{coupon.code}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {coupon.user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {coupon.user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(coupon.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(coupon.generatedAt), 'dd/MM/yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {coupon.redemption ?
                          `${coupon.redemption.finalPrice}€` :
                          '-'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Timeline de eventos */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Activitat Recent</h3>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {timeline.slice(0, 15).map((event) => (
                  <div key={event.id} className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${getEventColor(event.type)}`}>
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {event.type.replace('_', ' ')}
                      </p>
                      {event.user && (
                        <p className="text-xs text-gray-500">
                          {event.user.name}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {format(new Date(event.timestamp), 'dd/MM HH:mm')}
                        {event.metadata.deviceType && (
                          <>
                            <span>•</span>
                            <span>{event.metadata.deviceType}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}