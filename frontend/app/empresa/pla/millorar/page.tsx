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

  // Actualizar upgradeablePlans cuando cambien currentPlan o availablePlans
  useEffect(() => {
    async function loadUpgradeablePlans() {
      if (currentPlan && availablePlans.length > 0) {
        // Usar lógica local directamente (no Prisma en frontend)
        const planHierarchy = ['PIONERES', 'STANDARD', 'STRATEGIC', 'ENTERPRISE'];
        const currentIndex = planHierarchy.indexOf(currentPlan.plan.tier);
        if (currentIndex !== -1) {
          const upgradeable = availablePlans.filter(plan => {
            const planIndex = planHierarchy.indexOf(plan.tier);
            return planIndex > currentIndex && plan.isVisible && plan.isActive;
          });
          setUpgradeablePlans(upgradeable);
        }
      }
    }

    loadUpgradeablePlans();
  }, [currentPlan, availablePlans]);

  const [upgradeData, setUpgradeData] = useState<any>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loadingUpgrade, setLoadingUpgrade] = useState(false);

  const handleSelectPlan = async (selectedPlan: AvailablePlan) => {
    // Validar que el plan seleccionado sea realmente un upgrade válido
    const planHierarchy = ['PIONERES', 'STANDARD', 'STRATEGIC', 'ENTERPRISE'];
    const currentIndex = planHierarchy.indexOf(currentPlan?.plan.tier || '');
    const selectedIndex = planHierarchy.indexOf(selectedPlan.tier);

    if (selectedIndex <= currentIndex) {
      alert('Solo puedes actualizar a un plan superior.');
      return;
    }

    setLoadingUpgrade(true);
    try {
      // Obtener información de prorrateo del endpoint
      const response = await fetch(`/api/empresa/plan/upgrade?targetTier=${selectedPlan.tier}`);
      const data = await response.json();

      if (data.success) {
        setUpgradeData(data.preview);
        setShowUpgradeModal(true);
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error fetching upgrade data:', error);
      alert('❌ Error obtenint informació de l\'upgrade');
    } finally {
      setLoadingUpgrade(false);
    }
  };

  const handleConfirmUpgrade = async () => {
    if (!upgradeData) return;

    setLoadingUpgrade(true);
    try {
      const response = await fetch('/api/empresa/plan/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPlan: upgradeData.targetPlan.tier
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ ${data.message}`);
        setShowUpgradeModal(false);
        router.push('/empresa/pla'); // Redirigir de vuelta al plan
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error confirming upgrade:', error);
      alert('❌ Error confirmant l\'upgrade');
    } finally {
      setLoadingUpgrade(false);
    }
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

      {/* Modal de Confirmación de Upgrade */}
      {showUpgradeModal && upgradeData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Confirmar Actualització de Pla</h3>
                <p className="text-sm text-gray-600">Revisa els detalls del canvi abans de confirmar</p>
              </div>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Tancar modal"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Plans Comparison */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Current Plan */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Pla Actual</h4>
                  <p className="text-lg font-bold text-gray-700">{upgradeData.currentPlan.name}</p>
                  <p className="text-sm text-gray-600">
                    Preu base: {upgradeData.currentPlan.basePrice}€
                  </p>
                  <p className="text-sm text-gray-600">
                    Preu pagat: <span className="font-semibold">{upgradeData.currentPlan.paidPrice}€</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    (Amb {upgradeData.currentPlan.discount}% descompte)
                  </p>
                </div>

                {/* Target Plan */}
                <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Nou Pla</h4>
                  <p className="text-lg font-bold text-blue-700">{upgradeData.targetPlan.name}</p>
                  <p className="text-sm text-blue-600">
                    Preu base: {upgradeData.targetPlan.basePrice}€
                  </p>
                  <p className="text-sm text-blue-600">
                    Preu amb descompte: <span className="font-semibold">{upgradeData.targetPlan.discountedPrice}€</span>
                  </p>
                  <p className="text-xs text-blue-500">
                    (Amb {upgradeData.targetPlan.discount}% descompte primer any)
                  </p>
                </div>
              </div>

              {/* Proration Details */}
              {upgradeData.proration && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-900 mb-3">📊 Detalls del Prorrateo</h4>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dies restants del pla actual:</span>
                      <span className="font-semibold">{upgradeData.proration.daysRemaining} dies</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Tarifa diària pagada:</span>
                      <span className="font-semibold">{upgradeData.proration.dailyRate}€/dia</span>
                    </div>

                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600">Crèdit per dies no usats:</span>
                      <span className="font-semibold text-green-600">+{upgradeData.proration.remainingCredit}€</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Preu nou pla (amb descompte):</span>
                      <span className="font-semibold">{upgradeData.targetPlan.discountedPrice}€</span>
                    </div>

                    <div className="flex justify-between border-t pt-2 text-lg">
                      <span className="text-gray-900 font-semibold">Import a pagar ara:</span>
                      <span className="font-bold text-blue-600">{upgradeData.proration.amountToPay}€</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={loadingUpgrade}
                >
                  Cancel·lar
                </button>
                <button
                  onClick={handleConfirmUpgrade}
                  disabled={loadingUpgrade}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                >
                  {loadingUpgrade ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Processant...
                    </>
                  ) : (
                    <>
                      Confirmar Upgrade - {upgradeData.proration?.amountToPay || upgradeData.priceDiff}€
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}