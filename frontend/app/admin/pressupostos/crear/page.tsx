'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ============================================
// TIPOS
// ============================================

type BudgetItemType = 'PLAN' | 'EXTRA' | 'CUSTOM' | 'DISCOUNT';
type BillingCycle = 'MONTHLY' | 'ANNUAL' | 'ONE_TIME';

interface Company {
  id: string;
  name: string;
  cif: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
}

interface Plan {
  id: string;
  nombre: string;
  nombreCorto: string;
  descripcion: string;
  precioMensual: number;
  precioAnual: number;
  caracteristicas: string;
  color: string;
  icono: string;
  destacado: boolean;
}

interface Extra {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  priceType: string;
  category: string;
  isActive: boolean;
}

interface BudgetLine {
  id: string; // ID temporal para la lista
  itemType: BudgetItemType;
  planId?: string;
  extraId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  billingCycle?: BillingCycle;
  subtotal: number;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function CrearPressupostPage() {
  const router = useRouter();

  // Estado del wizard
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Datos del formulario
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [lines, setLines] = useState<BudgetLine[]>([]);
  const [notes, setNotes] = useState('');
  const [validUntilDays, setValidUntilDays] = useState(30);

  // Nueva línea en edición
  const [newLine, setNewLine] = useState<{
    itemType: BudgetItemType;
    planId: string;
    extraId: string;
    description: string;
    quantity: string;
    unitPrice: string;
    billingCycle: BillingCycle;
  }>({
    itemType: 'PLAN',
    planId: '',
    extraId: '',
    description: '',
    quantity: '1',
    unitPrice: '',
    billingCycle: 'MONTHLY',
  });

  // Datos cargados de APIs
  const [companies, setCompanies] = useState<Company[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);

  // ============================================
  // EFECTOS
  // ============================================

  useEffect(() => {
    loadCompanies();
    loadPlans();
    loadExtras();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      const company = companies.find(c => c.id === selectedCompanyId);
      setSelectedCompany(company || null);
    }
  }, [selectedCompanyId, companies]);

  // Auto-rellenar precio cuando se selecciona plan o extra
  useEffect(() => {
    if (newLine.itemType === 'PLAN' && newLine.planId) {
      const plan = plans.find(p => p.id === newLine.planId);
      if (plan) {
        const price = newLine.billingCycle === 'MONTHLY'
          ? plan.precioMensual
          : plan.precioAnual || plan.precioMensual * 12;
        setNewLine(prev => ({
          ...prev,
          unitPrice: price.toString(),
          description: `Pla ${plan.nombre} - ${newLine.billingCycle === 'MONTHLY' ? 'Mensual' : 'Anual'}`,
        }));
      }
    } else if (newLine.itemType === 'EXTRA' && newLine.extraId) {
      const extra = extras.find(e => e.id === newLine.extraId);
      if (extra) {
        setNewLine(prev => ({
          ...prev,
          unitPrice: extra.basePrice.toString(),
          description: extra.name,
        }));
      }
    }
  }, [newLine.planId, newLine.extraId, newLine.billingCycle, newLine.itemType, plans, extras]);

  // ============================================
  // FUNCIONES DE CARGA
  // ============================================

  const loadCompanies = async () => {
    try {
      const res = await fetch('/api/admin/companies');
      if (!res.ok) throw new Error('Error al cargar empresas');
      const data = await res.json();
      setCompanies(data.companies || []);
    } catch (err) {
      console.error('Error loading companies:', err);
    }
  };

  const loadPlans = async () => {
    try {
      const res = await fetch('/api/admin/plans');
      if (!res.ok) throw new Error('Error al cargar planes');
      const data = await res.json();
      setPlans(data.plans || []);
    } catch (err) {
      console.error('Error loading plans:', err);
    }
  };

  const loadExtras = async () => {
    try {
      const res = await fetch('/api/admin/extras?active=true');
      if (!res.ok) throw new Error('Error al cargar extras');
      const data = await res.json();
      setExtras(data.extras || []);
    } catch (err) {
      console.error('Error loading extras:', err);
    }
  };

  // ============================================
  // FUNCIONES DE LÍNEAS
  // ============================================

  const addLine = () => {
    // Validar
    if (!newLine.description.trim()) {
      alert('La descripció és obligatòria');
      return;
    }

    const quantity = parseFloat(newLine.quantity);
    const unitPrice = parseFloat(newLine.unitPrice);

    if (isNaN(quantity) || quantity <= 0) {
      alert('La quantitat ha de ser positiva');
      return;
    }

    if (isNaN(unitPrice)) {
      alert('El preu unitari és obligatori');
      return;
    }

    // Crear línea
    const line: BudgetLine = {
      id: Date.now().toString(), // ID temporal
      itemType: newLine.itemType,
      planId: newLine.planId || undefined,
      extraId: newLine.extraId || undefined,
      description: newLine.description.trim(),
      quantity,
      unitPrice,
      billingCycle: newLine.billingCycle,
      subtotal: quantity * unitPrice,
    };

    setLines(prev => [...prev, line]);

    // Reset formulario
    setNewLine({
      itemType: 'PLAN',
      planId: '',
      extraId: '',
      description: '',
      quantity: '1',
      unitPrice: '',
      billingCycle: 'MONTHLY',
    });
  };

  const removeLine = (id: string) => {
    setLines(prev => prev.filter(l => l.id !== id));
  };

  // ============================================
  // CÁLCULOS
  // ============================================

  const subtotal = lines.reduce((sum, line) => sum + line.subtotal, 0);
  const taxAmount = subtotal * 0.21;
  const total = subtotal + taxAmount;

  // ============================================
  // NAVEGACIÓN
  // ============================================

  const nextStep = () => {
    if (currentStep === 1 && !selectedCompanyId) {
      alert('Selecciona una empresa');
      return;
    }
    if (currentStep === 2 && lines.length === 0) {
      alert('Afegeix almenys una línia');
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  // ============================================
  // CREAR PRESUPUESTO
  // ============================================

  const createBudget = async () => {
    try {
      setLoading(true);
      setError(null);

      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + validUntilDays);

      const body = {
        companyId: selectedCompanyId,
        status: 'DRAFT',
        validUntil: validUntil.toISOString(),
        notes: notes.trim() || undefined,
        items: lines.map((line, index) => ({
          order: index,
          itemType: line.itemType,
          planId: line.planId,
          extraId: line.extraId,
          description: line.description,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          billingCycle: line.billingCycle,
        })),
      };

      const res = await fetch('/api/admin/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al crear pressupost');
      }

      const data = await res.json();
      alert(`✅ Pressupost ${data.budget.budgetNumber} creat correctament`);
      router.push('/admin/pressupostos');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconegut');
      console.error('Error creating budget:', err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // FUNCIONES AUXILIARES
  // ============================================

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)}€`;
  };

  const getItemTypeLabel = (type: BudgetItemType) => {
    const labels = {
      PLAN: 'Pla',
      EXTRA: 'Extra',
      CUSTOM: 'Personalitzat',
      DISCOUNT: 'Descompte',
    };
    return labels[type];
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/pressupostos"
          className="text-blue-600 hover:text-blue-800 mb-2 inline-block"
        >
          ← Tornar
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Crear Pressupost</h1>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  currentStep >= step
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`w-24 h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-2">
          <div className="text-center w-32">
            <span className={currentStep === 1 ? 'font-bold' : 'text-gray-500'}>
              Empresa
            </span>
          </div>
          <div className="text-center w-32">
            <span className={currentStep === 2 ? 'font-bold' : 'text-gray-500'}>
              Línies
            </span>
          </div>
          <div className="text-center w-32">
            <span className={currentStep === 3 ? 'font-bold' : 'text-gray-500'}>
              Revisar
            </span>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* PASO 1: SELECCIONAR EMPRESA */}
      {currentStep === 1 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Selecciona l'empresa</h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Empresa *
            </label>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Selecciona una empresa...</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name} - {company.cif}
                </option>
              ))}
            </select>
          </div>

          {selectedCompany && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-bold mb-2">Dades de l'empresa:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Nom:</span>{' '}
                  <span className="font-medium">{selectedCompany.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">CIF:</span>{' '}
                  <span className="font-medium">{selectedCompany.cif}</span>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>{' '}
                  <span className="font-medium">{selectedCompany.email}</span>
                </div>
                <div>
                  <span className="text-gray-600">Telèfon:</span>{' '}
                  <span className="font-medium">{selectedCompany.phone || '-'}</span>
                </div>
                {selectedCompany.address && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Adreça:</span>{' '}
                    <span className="font-medium">{selectedCompany.address}</span>
                  </div>
                )}
                {selectedCompany.website && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Web:</span>{' '}
                    <span className="font-medium">{selectedCompany.website}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={nextStep}
              disabled={!selectedCompanyId}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Següent →
            </button>
          </div>
        </div>
      )}

      {/* PASO 2: AÑADIR LÍNEAS */}
      {currentStep === 2 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Afegeix línies al pressupost</h2>

          {/* Formulario nueva línea */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-6">
            <h3 className="font-bold mb-3">Nova línia</h3>

            {/* Tipo de línea */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipus *
              </label>
              <select
                value={newLine.itemType}
                onChange={(e) =>
                  setNewLine({ ...newLine, itemType: e.target.value as BudgetItemType })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="PLAN">Pla de subscripció</option>
                <option value="EXTRA">Servei extra</option>
                <option value="CUSTOM">Concepte personalitzat</option>
                <option value="DISCOUNT">Descompte</option>
              </select>
            </div>

            {/* Si es PLAN */}
            {newLine.itemType === 'PLAN' && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pla *
                    </label>
                    <select
                      value={newLine.planId}
                      onChange={(e) => setNewLine({ ...newLine, planId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Selecciona un pla...</option>
                      {plans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.icono} {plan.nombre} - {formatCurrency(plan.precioMensual)}/mes
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facturació *
                    </label>
                    <select
                      value={newLine.billingCycle}
                      onChange={(e) =>
                        setNewLine({ ...newLine, billingCycle: e.target.value as BillingCycle })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="MONTHLY">Mensual</option>
                      <option value="ANNUAL">Anual</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Si es EXTRA */}
            {newLine.itemType === 'EXTRA' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servei extra *
                </label>
                <select
                  value={newLine.extraId}
                  onChange={(e) => setNewLine({ ...newLine, extraId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Selecciona un extra...</option>
                  {extras.map((extra) => (
                    <option key={extra.id} value={extra.id}>
                      {extra.name} - {formatCurrency(extra.basePrice)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Descripción (siempre visible) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripció *
              </label>
              <textarea
                value={newLine.description}
                onChange={(e) => setNewLine({ ...newLine, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={2}
                placeholder="Descripció del concepte..."
              />
            </div>

            {/* Cantidad y precio */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantitat *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newLine.quantity}
                  onChange={(e) => setNewLine({ ...newLine, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preu unitari (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newLine.unitPrice}
                  onChange={(e) => setNewLine({ ...newLine, unitPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            {/* Botón añadir */}
            <button
              onClick={addLine}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              + Afegir línia
            </button>
          </div>

          {/* Lista de líneas añadidas */}
          {lines.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold mb-3">Línies afegides ({lines.length})</h3>
              <div className="space-y-2">
                {lines.map((line) => (
                  <div
                    key={line.id}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{line.description}</div>
                      <div className="text-sm text-gray-600">
                        {getItemTypeLabel(line.itemType)} • Quantitat: {line.quantity} • Preu:{' '}
                        {formatCurrency(line.unitPrice)}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="font-bold">{formatCurrency(line.subtotal)}</div>
                      <button
                        onClick={() => removeLine(line.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totales provisionales */}
              <div className="mt-4 bg-blue-50 p-4 rounded-md">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span className="font-bold">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>IVA (21%):</span>
                  <span className="font-bold">{formatCurrency(taxAmount)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>TOTAL:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navegación */}
          <div className="flex justify-between mt-6">
            <button
              onClick={prevStep}
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              ← Enrere
            </button>
            <button
              onClick={nextStep}
              disabled={lines.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Següent →
            </button>
          </div>
        </div>
      )}

      {/* PASO 3: REVISAR Y CREAR */}
      {currentStep === 3 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Revisa i crea el pressupost</h2>

          {/* Datos empresa */}
          {selectedCompany && (
            <div className="mb-6">
              <h3 className="font-bold mb-2">Empresa:</h3>
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="font-medium">{selectedCompany.name}</div>
                <div className="text-sm text-gray-600">{selectedCompany.cif}</div>
                <div className="text-sm text-gray-600">{selectedCompany.email}</div>
              </div>
            </div>
          )}

          {/* Líneas */}
          <div className="mb-6">
            <h3 className="font-bold mb-2">Línies del pressupost:</h3>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm">Concepte</th>
                  <th className="px-4 py-2 text-right text-sm">Cant.</th>
                  <th className="px-4 py-2 text-right text-sm">Preu</th>
                  <th className="px-4 py-2 text-right text-sm">Total</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.id} className="border-t">
                    <td className="px-4 py-2">
                      <div className="font-medium">{line.description}</div>
                      <div className="text-xs text-gray-500">
                        {getItemTypeLabel(line.itemType)}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right">{line.quantity}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(line.unitPrice)}</td>
                    <td className="px-4 py-2 text-right font-medium">
                      {formatCurrency(line.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totales */}
          <div className="mb-6 bg-blue-50 p-4 rounded-md">
            <div className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <span className="font-bold">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>IVA (21%):</span>
              <span className="font-bold">{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>TOTAL:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Campos opcionales */}
          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vàlid fins (dies)
              </label>
              <input
                type="number"
                min="1"
                value={validUntilDays}
                onChange={(e) => setValidUntilDays(parseInt(e.target.value) || 30)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">
                Data límit:{' '}
                {new Date(
                  Date.now() + validUntilDays * 24 * 60 * 60 * 1000
                ).toLocaleDateString('ca-ES')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Notes internes o condicions especials..."
              />
            </div>
          </div>

          {/* Navegación */}
          <div className="flex justify-between mt-6">
            <button
              onClick={prevStep}
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              ← Enrere
            </button>
            <button
              onClick={createBudget}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Creant...' : '✓ Crear Pressupost'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}