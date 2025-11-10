'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Empresa {
  id: string;
  name: string;
  email: string;
  nombreFiscal: string | null;
  cif: string | null;
  direccionFiscal: string | null;
  ciudadFiscal: string | null;
  cpFiscal: string | null;
  provinciaFiscal: string | null;
}

interface Concepto {
  id: string;
  concepto: string;
  cantidad: number;
  precioUnit: number;
  descuento: number;
  subtotal: number;
}

export default function CrearFacturaPage() {
  const router = useRouter();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<Empresa | null>(null);
  const [conceptos, setConceptos] = useState<Concepto[]>([
    {
      id: '1',
      concepto: '',
      cantidad: 1,
      precioUnit: 0,
      descuento: 0,
      subtotal: 0
    }
  ]);
  const [porcentajeIVA, setPorcentajeIVA] = useState(21);
  const [diasVencimiento, setDiasVencimiento] = useState(15);
  const [observaciones, setObservaciones] = useState('');
  const [notasInternas, setNotasInternas] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const fetchEmpresas = async () => {
    try {
      const res = await fetch('/api/admin/empresas?activas=true');
      if (res.ok) {
        const data = await res.json();
        setEmpresas(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingEmpresas(false);
    }
  };

  const agregarConcepto = () => {
    setConceptos([...conceptos, {
      id: Date.now().toString(),
      concepto: '',
      cantidad: 1,
      precioUnit: 0,
      descuento: 0,
      subtotal: 0
    }]);
  };

  const eliminarConcepto = (id: string) => {
    if (conceptos.length > 1) {
      setConceptos(conceptos.filter(c => c.id !== id));
    }
  };

  const actualizarConcepto = (id: string, campo: string, valor: any) => {
    setConceptos(conceptos.map(c => {
      if (c.id === id) {
        const updated = { ...c, [campo]: valor };
        // Recalcular subtotal
        updated.subtotal = updated.cantidad * updated.precioUnit * (1 - updated.descuento / 100);
        return updated;
      }
      return c;
    }));
  };

  const calcularTotales = () => {
    const baseImponible = conceptos.reduce((sum, c) => sum + c.subtotal, 0);
    const importeIVA = baseImponible * (porcentajeIVA / 100);
    const total = baseImponible + importeIVA;
    return { baseImponible, importeIVA, total };
  };

  const handleSubmit = async (e: React.FormEvent, enviar = false) => {
    e.preventDefault();

    if (!empresaSeleccionada) {
      alert('Selecciona una empresa');
      return;
    }

    if (conceptos.some(c => !c.concepto || c.precioUnit === 0)) {
      alert('Completa tots els conceptes');
      return;
    }

    setLoading(true);

    try {
      const { baseImponible, importeIVA, total } = calcularTotales();
      const fechaEmision = new Date();
      const fechaVencimiento = new Date();
      fechaVencimiento.setDate(fechaVencimiento.getDate() + diasVencimiento);

      const res = await fetch('/api/admin/facturacion/facturas/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: empresaSeleccionada.id,
          conceptos: conceptos.map((c, idx) => ({
            concepto: c.concepto,
            cantidad: c.cantidad,
            precioUnit: c.precioUnit,
            descuento: c.descuento,
            subtotal: c.subtotal,
            orden: idx
          })),
          baseImponible,
          porcentajeIVA,
          importeIVA,
          total,
          fechaEmision,
          fechaVencimiento,
          observaciones,
          notasInternas,
          enviar // Si true, marca como ENVIADA en lugar de BORRADOR
        })
      });

      if (res.ok) {
        const factura = await res.json();
        alert(`Factura ${enviar ? 'creada i enviada' : 'guardada com a esborrany'} correctament`);
        router.push(`/dashboard/facturacio/facturas/${factura.id}`);
      } else {
        const error = await res.json();
        alert(error.message || 'Error al crear factura');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear factura');
    } finally {
      setLoading(false);
    }
  };

  const { baseImponible, importeIVA, total } = calcularTotales();

  if (loadingEmpresas) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div className="mb-8">
        <button
          onClick={() => router.push('/dashboard/facturacio/facturas')}
          className="text-blue-600 hover:text-blue-700 font-semibold mb-2 flex items-center gap-2"
        >
          ← Tornar a Factures
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Nova Factura</h1>
        <p className="text-gray-600 mt-1">
          Crea una factura manual per a una empresa
        </p>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">

        {/* Selección de empresa */}
        <div className="bg-white rounded-xl shadow border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Empresa Client</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecciona Empresa *
            </label>
            <select
              value={empresaSeleccionada?.id || ''}
              onChange={(e) => {
                const empresa = empresas.find(emp => emp.id === e.target.value);
                setEmpresaSeleccionada(empresa || null);
              }}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecciona una empresa...</option>
              {empresas.map((empresa) => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.name} - {empresa.email}
                </option>
              ))}
            </select>
          </div>

          {empresaSeleccionada && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Dades de Facturació</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Nom fiscal:</span>
                  <p className="font-medium">{empresaSeleccionada.nombreFiscal || empresaSeleccionada.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">CIF:</span>
                  <p className="font-medium">{empresaSeleccionada.cif || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Adreça:</span>
                  <p className="font-medium">{empresaSeleccionada.direccionFiscal || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Ciutat:</span>
                  <p className="font-medium">
                    {empresaSeleccionada.cpFiscal} {empresaSeleccionada.ciudadFiscal}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Conceptos */}
        <div className="bg-white rounded-xl shadow border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Conceptes</h2>
            <button
              type="button"
              onClick={agregarConcepto}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm"
            >
              + Afegir Concepte
            </button>
          </div>

          <div className="space-y-4">
            {conceptos.map((concepto, index) => (
              <div key={concepto.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 grid grid-cols-5 gap-3">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Concepte *
                      </label>
                      <input
                        type="text"
                        value={concepto.concepto}
                        onChange={(e) => actualizarConcepto(concepto.id, 'concepto', e.target.value)}
                        placeholder="Descripció del servei..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantitat
                      </label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={concepto.cantidad}
                        onChange={(e) => actualizarConcepto(concepto.id, 'cantidad', parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preu Unit. (€)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={concepto.precioUnit}
                        onChange={(e) => actualizarConcepto(concepto.id, 'precioUnit', parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dto. (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={concepto.descuento}
                        onChange={(e) => actualizarConcepto(concepto.id, 'descuento', parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="text-right pt-7">
                    <p className="text-sm text-gray-600 mb-1">Subtotal</p>
                    <p className="text-lg font-bold text-gray-900">
                      €{concepto.subtotal.toFixed(2)}
                    </p>
                    {conceptos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => eliminarConcepto(concepto.id)}
                        className="text-red-600 hover:text-red-700 text-sm mt-2"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configuración */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Configuració</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IVA (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={porcentajeIVA}
                  onChange={(e) => setPorcentajeIVA(parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dies de Venciment
                </label>
                <input
                  type="number"
                  min="0"
                  value={diasVencimiento}
                  onChange={(e) => setDiasVencimiento(parseInt(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Venciment: {new Date(Date.now() + diasVencimiento * 24 * 60 * 60 * 1000).toLocaleDateString('ca-ES')}
                </p>
              </div>
            </div>
          </div>

          {/* Totales */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow border border-blue-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Resum</h2>

            <div className="space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Base Imposable:</span>
                <span className="font-semibold">€{baseImponible.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>IVA ({porcentajeIVA}%):</span>
                <span className="font-semibold">€{importeIVA.toFixed(2)}</span>
              </div>
              <div className="border-t-2 border-blue-300 pt-3 flex justify-between text-gray-900">
                <span className="text-lg font-bold">TOTAL:</span>
                <span className="text-2xl font-bold text-blue-600">€{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notas */}
        <div className="bg-white rounded-xl shadow border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Notes</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observacions (visible al client)
              </label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={3}
                placeholder="Notes o comentaris per al client..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes Internes (només per a ús intern)
              </label>
              <textarea
                value={notasInternas}
                onChange={(e) => setNotasInternas(e.target.value)}
                rows={2}
                placeholder="Notes internes..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => router.push('/dashboard/facturacio/facturas')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg"
            disabled={loading}
          >
            Cancel·lar
          </button>
          <button
            type="submit"
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg"
            disabled={loading}
          >
            {loading ? 'Guardant...' : 'Guardar com a Esborrany'}
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg"
            disabled={loading}
          >
            {loading ? 'Creant...' : 'Crear i Enviar Factura'}
          </button>
        </div>

      </form>

    </div>
  );
}