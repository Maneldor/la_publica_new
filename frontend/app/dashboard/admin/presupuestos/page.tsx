'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Presupuesto {
  id: string;
  numeroPresupuesto: string;
  empresaId: string;
  concepto: string;
  total: number;
  estado: string;
  fechaCreacion: string;
  fechaEnvio: string | null;
  empresa: {
    name: string;
    email: string;
  };
  creador: {
    name: string;
  };
  items: Array<{
    concepto: string;
    cantidad: number;
    precioUnitario: number;
    total: number;
  }>;
}

interface Stats {
  total: number;
  borradores: number;
  enviados: number;
  aprobados: number;
  rechazados: number;
  activos: number;
  facturados: number;
}

export default function AdminPresupuestosPage() {
  const router = useRouter();
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    fetchPresupuestos();
  }, [filtroEstado]);

  const fetchPresupuestos = async () => {
    try {
      setLoading(true);
      const params = [];
      if (filtroEstado) params.push(`estado=${filtroEstado}`);
      if (busqueda) params.push(`search=${busqueda}`);
      const queryString = params.length > 0 ? `?${params.join('&')}` : '';

      const response = await fetch(`/api/admin/presupuestos${queryString}`);

      if (!response.ok) throw new Error('Error al cargar presupuestos');

      const data = await response.json();
      setPresupuestos(data.presupuestos || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar los presupuestos');
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = () => {
    fetchPresupuestos();
  };

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      BORRADOR: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Borrador' },
      ENVIADO: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Enviat' },
      APROBADO: { bg: 'bg-green-100', text: 'text-green-800', label: 'Aprovat' },
      RECHAZADO: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rebutjat' },
      ACTIVO: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Actiu' },
      FACTURADO: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Facturat' }
    };

    const badge = badges[estado] || badges.BORRADOR;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
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
            Gestió de Pressupostos
          </h1>
          <p className="text-gray-600">
            Crea i gestiona pressupostos per als clients
          </p>
        </div>
        <Link
          href="/dashboard/admin/presupuestos/nuevo"
          className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
        >
          + Nou Pressupost
        </Link>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-gray-50 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.borradores}</div>
            <div className="text-sm text-gray-700">Borradors</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-900">{stats.enviados}</div>
            <div className="text-sm text-blue-700">Enviats</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-900">{stats.aprobados}</div>
            <div className="text-sm text-green-700">Aprovats</div>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-red-900">{stats.rechazados}</div>
            <div className="text-sm text-red-700">Rebutjats</div>
          </div>
          <div className="bg-purple-50 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-purple-900">{stats.activos}</div>
            <div className="text-sm text-purple-700">Actius</div>
          </div>
          <div className="bg-emerald-50 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-emerald-900">{stats.facturados}</div>
            <div className="text-sm text-emerald-700">Facturats</div>
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
              placeholder="Buscar per empresa o número..."
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
            Tots
          </button>
          <button
            onClick={() => setFiltroEstado('BORRADOR')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filtroEstado === 'BORRADOR'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Borradors
          </button>
          <button
            onClick={() => setFiltroEstado('ENVIADO')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filtroEstado === 'ENVIADO'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Enviats
          </button>
          <button
            onClick={() => setFiltroEstado('APROBADO')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filtroEstado === 'APROBADO'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Aprovats
          </button>
          <button
            onClick={() => setFiltroEstado('ACTIVO')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filtroEstado === 'ACTIVO'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Actius
          </button>
          <button
            onClick={() => setFiltroEstado('FACTURADO')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filtroEstado === 'FACTURADO'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Facturats
          </button>
        </div>
      </div>

      {/* Lista de Presupuestos */}
      {presupuestos.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hi ha pressupostos
          </h3>
          <p className="text-gray-600 mb-4">
            {filtroEstado
              ? `No hi ha pressupostos amb estat "${filtroEstado}"`
              : 'Encara no hi ha cap pressupost creat'}
          </p>
          <Link
            href="/dashboard/admin/presupuestos/nuevo"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
          >
            Crear Primer Pressupost
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {presupuestos.map((presupuesto) => (
            <div
              key={presupuesto.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {presupuesto.numeroPresupuesto}
                      </h3>
                      {getEstadoBadge(presupuesto.estado)}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Empresa: <span className="font-medium">{presupuesto.empresa.name}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      {presupuesto.concepto}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {formatCurrency(presupuesto.total)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(presupuesto.fechaCreacion)}
                    </div>
                  </div>
                </div>

                {/* Items resumen */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {presupuesto.items.length} ítem{presupuesto.items.length !== 1 ? 's' : ''}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {presupuesto.items.slice(0, 3).map((item, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {item.concepto}
                      </span>
                    ))}
                    {presupuesto.items.length > 3 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        +{presupuesto.items.length - 3} més
                      </span>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <Link
                    href={`/dashboard/admin/presupuestos/${presupuesto.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Veure Detalls
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}