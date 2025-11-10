'use client';

import { useState, useEffect } from 'react';
import {
  ENTERPRISE_CATALOG,
  BASE_PLANS,
  calculatePricing,
  findFeatureById,
  getCategoryDisplayName,
  getCategoryIcon,
  type SelectedFeature,
  type EnterpriseFeature
} from '@/lib/enterprise-catalog';

interface PlanConfiguratorProps {
  companyId: string;
  companyName: string;
  currentPlan?: string;
}

export function PlanConfigurator({ companyId, companyName, currentPlan = 'PREMIUM' }: PlanConfiguratorProps) {
  const [basePlan, setBasePlan] = useState<'PREMIUM' | 'STANDARD'>('PREMIUM');
  const [selectedFeatures, setSelectedFeatures] = useState<SelectedFeature[]>([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Calcular precios en tiempo real
  const pricing = calculatePricing(basePlan, selectedFeatures, discountPercent);

  function toggleFeature(feature: EnterpriseFeature, quantity: number = 1) {
    setSelectedFeatures(prev => {
      const exists = prev.find(f => f.featureId === feature.key);

      if (exists) {
        // Remover si ya existe
        return prev.filter(f => f.featureId !== feature.key);
      } else {
        // Añadir nuevo
        return [...prev, {
          featureId: feature.key,
          quantity,
          unitPrice: feature.basePrice,
          totalPrice: feature.basePrice * quantity
        }];
      }
    });
  }

  function isFeatureSelected(featureId: string): boolean {
    return selectedFeatures.some(f => f.featureId === featureId);
  }

  async function saveAsProposal() {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/custom-package`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          basePlan,
          features: selectedFeatures,
          discountPercent,
          notes,
          status: 'proposed',
          pricing: pricing
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert('✅ Proposta guardada correctament');
        // TODO: Redirect to proposals list or show success message
      } else {
        const error = await response.json();
        alert('❌ Error: ' + error.message);
      }
    } catch (error) {
      console.error('Error saving proposal:', error);
      alert('❌ Error de connexió');
    } finally {
      setLoading(false);
    }
  }

  async function activatePackage() {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/custom-package`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          basePlan,
          features: selectedFeatures,
          discountPercent,
          notes,
          status: 'active',
          pricing: pricing
        })
      });

      if (response.ok) {
        alert('✅ Pla empresarial activat correctament!');
        // TODO: Update company status and redirect
      } else {
        const error = await response.json();
        alert('❌ Error activant pla: ' + error.message);
      }
    } catch (error) {
      console.error('Error activating package:', error);
      alert('❌ Error de connexió');
    } finally {
      setLoading(false);
    }
  }

  function generatePDF() {
    // TODO: Implement PDF generation
    alert('🔄 Generació de PDF en desenvolupament');
  }

  function sendByEmail() {
    // TODO: Implement email sending
    alert('🔄 Enviament per email en desenvolupament');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🏢 {companyName} - Configuració del Pla
              </h1>
              <p className="text-gray-600 mt-1">
                Crea un pla empresarial personalitzat amb funcionalitats a mida
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-600">Pla Actual:</span>
                <span className="font-semibold ml-2">{currentPlan}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna 1-2: Configurador */}
          <div className="lg:col-span-2 space-y-6">

            {/* Plan Base Selector */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                🏗️ Pla Base
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(BASE_PLANS).map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setBasePlan(plan.id as 'STANDARD' | 'PREMIUM')}
                    className={`
                      relative p-6 rounded-lg border-2 text-left transition-all
                      ${basePlan === plan.id
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-20'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                      }
                    `}
                  >
                    {basePlan === plan.id && (
                      <div className="absolute top-3 right-3">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}

                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {plan.description}
                    </p>
                    <div className="text-2xl font-bold text-blue-600">
                      €{plan.price}<span className="text-sm text-gray-500">/mes</span>
                    </div>
                    <div className="mt-3 space-y-1">
                      {plan.features.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                          <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>{feature}</span>
                        </div>
                      ))}
                      {plan.features.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{plan.features.length - 3} més...
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Catálogo por categorías */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  🎨 Configurador de Funcionalitats Empresarials
                </h2>

                {Object.entries(ENTERPRISE_CATALOG).map(([category, features]) => (
                  <div key={category} className="mb-8 last:mb-0">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">{getCategoryIcon(category)}</span>
                      <h3 className="text-xl font-bold text-gray-900">
                        {getCategoryDisplayName(category)}
                      </h3>
                      <div className="flex-1 h-px bg-gray-200 ml-4"></div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {features.map((feature) => (
                        <FeatureCheckbox
                          key={feature.key}
                          feature={feature}
                          isSelected={isFeatureSelected(feature.key)}
                          onToggle={() => toggleFeature(feature)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes internes */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                📝 Notes Internes
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={4}
                placeholder="Notes sobre la negociació, condicions especials, històric de converses..."
              />
            </div>
          </div>

          {/* Columna 3: Resumen y Pricing */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <PricingSummary
                basePlan={basePlan}
                selectedFeatures={selectedFeatures}
                pricing={pricing}
                discountPercent={discountPercent}
                onDiscountChange={setDiscountPercent}
                onSaveProposal={saveAsProposal}
                onActivatePackage={activatePackage}
                onGeneratePDF={generatePDF}
                onSendEmail={sendByEmail}
                loading={loading}
                companyName={companyName}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente para cada feature seleccionable
interface FeatureCheckboxProps {
  feature: EnterpriseFeature;
  isSelected: boolean;
  onToggle: () => void;
}

function FeatureCheckbox({ feature, isSelected, onToggle }: FeatureCheckboxProps) {
  return (
    <div
      onClick={onToggle}
      className={`
        relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
        ${isSelected
          ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500 ring-opacity-20'
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
        }
      `}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          <div className={`
            w-5 h-5 rounded border-2 flex items-center justify-center
            ${isSelected
              ? 'bg-purple-600 border-purple-600'
              : 'border-gray-300'
            }
          `}>
            {isSelected && (
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{feature.icon}</span>
              <h4 className="font-bold text-gray-900">{feature.name}</h4>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-lg font-bold text-gray-900">
                €{feature.basePrice}
                <span className="text-sm text-gray-500">/mes</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-2 leading-relaxed">
            {feature.description}
          </p>

          <div className="flex items-center gap-4 text-xs">
            {feature.setupFee && feature.setupFee > 0 && (
              <div className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                + €{feature.setupFee} fee única
              </div>
            )}

            {feature.discount && (
              <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                💰 {feature.discount}
              </div>
            )}

            {feature.value.amount === -1 && (
              <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                ∞ Il·limitat
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente del resumen de pricing
interface PricingSummaryProps {
  basePlan: 'STANDARD' | 'PREMIUM';
  selectedFeatures: SelectedFeature[];
  pricing: ReturnType<typeof calculatePricing>;
  discountPercent: number;
  onDiscountChange: (discount: number) => void;
  onSaveProposal: () => void;
  onActivatePackage: () => void;
  onGeneratePDF: () => void;
  onSendEmail: () => void;
  loading: boolean;
  companyName: string;
}

function PricingSummary({
  basePlan,
  selectedFeatures,
  pricing,
  discountPercent,
  onDiscountChange,
  onSaveProposal,
  onActivatePackage,
  onGeneratePDF,
  onSendEmail,
  loading,
  companyName
}: PricingSummaryProps) {
  const selectedFeaturesData = selectedFeatures.map(sf => ({
    ...sf,
    feature: findFeatureById(sf.featureId)
  })).filter(item => item.feature);

  return (
    <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-xl border-2 border-purple-200 p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">📊</span>
        <h3 className="text-xl font-bold text-gray-900">Resum del Paquet</h3>
      </div>

      {/* Plan base */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-700">Pla Base: {basePlan}</span>
          <span className="font-bold text-lg">€{pricing.basePlanPrice}/mes</span>
        </div>
      </div>

      {/* Extras seleccionados */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">
          📦 Extras Seleccionats ({selectedFeatures.length})
        </h4>
        {selectedFeaturesData.length === 0 ? (
          <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg">
            Cap extra seleccionat
          </p>
        ) : (
          <div className="space-y-2">
            {selectedFeaturesData.map(({ feature, totalPrice }) => (
              <div key={feature!.key} className="flex justify-between items-center text-sm bg-white p-2 rounded-lg">
                <span className="flex items-center gap-2">
                  <span>{feature!.icon}</span>
                  <span>{feature!.name}</span>
                </span>
                <span className="font-semibold">€{totalPrice}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cálculos */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span className="font-semibold">€{pricing.subtotal}/mes</span>
        </div>

        {/* Control de descuento */}
        <div className="flex justify-between items-center bg-white p-3 rounded-lg">
          <label className="font-medium text-gray-700">Descompte:</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={discountPercent}
              onChange={(e) => onDiscountChange(Number(e.target.value))}
              className="w-16 px-2 py-1 border border-gray-300 rounded text-right focus:ring-2 focus:ring-purple-500"
              min="0"
              max="50"
              step="1"
            />
            <span className="text-gray-600">%</span>
          </div>
        </div>

        {discountPercent > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Estalvi:</span>
            <span className="font-semibold">-€{pricing.discountAmount.toFixed(2)}/mes</span>
          </div>
        )}
      </div>

      {/* Totales principales */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-xl mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-bold">TOTAL MENSUAL:</span>
          <span className="text-2xl font-bold">€{pricing.totalMonthly.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-purple-100">
          <span>Total Anual:</span>
          <span className="font-semibold">€{pricing.totalAnnual.toFixed(2)}</span>
        </div>
        <p className="text-xs text-purple-200 mt-1">
          (estalvies €{pricing.annualSavings.toFixed(2)}/any amb pagament anual)
        </p>
      </div>

      {/* Setup fees */}
      {pricing.setupFees > 0 && (
        <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1">
              <span>⚠️</span>
              <span>Fees únics de setup:</span>
            </span>
            <span className="font-semibold text-amber-700">€{pricing.setupFees}</span>
          </div>
          <p className="text-xs text-amber-600 mt-1">
            Pagament únic per configuració inicial
          </p>
        </div>
      )}

      {/* Botones de acción */}
      <div className="space-y-3">
        <button
          onClick={onSaveProposal}
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Guardant...</span>
            </>
          ) : (
            <>
              <span>📄</span>
              <span>Generar Proposta</span>
            </>
          )}
        </button>

        <button
          onClick={onActivatePackage}
          disabled={loading}
          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span>✅</span>
          <span>Activar Pla</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onGeneratePDF}
            className="py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-all duration-200 text-sm"
          >
            📎 PDF
          </button>
          <button
            onClick={onSendEmail}
            className="py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-all duration-200 text-sm"
          >
            📧 Email
          </button>
        </div>
      </div>

      {/* Comparativa */}
      <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span>📊</span>
          <span>Comparativa</span>
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Pla {basePlan} estàndard:</span>
            <span>€{pricing.basePlanPrice}/mes</span>
          </div>
          <div className="flex justify-between text-purple-700 font-semibold">
            <span>Pla Custom:</span>
            <span>€{pricing.totalMonthly.toFixed(2)}/mes</span>
          </div>
          <div className="flex justify-between text-gray-600 pt-2 border-t">
            <span>Diferència:</span>
            <span className={pricing.totalMonthly > pricing.basePlanPrice ? 'text-red-600' : 'text-green-600'}>
              {pricing.totalMonthly > pricing.basePlanPrice ? '+' : ''}
              {((pricing.totalMonthly - pricing.basePlanPrice) / pricing.basePlanPrice * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Add-ons:</span>
            <span>{selectedFeatures.length} funcionalitats</span>
          </div>
        </div>
      </div>
    </div>
  );
}