'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Factura {
  id: string;
  numeroFactura: string;
  company: {
    name: string;
    email: string;
  };
  empresaNombre: string;
  total: number;
  estado: string;
  fechaEmision: string;
  fechaVencimiento: string;
  tipoFactura: string;
}

export default function ListaFacturasPage() {
  const router = useRouter();
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    estado: '',
    busqueda: '',
    fechaDesde: '',
    fechaHasta: ''
  });
  const [paginacion, setPaginacion] = useState({
    pagina: 1,
    porPagina: 20,
    total: 0
  });

  useEffect(() => {
    fetchFacturas();
  }, [filtros, paginacion.pagina]);

  const fetchFacturas = async () => {
    try {
      const params = new URLSearchParams({
        pagina: paginacion.pagina.toString(),
        limite: paginacion.porPagina.toString(),
        ...(filtros.estado && { estado: filtros.estado }),
        ...(filtros.busqueda && { busqueda: filtros.busqueda }),
        ...(filtros.fechaDesde && { fechaDesde: filtros.fechaDesde }),
        ...(filtros.fechaHasta && { fechaHasta: filtros.fechaHasta })
      });

      const res = await fetch(`/api/admin/facturacion/facturas?${params}`);
      if (res.ok) {
        const data = await res.json();
        setFacturas(data.facturas);
        setPaginacion(prev => ({ ...prev, total: data.total }));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo: string, valor: string) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
    setPaginacion(prev => ({ ...prev, pagina: 1 }));
  };

  const getBadgeColor = (estado: string) => {
    const colors = {
      'BORRADOR': 'bg-gray-100 text-gray-800',
      'ENVIADA': 'bg-blue-100 text-blue-800',
      'PAGADA': 'bg-green-100 text-green-800',
      'VENCIDA': 'bg-red-100 text-red-800',
      'PARCIALMENTE_PAGADA': 'bg-yellow-100 text-yellow-800',
      'CANCELADA': 'bg-gray-100 text-gray-500'
    };
    return colors[estado as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const totalPaginas = Math.ceil(paginacion.total / paginacion.porPagina);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => router.push('/dashboard/facturacio')}
              className="text-blue-600 hover:text-blue-700 font-semibold mb-2 flex items-center gap-2"
            >
              ← Tornar al Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Totes les Factures</h1>
            <p className="text-gray-600 mt-1">
              Gestiona i consulta totes les factures emeses
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/facturacio/facturas/crear')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-colors flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nova Factura
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cercar
              </label>
              <input
                type="text"
                placeholder="Núm. factura o empresa..."
                value={filtros.busqueda}
                onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estat
              </label>
              <select
                value={filtros.estado}
                onChange={(e) => handleFiltroChange('estado', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tots els estats</option>
                <option value="BORRADOR">Esborrany</option>
                <option value="ENVIADA">Enviada</option>
                <option value="PAGADA">Pagada</option>
                <option value="VENCIDA">Vençuda</option>
                <option value="PARCIALMENTE_PAGADA">Parcialment Pagada</option>
                <option value="CANCELADA">Cancel·lada</option>
              </select>
            </div>

            {/* Fecha desde */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Des de
              </label>
              <input
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) => handleFiltroChange('fechaDesde', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Fecha hasta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fins a
              </label>
              <input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) => handleFiltroChange('fechaHasta', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

          </div>

          {/* Botón limpiar filtros */}
          {(filtros.estado || filtros.busqueda || filtros.fechaDesde || filtros.fechaHasta) && (
            <div className="mt-4">
              <button
                onClick={() => {
                  setFiltros({ estado: '', busqueda: '', fechaDesde: '', fechaHasta: '' });
                  setPaginacion(prev => ({ ...prev, pagina: 1 }));
                }}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Esborrar filtres
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabla de facturas */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Núm. Factura
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Import
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Emissió
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Venciment
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {facturas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500 font-medium">No s'han trobat factures</p>
                    <p className="text-gray-400 text-sm mt-1">Prova a ajustar els filtres o crea una nova factura</p>
                  </td>
                </tr>
              ) : (
                facturas.map((factura) => (
                  <tr key={factura.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono font-semibold text-gray-900">
                        {factura.numeroFactura}
                      </span>
                      {factura.tipoFactura !== 'MANUAL' && (
                        <span className="ml-2 text-xs text-gray-500">
                          (Auto)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{factura.empresaNombre}</div>
                        <div className="text-sm text-gray-500">{factura.company.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">
                        €{factura.total.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getBadgeColor(factura.estado)}`}>
                        {factura.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(factura.fechaEmision).toLocaleDateString('ca-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(factura.fechaVencimiento).toLocaleDateString('ca-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => router.push(`/dashboard/facturacio/facturas/${factura.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Veure
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrant {((paginacion.pagina - 1) * paginacion.porPagina) + 1} a {Math.min(paginacion.pagina * paginacion.porPagina, paginacion.total)} de {paginacion.total} factures
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPaginacion(prev => ({ ...prev, pagina: prev.pagina - 1 }))}
                disabled={paginacion.pagina === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Anterior
              </button>
              <span className="px-4 py-2 border rounded-lg bg-blue-50 text-blue-700 font-semibold">
                {paginacion.pagina} / {totalPaginas}
              </span>
              <button
                onClick={() => setPaginacion(prev => ({ ...prev, pagina: prev.pagina + 1 }))}
                disabled={paginacion.pagina >= totalPaginas}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Següent
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}