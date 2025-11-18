'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Crown,
  TrendingUp,
  Users,
  FileText,
  Ticket,
  CheckCircle2,
  XCircle,
  CreditCard,
  Calendar,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { PlanTier } from '@/lib/plans/planService';
import {
  calculateProration,
  comparePlans,
  formatPrice,
  formatDate,
  getFeatureName,
  isUpgrade,
  type ProrationCalculation,
  type PlanComparison
} from '@/lib/billing-utils';

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: PlanTier;
  newPlan: PlanTier;
  onConfirm: (newPlan: PlanTier) => Promise<void>;
  isLoading?: boolean;
  currentPeriodEnd?: Date;
}

export default function UpgradePlanModal({
  isOpen,
  onClose,
  currentPlan,
  newPlan,
  onConfirm,
  isLoading = false,
  currentPeriodEnd
}: UpgradePlanModalProps) {
  const [proration, setProration] = useState<ProrationCalculation | null>(null);
  const [comparison, setComparison] = useState<PlanComparison | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (isOpen && currentPlan && newPlan) {
      // Calcular prorrateo i comparació
      const periodEnd = currentPeriodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const prorateCalc = calculateProration(currentPlan, newPlan, new Date(), periodEnd);
      const planComparison = comparePlans(currentPlan, newPlan);

      setProration(prorateCalc);
      setComparison(planComparison);
    }
  }, [isOpen, currentPlan, newPlan, currentPeriodEnd]);

  const handleConfirm = async () => {
    if (!newPlan) return;

    setIsConfirming(true);
    try {
      await onConfirm(newPlan);
      onClose();
    } catch (error) {
      console.error('Error confirmant upgrade:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleClose = () => {
    if (!isConfirming && !isLoading) {
      onClose();
    }
  };

  if (!isOpen || !proration || !comparison) {
    return null;
  }

  const isUpgradeAction = isUpgrade(currentPlan, newPlan);
  const actionText = isUpgradeAction ? 'Actualitzar' : 'Canviar';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {isUpgradeAction ? (
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            ) : (
              <ArrowRight className="w-6 h-6 text-blue-600" />
            )}
            <h2 className="text-xl font-semibold text-gray-900">
              {actionText} pla a {comparison.newPlan.name}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
            disabled={isConfirming || isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Comparació visual de plans */}
          <div className="grid grid-cols-2 gap-4">
            {/* Pla actual */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-center mb-3">
                <div className="text-sm text-gray-600 mb-1">Pla actual</div>
                <div className="text-lg font-semibold text-gray-900">{comparison.currentPlan.name}</div>
                <div className="text-xl font-bold text-gray-700">{formatPrice(comparison.currentPlan.price)}</div>
                {comparison.currentPlan.price > 0 && (
                  <div className="text-sm text-gray-500">per mes</div>
                )}
              </div>
            </div>

            {/* Pla nou */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-4 text-white">
              <div className="text-center mb-3">
                <div className="text-sm text-indigo-100 mb-1">Pla nou</div>
                <div className="text-lg font-semibold">{comparison.newPlan.name}</div>
                <div className="text-xl font-bold">{formatPrice(comparison.newPlan.price)}</div>
                {comparison.newPlan.price > 0 && (
                  <div className="text-sm text-indigo-100">per mes</div>
                )}
              </div>
            </div>
          </div>

          {/* Millores de límits */}
          {comparison.increasedLimits.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-900 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Límits que milloren
              </h3>
              <div className="space-y-2">
                {comparison.increasedLimits.map((limit, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-green-700">{limit.label}</span>
                    <span className="font-medium text-green-900">
                      {limit.current} {limit.improvement}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Noves funcionalitats */}
          {comparison.upgradedFeatures.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Noves funcionalitats
              </h3>
              <div className="space-y-1">
                {comparison.upgradedFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-blue-700">
                    <CheckCircle2 className="w-3 h-3" />
                    {getFeatureName(feature)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resum de facturació */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Resum de facturació
            </h3>

            <div className="space-y-3">
              {proration.creditAmount > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">
                    Crèdit prorratejat ({proration.daysRemaining} dies restants)
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    -{formatPrice(proration.creditAmount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">
                  {comparison.newPlan.name} (prorratejat)
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {formatPrice(proration.newPlanCost)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="font-medium text-gray-900">Import a pagar avui</span>
                <span className="text-lg font-bold text-indigo-600">
                  {formatPrice(proration.dueToday)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 text-sm text-gray-600">
                <span>Pròxima facturació ({formatDate(proration.currentPeriodEnd)})</span>
                <span className="font-medium">
                  {formatPrice(proration.nextBillingAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Avís important per downgrades */}
          {!isUpgradeAction && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-amber-900 mb-1">
                    Canvi a un pla inferior
                  </h4>
                  <p className="text-sm text-amber-700">
                    Algunes funcionalitats avançades podrien deixar d'estar disponibles.
                    Assegura't que el nou pla cobreix les teves necessitats.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isConfirming || isLoading}
          >
            Cancel·lar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirming || isLoading}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processant...
              </>
            ) : (
              <>
                {actionText} pla
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}