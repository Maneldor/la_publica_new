'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface PlanLimites {
  maxUsuarios: number;
  maxStorage: number;
  maxDocumentos: number;
  maxOfertas: number;
}

interface Plan {
  id: string;
  planType: string;
  nombre: string;
  nombreCorto: string;
  descripcion: string;
  precioMensual: number;
  precioAnual: number | null;
  limitesJSON: string;
  caracteristicas: string;
  color: string;
  icono: string;
  destacado: boolean;
  activo: boolean;
  visible: boolean;
}

interface Company {
  id: string;
  name: string;
  currentPlanId: string | null;
}

interface ApiResponse {
  plans: Plan[];
  currentPlan: Plan | null;
  currentSubscription: any;
  company: Company;
}

export default function EmpresaPlaPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      cargarPlanes();
    } else if (status === 'unauthenticated') {
      setError('Debes iniciar sesión para ver los planes');
      setLoading(false);
    }
  }, [status]);

  const cargarPlanes = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/company/plans');

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('No perteneces a ninguna empresa');
        }
        throw new Error('Error al cargar los planes');
      }

      const data: ApiResponse = await response.json();

      setPlans(data.plans);
      setCurrentPlan(data.currentPlan);
      setCompany(data.company);

    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const getColorClasses = (color: string, isActive: boolean) => {
    const opacity = isActive ? '100' : '50';
    return {
      border: `border-[${color}]`,
      bg: `bg-[${color}]/10`,
      text: `text-[${color}]`,
      opacity: `opacity-${opacity}`
    };
  };

  const parseLimites = (limitesJSON: string): PlanLimites => {
    try {
      return JSON.parse(limitesJSON);
    } catch {
      return {
        maxUsuarios: 0,
        maxStorage: 0,
        maxDocumentos: 0,
        maxOfertas: 0
      };
    }
  };

  const parseCaracteristicas = (caracteristicas: string): string[] => {
    try {
      return JSON.parse(caracteristicas);
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregant plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Plans de Subscripció
          </h1>
          <p className="text-xl text-gray-600">
            Tria el pla que millor s'adapti a les necessitats de la teva empresa
          </p>
        </div>

        {/* Plan Actual Alert */}
        {currentPlan && company && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">{currentPlan.icono}</span>
              <div>
                <p className="text-sm text-blue-600 font-semibold">
                  Pla Actual de {company.name}
                </p>
                <p className="text-lg font-bold text-blue-900">
                  {currentPlan.nombre}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {plans.map((plan) => {
            const limites = parseLimites(plan.limitesJSON);
            const caracteristicas = parseCaracteristicas(plan.caracteristicas);
            const isCurrentPlan = currentPlan?.id === plan.id;
            const colors = getColorClasses(plan.color, plan.activo);

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 ${
                  plan.destacado ? 'ring-2 ring-yellow-400' : ''
                } ${!plan.activo ? 'opacity-75' : ''}`}
              >
                {/* Badge Destacado */}
                {plan.destacado && (
                  <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1 rounded-bl-lg">
                    ⭐ Més Popular
                  </div>
                )}

                {/* Badge Plan Actual */}
                {isCurrentPlan && (
                  <div className="absolute top-0 left-0 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-br-lg">
                    ✓ Pla Actual
                  </div>
                )}

                {/* Header del Plan */}
                <div
                  className="pt-8 pb-6 px-6 text-center"
                  style={{
                    background: `linear-gradient(135deg, ${plan.color}15 0%, ${plan.color}05 100%)`
                  }}
                >
                  <div className="text-5xl mb-3">{plan.icono}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {plan.nombre}
                  </h3>
                  <p className="text-sm text-gray-500 uppercase tracking-wide">
                    {plan.planType}
                  </p>
                </div>

                {/* Precio */}
                <div className="px-6 py-4 text-center border-b border-gray-100">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.precioMensual}€
                    </span>
                    <span className="text-gray-500 ml-2">/mes</span>
                  </div>
                  {plan.precioAnual && (
                    <p className="text-sm text-gray-500 mt-1">
                      o {plan.precioAnual}€/any
                    </p>
                  )}
                </div>

                {/* Descripción */}
                <div className="px-6 py-4">
                  <p className="text-sm text-gray-600 text-center mb-4">
                    {plan.descripcion}
                  </p>

                  {/* Límites */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <span className="mr-2">👥</span>
                      <span className="text-gray-700">
                        {limites.maxUsuarios} usuaris
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="mr-2">💾</span>
                      <span className="text-gray-700">
                        {limites.maxStorage} GB
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="mr-2">📄</span>
                      <span className="text-gray-700">
                        {limites.maxDocumentos} documents
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="mr-2">🎁</span>
                      <span className="text-gray-700">
                        {limites.maxOfertas} ofertes
                      </span>
                    </div>
                  </div>

                  {/* Características */}
                  <div className="border-t border-gray-100 pt-4 space-y-2">
                    {caracteristicas.slice(0, 5).map((caracteristica, idx) => (
                      <div key={idx} className="flex items-start">
                        <span className="text-green-500 mr-2 mt-0.5">✓</span>
                        <span className="text-sm text-gray-600">
                          {caracteristica}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botón de Acción */}
                <div className="px-6 pb-6">
                  {isCurrentPlan ? (
                    <button
                      disabled
                      className="w-full py-3 px-4 bg-gray-100 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
                    >
                      Pla Actual
                    </button>
                  ) : plan.activo ? (
                    <button
                      className="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                      style={{
                        backgroundColor: plan.color,
                        color: 'white'
                      }}
                    >
                      Canviar a aquest Pla
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-3 px-4 bg-gray-100 text-gray-400 rounded-lg font-semibold cursor-not-allowed"
                    >
                      No Disponible
                    </button>
                  )}
                </div>

                {/* Badge Plan No Activo */}
                {!plan.activo && (
                  <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs font-bold text-center py-1">
                    Pla Desactivat
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tabla Comparativa */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Comparativa de Plans
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">
                    Característica
                  </th>
                  {plans.filter(p => p.activo).map((plan) => (
                    <th
                      key={plan.id}
                      className="text-center py-4 px-4 font-semibold"
                      style={{ color: plan.color }}
                    >
                      {plan.icono} {plan.nombreCorto}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Usuaris</td>
                  {plans.filter(p => p.activo).map((plan) => {
                    const limites = parseLimites(plan.limitesJSON);
                    return (
                      <td key={plan.id} className="text-center py-4 px-4">
                        {limites.maxUsuarios}
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Emmagatzematge</td>
                  {plans.filter(p => p.activo).map((plan) => {
                    const limites = parseLimites(plan.limitesJSON);
                    return (
                      <td key={plan.id} className="text-center py-4 px-4">
                        {limites.maxStorage} GB
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Documents</td>
                  {plans.filter(p => p.activo).map((plan) => {
                    const limites = parseLimites(plan.limitesJSON);
                    return (
                      <td key={plan.id} className="text-center py-4 px-4">
                        {limites.maxDocumentos}
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Ofertes</td>
                  {plans.filter(p => p.activo).map((plan) => {
                    const limites = parseLimites(plan.limitesJSON);
                    return (
                      <td key={plan.id} className="text-center py-4 px-4">
                        {limites.maxOfertas}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700 font-semibold">
                    Preu Mensual
                  </td>
                  {plans.filter(p => p.activo).map((plan) => (
                    <td
                      key={plan.id}
                      className="text-center py-4 px-4 font-bold"
                      style={{ color: plan.color }}
                    >
                      {plan.precioMensual}€
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Tens dubtes?
          </h2>
          <p className="text-gray-600 mb-6">
            El nostre equip està aquí per ajudar-te a triar el millor pla per a la teva empresa
          </p>
          <button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Contacta amb Nosaltres
          </button>
        </div>
      </div>
    </div>
  );
}