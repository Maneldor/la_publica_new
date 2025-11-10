'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ExtraContratado {
  id: string;
  featureExtraId: string;
  empresaId: string;
  activo: boolean;
  fechaActivacion: string;
  fechaVencimiento?: string;
  precioContratado: number;
  limitesContratados?: string;
  createdAt: string;
  featureExtra: {
    id: string;
    nombre: string;
    descripcion?: string;
    categoria: string;
    precio: number;
    limitesJSON?: string;
  };
}

const CATEGORIAS: Record<string, { nombre: string; icono: string }> = {
  storage: { nombre: 'Emmagatzematge', icono: '💾' },
  users: { nombre: 'Usuaris', icono: '👥' },
  ia: { nombre: 'Intel·ligència Artificial', icono: '🤖' },
  features: { nombre: 'Funcionalitats', icono: '⚡' },
  support: { nombre: 'Suport', icono: '🎧' },
  security: { nombre: 'Seguretat', icono: '🔒' },
  content: { nombre: 'Contingut', icono: '📄' },
  branding: { nombre: 'Branding i Disseny', icono: '🎨' },
  web: { nombre: 'Desenvolupament Web', icono: '🌐' },
  rrss: { nombre: 'Xarxes Socials', icono: '📱' },
  automation: { nombre: 'Automatització', icono: '⚙️' },
  programming: { nombre: 'Programació', icono: '💻' },
  training: { nombre: 'Formació', icono: '🎓' },
  consulting: { nombre: 'Consultoria', icono: '📊' },
};

export default function ExtrasContratadosPage() {
  const [extrasContratados, setExtrasContratados] = useState<ExtraContratado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarExtrasContratados();
  }, []);

  const cargarExtrasContratados = async () => {
    try {
      const response = await fetch('/api/empresa/extras/contratados');
      if (response.ok) {
        const data = await response.json();
        setExtrasContratados(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrecio = (precio: number) => {
    return new Intl.NumberFormat('ca-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(precio);
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('ca-ES');
  };

  const calcularTotalMensual = () => {
    return extrasContratados
      .filter(e => e.activo)
      .reduce((total, extra) => total + extra.precioContratado, 0);
  };

  const extrasActivos = extrasContratados.filter(e => e.activo);
  const extrasInactivos = extrasContratados.filter(e => !e.activo);

  // Agrupar por categoría
  const extrasAgrupadosPorCategoria = extrasActivos.reduce((acc, extra) => {
    const categoria = extra.featureExtra.categoria;
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(extra);
    return acc;
  }, {} as Record<string, ExtraContratado[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregant extras contractats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Els Meus Extras</h1>
            <p className="text-gray-600 mt-2">
              Gestiona els extras i serveis contractats per la teva empresa
            </p>
          </div>
          <Link
            href="/empresa/extras"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Explorar Catàleg
          </Link>
        </div>
      </div>

      {/* Resumen */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="text-3xl">✨</div>
              <div>
                <p className="text-sm text-gray-600">Extras Actius</p>
                <p className="text-2xl font-bold text-gray-900">{extrasActivos.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="text-3xl">💰</div>
              <div>
                <p className="text-sm text-gray-600">Cost Mensual</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatPrecio(calcularTotalMensual())}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="text-3xl">📊</div>
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.keys(extrasAgrupadosPorCategoria).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {extrasActivos.length === 0 ? (
        /* Estado vacío */
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Encara no tens extras contractats
            </h3>
            <p className="text-gray-600 mb-6">
              Explora el nostre catàleg d'extras i serveis per ampliar les capacitats del teu pla
            </p>
            <Link
              href="/empresa/extras"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Explorar Catàleg
            </Link>
          </div>
        </div>
      ) : (
        /* Lista de extras activos */
        <div className="max-w-7xl mx-auto space-y-8">
          {Object.entries(extrasAgrupadosPorCategoria)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([categoria, extras]) => {
              const catInfo = CATEGORIAS[categoria];

              return (
                <div key={categoria} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{catInfo?.icono}</div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {catInfo?.nombre || categoria}
                        </h2>
                        <p className="text-sm text-gray-600">
                          {extras.length} extra(s) contractat(s)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4">
                      {extras.map(extra => (
                        <div
                          key={extra.id}
                          className="border rounded-lg p-4 border-green-200 bg-green-50"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-gray-900">
                                  {extra.featureExtra.nombre}
                                </h3>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-600 text-white">
                                  ✓ Actiu
                                </span>
                              </div>

                              {extra.featureExtra.descripcion && (
                                <p className="text-sm text-gray-600 mb-3">
                                  {extra.featureExtra.descripcion}
                                </p>
                              )}

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500">Data contractació:</span>
                                  <p className="font-medium">{formatFecha(extra.createdAt)}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Data activació:</span>
                                  <p className="font-medium">{formatFecha(extra.fechaActivacion)}</p>
                                </div>
                                {extra.fechaVencimiento && (
                                  <div>
                                    <span className="text-gray-500">Data venciment:</span>
                                    <p className="font-medium">{formatFecha(extra.fechaVencimiento)}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="text-right ml-4">
                              <p className="text-2xl font-bold text-green-600">
                                {formatPrecio(extra.precioContratado)}
                              </p>
                              <p className="text-sm text-gray-500">per mes</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Extras inactivos (si los hay) */}
      {extrasInactivos.length > 0 && (
        <div className="max-w-7xl mx-auto mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Historial d'Extras</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="space-y-4">
                {extrasInactivos.map(extra => (
                  <div
                    key={extra.id}
                    className="border rounded-lg p-4 border-gray-200 bg-gray-50"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-700">
                            {extra.featureExtra.nombre}
                          </h3>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-500 text-white">
                            Inactiu
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Contractat el {formatFecha(extra.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-500">
                          {formatPrecio(extra.precioContratado)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}