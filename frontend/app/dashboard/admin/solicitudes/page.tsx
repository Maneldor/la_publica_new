'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Solicitud {
  id: string;
  empresaId: string;
  estado: string;
  fechaSolicitud: string;
  mensaje: string | null;
  telefono: string | null;
  empresa: {
    name: string;
    email: string;
  };
  usuario: {
    name: string;
    email: string;
  };
  gestor: {
    name: string;
  } | null;
  extras: Array<{
    id: string;
    nombre: string;
    categoria: string;
    precio: number;
  }>;
  presupuesto: {
    numero: string;
    total: number;
    estado: string;
  } | null;
}

interface Stats {
  total: number;
  pendientes: number;
  enProceso: number;
  presupuestoEnviado: number;
  cerradas: number;
}

export default function AdminSolicitudesPage() {
  const { data: session } = useSession();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('');

  useEffect(() => {
    fetchSolicitudes();
  }, [filtroEstado]);

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      const queryString = filtroEstado ? `?estado=${filtroEstado}` : '';
      const response = await fetch(`/api/admin/solicitudes${queryString}`);

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

  const handleAsignar = async (solicitudId: string) => {
    try {
      const response = await fetch(`/api/admin/solicitudes/${solicitudId}`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Error al asignar solicitud');

      alert('Solicitud asignada correctamente');
      fetchSolicitudes();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al asignar la solicitud');
    }
  };

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      PENDIENTE: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendent' },
      EN_PROCESO: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'En Procés' },
      PRESUPUESTO_ENVIADO: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Pressupost Enviat' },
      CERRADA: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Tancada' }
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrecio = (precio: number) => {
    return new Intl.NumberFormat('ca-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(precio);
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gestió de Sol·licituds
        </h1>
        <p className="text-gray-600">
          Gestiona les sol·licituds d'informació sobre extras dels clients
        </p>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-yellow-900">{stats.pendientes}</div>
            <div className="text-sm text-yellow-700">Pendents</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-900">{stats.enProceso}</div>
            <div className="text-sm text-blue-700">En Procés</div>
          </div>
          <div className="bg-purple-50 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-purple-900">{stats.presupuestoEnviado}</div>
            <div className="text-sm text-purple-700">Pressupost Enviat</div>
          </div>
          <div className="bg-gray-50 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.cerradas}</div>
            <div className="text-sm text-gray-700">Tancades</div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-wrap gap-2">
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
            onClick={() => setFiltroEstado('EN_PROCESO')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filtroEstado === 'EN_PROCESO'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            En Procés
          </button>
          <button
            onClick={() => setFiltroEstado('PRESUPUESTO_ENVIADO')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filtroEstado === 'PRESUPUESTO_ENVIADO'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pressupost Enviat
          </button>
          <button
            onClick={() => setFiltroEstado('CERRADA')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filtroEstado === 'CERRADA'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tancades
          </button>
        </div>
      </div>

      {/* Lista de Solicitudes */}
      {solicitudes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hi ha sol·licituds
          </h3>
          <p className="text-gray-600">
            {filtroEstado
              ? `No hi ha sol·licituds amb estat "${filtroEstado}"`
              : 'Encara no hi ha cap sol·licitud creada'}
          </p>
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
                        {solicitud.empresa.name}
                      </h3>
                      {getEstadoBadge(solicitud.estado)}
                    </div>
                    <p className="text-sm text-gray-600">
                      Sol·licitant: {solicitud.usuario.name} ({solicitud.usuario.email})
                    </p>
                    {solicitud.gestor && (
                      <p className="text-sm text-gray-600">
                        Gestor: {solicitud.gestor.name}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {formatDate(solicitud.fechaSolicitud)}
                  </div>
                </div>

                {/* Extras solicitados */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Serveis d'interès:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {solicitud.extras.map((extra) => (
                      <span
                        key={extra.id}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                      >
                        {extra.nombre} - {formatPrecio(extra.precio)}/mes
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mensaje */}
                {solicitud.mensaje && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700">{solicitud.mensaje}</p>
                  </div>
                )}

                {/* Teléfono */}
                {solicitud.telefono && (
                  <p className="text-sm text-gray-600 mb-4">
                    📞 {solicitud.telefono}
                  </p>
                )}

                {/* Presupuesto asociado */}
                {solicitud.presupuesto && (
                  <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-md">
                    <p className="text-sm font-medium text-purple-900">
                      Pressupost: {solicitud.presupuesto.numero}
                    </p>
                    <p className="text-sm text-purple-700">
                      Total: {formatPrecio(solicitud.presupuesto.total)} - Estat: {solicitud.presupuesto.estado}
                    </p>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <Link
                    href={`/dashboard/admin/solicitudes/${solicitud.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Veure Detalls
                  </Link>

                  {solicitud.estado === 'PENDIENTE' && (
                    <button
                      onClick={() => handleAsignar(solicitud.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                    >
                      Assignar-me
                    </button>
                  )}

                  {!solicitud.presupuesto && solicitud.estado !== 'CERRADA' && (
                    <Link
                      href={`/dashboard/admin/presupuestos/nuevo?solicitudId=${solicitud.id}`}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700"
                    >
                      Crear Pressupost
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