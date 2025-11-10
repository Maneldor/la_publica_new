'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SolicitudExtra {
  id: string;
  mensaje: string;
  telefono: string | null;
  estado: string;
  fechaCreacion: string;
  fechaRespuesta: string | null;
  respuestaAdministrador: string | null;
  extras: Array<{
    id: string;
    nombre: string;
    categoria: string;
    precio: number;
  }>;
  presupuesto?: {
    id: string;
    numeroPresupuesto: string;
    total: number;
    estado: string;
  } | null;
}

interface Stats {
  total: number;
  pendientes: number;
  respondidas: number;
  enProceso: number;
  conPresupuesto: number;
}

export default function EmpresaSolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<SolicitudExtra[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    fetchSolicitudes();
  }, [filtroEstado]);

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      const params = [];
      if (filtroEstado) params.push(`estado=${filtroEstado}`);
      if (busqueda) params.push(`search=${busqueda}`);
      const queryString = params.length > 0 ? `?${params.join('&')}` : '';

      const response = await fetch(`/api/empresa/solicitudes${queryString}`);

      if (!response.ok) throw new Error('Error al cargar solicitudes');

      const data = await response.json();
      setSolicitudes(data.solicitudes || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = () => {
    fetchSolicitudes();
  };

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      PENDIENTE: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendent' },
      RESPONDIDA: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Resposta' },
      EN_PROCESO: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'En Procés' },
      COMPLETADA: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completada' }
    };

    const badge = badges[estado] || badges.PENDIENTE;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ca-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ca-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Les Meves Sol·licituds
          </h1>
          <p className="text-gray-600">
            Consulta l'estat de les teves sol·licituds d'informació
          </p>
        </div>
        <Link
          href="/empresa/extras"
          className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
        >
          + Nova Sol·licitud
        </Link>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-yellow-900">{stats.pendientes}</div>
            <div className="text-sm text-yellow-700">Pendents</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-900">{stats.respondidas}</div>
            <div className="text-sm text-blue-700">Respostes</div>
          </div>
          <div className="bg-purple-50 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-purple-900">{stats.enProceso}</div>
            <div className="text-sm text-purple-700">En Procés</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-900">{stats.conPresupuesto}</div>
            <div className="text-sm text-green-700">Amb Pressupost</div>
          </div>
        </div>
      )}

      {/* Búsqueda y Filtros */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
              placeholder="Buscar per missatge o categoria..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <button
            onClick={handleBuscar}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Buscar
          </button>
        </div>

        {/* Filtros de estado */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setFiltroEstado('')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filtroEstado === ''
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Totes
          </button>
          <button
            onClick={() => setFiltroEstado('PENDIENTE')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filtroEstado === 'PENDIENTE'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pendents
          </button>
          <button
            onClick={() => setFiltroEstado('RESPONDIDA')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filtroEstado === 'RESPONDIDA'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Respostes
          </button>
          <button
            onClick={() => setFiltroEstado('EN_PROCESO')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filtroEstado === 'EN_PROCESO'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            En Procés
          </button>
        </div>
      </div>

      {/* Lista de Solicitudes */}
      {solicitudes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hi ha sol·licituds
          </h3>
          <p className="text-gray-600 mb-4">
            {filtroEstado
              ? `No hi ha sol·licituds amb estat "${filtroEstado}"`
              : 'Encara no has fet cap sol·licitud d\'informació'}
          </p>
          <Link
            href="/empresa/extras"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
          >
            Fer Primera Sol·licitud
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {solicitudes.map((solicitud) => (
            <div
              key={solicitud.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Sol·licitud #{solicitud.id.slice(-8).toUpperCase()}
                      </h3>
                      {getEstadoBadge(solicitud.estado)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {formatDate(solicitud.fechaCreacion)}
                      {solicitud.telefono && (
                        <span className="ml-2">• 📞 {solicitud.telefono}</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    {solicitud.presupuesto && (
                      <div className="mb-2">
                        <Link
                          href={`/empresa/presupuestos/${solicitud.presupuesto.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          Pressupost: {solicitud.presupuesto.numeroPresupuesto}
                        </Link>
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(solicitud.presupuesto.total)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mensaje */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Missatge
                  </label>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                    {solicitud.mensaje}
                  </p>
                </div>

                {/* Extras solicitados */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Extras sol·licitats ({solicitud.extras.length})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {solicitud.extras.map((extra) => (
                      <span
                        key={extra.id}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {extra.nombre} ({extra.categoria})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Respuesta del administrador */}
                {solicitud.respuestaAdministrador && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Resposta de l'administració
                    </label>
                    <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-md border border-green-200">
                      {solicitud.respuestaAdministrador}
                    </p>
                    {solicitud.fechaRespuesta && (
                      <p className="text-xs text-gray-500 mt-1">
                        Responsa el {formatDate(solicitud.fechaRespuesta)}
                      </p>
                    )}
                  </div>
                )}

                {/* Acciones */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  {solicitud.presupuesto && (
                    <Link
                      href={`/empresa/presupuestos/${solicitud.presupuesto.id}`}
                      className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                    >
                      Veure Pressupost
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}