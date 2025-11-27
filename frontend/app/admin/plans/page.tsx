'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import toast, { Toaster } from 'react-hot-toast';
import PlanCard from '@/components/plans/PlanCard';

interface PlanConfig {
  id: string;
  slug: string;
  tier: string;
  name: string;
  nameEs: string;
  nameEn: string;
  description: string;
  basePrice: number;
  precioMensual: number;
  precioAnual: number;
  firstYearDiscount: number;
  maxActiveOffers: number;
  maxTeamMembers: number;
  maxFeaturedOffers: number;
  maxStorage: number;
  features: any;
  badge: string;
  badgeColor: string;
  isPioneer: boolean;
  color: string;
  icono: string;
  destacado: boolean;
  priority: number;
  hasFreeTrial: boolean;
  trialDurationDays: number;
  durationMonths: number;
  isActive: boolean;
  isVisible: boolean;
  displayNote: string;
  funcionalidades?: string;
  priceIncludesVAT: boolean;
}

type PlanLike = Omit<PlanConfig, 'id'> & { id?: string };

interface PlanStats {
  totalCompanies: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
}

export default function AdminPlansPage() {
  const { data: session, status } = useSession();
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<PlanConfig | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [planStats, setPlanStats] = useState<Record<string, PlanStats>>({});
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      cargarPlans();
    }
  }, [status]);

  const cargarPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/plans');
      const data = await response.json();

      if (data.success) {
        setPlans(data.data || []);
        // TODO: Cargar estadísticas por plan
        // await cargarEstadisticas(data.data);
      }
    } catch (error) {
      console.error('Error cargando planes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: PlanConfig) => {
    setEditingPlan(plan);
    setShowEditModal(true);
  };

  // Función de validación
  const validatePlan = (plan: PlanLike) => {
    const errors: string[] = [];

    if (plan.basePrice < 0) {
      errors.push('El preu base no pot ser negatiu');
    }

    if (plan.firstYearDiscount < 0 || plan.firstYearDiscount > 1) {
      errors.push('El descompte del primer any ha d\'estar entre 0 i 1 (0% - 100%)');
    }

    if (plan.maxActiveOffers < 0) {
      errors.push('El màxim d\'ofertes actives no pot ser negatiu');
    }

    if (plan.maxTeamMembers < 0) {
      errors.push('El màxim de membres d\'equip no pot ser negatiu');
    }

    if (plan.maxFeaturedOffers < 0) {
      errors.push('El màxim d\'ofertes destacades no pot ser negatiu');
    }

    if (plan.maxStorage < 0) {
      errors.push('El màxim d\'emmagatzematge no pot ser negatiu');
    }

    return errors;
  };

  const handleSave = async () => {
    if (!editingPlan) return;

    // Validar abans de guardar
    const validationErrors = validatePlan(editingPlan);
    if (validationErrors.length > 0) {
      toast.error(validationErrors[0]);
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/plans/${editingPlan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPlan)
      });

      if (response.ok) {
        await cargarPlans();
        setShowEditModal(false);
        setEditingPlan(null);
        toast.success('Plan actualitzat correctament!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Error al guardar el pla');
      }
    } catch (error) {
      console.error('Error guardando plan:', error);
      toast.error('Error de connexió');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (plan: any) => {
    try {
      // Calcular el NUEVO estado (invertir el actual)
      const newStatus = !plan.isActive;

      console.log('🔄 Toggle plan:', plan.name);
      console.log('   Estado actual:', plan.isActive);
      console.log('   Nuevo estado:', newStatus);

      const response = await fetch(`/api/admin/plans/${plan.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: newStatus
        })
      });

      const data = await response.json();
      console.log('📡 Respuesta API:', data);

      if (data.success) {
        // IMPORTANTE: Actualizar el estado local INMEDIATAMENTE
        setPlans(prevPlans =>
          prevPlans.map(p =>
            p.id === plan.id
              ? { ...p, isActive: newStatus }  // Actualizar con el nuevo estado
              : p
          )
        );

        // Mensaje dinámico según el nuevo estado
        const mensaje = newStatus
          ? 'Pla activat correctament'
          : 'Pla desactivat correctament';

        toast.success(mensaje);
        console.log('✅', mensaje);

      } else {
        toast.error(data.error || 'Error al canviar l\'estat del pla');
        console.error('❌ Error API:', data.error);
      }
    } catch (error) {
      console.error('❌ Error toggling plan:', error);
      toast.error('Error al canviar l\'estat del pla');
    }
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

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-right" />
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestió de Plans
          </h1>
          <p className="text-gray-600">
            Administra els plans de subscripció del sistema
          </p>
        </div>

        <div className="flex gap-3">
          {/* Toggle Vista */}
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'cards'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              🎴 Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              📊 Taula
            </button>
          </div>

          {/* Botón Crear */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Nou Plan
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Plans Actius</div>
          <div className="text-3xl font-bold text-gray-900">
            {plans.filter(p => p.isActive).length}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Plans Visibles</div>
          <div className="text-3xl font-bold text-gray-900">
            {plans.filter(p => p.isVisible).length}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Amb Trial</div>
          <div className="text-3xl font-bold text-gray-900">
            {plans.filter(p => p.hasFreeTrial).length}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Ingressos Potencials</div>
          <div className="text-3xl font-bold text-green-600">
            {plans.reduce((sum, p) => sum + p.basePrice, 0).toFixed(0)}€/any
          </div>
        </div>
      </div>

      {/* Vista Cards o Tabla según viewMode */}
      {viewMode === 'cards' ? (
        <div className="space-y-8">
          {/* FILA 1: PLAN ESPECIAL EMPRESES PIONERES */}
          {plans.filter(p => p.tier === 'PIONERES').map((plan) => {
            const firstYearPrice = plan.basePrice * (1 - plan.firstYearDiscount);

            return (
              <div key={plan.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-lg border-2 border-yellow-400 p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {plan.name}
                      </h3>
                      <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                        PLA ESPECIAL LLANÇAMENT
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Pla exclusiu per a les primeres empreses que confien en La Pública
                    </p>

                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-bold text-gray-900">GRATIS</span>
                      <span className="text-lg text-gray-600">durant 6 mesos</span>
                      {plan.firstYearDiscount > 0 && (
                        <span className="text-sm font-medium text-green-600">
                          després 50% 1r any (per a noves empreses)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Toggle Actiu/Inactiu */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">
                      {plan.isActive ? 'Actiu' : 'Inactiu'}
                    </span>
                    <button
                      onClick={() => toggleActive(plan)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        plan.isActive ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          plan.isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Límites */}
                  <div className="bg-white rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-gray-900 mb-3">Límits</h4>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ofertes actives</span>
                      <span className="font-semibold">{plan.maxActiveOffers}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Membres equip</span>
                      <span className="font-semibold">{plan.maxTeamMembers}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Emmagatzematge</span>
                      <span className="font-semibold">{plan.maxStorage} GB</span>
                    </div>
                  </div>

                  {/* Funcionalidades */}
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Funcionalitats</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {plan.funcionalidades
                        ? plan.funcionalidades.split('\n').filter(f => f.trim().length > 0).map((func, idx) => (
                            <li key={idx} className={func.startsWith('Tot') ? 'font-semibold text-gray-900 mt-2' : ''}>
                              • {func}
                            </li>
                          ))
                        : <li>• Sense funcionalitats definides</li>
                      }
                    </ul>
                  </div>
                </div>

                {/* Botones */}
                <div className="px-5 py-3 bg-white border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(plan)}
                    className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                  >
                    Editar
                  </button>
                </div>
              </div>
            );
          })}

          {/* FILA 2: PLANS REGULARS (ESTÀNDARD, ESTRATÈGIC, ENTERPRISE) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {plans
              .filter(p => p.tier !== 'PIONERES')
              .sort((a, b) => {
                const order = ['STANDARD', 'STRATEGIC', 'ENTERPRISE'];
                return order.indexOf(a.tier) - order.indexOf(b.tier);
              })
              .map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isAdminView={true}
                  onEdit={handleEdit}
                  onToggleActive={toggleActive}
                />
              ))}
          </div>
        </div>
      ) : (
        // VISTA TABLA
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Límits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trial
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estat
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full"
                           style={{ backgroundColor: plan.color + '20' }}>
                        <span className="text-2xl">{plan.icono}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {plan.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {plan.slug}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      plan.tier === 'ENTERPRISE' ? 'bg-purple-100 text-purple-800' :
                      plan.tier === 'STRATEGIC' ? 'bg-blue-100 text-blue-800' :
                      plan.tier === 'STANDARD' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {plan.tier}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="font-medium">{plan.basePrice}€/any</div>
                      {plan.firstYearDiscount > 0 && (
                        <div className="text-xs text-green-600">
                          -{(plan.firstYearDiscount * 100).toFixed(0)}% 1r any
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-500">
                      <div>👥 {plan.maxTeamMembers === -1 ? '∞' : plan.maxTeamMembers} membres</div>
                      <div>📢 {plan.maxActiveOffers === -1 ? '∞' : plan.maxActiveOffers} ofertes</div>
                      <div>💾 {plan.maxStorage === -1 ? '∞' : plan.maxStorage} GB</div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {plan.hasFreeTrial ? (
                      <span className="text-green-600">✓ {plan.trialDurationDays} dies</span>
                    ) : (
                      <span className="text-gray-400">No</span>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        plan.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {plan.isActive ? 'Actiu' : 'Inactiu'}
                      </span>
                      {!plan.isVisible && (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Ocult
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => toggleActive(plan)}
                      className={`${
                        plan.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                      }`}
                    >
                      {plan.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingPlan && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mb-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Editar Plan: {editingPlan.name}
              </h3>
            </div>

            <div className="space-y-4">
              {/* Precios */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preu Base Anual (€)
                  </label>
                  <input
                    type="number"
                    value={editingPlan.basePrice}
                    onChange={(e) => setEditingPlan({
                      ...editingPlan,
                      basePrice: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descompte 1r Any (0-1)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={editingPlan.firstYearDiscount}
                    onChange={(e) => setEditingPlan({
                      ...editingPlan,
                      firstYearDiscount: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* Límites */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Màx. Membres Equip (-1 = ∞)
                  </label>
                  <input
                    type="number"
                    value={editingPlan.maxTeamMembers}
                    onChange={(e) => setEditingPlan({
                      ...editingPlan,
                      maxTeamMembers: parseInt(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Màx. Ofertes Actives (-1 = ∞)
                  </label>
                  <input
                    type="number"
                    value={editingPlan.maxActiveOffers}
                    onChange={(e) => setEditingPlan({
                      ...editingPlan,
                      maxActiveOffers: parseInt(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Màx. Ofertes Destacades (-1 = ∞)
                  </label>
                  <input
                    type="number"
                    value={editingPlan.maxFeaturedOffers}
                    onChange={(e) => setEditingPlan({
                      ...editingPlan,
                      maxFeaturedOffers: parseInt(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Màx. Emmagatzematge GB (-1 = ∞)
                  </label>
                  <input
                    type="number"
                    value={editingPlan.maxStorage}
                    onChange={(e) => setEditingPlan({
                      ...editingPlan,
                      maxStorage: parseInt(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* Funcionalidades - Nuevo campo */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Funcionalitats (una per línia)
                  </label>
                  <textarea
                    value={editingPlan?.funcionalidades || ''}
                    onChange={(e) => setEditingPlan({
                      ...editingPlan!,
                      funcionalidades: e.target.value
                    })}
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                    placeholder="Escriu una funcionalitat per línia..."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    💡 Edita les funcionalitats del pla. Cada línia serà un punt.
                    Comença amb "Tot de [PLAN], més:" per a plans superiors.
                  </p>
                </div>
              </div>

              {/* Switches */}
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingPlan.isActive}
                    onChange={(e) => setEditingPlan({
                      ...editingPlan,
                      isActive: e.target.checked
                    })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Actiu</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingPlan.isVisible}
                    onChange={(e) => setEditingPlan({
                      ...editingPlan,
                      isVisible: e.target.checked
                    })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Visible</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingPlan.destacado}
                    onChange={(e) => setEditingPlan({
                      ...editingPlan,
                      destacado: e.target.checked
                    })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Destacat</span>
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingPlan(null);
                }}
                disabled={isSaving}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel·lar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {isSaving ? 'Guardant...' : 'Guardar Canvis'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-4xl shadow-lg rounded-md bg-white mb-10">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Crear Nou Plan
              </h3>
              <p className="text-gray-600">
                Omple els camps per crear un pla de subscripció nou
              </p>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();

              if (isCreating) return; // Prevenir múltiples submits

              // Crear objeto del nuevo plan
              const newPlan: PlanLike = {
                slug: (e.currentTarget.slug as any).value,
                tier: (e.currentTarget.tier as any).value,
                name: (e.currentTarget.name as any).value,
                nameEs: (e.currentTarget.nameEs as any).value,
                nameEn: (e.currentTarget.nameEn as any).value,
                description: (e.currentTarget.description as any).value,
                basePrice: parseFloat((e.currentTarget.basePrice as any).value) || 0,
                precioMensual: parseFloat((e.currentTarget.precioMensual as any).value) || 0,
                precioAnual: parseFloat((e.currentTarget.precioAnual as any).value) || 0,
                firstYearDiscount: parseFloat((e.currentTarget.firstYearDiscount as any).value) || 0,
                maxActiveOffers: parseInt((e.currentTarget.maxActiveOffers as any).value) || -1,
                maxTeamMembers: parseInt((e.currentTarget.maxTeamMembers as any).value) || -1,
                maxFeaturedOffers: parseInt((e.currentTarget.maxFeaturedOffers as any).value) || -1,
                maxStorage: parseInt((e.currentTarget.maxStorage as any).value) || -1,
                color: (e.currentTarget.color as any).value,
                icono: (e.currentTarget.icono as any).value,
                badge: (e.currentTarget.badge as any).value || '',
                badgeColor: (e.currentTarget.badgeColor as any).value || '',
                hasFreeTrial: (e.currentTarget.hasFreeTrial as any).checked,
                trialDurationDays: parseInt((e.currentTarget.trialDurationDays as any).value) || 0,
                isActive: (e.currentTarget.isActive as any).checked,
                isVisible: (e.currentTarget.isVisible as any).checked,
                destacado: (e.currentTarget.destacado as any).checked,
                displayNote: (e.currentTarget.displayNote as any).value || '',
                funcionalidades: (e.currentTarget.funcionalidades as any).value || '',
                priceIncludesVAT: true,
                priority: parseInt((e.currentTarget.priority as any).value) || 0,
                features: {},
                durationMonths: 12,
                isPioneer: false
              };

              // Validar antes de crear
              const validationErrors = validatePlan(newPlan);
              if (validationErrors.length > 0) {
                toast.error(validationErrors[0]);
                return;
              }

              setIsCreating(true);
              try {
                const response = await fetch('/api/plans', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(newPlan)
                });

                if (response.ok) {
                  await cargarPlans();
                  setShowCreateModal(false);
                  e.currentTarget.reset();
                  toast.success('Plan creat correctament!');
                } else {
                  const error = await response.json();
                  toast.error('Error creant pla: ' + (error.error || 'Error desconegut'));
                }
              } catch (error) {
                console.error('Error creant pla:', error);
                toast.error('Error de connexió');
              } finally {
                setIsCreating(false);
              }
            }}>
              <div className="space-y-6 max-h-[70vh] overflow-y-auto px-2">

                {/* Información Básica */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-4">Informació Bàsica</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Slug * <span className="text-xs text-gray-500">(identificador únic)</span>
                      </label>
                      <input
                        type="text"
                        name="slug"
                        required
                        placeholder="ex: pioneres, strategic"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tier *
                      </label>
                      <select
                        name="tier"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Selecciona...</option>
                        <option value="PIONERES">PIONERES</option>
                        <option value="STANDARD">STANDARD</option>
                        <option value="STRATEGIC">STRATEGIC</option>
                        <option value="ENTERPRISE">ENTERPRISE</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom (Català) *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="ex: Empreses Pioneres"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom (Castellà)
                      </label>
                      <input
                        type="text"
                        name="nameEs"
                        placeholder="ex: Empresas Pioneras"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom (Anglès)
                      </label>
                      <input
                        type="text"
                        name="nameEn"
                        placeholder="ex: Pioneer Companies"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripció
                      </label>
                      <textarea
                        name="description"
                        rows={2}
                        placeholder="Descripció del pla..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Precios */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-4">Preus</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preu Base Anual (€) *
                      </label>
                      <input
                        type="number"
                        name="basePrice"
                        required
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descompte 1r Any (0-1)
                      </label>
                      <input
                        type="number"
                        name="firstYearDiscount"
                        step="0.01"
                        min="0"
                        max="1"
                        defaultValue="0"
                        placeholder="0.50 = 50%"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preu Mensual (€)
                      </label>
                      <input
                        type="number"
                        name="precioMensual"
                        step="0.01"
                        min="0"
                        defaultValue="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preu Anual (€)
                      </label>
                      <input
                        type="number"
                        name="precioAnual"
                        step="0.01"
                        min="0"
                        defaultValue="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Límites */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-4">Límits (-1 = il·limitat)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Màx. Membres Equip
                      </label>
                      <input
                        type="number"
                        name="maxTeamMembers"
                        defaultValue="-1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Màx. Ofertes Actives
                      </label>
                      <input
                        type="number"
                        name="maxActiveOffers"
                        defaultValue="-1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Màx. Ofertes Destacades
                      </label>
                      <input
                        type="number"
                        name="maxFeaturedOffers"
                        defaultValue="-1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Màx. Emmagatzematge (GB)
                      </label>
                      <input
                        type="number"
                        name="maxStorage"
                        defaultValue="-1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Visual */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-4">Aparença</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color (hex) *
                      </label>
                      <input
                        type="color"
                        name="color"
                        defaultValue="#3B82F6"
                        className="w-full h-10 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Icona (emoji) *
                      </label>
                      <input
                        type="text"
                        name="icono"
                        required
                        placeholder="🌟"
                        maxLength={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-2xl text-center"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prioritat (ordre)
                      </label>
                      <input
                        type="number"
                        name="priority"
                        defaultValue="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Badge Text
                      </label>
                      <input
                        type="text"
                        name="badge"
                        placeholder="POPULAR, NOU..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Badge Color (hex)
                      </label>
                      <input
                        type="color"
                        name="badgeColor"
                        defaultValue="#10B981"
                        className="w-full h-10 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>

                {/* Trial */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-4">Prova Gratuïta</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="hasFreeTrial"
                        className="mr-3 h-4 w-4"
                      />
                      <span className="text-sm text-gray-700">Ofereix prova gratuïta</span>
                    </label>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dies de prova
                      </label>
                      <input
                        type="number"
                        name="trialDurationDays"
                        defaultValue="0"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nota mostrada
                      </label>
                      <input
                        type="text"
                        name="displayNote"
                        placeholder="ex: IVA inclòs"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>

                {/* Funcionalidades */}
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-4">📋 Funcionalitats</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Funcionalitats del pla (una per línia)
                    </label>
                    <textarea
                      name="funcionalidades"
                      rows={10}
                      placeholder="Escriu una funcionalitat per línia...
Exemple:
Fitxa empresarial completa
Ofertes editables
Estadístiques bàsiques
..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      💡 Per a plans superiors, comença amb "Tot de [PLAN], més:" i després les funcionalitats addicionals.
                    </p>
                  </div>
                </div>

                {/* Estados */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-4">Estat</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        defaultChecked
                        className="mr-3 h-4 w-4"
                      />
                      <span className="text-sm text-gray-700">Pla actiu</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isVisible"
                        defaultChecked
                        className="mr-3 h-4 w-4"
                      />
                      <span className="text-sm text-gray-700">Visible públicament</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="destacado"
                        className="mr-3 h-4 w-4"
                      />
                      <span className="text-sm text-gray-700">Destacar aquest pla</span>
                    </label>
                  </div>
                </div>

              </div>

              {/* Buttons */}
              <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isCreating}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel·lar
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isCreating && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {isCreating ? 'Creant...' : 'Crear Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}