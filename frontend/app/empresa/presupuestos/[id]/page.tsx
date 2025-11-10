'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface PresupuestoDetalle {
  id: string;
  numeroPresupuesto: string;
  empresaId: string;
  concepto: string;
  observaciones: string | null;
  subtotal: number;
  descuento: number;
  iva: number;
  total: number;
  estado: string;
  fechaCreacion: string;
  fechaEnvio: string | null;
  fechaAprobacion: string | null;
  fechaActivacion: string | null;
  fechaFacturacion: string | null;
  empresa: {
    name: string;
    email: string;
    telefono: string | null;
  };
  creador: {
    name: string;
    email: string;
  };
  items: Array<{
    id: string;
    concepto: string;
    descripcion: string | null;
    cantidad: number;
    precioUnitario: number;
    total: number;
    featureExtra: {
      nombre: string;
      categoria: string;
    } | null;
  }>;
}

export default function EmpresaPresupuestoDetallePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const presupuestoId = params.id as string;
  const action = searchParams.get('action');

  const [presupuesto, setPresupuesto] = useState<PresupuestoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [procesandoAccion, setProcesandoAccion] = useState(false);

  // Estados para modales
  const [mostrarModalAceptar, setMostrarModalAceptar] = useState(false);
  const [mostrarModalRechazar, setMostrarModalRechazar] = useState(false);
  const [comentarios, setComentarios] = useState('');
  const [motivo, setMotivo] = useState('');

  useEffect(() => {
    fetchPresupuesto();

    // Manejar acciones directas desde la URL
    if (action === 'accept') {
      setMostrarModalAceptar(true);
    } else if (action === 'reject') {
      setMostrarModalRechazar(true);
    }
  }, [presupuestoId, action]);

  const fetchPresupuesto = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/empresa/presupuestos/${presupuestoId}`);

      if (!response.ok) {
        if (response.status === 404) {
          alert('Presupuesto no encontrado');
          router.push('/empresa/presupuestos');
          return;
        }
        throw new Error('Error al cargar presupuesto');
      }

      const data = await response.json();
      setPresupuesto(data.presupuesto || data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar el presupuesto');
    } finally {
      setLoading(false);
    }
  };

  const ejecutarAccion = async (accion: string, data: any) => {
    try {
      setProcesandoAccion(true);
      const response = await fetch(`/api/empresa/presupuestos/${presupuestoId}/${accion}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error al ${accion}`);
      }

      alert(`Presupuesto ${accion === 'aceptar' ? 'aprovat' : 'rebutjat'} correctament!`);

      // Limpiar URL y cerrar modales
      router.replace(`/empresa/presupuestos/${presupuestoId}`);
      setMostrarModalAceptar(false);
      setMostrarModalRechazar(false);
      setComentarios('');
      setMotivo('');

      fetchPresupuesto(); // Recargar datos
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || `Error al ${accion} el presupuesto`);
    } finally {
      setProcesandoAccion(false);
    }
  };

  const handleAceptar = () => {
    ejecutarAccion('aceptar', { comentarios });
  };

  const handleRechazar = () => {
    if (!motivo.trim()) {
      alert('Debe proporcionar un motivo para rechazar el presupuesto');
      return;
    }
    ejecutarAccion('rechazar', { motivo: motivo.trim() });
  };

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      BORRADOR: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Borrador' },
      ENVIADO: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Pendent d\'Aprovació' },
      APROBADO: { bg: 'bg-green-100', text: 'text-green-800', label: 'Aprovat' },
      RECHAZADO: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rebutjat' },
      ACTIVO: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Actiu' },
      FACTURADO: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Facturat' }
    };

    const badge = badges[estado] || badges.BORRADOR;

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ca-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ca-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getBotonesAccion = () => {
    if (!presupuesto || presupuesto.estado !== 'ENVIADO') return null;

    return (
      <div className="flex gap-2">
        <button
          onClick={() => setMostrarModalAceptar(true)}
          disabled={procesandoAccion}
          className="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 disabled:opacity-50"
        >
          Acceptar Pressupost
        </button>
        <button
          onClick={() => setMostrarModalRechazar(true)}
          disabled={procesandoAccion}
          className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 disabled:opacity-50"
        >
          Rebutjar Pressupost
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!presupuesto) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Presupuesto no encontrado</h1>
        <Link
          href="/empresa/presupuestos"
          className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
        >
          Tornar als Pressupostos
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {presupuesto.numeroPresupuesto}
              </h1>
              {getEstadoBadge(presupuesto.estado)}
            </div>
            <p className="text-gray-600">
              {presupuesto.concepto}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/empresa/presupuestos"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
            >
              ← Tornar
            </Link>
            {getBotonesAccion()}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Datos del presupuesto */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Informació del Pressupost
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Creat per
                  </label>
                  <p className="text-sm text-gray-900 font-medium">
                    {presupuesto.creador.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {presupuesto.creador.email}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Creació
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDate(presupuesto.fechaCreacion)}
                  </p>
                </div>
              </div>

              {presupuesto.observaciones && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observacions
                  </label>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                    {presupuesto.observaciones}
                  </p>
                </div>
              )}
            </div>

            {/* Items del presupuesto */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Detall dels Serveis
              </h2>

              <div className="space-y-3">
                {presupuesto.items.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {item.concepto}
                        </h3>
                        {item.descripcion && (
                          <p className="text-sm text-gray-600 mt-1">
                            {item.descripcion}
                          </p>
                        )}
                        {item.featureExtra && (
                          <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {item.featureExtra.categoria}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {formatCurrency(item.total)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.cantidad} × {formatCurrency(item.precioUnitario)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar con totales e historial */}
          <div className="space-y-6">
            {/* Totales */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Resum Econòmic
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">
                    {formatCurrency(presupuesto.subtotal)}
                  </span>
                </div>

                {presupuesto.descuento > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Descompte ({presupuesto.descuento}%):</span>
                    <span className="font-medium text-red-600">
                      -{formatCurrency((presupuesto.subtotal * presupuesto.descuento) / 100)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">IVA ({presupuesto.iva}%):</span>
                  <span className="font-medium">
                    {formatCurrency(((presupuesto.subtotal - (presupuesto.subtotal * presupuesto.descuento) / 100) * presupuesto.iva) / 100)}
                  </span>
                </div>

                <div className="pt-3 border-t-2 border-gray-300">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold">TOTAL:</span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(presupuesto.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Historial de fechas */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Historial
              </h3>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Creat:</span>
                  <br />
                  <span className="text-gray-600">
                    {formatDate(presupuesto.fechaCreacion)}
                  </span>
                </div>

                {presupuesto.fechaEnvio && (
                  <div>
                    <span className="font-medium text-gray-700">Enviat:</span>
                    <br />
                    <span className="text-gray-600">
                      {formatDate(presupuesto.fechaEnvio)}
                    </span>
                  </div>
                )}

                {presupuesto.fechaAprobacion && (
                  <div>
                    <span className="font-medium text-gray-700">Aprovat:</span>
                    <br />
                    <span className="text-gray-600">
                      {formatDate(presupuesto.fechaAprobacion)}
                    </span>
                  </div>
                )}

                {presupuesto.fechaActivacion && (
                  <div>
                    <span className="font-medium text-gray-700">Activat:</span>
                    <br />
                    <span className="text-gray-600">
                      {formatDate(presupuesto.fechaActivacion)}
                    </span>
                  </div>
                )}

                {presupuesto.fechaFacturacion && (
                  <div>
                    <span className="font-medium text-gray-700">Facturat:</span>
                    <br />
                    <span className="text-gray-600">
                      {formatDate(presupuesto.fechaFacturacion)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Aceptar */}
      {mostrarModalAceptar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Acceptar Pressupost</h3>
            <p className="text-gray-600 mb-4">
              Estàs segur que vols acceptar aquest pressupost?
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentaris (opcional)
              </label>
              <textarea
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                rows={3}
                placeholder="Afegeix comentaris sobre l'acceptació..."
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMostrarModalAceptar(false);
                  setComentarios('');
                  router.replace(`/empresa/presupuestos/${presupuestoId}`);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel·lar
              </button>
              <button
                onClick={handleAceptar}
                disabled={procesandoAccion}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {procesandoAccion ? 'Processant...' : 'Acceptar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rechazar */}
      {mostrarModalRechazar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Rebutjar Pressupost</h3>
            <p className="text-gray-600 mb-4">
              Per favor, indica el motiu pel qual rebutges aquest pressupost:
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motiu del rebuig *
              </label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={4}
                placeholder="Explica el motiu del rebuig..."
                required
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMostrarModalRechazar(false);
                  setMotivo('');
                  router.replace(`/empresa/presupuestos/${presupuestoId}`);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel·lar
              </button>
              <button
                onClick={handleRechazar}
                disabled={procesandoAccion || !motivo.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {procesandoAccion ? 'Processant...' : 'Rebutjar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}