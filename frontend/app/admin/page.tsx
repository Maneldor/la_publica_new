'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface DashboardMetrics {
  users?: {
    total: number;
    active: number;
    newToday: number;
    byRole: Record<string, number>;
    growth: number;
    growthPercent: number;
  };
  companies?: {
    total: number;
    active: number;
    pending: number;
    approved: number;
    approvalRate: number;
  };
  offers?: {
    total: number;
    published: number;
    pending: number;
    draft: number;
    publishRate: number;
  };
  coupons?: {
    total: number;
    active: number;
    used: number;
    redeemed: number;
    conversionRate: number;
  };
  activity?: {
    eventsLast7Days: number;
    viewsLast7Days: number;
    avgViewsPerDay: number;
  };
  notifications?: {
    total: number;
    unread: number;
  };
  invoices?: {
    total: number;
    paid: number;
  };
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardMetrics>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [partialData, setPartialData] = useState<DashboardMetrics | null>(null);

  // Cargar al montar y auto-refresh cada 60s (reducido para mejor rendimiento)
  useEffect(() => {
    cargarEstadisticas();

    const interval = setInterval(() => {
      cargarEstadisticas();
    }, 60000); // 60 segundos (reducido de 30s)

    return () => clearInterval(interval);
  }, []);

  const cargarEstadisticas = async (showPartial = false) => {
    try {
      if (!showPartial) {
        setLoading(true);
      }
      setError(null);

      const response = await fetch('/api/admin/dashboard');

      if (!response.ok) {
        throw new Error('Error al carregar mètriques');
      }

      const data = await response.json();

      if (data.success) {
        const metrics = data.metrics || {};
        
        // Si hay datos parciales, actualizar progresivamente
        if (showPartial && partialData) {
          setPartialData(prev => ({ ...prev, ...metrics }));
        } else {
          setPartialData(metrics);
        }
        
        setStats(metrics);
        setLastUpdated(new Date());
        
        // Log solo en desarrollo
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Dashboard metrics loaded:', data.queryTime || 'N/A', data.cached ? '(cached)' : '');
        }
      } else {
        throw new Error(data.error || 'Error desconegut');
      }

    } catch (err) {
      // Siempre log errores, pero sin detalles sensibles
      console.error('Error loading dashboard metrics');
      setError(err instanceof Error ? err.message : 'Error al carregar dades');
      // Mantener datos anteriores si los hay
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { title: 'Empreses', value: stats?.companies?.total || 0, icon: '🏢', color: 'bg-blue-500', description: 'Total empreses registrades' },
    { title: 'Usuaris', value: stats?.users?.total || 0, icon: '👥', color: 'bg-green-500', description: 'Usuaris actius al sistema' },
    { title: 'Ofertes', value: stats?.offers?.total || 0, icon: '🎯', color: 'bg-purple-500', description: 'Ofertes publicades' },
    { title: 'Cupons', value: stats?.coupons?.total || 0, icon: '🎫', color: 'bg-orange-500', description: 'Cupons generats' }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard Admin</h1>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <RefreshCw className="w-3 h-3" />
              Última actualització: {lastUpdated.toLocaleTimeString('ca-ES')}
            </div>
          )}
          <button
            onClick={() => cargarEstadisticas()}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Carregant...' : 'Actualitzar'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <p className="text-red-800">❌ {error}</p>
            <button
              onClick={() => cargarEstadisticas()}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Tornar a intentar
            </button>
          </div>
        </div>
      )}

      {/* Loading inicial - mostrar skeleton */}
      {loading && !lastUpdated && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16 mt-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-32 mt-1"></div>
                </div>
                <div className="w-14 h-14 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mostrar datos cuando están disponibles */}
      {!loading || lastUpdated ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.map((card, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                  <p className="text-3xl font-bold mt-2 text-gray-900">
                    {card.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                </div>
                <div className={`${card.color} text-white text-2xl w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0`}>
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Accesos Rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/gestio"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
          >
            <div className="text-3xl mb-2">🎛️</div>
            <div className="font-medium">Dashboard de Gestió</div>
            <div className="text-xs text-gray-500 mt-1">CRM Comercial i Gestió d'Empreses</div>
          </Link>

          <Link
            href="/admin/blog/crear"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
          >
            <div className="text-3xl mb-2">📝</div>
            <div className="font-medium">Crear Post</div>
          </Link>

          <Link
            href="/admin/posts"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
          >
            <div className="text-3xl mb-2">💬</div>
            <div className="font-medium">Gestionar Posts</div>
          </Link>

          <Link
            href="/admin/moderacion-unificada"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors text-center"
          >
            <div className="text-3xl mb-2">🛡️</div>
            <div className="font-medium">Moderación Unificada</div>
            <div className="text-xs text-gray-500 mt-1">Gestionar todos los reportes</div>
          </Link>

          <Link
            href="/admin/moderacion"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors text-center"
          >
            <div className="text-3xl mb-2">⚠️</div>
            <div className="font-medium">Moderación Blog</div>
            <div className="text-xs text-gray-500 mt-1">Solo reportes de blog</div>
          </Link>

          <Link
            href="/admin/grupos"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center"
          >
            <div className="text-3xl mb-2">👥</div>
            <div className="font-medium">Gestionar Grupos</div>
          </Link>

          <Link
            href="/admin/foros"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center"
          >
            <div className="text-3xl mb-2">💭</div>
            <div className="font-medium">Gestionar Foros</div>
          </Link>

          <Link
            href="/admin/anuncios"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition-colors text-center"
          >
            <div className="text-3xl mb-2">📢</div>
            <div className="font-medium">Gestionar Anuncios</div>
          </Link>

          <Link
            href="/admin/empresas"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-500 hover:bg-gray-50 transition-colors text-center"
          >
            <div className="text-3xl mb-2">🏢</div>
            <div className="font-medium">Gestionar Empresas</div>
          </Link>
        </div>
      </div>
    </div>
  );
}