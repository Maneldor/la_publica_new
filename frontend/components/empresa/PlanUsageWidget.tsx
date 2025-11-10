'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

// Interfaces
interface PlanUsage {
  members: { used: number; limit: number };
  storage: { used: number; limit: number };
  projects: { used: number; limit: number };
  documents: { used: number; limit: number };
}

interface PlanData {
  company: {
    id: string;
    name: string;
    subscriptionPlan: 'BASIC' | 'STANDARD' | 'PREMIUM' | 'EMPRESARIAL';
  };
  usage: PlanUsage;
}

interface UsageItemProps {
  label: string;
  used: number | string;
  limit: number | string;
  icon: string;
  formatValue?: (value: number) => string;
}

export default function PlanUsageWidget() {
  const { data: session } = useSession();
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchPlanData();
    }
  }, [session]);

  async function fetchPlanData() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/empresa/plan', {
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Error cargando datos del plan');
      }

      const data = await response.json();
      setPlanData(data);
    } catch (error) {
      console.error('Error fetching plan data:', error);
      setError('Error cargando límites del plan');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="h-4 bg-gray-300 rounded w-full mb-1"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <div className="text-center">
          <span className="text-2xl mb-2 block">⚠️</span>
          <h3 className="font-semibold text-red-900 mb-1">Error</h3>
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <button
            onClick={fetchPlanData}
            className="text-sm text-red-600 hover:text-red-800 underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!planData) return null;

  const currentPlan = planData.company.subscriptionPlan;
  const usage = planData.usage;

  // Calcular si algún límite está cercano al máximo
  const usageItems = [
    {
      label: 'Membres',
      used: usage.members.used,
      limit: usage.members.limit,
      icon: '👥'
    },
    {
      label: 'Storage',
      used: usage.storage.used,
      limit: usage.storage.limit,
      icon: '💾',
      formatValue: formatStorage
    },
    {
      label: 'Projectes',
      used: usage.projects.used,
      limit: usage.projects.limit,
      icon: '📁'
    },
    {
      label: 'Documents',
      used: usage.documents.used,
      limit: usage.documents.limit,
      icon: '📄'
    }
  ];

  const hasAnyLimitReached = usageItems.some(item => {
    const usedNum = typeof item.used === 'number' ? item.used : parseFloat(String(item.used).replace(/[^\d.]/g, ''));
    const limitNum = typeof item.limit === 'number' ? item.limit : parseFloat(String(item.limit).replace(/[^\d.]/g, ''));
    return (usedNum / limitNum) >= 1;
  });

  const hasAnyLimitNear = usageItems.some(item => {
    const usedNum = typeof item.used === 'number' ? item.used : parseFloat(String(item.used).replace(/[^\d.]/g, ''));
    const limitNum = typeof item.limit === 'number' ? item.limit : parseFloat(String(item.limit).replace(/[^\d.]/g, ''));
    const percentage = (usedNum / limitNum) * 100;
    return percentage >= 80 && percentage < 100;
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          <h3 className="font-semibold text-gray-900">
            Límits del Pla {getPlanDisplayName(currentPlan)}
          </h3>
        </div>
        <Link
          href="/empresa/pla"
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
        >
          <ExternalLink className="w-4 h-4" />
          Veure plans
        </Link>
      </div>

      <div className="space-y-4 mb-4">
        {usageItems.map((item) => (
          <UsageItem
            key={item.label}
            label={item.label}
            used={item.used}
            limit={item.limit}
            icon={item.icon}
            formatValue={item.formatValue}
          />
        ))}
      </div>

      {/* Alertas */}
      {hasAnyLimitReached && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">
                Has arribat al límit del teu pla
              </p>
              <p className="text-xs text-red-600 mt-1">
                Algunes funcionalitats poden estar limitades
              </p>
            </div>
          </div>
        </div>
      )}

      {hasAnyLimitNear && !hasAnyLimitReached && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                T'estàs acostant als límits del pla
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Considera millorar el teu pla per evitar interrupcions
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Botón de upgrade */}
      {(hasAnyLimitReached || hasAnyLimitNear) && currentPlan !== 'EMPRESARIAL' && (
        <Link
          href="/empresa/pla"
          className="w-full block text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 rounded-lg font-medium hover:shadow-lg transition"
        >
          {currentPlan === 'BASIC' && 'Millorar a Estàndard'}
          {currentPlan === 'STANDARD' && 'Millorar a Premium'}
          {currentPlan === 'PREMIUM' && 'Millorar a Empresarial'}
        </Link>
      )}
    </div>
  );
}

// Componente para cada item de uso
function UsageItem({ label, used, limit, icon, formatValue }: UsageItemProps) {
  const usedNum = typeof used === 'number' ? used : parseFloat(String(used).replace(/[^\d.]/g, ''));
  const limitNum = typeof limit === 'number' ? limit : parseFloat(String(limit).replace(/[^\d.]/g, ''));
  const percentage = (usedNum / limitNum) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  const displayUsed = formatValue ? formatValue(usedNum) : used;
  const displayLimit = formatValue ? formatValue(limitNum) : limit;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm">{icon}</span>
          <span className="text-sm font-medium text-gray-900">{label}</span>
        </div>
        <span className={`text-xs font-semibold ${
          isAtLimit ? 'text-red-600' : isNearLimit ? 'text-amber-600' : 'text-gray-500'
        }`}>
          {displayUsed} / {displayLimit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-blue-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

// Helper functions
function getPlanDisplayName(plan: string) {
  const names = {
    BASIC: 'Bàsic',
    STANDARD: 'Estàndard',
    PREMIUM: 'Premium',
    EMPRESARIAL: 'Empresarial'
  };
  return names[plan as keyof typeof names] || plan;
}

function formatStorage(bytes: number) {
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(1)} GB`;
}