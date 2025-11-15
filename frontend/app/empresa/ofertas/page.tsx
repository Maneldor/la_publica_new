'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Plus, Search, Filter, Edit, Trash2, Eye, EyeOff, Star, MoreVertical, Clock, CheckCircle, XCircle, Pause, Archive, AlertCircle } from 'lucide-react';

interface Offer {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  price: number | null;
  originalPrice: number | null;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  status: string;
  featured: boolean;
  createdAt: string;
  publishedAt: string | null;
}

interface Stats {
  total: number;
  draft: number;
  pending: number;
  published: number;
  rejected: number;
  paused: number;
  expired: number;
  featured: number;
}

interface ApiResponse {
  success: boolean;
  data: {
    offers: Offer[];
    stats: Stats;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export default function OfertasPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [search, categoryFilter, statusFilter, page]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/ofertas/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchOffers = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(categoryFilter && { categoryId: categoryFilter }),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await fetch(`/api/empresa/ofertas?${params}`);
      if (response.ok) {
        const data: ApiResponse = await response.json();
        setOffers(data.data.offers);
        setStats(data.data.stats);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Estàs segur que vols eliminar aquesta oferta?')) return;

    try {
      const response = await fetch(`/api/empresa/ofertas/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchOffers(); // Reload
      }
    } catch (error) {
      console.error('Error deleting offer:', error);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return {
          label: 'Esborrany',
          icon: EyeOff,
          color: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          canEdit: true
        };
      case 'PENDING':
        return {
          label: 'Pendent',
          icon: Clock,
          color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
          canEdit: false
        };
      case 'PUBLISHED':
        return {
          label: 'Publicada',
          icon: CheckCircle,
          color: 'bg-green-100 text-green-700 hover:bg-green-200',
          canEdit: true
        };
      case 'REJECTED':
        return {
          label: 'Rebutjada',
          icon: XCircle,
          color: 'bg-red-100 text-red-700 hover:bg-red-200',
          canEdit: true
        };
      case 'PAUSED':
        return {
          label: 'Pausada',
          icon: Pause,
          color: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
          canEdit: true
        };
      case 'EXPIRED':
        return {
          label: 'Caducada',
          icon: AlertCircle,
          color: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
          canEdit: true
        };
      default:
        return {
          label: 'Desconegut',
          icon: EyeOff,
          color: 'bg-gray-100 text-gray-700',
          canEdit: false
        };
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    let newStatus: string;

    // Define status transitions
    switch (currentStatus) {
      case 'DRAFT':
        newStatus = 'PENDING';
        break;
      case 'PENDING':
        alert('Les ofertes pendents només poden ser aprovades per l\'administrador');
        return;
      case 'PUBLISHED':
        newStatus = 'PAUSED';
        break;
      case 'REJECTED':
        newStatus = 'DRAFT';
        break;
      case 'PAUSED':
        newStatus = 'PUBLISHED';
        break;
      case 'EXPIRED':
        newStatus = 'DRAFT';
        break;
      default:
        return;
    }

    try {
      const response = await fetch(`/api/empresa/ofertas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchOffers(); // Reload
      }
    } catch (error) {
      console.error('Error toggling offer status:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ca-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number | null, originalPrice: number | null) => {
    if (!price) return '-';

    if (originalPrice && originalPrice > price) {
      const discount = Math.round((1 - price / originalPrice) * 100);
      return `€${price} (-${discount}%)`;
    }

    return `€${price}`;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ofertes</h1>
          <p className="text-gray-600 mt-1">Gestiona les ofertes de la teva empresa</p>
        </div>
        <Link
          href="/empresa/ofertas/crear"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Crear nova oferta
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-600 font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <EyeOff className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-600 font-medium">Esborranys</span>
            </div>
            <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="text-xs text-gray-600 font-medium">Pendents</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-xs text-gray-600 font-medium">Publicades</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.published}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-xs text-gray-600 font-medium">Rebutjades</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Pause className="w-4 h-4 text-orange-600" />
              <span className="text-xs text-gray-600 font-medium">Pausades</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">{stats.paused}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-gray-600 font-medium">Caducades</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.expired}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-gray-600 font-medium">Destacades</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.featured}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cercar ofertes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Totes les categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tots els estats</option>
            <option value="DRAFT">Esborranys</option>
            <option value="PENDING">Pendents de revisió</option>
            <option value="PUBLISHED">Publicades</option>
            <option value="REJECTED">Rebutjades</option>
            <option value="PAUSED">Pausades</option>
            <option value="EXPIRED">Caducades</option>
          </select>
        </div>
      </div>

      {/* Offers Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Carregant ofertes...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hi ha ofertes</h3>
            <p className="text-gray-600 mb-6">Comença creant la teva primera oferta</p>
            <Link
              href="/empresa/ofertas/crear"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Crear primera oferta
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Oferta</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Categoria</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Preu</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Estat</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Data</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Accions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {offers.map(offer => (
                  <tr key={offer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        {offer.featured && (
                          <Star className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate">{offer.title}</p>
                          {offer.shortDescription && (
                            <p className="text-sm text-gray-500 truncate mt-0.5">
                              {offer.shortDescription}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: `${offer.category.color}20`,
                          color: offer.category.color
                        }}
                      >
                        {offer.category.icon} {offer.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {formatPrice(offer.price, offer.originalPrice)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const statusInfo = getStatusInfo(offer.status);
                        const IconComponent = statusInfo.icon;
                        return (
                          <button
                            onClick={() => toggleStatus(offer.id, offer.status)}
                            disabled={!statusInfo.canEdit}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-colors ${statusInfo.color} ${
                              !statusInfo.canEdit ? 'cursor-not-allowed opacity-75' : ''
                            }`}
                          >
                            <IconComponent className="w-3.5 h-3.5" />
                            {statusInfo.label}
                          </button>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        <p>Creada: {formatDate(offer.createdAt)}</p>
                        {offer.publishedAt && (
                          <p className="text-xs text-gray-400 mt-1">
                            Publicada: {formatDate(offer.publishedAt)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/empresa/ofertas/${offer.id}`}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(offer.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Pàgina {page} de {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Següent
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}