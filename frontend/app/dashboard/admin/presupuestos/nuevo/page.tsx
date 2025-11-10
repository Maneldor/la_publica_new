'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Empresa {
  id: string;
  name: string;
  email: string;
}

interface Extra {
  id: string;
  nombre: string;
  descripcion: string | null;
  categoria: string;
  precio: number;
}

interface Item {
  featureExtraId: string | null;
  concepto: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
}

function NuevoPresupuestoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const solicitudId = searchParams.get('solicitudId');

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  // Datos del presupuesto
  const [empresaId, setEmpresaId] = useState('');
  const [concepto, setConcepto] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [descuento, setDescuento] = useState(0);
  const [iva, setIva] = useState(21);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Cargar empresas y extras desde las APIs que ya existen
      const [empresasRes, extrasRes] = await Promise.all([
        fetch('/api/admin/solicitudes'), // Asumiendo que devuelve empresas
        fetch('/api/empresa/extras') // Reutilizar API de extras
      ]);

      if (extrasRes.ok) {
        const extrasData = await extrasRes.json();
        setExtras(extrasData.extras || []);
      }

      // Mock para empresas si no hay API específica
      setEmpresas([
        { id: '1', name: 'Empresa Demo 1', email: 'demo1@example.com' },
        { id: '2', name: 'Empresa Demo 2', email: 'demo2@example.com' }
      ]);

    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const agregarItem = () => {
    setItems([...items, {
      featureExtraId: null,
      concepto: '',
      descripcion: '',
      cantidad: 1,
      precioUnitario: 0,
      total: 0
    }]);
  };

  const agregarItemDesdeExtra = (extra: Extra) => {
    const nuevoItem: Item = {
      featureExtraId: extra.id,
      concepto: extra.nombre,
      descripcion: extra.descripcion || '',
      cantidad: 1,
      precioUnitario: extra.precio,
      total: extra.precio
    };
    setItems([...items, nuevoItem]);
  };

  const actualizarItem = (index: number, campo: keyof Item, valor: any) => {
    const nuevosItems = [...items];
    nuevosItems[index] = { ...nuevosItems[index], [campo]: valor };

    // Recalcular total del item
    if (campo === 'cantidad' || campo === 'precioUnitario') {
      nuevosItems[index].total = nuevosItems[index].cantidad * nuevosItems[index].precioUnitario;
    }

    setItems(nuevosItems);
  };

  const eliminarItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calcularSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const calcularTotal = () => {
    const subtotal = calcularSubtotal();
    const descuentoAmount = (subtotal * descuento) / 100;
    const subtotalConDescuento = subtotal - descuentoAmount;
    const ivaAmount = (subtotalConDescuento * iva) / 100;
    return subtotalConDescuento + ivaAmount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!empresaId) {
      alert('Selecciona una empresa');
      return;
    }

    if (items.length === 0) {
      alert('Agrega al menos un ítem al presupuesto');
      return;
    }

    if (!concepto.trim()) {
      alert('Introduce un concepto para el presupuesto');
      return;
    }

    try {
      setEnviando(true);

      const presupuestoData = {
        empresaId,
        concepto: concepto.trim(),
        observaciones: observaciones.trim() || undefined,
        subtotal: calcularSubtotal(),
        descuento,
        iva,
        total: calcularTotal(),
        items: items.map(item => ({
          featureExtraId: item.featureExtraId || undefined,
          concepto: item.concepto,
          descripcion: item.descripcion || undefined,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          total: item.total
        })),
        solicitudId: solicitudId || undefined
      };

      const response = await fetch('/api/admin/presupuestos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(presupuestoData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear presupuesto');
      }

      const data = await response.json();

      alert('Pressupost creat correctament!');
      router.push(`/dashboard/admin/presupuestos/${data.presupuesto?.id || data.id}`);

    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'Error al crear el presupuesto');
    } finally {
      setEnviando(false);
    }
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
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Nou Pressupost
        </h1>
        <p className="text-gray-600">
          Crea un pressupost personalitzat per a un client
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos básicos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Informació Bàsica
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Empresa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empresa *
              </label>
              <select
                value={empresaId}
                onChange={(e) => setEmpresaId(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="">Selecciona una empresa</option>
                {empresas.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Concepto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Concepte *
              </label>
              <input
                type="text"
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                required
                placeholder="Ex: Contractació d'extras premium"
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
          </div>

          {/* Observaciones */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observacions
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={3}
              placeholder="Notes o comentaris addicionals..."
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
        </div>

        {/* Items del presupuesto */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Ítems del Pressupost
            </h2>
            <button
              type="button"
              onClick={agregarItem}
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
            >
              + Afegir Ítem
            </button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hi ha ítems. Afegeix ítems manualment o des de la llista d'extras.
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-md p-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    {/* Concepto */}
                    <div className="md:col-span-4">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Concepte
                      </label>
                      <input
                        type="text"
                        value={item.concepto}
                        onChange={(e) => actualizarItem(index, 'concepto', e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                      />
                    </div>

                    {/* Cantidad */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Quantitat
                      </label>
                      <input
                        type="number"
                        value={item.cantidad}
                        onChange={(e) => actualizarItem(index, 'cantidad', parseInt(e.target.value) || 1)}
                        min="1"
                        required
                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                      />
                    </div>

                    {/* Precio Unitario */}
                    <div className="md:col-span-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Preu Unitari
                      </label>
                      <input
                        type="number"
                        value={item.precioUnitario}
                        onChange={(e) => actualizarItem(index, 'precioUnitario', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        required
                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                      />
                    </div>

                    {/* Total */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Total
                      </label>
                      <div className="w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-50 font-medium">
                        {formatCurrency(item.total)}
                      </div>
                    </div>

                    {/* Eliminar */}
                    <div className="md:col-span-1 flex items-end">
                      <button
                        type="button"
                        onClick={() => eliminarItem(index)}
                        className="w-full px-3 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totales */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Càlculs
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Subtotal:</span>
              <span className="text-lg font-medium">
                {formatCurrency(calcularSubtotal())}
              </span>
            </div>

            <div className="flex justify-between items-center gap-4">
              <label className="text-gray-700">Descompte (%):</label>
              <input
                type="number"
                value={descuento}
                onChange={(e) => setDescuento(parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.1"
                className="w-32 border border-gray-300 rounded-md p-2"
              />
            </div>

            <div className="flex justify-between items-center gap-4">
              <label className="text-gray-700">IVA (%):</label>
              <input
                type="number"
                value={iva}
                onChange={(e) => setIva(parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.1"
                className="w-32 border border-gray-300 rounded-md p-2"
              />
            </div>

            <div className="pt-3 border-t-2 border-gray-300">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900">TOTAL:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(calcularTotal())}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
          >
            Cancel·lar
          </button>
          <button
            type="submit"
            disabled={enviando}
            className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {enviando ? 'Creant...' : 'Crear Pressupost'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NuevoPresupuestoPage() {
  return (
    <Suspense fallback={
      <div className="p-6 max-w-6xl mx-auto animate-pulse">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>

        <div className="space-y-6">
          {/* Información básica skeleton */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="mt-4">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>

          {/* Items skeleton */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-md p-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-4">
                    <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                  <div className="md:col-span-3">
                    <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="h-3 bg-gray-200 rounded w-12 mb-2"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                  <div className="md:col-span-1">
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Totales skeleton */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-10 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-10 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="pt-3 border-t-2 border-gray-300">
                <div className="flex justify-between">
                  <div className="h-6 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-40"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Botones skeleton */}
          <div className="flex justify-end gap-3">
            <div className="h-10 bg-gray-200 rounded w-32"></div>
            <div className="h-10 bg-gray-200 rounded w-40"></div>
          </div>
        </div>
      </div>
    }>
      <NuevoPresupuestoContent />
    </Suspense>
  );
}