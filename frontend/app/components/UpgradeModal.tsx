'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Plan {
  id: string;
  name: string;
  tier: string;
  basePrice: number;
  precioAnual: number;
  firstYearDiscount: number;
  funcionalidades: string;
  maxActiveOffers: number;
  maxTeamMembers: number;
  maxFeaturedOffers: number;
  maxStorage: number;
}

interface UpgradePreview {
  currentPlan: {
    name: string;
    price: number;
  };
  newPlan: {
    name: string;
    price: number;
  };
  proratedAmount: number;
  daysRemaining: number;
  immediateCharge: number;
  nextRenewalDate: string;
  nextRenewalAmount: number;
}

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanName: string;
  newPlan: Plan;
  onConfirm: () => void;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  currentPlanName,
  newPlan,
  onConfirm
}: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<UpgradePreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);

  useEffect(() => {
    if (isOpen && newPlan) {
      loadPreview();
    }
  }, [isOpen, newPlan]);

  const loadPreview = async () => {
    try {
      setLoadingPreview(true);

      const response = await fetch('/api/empresa/plan/calculate-proration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPlanId: newPlan.id
        })
      });

      const data = await response.json();

      if (data.success) {
        setPreview(data.data);
      } else {
        toast.error('Error al calcular el prorrateo');
        console.error('Error preview:', data.error);
      }
    } catch (error) {
      console.error('Error loading preview:', error);
      toast.error('Error al carregar la previsualització');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleConfirm = async () => {
    if (!preview) return;

    setLoading(true);

    try {
      // 1. Crear Stripe Checkout Session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: newPlan.id,
          prorationAmount: preview?.immediateCharge || newPlan.basePrice
        })
      });

      if (!response.ok) {
        throw new Error('Error al crear sesión de pago');
      }

      const { url } = await response.json();

      // 2. Redirigir a Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No se recibió URL de checkout');
      }

    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al procesar el pago. Intenta de nuevo.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const funcionalitats = newPlan.funcionalidades
    ? newPlan.funcionalidades.split('\n').filter(f => f.trim().length > 0).slice(0, 5)
    : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Confirmar actualització de pla
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">

          {/* Cambio de plan */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Pla actual</p>
                <p className="text-lg font-bold text-gray-900">{currentPlanName}</p>
              </div>

              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Nou pla</p>
                <p className="text-lg font-bold text-blue-600">{newPlan.name}</p>
              </div>
            </div>
          </div>

          {/* Loading preview */}
          {loadingPreview && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Calculant prorrateg...</p>
            </div>
          )}

          {/* Preview de costes */}
          {!loadingPreview && preview && (
            <div className="space-y-4">

              {/* Prorrateo */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Càlcul del prorrateg</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dies restants del pla actual:</span>
                    <span className="font-medium">{preview.daysRemaining} dies</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Crèdit del pla actual:</span>
                    <span className="font-medium text-green-600">-{preview.proratedAmount.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cost del nou pla (prorrateig):</span>
                    <span className="font-medium">{preview.newPlan.price.toFixed(2)}€</span>
                  </div>

                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">A pagar avui:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {preview.immediateCharge.toFixed(2)}€
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Próxima renovación */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-gray-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm">
                    <p className="text-gray-700">
                      <strong>Propera renovació:</strong> {new Date(preview.nextRenewalDate).toLocaleDateString('ca-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-gray-600 mt-1">
                      Import de la renovació: <strong>{preview.nextRenewalAmount.toFixed(2)}€/any</strong>
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Mejoras que obtiene */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Què guanyes amb aquest upgrade?</h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 rounded p-3">
                <p className="text-xs text-gray-600 mb-1">Ofertes actives</p>
                <p className="text-lg font-bold text-green-700">
                  {newPlan.maxActiveOffers === -1 ? 'Il·limitades' : newPlan.maxActiveOffers}
                </p>
              </div>
              <div className="bg-green-50 rounded p-3">
                <p className="text-xs text-gray-600 mb-1">Membres equip</p>
                <p className="text-lg font-bold text-green-700">
                  {newPlan.maxTeamMembers === -1 ? 'Il·limitats' : newPlan.maxTeamMembers}
                </p>
              </div>
              <div className="bg-green-50 rounded p-3">
                <p className="text-xs text-gray-600 mb-1">Ofertes destacades</p>
                <p className="text-lg font-bold text-green-700">
                  {newPlan.maxFeaturedOffers === -1 ? 'Il·limitades' : newPlan.maxFeaturedOffers}
                </p>
              </div>
              <div className="bg-green-50 rounded p-3">
                <p className="text-xs text-gray-600 mb-1">Emmagatzematge</p>
                <p className="text-lg font-bold text-green-700">
                  {newPlan.maxStorage === -1 ? 'Il·limitat' : `${newPlan.maxStorage} GB`}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-900 mb-2">Funcionalitats destacades:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {funcionalitats.map((func, idx) => (
                  <li key={idx} className="flex items-start">
                    <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{func}</span>
                  </li>
                ))}
                {funcionalitats.length < newPlan.funcionalidades.split('\n').filter(f => f.trim()).length && (
                  <li className="text-xs text-gray-500 italic ml-6">
                    ... i {newPlan.funcionalidades.split('\n').filter(f => f.trim()).length - funcionalitats.length} més
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Aviso importante */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Tingues en compte:</p>
                <ul className="space-y-1 text-xs">
                  <li>• El canvi de pla s'aplicarà immediatament</li>
                  <li>• Els nous límits estaran disponibles a l'instant</li>
                  <li>• El càrrec es processarà ara mateix</li>
                  <li>• Pots cancel·lar el pla en qualsevol moment</li>
                </ul>
              </div>
            </div>
          </div>

        </div>

        {/* Footer con botones */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel·lar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || loadingPreview}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {loading ? 'Processant...' : `Confirmar i pagar ${preview?.immediateCharge.toFixed(2)}€`}
          </button>
        </div>

      </div>
    </div>
  );
}