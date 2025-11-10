'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Extra {
  id: string;
  nombre: string;
  descripcion: string | null;
  categoria: string;
  precio: number;
  limitesJSON: string | null;
  activo: boolean;
}

interface ExtraContratado {
  id: string;
  featureExtraId: string;
  activo: boolean;
}

const CATEGORIAS: Record<string, { nombre: string; icono: string; descripcion: string }> = {
  // PLAN EMPRESARIAL - RECURSOS TÉCNICOS
  storage: { nombre: 'Emmagatzematge', icono: '💾', descripcion: 'Amplia el teu espai d\'emmagatzematge' },
  users: { nombre: 'Usuaris', icono: '👥', descripcion: 'Més membres per al teu equip' },
  ia: { nombre: 'Intel·ligència Artificial', icono: '🤖', descripcion: 'Agents IA per automatització' },
  features: { nombre: 'Funcionalitats', icono: '⚡', descripcion: 'Característiques avançades' },
  support: { nombre: 'Suport', icono: '🎧', descripcion: 'Atenció prioritària' },
  security: { nombre: 'Seguretat', icono: '🔒', descripcion: 'Protecció avançada' },
  content: { nombre: 'Contingut', icono: '📄', descripcion: 'Templates i recursos' },

  // SERVICIOS PROFESIONALES
  branding: { nombre: 'Branding i Disseny', icono: '🎨', descripcion: 'Identitat corporativa' },
  web: { nombre: 'Desenvolupament Web', icono: '🌐', descripcion: 'Llocs web i portals' },
  rrss: { nombre: 'Xarxes Socials', icono: '📱', descripcion: 'Gestió de RRSS' },
  automation: { nombre: 'Automatització', icono: '⚙️', descripcion: 'Workflows automàtics' },
  programming: { nombre: 'Programació', icono: '💻', descripcion: 'Desenvolupament a mida' },
  training: { nombre: 'Formació', icono: '🎓', descripcion: 'Capacitació professional' },
  consulting: { nombre: 'Consultoria', icono: '📊', descripcion: 'Assessorament estratègic' },

  // PUBLICIDAD Y VISIBILIDAD
  advertising: { nombre: 'Publicitat', icono: '📢', descripcion: 'Campanyes publicitàries' },
  visibility: { nombre: 'Visibilitat Premium', icono: '👁️', descripcion: 'Destaca a la plataforma' },
  events: { nombre: 'Events i Webinars', icono: '🎪', descripcion: 'Esdeveniments corporatius' },

  // CONTENIDO Y MARKETING
  'sponsored-content': { nombre: 'Contingut Patrocinat', icono: '📰', descripcion: 'Articles i casos d\'èxit' },
  community: { nombre: 'Presència en Comunitats', icono: '💬', descripcion: 'Grups i fòrums' },
  'lead-generation': { nombre: 'Captació de Leads', icono: '🎯', descripcion: 'Generació de contactes' },

  // RECURSOS HUMANOS
  recruitment: { nombre: 'Reclutament', icono: '👔', descripcion: 'Selecció de personal' },
  'employer-branding': { nombre: 'Employer Branding', icono: '🏢', descripcion: 'Atracció de talent' },

  // DATOS Y ANÁLISIS
  analytics: { nombre: 'Analítiques', icono: '📊', descripcion: 'Informes i dashboards' },
  research: { nombre: 'Estudis de Mercat', icono: '🔍', descripcion: 'Investigació' },

  // OTROS
  packages: { nombre: 'Paquets d\'Ofertes', icono: '📦', descripcion: 'Packs amb descompte' },
  integrations: { nombre: 'Integracions', icono: '🔌', descripcion: 'Connexions amb sistemes' },
  education: { nombre: 'Formació Corporativa', icono: '🎓', descripcion: 'Programes formatius' }
};

export default function ExtrasEmpresaPage() {
  const { data: session } = useSession();
  const [extras, setExtras] = useState<Extra[]>([]);
  const [extrasContratados, setExtrasContratados] = useState<ExtraContratado[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('');
  const [busqueda, setBusqueda] = useState('');
  const [modalExtra, setModalExtra] = useState<Extra | null>(null);
  const [modalSolicitud, setModalSolicitud] = useState(false);
  const [extrasSeleccionados, setExtrasSeleccionados] = useState<string[]>([]);
  const [mensajeSolicitud, setMensajeSolicitud] = useState('');
  const [telefonoSolicitud, setTelefonoSolicitud] = useState('');
  const [enviandoSolicitud, setEnviandoSolicitud] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      // Cargar extras disponibles con indicador de contratación
      const resExtras = await fetch('/api/empresa/extras');
      if (resExtras.ok) {
        const dataExtras = await resExtras.json();
        setExtras(dataExtras.extras || []);

        // Actualizar extras contratados basado en el indicador
        const contratados = dataExtras.extras
          .filter((e: any) => e.contratado)
          .map((e: any) => ({
            id: e.id,
            featureExtraId: e.id,
            activo: true
          }));
        setExtrasContratados(contratados);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const estaContratado = (extraId: string) => {
    return extrasContratados.some(
      ec => ec.featureExtraId === extraId && ec.activo
    );
  };

  const abrirModalSolicitud = (extra?: Extra) => {
    if (extra) {
      setExtrasSeleccionados([extra.id]);
    }
    setModalExtra(null);
    setModalSolicitud(true);
  };

  const toggleExtraSeleccionado = (extraId: string) => {
    setExtrasSeleccionados(prev =>
      prev.includes(extraId)
        ? prev.filter(id => id !== extraId)
        : [...prev, extraId]
    );
  };

  const enviarSolicitud = async () => {
    if (extrasSeleccionados.length === 0) {
      alert('Selecciona al menos un extra para solicitar información');
      return;
    }

    if (!mensajeSolicitud.trim()) {
      alert('Escriu un missatge explicant les teves necessitats');
      return;
    }

    setEnviandoSolicitud(true);

    try {
      const response = await fetch('/api/empresa/solicitudes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          extrasIds: extrasSeleccionados,
          mensaje: mensajeSolicitud,
          telefono: telefonoSolicitud
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Sol·licitud enviada correctament! Ens posarem en contacte aviat.');
        setModalSolicitud(false);
        setExtrasSeleccionados([]);
        setMensajeSolicitud('');
        setTelefonoSolicitud('');
      } else {
        alert(data.error || 'Error al enviar la sol·licitud');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al enviar la sol·licitud');
    } finally {
      setEnviandoSolicitud(false);
    }
  };

  const formatPrecio = (precio: number) => {
    return new Intl.NumberFormat('ca-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(precio);
  };

  // Filtrar extras
  const extrasFiltrados = extras.filter(extra => {
    const matchBusqueda = extra.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                         (extra.descripcion && extra.descripcion.toLowerCase().includes(busqueda.toLowerCase()));
    const matchCategoria = !categoriaSeleccionada || extra.categoria === categoriaSeleccionada;
    return matchBusqueda && matchCategoria;
  });

  // Agrupar por categoría
  const extrasPorCategoria = extrasFiltrados.reduce((acc, extra) => {
    if (!acc[extra.categoria]) {
      acc[extra.categoria] = [];
    }
    acc[extra.categoria].push(extra);
    return acc;
  }, {} as Record<string, Extra[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregant catàleg...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Catàleg d'Extras i Serveis</h1>
            <p className="text-gray-600 mt-2">
              Amplia les capacitats del teu pla amb serveis professionals i funcionalitats extra
            </p>
          </div>
          <button
            onClick={() => abrirModalSolicitud()}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-colors shadow-lg"
          >
            📝 Sol·licitar Múltiples Serveis
          </button>
        </div>
      </div>

      {/* Enlaces rápidos */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">✨</div>
            <div>
              <p className="font-semibold text-gray-900">Tens extras contractats</p>
              <p className="text-sm text-gray-600">
                Actualment tens {extrasContratados.filter(e => e.activo).length} extra(s) actiu(s)
              </p>
            </div>
          </div>
          <Link
            href="/empresa/extras/contratados"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Veure els meus extras
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cercar per nom
              </label>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Nom del servei..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar per categoria
              </label>
              <select
                value={categoriaSeleccionada}
                onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Totes les categories</option>
                {Object.entries(CATEGORIAS).map(([key, cat]) => (
                  <option key={key} value={key}>
                    {cat.icono} {cat.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Catálogo por categorías */}
      <div className="max-w-7xl mx-auto space-y-8">
        {Object.entries(extrasPorCategoria)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([categoria, extrasCategoria]) => {
            const catInfo = CATEGORIAS[categoria];

            return (
              <div key={categoria} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{catInfo?.icono}</div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {catInfo?.nombre || categoria}
                      </h2>
                      <p className="text-sm text-gray-600">{catInfo?.descripcion}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {extrasCategoria.map(extra => {
                      const contratado = estaContratado(extra.id);

                      return (
                        <div
                          key={extra.id}
                          className={`border rounded-lg p-4 transition-all ${
                            contratado
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                          }`}
                        >
                          {contratado && (
                            <div className="mb-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-600 text-white">
                                ✓ Contractat
                              </span>
                            </div>
                          )}

                          <h3 className="font-semibold text-gray-900 mb-2">
                            {extra.nombre}
                          </h3>

                          {extra.descripcion && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {extra.descripcion}
                            </p>
                          )}

                          <div className="flex items-center justify-between mt-4">
                            <span className="text-lg font-bold text-blue-600">
                              {formatPrecio(extra.precio)}/mes
                            </span>

                            <button
                              onClick={() => setModalExtra(extra)}
                              className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-semibold text-sm transition-colors"
                            >
                              Veure més
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Modal detalle */}
      {modalExtra && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {modalExtra.nombre}
                </h2>
                <button
                  onClick={() => setModalExtra(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                  {CATEGORIAS[modalExtra.categoria]?.icono} {CATEGORIAS[modalExtra.categoria]?.nombre}
                </span>

                <p className="text-gray-700 mb-4">
                  {modalExtra.descripcion || 'Sense descripció disponible'}
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-2">Preu mensual:</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {formatPrecio(modalExtra.precio)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    IVA no inclòs
                  </p>
                </div>

                {modalExtra.limitesJSON && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Què inclou:
                    </p>
                    <div className="text-sm text-gray-600">
                      {JSON.parse(modalExtra.limitesJSON).maxStorage && (
                        <p>💾 +{JSON.parse(modalExtra.limitesJSON).maxStorage}GB d'emmagatzematge</p>
                      )}
                      {JSON.parse(modalExtra.limitesJSON).maxUsuarios && (
                        <p>👥 +{JSON.parse(modalExtra.limitesJSON).maxUsuarios} usuaris</p>
                      )}
                      {JSON.parse(modalExtra.limitesJSON).maxAgentsIA && (
                        <p>🤖 +{JSON.parse(modalExtra.limitesJSON).maxAgentsIA} agents IA</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => abrirModalSolicitud(modalExtra)}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Sol·licitar Informació
                </button>
                <button
                  onClick={() => setModalExtra(null)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Tancar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal solicitud múltiple */}
      {modalSolicitud && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Sol·licitar Informació d'Extras
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Selecciona els serveis que t'interessen i envia'ns una sol·licitud personalitzada
                  </p>
                </div>
                <button
                  onClick={() => setModalSolicitud(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Selección de extras por categoría */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Selecciona els serveis que t'interessen:
                </h3>

                <div className="space-y-6">
                  {Object.entries(extrasPorCategoria)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([categoria, extrasCategoria]) => {
                      const catInfo = CATEGORIAS[categoria];
                      const extrasSeleccionadosCategoria = extrasCategoria.filter(e =>
                        extrasSeleccionados.includes(e.id)
                      ).length;

                      return (
                        <div key={categoria} className="border rounded-lg overflow-hidden">
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 border-b">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="text-2xl">{catInfo?.icono}</div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">
                                    {catInfo?.nombre || categoria}
                                  </h4>
                                  <p className="text-sm text-gray-600">{catInfo?.descripcion}</p>
                                </div>
                              </div>
                              {extrasSeleccionadosCategoria > 0 && (
                                <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                                  {extrasSeleccionadosCategoria} seleccionat{extrasSeleccionadosCategoria > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {extrasCategoria.map(extra => (
                                <div
                                  key={extra.id}
                                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                                    extrasSeleccionados.includes(extra.id)
                                      ? 'border-blue-500 bg-blue-50'
                                      : 'border-gray-200 hover:border-blue-300'
                                  }`}
                                  onClick={() => toggleExtraSeleccionado(extra.id)}
                                >
                                  <div className="flex items-start gap-3">
                                    <input
                                      type="checkbox"
                                      checked={extrasSeleccionados.includes(extra.id)}
                                      onChange={() => toggleExtraSeleccionado(extra.id)}
                                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <div className="flex-1">
                                      <h5 className="font-semibold text-gray-900">{extra.nombre}</h5>
                                      {extra.descripcion && (
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                          {extra.descripcion}
                                        </p>
                                      )}
                                      <p className="text-sm font-bold text-blue-600 mt-2">
                                        {formatPrecio(extra.precio)}/mes
                                      </p>
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
              </div>

              {/* Resumen selección */}
              {extrasSeleccionados.length > 0 && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Resum de la selecció ({extrasSeleccionados.length} servei{extrasSeleccionados.length > 1 ? 's' : ''})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {extrasSeleccionados.map(extraId => {
                      const extra = extras.find(e => e.id === extraId);
                      return extra ? (
                        <span
                          key={extraId}
                          className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-full"
                        >
                          {extra.nombre}
                          <button
                            onClick={() => toggleExtraSeleccionado(extraId)}
                            className="ml-2 hover:bg-blue-700 rounded-full p-0.5"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Formulario de solicitud */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Missatge (obligatori) *
                  </label>
                  <textarea
                    value={mensajeSolicitud}
                    onChange={(e) => setMensajeSolicitud(e.target.value)}
                    placeholder="Explica'ns les teves necessitats, terminis, pressupost aproximat, objectius..."
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Quanta més informació ens proporcionis, millor podrem ajudar-te
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telèfon de contacte (opcional)
                  </label>
                  <input
                    type="tel"
                    value={telefonoSolicitud}
                    onChange={(e) => setTelefonoSolicitud(e.target.value)}
                    placeholder="+34 600 000 000"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Per poder contactar-te més ràpidament si cal
                  </p>
                </div>
              </div>

              {/* Información adicional */}
              <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-3">
                  <div className="text-yellow-600 text-xl">💡</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Què passarà després?</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Rebràs una confirmació immediata de la teva sol·licitud</li>
                      <li>• El nostre equip revisarà les teves necessitats en menys de 24h</li>
                      <li>• Et contactarem per telèfon o email amb una proposta personalitzada</li>
                      <li>• Si cal, programarem una reunió per afinar els detalls</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  onClick={enviarSolicitud}
                  disabled={enviandoSolicitud || extrasSeleccionados.length === 0 || !mensajeSolicitud.trim()}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enviandoSolicitud ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Enviant...
                    </div>
                  ) : (
                    `Enviar Sol·licitud${extrasSeleccionados.length > 0 ? ` (${extrasSeleccionados.length} servei${extrasSeleccionados.length > 1 ? 's' : ''})` : ''}`
                  )}
                </button>
                <button
                  onClick={() => setModalSolicitud(false)}
                  disabled={enviandoSolicitud}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel·lar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}