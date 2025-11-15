'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PlanCard from '@/app/components/PlanCard';
import UpgradeModal from '@/app/components/UpgradeModal';
import toast from 'react-hot-toast';

interface Plan {
  id: string;
  name: string;
  tier: string;
  slug: string;
  basePrice: number;
  precioMensual: number;
  precioAnual: number;
  firstYearDiscount: number;
  funcionalidades: string;
  maxActiveOffers: number;
  maxTeamMembers: number;
  maxFeaturedOffers: number;
  maxStorage: number;
  destacado: boolean;
}

interface CurrentPlanInfo {
  company: {
    id: string;
    name: string;
  };
  plan: {
    id: string;
    name: string;
    tier: string;
  };
}

export default function ComparadorPlansPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState<CurrentPlanInfo | null>(null);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado para el modal de upgrade
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      cargarDatos();
    }
  }, [status]);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar plan actual
      const resCurrent = await fetch('/api/empresa/plan');
      const dataCurrent = await resCurrent.json();

      if (dataCurrent.success) {
        setCurrentPlan(dataCurrent.data);

        // Cargar todos los planes
        const resPlans = await fetch('/api/plans');
        const dataPlans = await resPlans.json();

        if (dataPlans.success) {
          // Filtrar solo planes superiores
          const currentTier = dataCurrent.data.plan.tier;
          const tierOrder = ['PIONERES', 'STANDARD', 'STRATEGIC', 'ENTERPRISE'];
          const currentIndex = tierOrder.indexOf(currentTier);

          const superiores = dataPlans.data.filter((p: Plan) => {
            const planIndex = tierOrder.indexOf(p.tier);
            return planIndex > currentIndex;
          }).sort((a: Plan, b: Plan) => {
            return tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier);
          });

          setAvailablePlans(superiores);
        }
      }

    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (planId: string) => {
    const planToUpgrade = availablePlans.find(p => p.id === planId);
    if (planToUpgrade) {
      setSelectedPlan(planToUpgrade);
      setShowUpgradeModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowUpgradeModal(false);
    setSelectedPlan(null);
  };

  const handleConfirmUpgrade = async () => {
    // Recargar datos tras upgrade exitoso
    await cargarDatos();
    toast.success('Pla actualitzat! Redirigint...');

    setTimeout(() => {
      router.push('/empresa/pla');
    }, 2000);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregant plans...</p>
        </div>
      </div>
    );
  }

  if (!currentPlan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No s'ha pogut carregar la informació del pla actual.</p>
          <button
            onClick={() => router.push('/empresa/pla')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tornar al meu pla
          </button>
        </div>
      </div>
    );
  }

  if (availablePlans.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Ja tens el pla màxim
          </h2>
          <p className="text-gray-600 mb-6">
            Actualment tens el pla <strong>{currentPlan.plan.name}</strong>, el més complet que oferim.
          </p>
          <button
            onClick={() => router.push('/empresa/pla')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tornar al meu pla
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">

      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/empresa/pla')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Tornar al meu pla
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {currentPlan.plan.tier === 'PIONERES' ? 'Tria el teu pla de col·laboració' : 'Millora el teu pla'}
        </h1>
        <p className="text-gray-600">
          {currentPlan.plan.tier === 'PIONERES' ? (
            <>
              Disposes de <strong>6 mesos gratuïts</strong> amb funcionalitats del pla Estàndard.
              Passat aquest període, hauràs de triar un pla de col·laboració per continuar gaudint de tots els beneficis.
            </>
          ) : (
            <>
              El teu pla actual és <strong>{currentPlan.plan.name}</strong>.
              Tria un pla superior per accedir a més funcionalitats.
            </>
          )}
        </p>
      </div>

      {/* Grid de planes superiores */}
      <div className={`grid grid-cols-1 ${
        availablePlans.length === 1 ? 'md:grid-cols-1 max-w-md mx-auto' :
        availablePlans.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' :
        'lg:grid-cols-3'
      } gap-6`}>
        {availablePlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={false}
            onUpgrade={handleUpgrade}
            showActions={true}
          />
        ))}
      </div>

      {/* Info adicional */}
      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Com funciona l'actualització?
            </h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• El canvi de pla s'aplica immediatament</li>
              <li>• Es calcula el prorrateig del temps restant del teu pla actual</li>
              <li>• Només pagues la diferència fins la propera renovació</li>
              <li>• Tots els teus límits s'amplien automàticament</li>
              <li>• Pots cancel·lar en qualsevol moment</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal de upgrade */}
      {selectedPlan && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={handleCloseModal}
          currentPlanName={currentPlan.plan.name}
          newPlan={selectedPlan}
          onConfirm={handleConfirmUpgrade}
        />
      )}

    </div>
  );
}