'use client';

import { useEffect, useState } from 'react';
import {
  Crown,
  TrendingUp,
  Users,
  FileText,
  Ticket,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Zap,
  Shield,
  Sparkles
} from 'lucide-react';
import UpgradePlanModal from '@/components/empresa/UpgradePlanModal';
import PlanCard from '@/components/plans/PlanCard';

type PlanTier = 'PIONERES' | 'STANDARD' | 'STRATEGIC' | 'ENTERPRISE';

interface PlanData {
  plan: {
    tier: string;
    name: string;
    price: number;
    limits: {
      maxOffers: number | string;
      maxActiveOffers: number | string;
      maxCouponsPerMonth: number | string;
      maxTeamMembers: number | string;
    };
    features: Record<string, boolean>;
  };
  config: {
    funcionalidades?: string;
    [key: string]: any;
  };
  usage: {
    offers: { current: number; limit: number | string; percentage: number };
    activeOffers: { current: number; limit: number | string; percentage: number };
    coupons: { current: number; limit: number | string; percentage: number };
    team: { current: number; limit: number | string; percentage: number };
  };
}

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

export default function ElMeuPlaPage() {
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [availablePlans, setAvailablePlans] = useState<AvailablePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlanData();
    loadAvailablePlans();
  }, []);

  async function loadPlanData() {
    try {
      const response = await fetch('/api/empresa/plan');
      const data = await response.json();

      if (data.success) {
        setPlanData(data);
      } else {
        setError(data.error || 'Error al carregar pla');
      }
    } catch (err) {
      setError('Error de connexió');
    } finally {
      setLoading(false);
    }
  }

  async function loadAvailablePlans() {
    try {
      const response = await fetch('/api/plans');
      const data = await response.json();

      if (data.success) {
        // Usar los datos de BD directamente (misma estructura que admin)
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
    }
  }


  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error || !planData) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-800">{error || 'No s\'ha pogut carregar el pla'}</p>
        </div>
      </div>
    );
  }

  const { plan, config, usage } = planData;


  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">El Meu Pla</h1>
          <p className="text-gray-600 mt-1">Gestiona la teva subscripció i límits</p>
        </div>

        {plan.tier !== 'ENTERPRISE' && (
          <a
            href="/empresa/pla/millorar"
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-decoration-none"
          >
            <TrendingUp className="w-5 h-5" />
            ⬆️ Millorar el meu Pla
          </a>
        )}
      </div>

      {/* Plan Actual Card */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-xl p-8 text-white">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-8 h-8" />
              <h2 className="text-3xl font-bold">{plan.name}</h2>
            </div>
            <p className="text-indigo-100">El teu pla actual</p>
          </div>

          <div className="text-right">
            <div className="text-4xl font-bold">
              {plan.price === 0 ? 'Gratis' : `${plan.price}€`}
            </div>
            {plan.price > 0 && (
              <div className="text-indigo-100 text-sm">per mes</div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={FileText}
            label="Ofertes"
            current={usage.offers.current}
            limit={usage.offers.limit}
            percentage={usage.offers.percentage}
          />
          <StatCard
            icon={Zap}
            label="Ofertes Actives"
            current={usage.activeOffers.current}
            limit={usage.activeOffers.limit}
            percentage={usage.activeOffers.percentage}
          />
          <StatCard
            icon={Ticket}
            label="Cupons (mes)"
            current={usage.coupons.current}
            limit={usage.coupons.limit}
            percentage={usage.coupons.percentage}
          />
          <StatCard
            icon={Users}
            label="Equip"
            current={usage.team.current}
            limit={usage.team.limit}
            percentage={usage.team.percentage}
          />
        </div>
      </div>

      {/* Usage Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Límits d'Ús */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            Límits d'Ús
          </h3>

          <div className="space-y-4">
            <UsageBar
              label="Ofertes Totals"
              current={usage.offers.current}
              limit={usage.offers.limit}
              percentage={usage.offers.percentage}
            />
            <UsageBar
              label="Ofertes Actives"
              current={usage.activeOffers.current}
              limit={usage.activeOffers.limit}
              percentage={usage.activeOffers.percentage}
            />
            <UsageBar
              label="Cupons Aquest Mes"
              current={usage.coupons.current}
              limit={usage.coupons.limit}
              percentage={usage.coupons.percentage}
            />
            <UsageBar
              label="Membres d'Equip"
              current={usage.team.current}
              limit={usage.team.limit}
              percentage={usage.team.percentage}
            />
          </div>
        </div>

        {/* Features Actives */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            Funcionalitats del Pla
          </h3>

          <div className="space-y-2">
            {Object.entries(plan.features)
              .filter(([key, value]) => {
                // Solo mostrar si está activa Y tiene contenido real
                if (!value) return false;

                // Verificar que existe línea correspondiente en funcionalidades
                if (config?.funcionalidades) {
                  const lines = config.funcionalidades.split('\n').filter((line: string) => line.trim());
                  const index = parseInt(key);
                  return !isNaN(index) && lines[index];
                }

                return true; // Fallback para claves no numéricas
              })
              .map(([key, value]) => (
                <FeatureItem
                  key={key}
                  label={formatFeatureName(key, { config })}
                  active={!!value}
                />
              ))}
          </div>
        </div>
      </div>


    </div>
  );
}

// Componente para stats rápidos en el header del plan
function StatCard({
  icon: Icon,
  label,
  current,
  limit,
  percentage
}: {
  icon: any;
  label: string;
  current: number;
  limit: number | string;
  percentage: number;
}) {
  const isUnlimited = limit === 'unlimited';
  const isNearLimit = percentage >= 80 && !isUnlimited;

  return (
    <div className="bg-white/10 backdrop-blur rounded-lg p-4">
      <Icon className="w-5 h-5 mb-2 text-indigo-200" />
      <div className="text-2xl font-bold">
        {current}
        {!isUnlimited && <span className="text-lg font-normal text-indigo-200">/{limit}</span>}
      </div>
      <div className="text-sm text-indigo-100">{label}</div>
      {isNearLimit && (
        <div className="text-xs text-yellow-300 mt-1">Prop del límit</div>
      )}
    </div>
  );
}

// Barra de uso con porcentaje
function UsageBar({
  label,
  current,
  limit,
  percentage
}: {
  label: string;
  current: number;
  limit: number | string;
  percentage: number;
}) {
  const isUnlimited = limit === 'unlimited';
  const isNearLimit = percentage >= 80 && !isUnlimited;
  const isAtLimit = percentage >= 100 && !isUnlimited;

  const barColor = isAtLimit
    ? 'bg-red-500'
    : isNearLimit
    ? 'bg-yellow-500'
    : 'bg-indigo-600';

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className="text-gray-600">
          {current} {!isUnlimited && `/ ${limit}`}
        </span>
      </div>

      {!isUnlimited ? (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`${barColor} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      ) : (
        <div className="text-xs text-gray-500 italic">Il·limitat</div>
      )}
    </div>
  );
}

// Función para formatear nombres de features
function formatFeatureName(key: string, planData?: any): string {
  // Si tenemos el texto original de funcionalidades, usar esas líneas
  if (planData?.config?.funcionalidades) {
    const lines = planData.config.funcionalidades.split('\n').filter((line: string) => line.trim());
    const index = parseInt(key);
    if (!isNaN(index) && lines[index]) {
      return lines[index].trim();
    }
  }

  // Traducciones por clave descriptiva (fallback)
  const translations: Record<string, string> = {
    canCreateOffers: 'Crear ofertes',
    canManageTeam: 'Gestionar equip',
    canUseAdvancedFilters: 'Filtres avançats',
    canExportData: 'Exportar dades',
    canUsePremiumSupport: 'Suport premium',
    canUseCustomBranding: 'Marca personalitzada',
    canUseAnalytics: 'Analítiques',
    canUseCoupons: 'Cupons',
    canUseFeaturedOffers: 'Ofertes destacades',
    canUseCustomFields: 'Camps personalitzats'
  };

  // Si es una clave descriptiva, usarla
  if (translations[key]) {
    return translations[key];
  }

  // Fallback para índices numéricos
  const featuresByIndex: Record<string, string> = {
    '0': 'Crear ofertes bàsiques',
    '1': 'Gestió d\'equip',
    '2': 'Analítiques bàsiques',
    '3': 'Suport per email',
    '4': 'Exportar dades CSV',
    '5': 'Filtres avançats',
    '6': 'Ofertes destacades'
  };

  return featuresByIndex[key] || `Funcionalitat ${key}`;
}

// Item de feature con check/cross
function FeatureItem({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {active ? (
        <CheckCircle2 className="w-5 h-5 text-green-500" />
      ) : (
        <XCircle className="w-5 h-5 text-gray-300" />
      )}
      <span className={active ? 'text-gray-900' : 'text-gray-400'}>
        {label}
      </span>
    </div>
  );
}

