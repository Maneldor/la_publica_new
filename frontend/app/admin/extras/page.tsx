'use client';

import { useState, useEffect, useCallback } from 'react';

// ============================================
// TIPOS
// ============================================

type ExtraCategory =
  | 'WEB_MAINTENANCE' | 'BRANDING' | 'MARKETING' | 'SEO'
  | 'CONTENT' | 'CONSULTING' | 'TRAINING' | 'DEVELOPMENT'
  | 'SUPPORT' | 'OTHER';

type PriceType = 'FIXED' | 'MONTHLY' | 'ANNUAL' | 'HOURLY' | 'CUSTOM';

interface Extra {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: ExtraCategory;
  basePrice: number;
  priceType: PriceType;
  active: boolean;
  featured: boolean;
  icon?: string;
  order: number;
  _count?: {
    budgetItems: number;
    invoiceItems: number;
  };
}

interface ExtraFormData {
  name: string;
  description: string;
  category: ExtraCategory;
  basePrice: string;
  priceType: PriceType;
  active: boolean;
  featured: boolean;
  icon: string;
}

// ============================================
// CONSTANTES
// ============================================

const CATEGORIES: { value: ExtraCategory; label: string; icon: string }[] = [
  { value: 'WEB_MAINTENANCE', label: 'Manteniment Web', icon: '🔧' },
  { value: 'BRANDING', label: 'Branding', icon: '🎨' },
  { value: 'MARKETING', label: 'Marketing', icon: '📱' },
  { value: 'SEO', label: 'SEO', icon: '🔍' },
  { value: 'CONTENT', label: 'Contingut', icon: '✍️' },
  { value: 'CONSULTING', label: 'Consultoria', icon: '💡' },
  { value: 'TRAINING', label: 'Formació', icon: '🎓' },
  { value: 'DEVELOPMENT', label: 'Desenvolupament', icon: '💻' },
  { value: 'SUPPORT', label: 'Suport', icon: '🛟' },
  { value: 'OTHER', label: 'Altres', icon: '📦' },
];

const PRICE_TYPES: { value: PriceType; label: string }[] = [
  { value: 'FIXED', label: 'Preu fix (pagament únic)' },
  { value: 'MONTHLY', label: 'Mensual' },
  { value: 'ANNUAL', label: 'Anual' },
  { value: 'HOURLY', label: 'Per hores' },
  { value: 'CUSTOM', label: 'Personalitzat' },
];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function ExtrasPage() {

  // Estados
  const [extras, setExtras] = useState<Extra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingExtra, setEditingExtra] = useState<Extra | null>(null);
  const [formData, setFormData] = useState<ExtraFormData>({
    name: '',
    description: '',
    category: 'WEB_MAINTENANCE',
    basePrice: '',
    priceType: 'MONTHLY',
    active: true,
    featured: false,
    icon: '',
  });

  // ============================================
  // EFECTOS
  // ============================================

  // ============================================
  // FUNCIONES API
  // ============================================

  const fetchExtras = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter);
      if (activeFilter !== 'ALL') params.append('active', activeFilter);
      if (searchTerm) params.append('search', searchTerm);

      const res = await fetch(`/api/admin/extras?${params.toString()}`);

      if (!res.ok) {
        throw new Error('Error al cargar extras');
      }

      const data = await res.json();
      setExtras(data.extras || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching extras:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, activeFilter, searchTerm]);

  useEffect(() => {
    fetchExtras();
  }, [fetchExtras]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/admin/extras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          basePrice: parseFloat(formData.basePrice),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al crear extra');
      }

      // Cerrar modal y recargar
      setShowModal(false);
      resetForm();
      fetchExtras();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al crear extra');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExtra) return;

    try {
      const res = await fetch(`/api/admin/extras/${editingExtra.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          basePrice: parseFloat(formData.basePrice),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al actualizar extra');
      }

      // Cerrar modal y recargar
      setShowModal(false);
      setEditingExtra(null);
      resetForm();
      fetchExtras();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al actualizar extra');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Seguro que quieres eliminar "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/extras/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al eliminar extra');
      }

      const data = await res.json();

      if (data.deactivated) {
        alert(data.message);
      }

      fetchExtras();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar extra');
    }
  };

  const handleToggleActive = async (extra: Extra) => {
    try {
      const res = await fetch(`/api/admin/extras/${extra.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !extra.active }),
      });

      if (!res.ok) throw new Error('Error al cambiar estado');

      fetchExtras();
    } catch {
      alert('Error al cambiar estado del extra');
    }
  };

  // ============================================
  // FUNCIONES AUXILIARES
  // ============================================

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'WEB_MAINTENANCE',
      basePrice: '',
      priceType: 'MONTHLY',
      active: true,
      featured: false,
      icon: '',
    });
  };

  const openCreateModal = () => {
    resetForm();
    setEditingExtra(null);
    setShowModal(true);
  };

  const openEditModal = (extra: Extra) => {
    setEditingExtra(extra);
    setFormData({
      name: extra.name,
      description: extra.description,
      category: extra.category,
      basePrice: extra.basePrice.toString(),
      priceType: extra.priceType,
      active: extra.active,
      featured: extra.featured,
      icon: extra.icon || '',
    });
    setShowModal(true);
  };

  const formatPrice = (price: number | string, type: PriceType) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    const formatted = `${numPrice.toFixed(2)}€`;
    if (type === 'MONTHLY') return `${formatted}/mes`;
    if (type === 'ANNUAL') return `${formatted}/any`;
    if (type === 'HOURLY') return `${formatted}/hora`;
    return formatted;
  };

  const getCategoryLabel = (category: ExtraCategory) => {
    return CATEGORIES.find(c => c.value === category)?.label || category;
  };

  const getCategoryIcon = (category: ExtraCategory) => {
    return CATEGORIES.find(c => c.value === category)?.icon || '📦';
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestió d'Extras</h1>
        <p className="text-gray-600 mt-2">
          Catàleg de serveis addicionals per oferir als clients
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total Extras</div>
          <div className="text-2xl font-bold">{extras.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Actius</div>
          <div className="text-2xl font-bold text-green-600">
            {extras.filter(e => e.active).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Destacats</div>
          <div className="text-2xl font-bold text-blue-600">
            {extras.filter(e => e.featured).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Inactius</div>
          <div className="text-2xl font-bold text-red-600">
            {extras.filter(e => !e.active).length}
          </div>
        </div>
      </div>

      {/* Filtros y botón crear */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* Búsqueda */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Nom o descripció..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchExtras()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Filtro categoría */}
          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="ALL">Totes</option>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro activo */}
          <div className="w-full md:w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estat
            </label>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="ALL">Tots</option>
              <option value="true">Actius</option>
              <option value="false">Inactius</option>
            </select>
          </div>

          {/* Botón buscar */}
          <button
            onClick={fetchExtras}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Buscar
          </button>

          {/* Botón crear */}
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <span>+</span> Nou Extra
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-600">Carregant extras...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tabla de extras */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Extra
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Preu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ús
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Accions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {extras.map((extra) => (
                <tr key={extra.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">
                        {extra.icon || getCategoryIcon(extra.category)}
                      </span>
                      <div>
                        <div className="font-medium text-gray-900">
                          {extra.name}
                          {extra.featured && (
                            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              ⭐ Destacat
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {extra.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {getCategoryLabel(extra.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">
                      {formatPrice(extra.basePrice, extra.priceType)}
                    </span>
                    <div className="text-xs text-gray-500">IVA inclòs</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {extra.active ? (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                        Actiu
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                        Inactiu
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {extra._count && (
                      <div>
                        {extra._count.budgetItems + extra._count.invoiceItems} usos
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEditModal(extra)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleToggleActive(extra)}
                      className={`${
                        extra.active ? 'text-orange-600' : 'text-green-600'
                      } hover:opacity-75 mr-3`}
                    >
                      {extra.active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => handleDelete(extra.id, extra.name)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {extras.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No s'han trobat extras amb els filtres seleccionats
              </p>
            </div>
          )}
        </div>
      )}

      {/* MODAL CREAR/EDITAR */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingExtra ? 'Editar Extra' : 'Nou Extra'}
              </h2>

              <form onSubmit={editingExtra ? handleUpdate : handleCreate}>
                {/* Nombre */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Manteniment Web Premium"
                  />
                </div>

                {/* Descripción */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripció *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="Descripció detallada del servei..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Categoría */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoria *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value as ExtraCategory})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tipo de precio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipus de Preu *
                    </label>
                    <select
                      required
                      value={formData.priceType}
                      onChange={(e) => setFormData({...formData, priceType: e.target.value as PriceType})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {PRICE_TYPES.map(pt => (
                        <option key={pt.value} value={pt.value}>
                          {pt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Precio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preu Base (€) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.basePrice}
                      onChange={(e) => setFormData({...formData, basePrice: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="99.00"
                    />
                    <p className="text-xs text-gray-500 mt-1">IVA inclòs (21%)</p>
                  </div>

                  {/* Icono */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Icona (emoji)
                    </label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({...formData, icon: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="🔧"
                      maxLength={2}
                    />
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="mb-6 space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({...formData, active: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm">Actiu</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm">Destacat ⭐</span>
                  </label>
                </div>

                {/* Botones */}
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingExtra(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel·lar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingExtra ? 'Actualitzar' : 'Crear'} Extra
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}