'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Crown, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PlanCard from '@/components/plans/PlanCard';

interface AvailablePlan {
  id: string;
  slug: string;
  tier: string;
  name: string;
  nameEs?: string;
  nameEn?: string;
  basePrice: number;
  firstYearDiscount: number;
  maxActiveOffers: number;
  maxTeamMembers: number;
  maxFeaturedOffers: number;
  maxStorage: number;
  badge?: string;
  badgeColor?: string;
  destacado?: boolean;
  color?: string;
  icono?: string;
  funcionalidades?: string;
  features: Record<string, boolean>;
  isActive?: boolean;
  isVisible?: boolean;
}

interface CurrentPlanData {
  plan: {
    tier: string;
    name: string;
    price: number;
  };
}

export default function MillorarPlaPage() {
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState<CurrentPlanData | null>(null);
  const [availablePlans, setAvailablePlans] = useState<AvailablePlan[]>([]);
  const [upgradeablePlans, setUpgradeablePlans] = useState<AvailablePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCurrentPlan();
    loadAvailablePlans();
  }, []);

  async function loadCurrentPlan() {
    try {
      const response = await fetch('/api/empresa/plan');
      const data = await response.json();

      if (data.success) {
        setCurrentPlan(data);
      } else {
        setError(data.error || 'Error al carregar pla actual');
      }
    } catch (err) {
      setError('Error de connexió');
    }
  }

  async function loadAvailablePlans() {
    try {
      const response = await fetch('/api/plans');
      const data = await response.json();

      if (data.success) {
        const mappedPlans = (data.data || []).map((plan: any) => ({
          id: plan.id,
          slug: plan.slug,
          tier: plan.tier,
          name: plan.name,
          nameEs: plan.nameEs,
          nameEn: plan.nameEn,
          basePrice: plan.basePrice,
          firstYearDiscount: plan.firstYearDiscount,
          maxActiveOffers: plan.maxActiveOffers,
          maxTeamMembers: plan.maxTeamMembers,
          maxFeaturedOffers: plan.maxFeaturedOffers,
          maxStorage: plan.maxStorage,
          badge: plan.badge,
          badgeColor: plan.badgeColor,
          destacado: plan.destacado,
          color: plan.color,
          icono: plan.icono,
          funcionalidades: plan.funcionalidades,
          features: plan.features || {},
          isActive: plan.isActive,
          isVisible: plan.isVisible,
        }));
        setAvailablePlans(mappedPlans);
      }
    } catch (err) {
      console.error('Error loading plans:', err);
    } finally {
      setLoading(false);
    }
  }

  // Función para obtener planes disponibles para upgrade
  function getAvailablePlansForUpgrade(currentPlanTier: string, allPlans: AvailablePlan[]): AvailablePlan[] {
    const planHierarchy = ['PIONERES', 'STANDARD', 'STRATEGIC', 'ENTERPRISE'];
    const currentIndex = planHierarchy.indexOf(currentPlanTier);

    if (currentIndex === -1) return [];

    // Filtrar solo planes superiores al actual y visibles
    return allPlans.filter(plan => {
      const planIndex = planHierarchy.indexOf(plan.tier);
      return planIndex > currentIndex && plan.isVisible && plan.isActive;
    });
  }

  // Actualizar upgradeablePlans cuando cambien currentPlan o availablePlans
  useEffect(() => {
    if (currentPlan && availablePlans.length > 0) {
      const upgradeable = getAvailablePlansForUpgrade(currentPlan.plan.tier, availablePlans);
      setUpgradeablePlans(upgradeable);
    }
  }, [currentPlan, availablePlans]);

  const handleSelectPlan = (selectedPlan: AvailablePlan) => {
    // Validar que el plan seleccionado sea realmente un upgrade válido
    const planHierarchy = ['PIONERES', 'STANDARD', 'STRATEGIC', 'ENTERPRISE'];
    const currentIndex = planHierarchy.indexOf(currentPlan?.plan.tier || '');
    const selectedIndex = planHierarchy.indexOf(selectedPlan.tier);

    if (selectedIndex <= currentIndex) {
      alert('Solo puedes actualizar a un plan superior.');
      return;
    }

    // TODO: Redirigir a página de confirmación con selectedPlan
    console.log('Redirigir a confirmar upgrade:', selectedPlan);
    alert(`Redirigint a confirmació per actualitzar a ${selectedPlan.name}`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error || !currentPlan) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800">{error || 'No s\'ha pogut carregar el pla actual'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Tornar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Tornar
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Millorar el Meu Pla</h1>
          <p className="text-gray-600 mt-1">Selecciona un pla superior per obtenir més funcionalitats</p>
        </div>
      </div>

      {/* Current Plan Summary */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <Crown className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-900">Pla Actual</h2>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-900">{currentPlan.plan.name}</span>
          <span className="text-gray-600">
            {currentPlan.plan.price === 0 ? 'Gratis' : `${currentPlan.plan.price}€/any`}
          </span>
        </div>
      </div>

      {/* Available Upgrades */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            Plans Disponibles per Actualitzar
          </h3>
          {upgradeablePlans.length === 0 ? (
            <div className="mt-4 text-center py-12">
              <p className="text-gray-600 text-lg">
                {currentPlan.plan.tier === 'ENTERPRISE'
                  ? '🎉 Ja tens el pla més alt disponible!'
                  : 'No hi ha plans superiors disponibles en aquest moment.'}
              </p>
              <button
                onClick={() => router.back()}
                className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Tornar al Meu Pla
              </button>
            </div>
          ) : (
            <p className="text-gray-600 mt-2">
              Selecciona un dels següents plans per obtenir més funcionalitats i límits més alts.
            </p>
          )}
        </div>

        {upgradeablePlans.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upgradeablePlans
              .sort((a, b) => {
                const order = ['PIONERES', 'STANDARD', 'STRATEGIC', 'ENTERPRISE'];
                return order.indexOf(a.tier) - order.indexOf(b.tier);
              })
              .map((plan) => (
                <PlanCard
                  key={plan.tier}
                  plan={plan}
                  isAdminView={false}
                  isCurrentPlan={false}
                  onSelectPlan={handleSelectPlan}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}