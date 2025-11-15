'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PlanLimitsSection from '@/app/components/PlanLimitsSection';

interface PlanInfo {
  company: {
    id: string;
    name: string;
  };
  plan: {
    id: string;
    name: string;
    tier: string;
    slug: string;
    basePrice: number;
    precioMensual: number;
    precioAnual: number;
    firstYearDiscount: number;
    funcionalidades: string;
    limits: {
      maxActiveOffers: number;
      maxTeamMembers: number;
      maxFeaturedOffers: number;
      maxStorage: number;
    };
  };
  subscription: {
    id: string;
    status: string;
    startDate: string;
    endDate: string;
    precioMensual: number;
    precioAnual: number;
    isInTrial: boolean;
    daysRemaining: number;
    trialEndsAt: string | null;
  } | null;
  usage: {
    activeOffers: number;
    teamMembers: number;
    featuredOffers: number;
    storage: number;
  };
  canUpgrade: boolean;
}

interface Limits {
  activeOffers: {
    current: number;
    limit: number;
    remaining: number;
    percentage: number;
    status: string;
    label: string;
  };
  teamMembers: {
    current: number;
    limit: number;
    remaining: number;
    percentage: number;
    status: string;
    label: string;
  };
  featuredOffers: {
    current: number;
    limit: number;
    remaining: number;
    percentage: number;
    status: string;
    label: string;
  };
  storage: {
    current: number;
    limit: number;
    remaining: number;
    percentage: number;
    status: string;
    label: string;
  };
}

export default function MiPlanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      cargarDatos();
    }
  }, [status]);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar info del plan
      const resPlan = await fetch('/api/empresa/plan');
      const dataPlan = await resPlan.json();

      if (dataPlan.success) {
        setPlanInfo(dataPlan.data);
      }


    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };


  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregant el teu pla...</p>
        </div>
      </div>
    );
  }

  if (!planInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No s'ha pogut carregar la informació del pla.</p>
          <button
            onClick={() => cargarDatos()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tornar a intentar
          </button>
        </div>
      </div>
    );
  }

  const isTrialEnding = planInfo.subscription?.isInTrial &&
    planInfo.subscription?.daysRemaining <= 30;

  const funcionalitats = planInfo.plan.funcionalidades
    ? planInfo.plan.funcionalidades.split('\n').filter(f => f.trim().length > 0)
    : [];

  // DEBUG temporal
  console.log('🔍 DEBUG Funcionalidades:');
  console.log('Raw:', planInfo.plan.funcionalidades);
  console.log('Array:', funcionalitats);
  console.log('Length:', funcionalitats.length);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          El meu pla
        </h1>
        <p className="text-gray-600">
          Gestiona la teva subscripció i revisa l'ús dels recursos
        </p>
      </div>

      {/* Alert Trial Ending */}
      {isTrialEnding && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>El teu període de prova finalitza en {planInfo.subscription?.daysRemaining} dies.</strong>
                {' '}Actualitza el teu pla per continuar gaudint de tots els beneficis.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Columna Izquierda: Info del Plan */}
        <div className="lg:col-span-2 space-y-6">

          {/* Card Plan Actual */}
          <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Pla Actual</p>
                  <h2 className="text-3xl font-bold mb-2">{planInfo.plan.name}</h2>
                  <span className="inline-flex px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                    {planInfo.plan.tier}
                  </span>
                </div>
                {planInfo.subscription?.isInTrial && (
                  <div className="bg-green-500 px-3 py-1 rounded-full">
                    <span className="text-white text-xs font-bold">PROVA GRATUÏTA</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-blue-500/30">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">
                    {planInfo.subscription?.isInTrial
                      ? 'GRATIS'
                      : `${planInfo.plan.basePrice * (1 - (planInfo.plan.firstYearDiscount || 0))}€`
                    }
                  </span>
                  {!planInfo.subscription?.isInTrial && (
                    <span className="ml-2 text-blue-100">/any</span>
                  )}
                </div>
                {planInfo.subscription?.isInTrial && planInfo.subscription.trialEndsAt && (
                  <p className="text-blue-100 text-sm mt-1">
                    Finalitza el {new Date(planInfo.subscription.trialEndsAt).toLocaleDateString('ca-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                )}
                {!planInfo.subscription?.isInTrial && planInfo.plan.firstYearDiscount > 0 && (
                  <p className="text-blue-100 text-xs mt-2">
                    Preu original: {planInfo.plan.basePrice}€/any
                    ({(planInfo.plan.firstYearDiscount * 100).toFixed(0)}% descompte per a noves empreses)
                  </p>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Data inici</p>
                  <p className="font-medium text-gray-900">
                    {planInfo.subscription ? new Date(planInfo.subscription.startDate).toLocaleDateString('ca-ES') : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">
                    {planInfo.subscription?.isInTrial ? 'Fi del trial' : 'Renovació'}
                  </p>
                  <p className="font-medium text-gray-900">
                    {planInfo.subscription ? new Date(planInfo.subscription.endDate).toLocaleDateString('ca-ES') : '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Funcionalidades */}
            <div className="px-6 py-5 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Funcionalitats incloses</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                {funcionalitats.map((func, idx) => (
                  <li key={idx} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{func}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Ús de recursos - Usando componente con API real */}
          <PlanLimitsSection />

        </div>

        {/* Columna Derecha: Actions */}
        <div className="space-y-6">

          {/* Card Upgrade */}
          {planInfo.canUpgrade && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  Millora el teu pla
                </h4>
                <p className="text-sm text-gray-600 mb-6">
                  Accedeix a més funcionalitats, augmenta els teus límits i impulsa el creixement de la teva empresa
                </p>
                <button
                  onClick={() => router.push('/empresa/plans')}
                  className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                  Veure plans superiors
                </button>
              </div>
            </div>
          )}

          {/* Card Información */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Informació</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">Renovació automàtica</p>
                  <p className="text-gray-600 mt-0.5">
                    {planInfo.subscription?.isInTrial
                      ? 'El teu pla es renovarà automàticament quan finalitzi el període de prova'
                      : 'El teu pla es renovarà automàticament cada any'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <svg className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">Mètode de pagament</p>
                  <p className="text-gray-600 mt-0.5">
                    Targeta que acaba en ••••
                  </p>
                  <a href="#" className="text-blue-600 hover:text-blue-700 text-xs mt-1 inline-block">
                    Actualitzar
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Card Soporte */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Necessites ajuda?</h4>
            <div className="space-y-3 text-sm">
              <a href="#" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Contactar amb suport
              </a>
              <a href="#" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Centre d'ajuda
              </a>
              <a href="#" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Documentació
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}