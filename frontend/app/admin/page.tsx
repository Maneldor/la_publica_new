'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface DashboardStats {
  contenidos: number;
  usuarios: number;
  publicaciones: number;
  traducciones: number;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    contenidos: 0,
    usuarios: 0,
    publicaciones: 0,
    traducciones: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Cargar al montar y auto-refresh cada 30s
  useEffect(() => {
    cargarEstadisticas();

    const interval = setInterval(() => {
      cargarEstadisticas();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/dashboard');

      if (!response.ok) {
        throw new Error('Error al carregar mètriques');
      }

      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
        setLastUpdated(new Date());
        console.log('✅ Dashboard metrics loaded:', data.meta?.queryTime || 'N/A');
      } else {
        throw new Error(data.error || 'Error desconegut');
      }

    } catch (err) {
      console.error('Error loading dashboard metrics:', err);
      setError(err instanceof Error ? err.message : 'Error al carregar dades');
      // Mantener datos anteriores si los hay
    } finally {
      setLoading(false);
    }
  };

  // Función para debuggear el token
  const debugToken = () => {
    console.log('🔍 === DEBUG SESSION & TOKEN ===');
    console.log('📝 Session completa:', session);
    console.log('📝 User:', session?.user);
    console.log('📝 API Token presente:', !!session?.user?.apiToken);

    if (session?.user?.apiToken) {
      console.log('🔑 API Token:', session.user.apiToken.substring(0, 50) + '...');

      // Decodificar JWT para ver fechas
      try {
        const tokenParts = session.user.apiToken.split('.');
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('🕐 Payload del token:', payload);

        const now = Math.floor(Date.now() / 1000);
        const issuedAt = new Date(payload.iat * 1000);
        const expiresAt = new Date(payload.exp * 1000);

        console.log('🕐 Ahora:', new Date().toLocaleString());
        console.log('🕐 Token creado:', issuedAt.toLocaleString());
        console.log('🕐 Token expira:', expiresAt.toLocaleString());
        console.log('⏰ Token válido:', now < payload.exp ? '✅ SÍ' : '❌ NO (EXPIRADO)');
        console.log('⏳ Tiempo restante:', Math.max(0, payload.exp - now), 'segundos');

      } catch (error) {
        console.error('❌ Error decodificando token:', error);
      }

      localStorage.setItem('token', session.user.apiToken);
      console.log('✅ Token guardado en localStorage');
    } else {
      console.log('❌ NO HAY API TOKEN EN LA SESIÓN');
      console.log('📝 Propiedades disponibles:', Object.keys(session?.user || {}));
    }

    console.log('🔍 Token en localStorage:', localStorage.getItem('token'));
    console.log('🔍 === FIN DEBUG ===');
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
            onClick={cargarEstadisticas}
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
              onClick={cargarEstadisticas}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Tornar a intentar
            </button>
          </div>
        </div>
      )}

      {loading && !lastUpdated && (
        <div className="flex items-center justify-center h-64 mb-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      )}

      {!loading && (
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
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Accesos Rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Botón de Debug Token */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-medium text-yellow-800 mb-2">🔧 Debug Lead Generation Token</h3>
          <p className="text-sm text-yellow-700 mb-3">
            Si Lead Generation no funciona, usa este botón para verificar y arreglar el token:
          </p>
          <button
            onClick={debugToken}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
          >
            🔍 Debuggear Token
          </button>
        </div>
      </div>
    </div>
  );
}