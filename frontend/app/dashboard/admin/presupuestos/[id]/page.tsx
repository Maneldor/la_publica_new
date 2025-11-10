'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

export default function PresupuestoDetallePage() {
  const params = useParams();
  const router = useRouter();
  const presupuestoId = params.id as string;

  const [presupuesto, setPresupuesto] = useState<PresupuestoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [procesandoAccion, setProcesandoAccion] = useState(false);

  useEffect(() => {
    fetchPresupuesto();
  }, [presupuestoId]);

  const fetchPresupuesto = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/presupuestos/${presupuestoId}`);

      if (!response.ok) {
        if (response.status === 404) {
          alert('Presupuesto no encontrado');
          router.push('/dashboard/admin/presupuestos');
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

  const ejecutarAccion = async (accion: string, confirmarTexto: string) => {
    if (!confirm(`¿Estás seguro de que quieres ${confirmarTexto.toLowerCase()} este presupuesto?`)) {
      return;
    }

    try {
      setProcesandoAccion(true);
      const response = await fetch(`/api/admin/presupuestos/${presupuestoId}/${accion}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error al ${confirmarTexto.toLowerCase()}`);
      }

      alert(`Presupuesto ${confirmarTexto.toLowerCase()} correctamente!`);
      fetchPresupuesto(); // Recargar datos
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || `Error al ${confirmarTexto.toLowerCase()} el presupuesto`);
    } finally {
      setProcesandoAccion(false);
    }
  };

  const handleEnviar = () => ejecutarAccion('enviar', 'Enviar');
  const handleAprobar = () => ejecutarAccion('aprobar', 'Aprobar');
  const handleRechazar = () => ejecutarAccion('rechazar', 'Rechazar');
  const handleActivar = () => ejecutarAccion('activar', 'Activar');
  const handleFacturar = () => ejecutarAccion('facturar', 'Facturar');

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
    if (!presupuesto) return null;

    const { estado } = presupuesto;
    const botones = [];

    switch (estado) {
      case 'BORRADOR':
        botones.push(
          <button
            key="enviar"
            onClick={handleEnviar}
            disabled={procesandoAccion}
            className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            Enviar a Empresa
          </button>
        );
        break;

      case 'ENVIADO':
        botones.push(
          <button
            key="aprobar"
            onClick={handleAprobar}
            disabled={procesandoAccion}
            className="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 disabled:opacity-50"
          >
            Aprovar
          </button>
        );
        botones.push(
          <button
            key="rechazar"
            onClick={handleRechazar}
            disabled={procesandoAccion}
            className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 disabled:opacity-50"
          >
            Rebutjar
          </button>
        );
        break;

      case 'APROBADO':
        botones.push(
          <button
            key="activar"
            onClick={handleActivar}
            disabled={procesandoAccion}
            className="px-4 py-2 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 disabled:opacity-50"
          >
            Activar Extras
          </button>
        );
        break;

      case 'ACTIVO':
        botones.push(
          <button
            key="facturar"
            onClick={handleFacturar}
            disabled={procesandoAccion}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-700 disabled:opacity-50"
          >
            Generar Factura
          </button>
        );
        break;
    }

    return botones;
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
          href="/dashboard/admin/presupuestos"
          className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
        >
          Volver a Presupuestos
        </Link>
      </div>
    );
  }

  return (
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
            href="/dashboard/admin/presupuestos"
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
                  Empresa
                </label>
                <p className="text-sm text-gray-900 font-medium">
                  {presupuesto.empresa.name}
                </p>
                <p className="text-xs text-gray-500">
                  {presupuesto.empresa.email}
                </p>
                {presupuesto.empresa.telefono && (
                  <p className="text-xs text-gray-500">
                    📞 {presupuesto.empresa.telefono}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Creado por
                </label>
                <p className="text-sm text-gray-900 font-medium">
                  {presupuesto.creador.name}
                </p>
                <p className="text-xs text-gray-500">
                  {presupuesto.creador.email}
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
              Ítems del Pressupost
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
  );
}