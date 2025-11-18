'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Plus, Search, Filter, Edit, Trash2, Eye, EyeOff, MoreVertical, Clock, CheckCircle, XCircle, Pause, Archive, AlertCircle, BarChart3 } from 'lucide-react';

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
          style: 'border-gray-300 text-gray-500 bg-gray-50',
          canEdit: true
        };
      case 'PENDING':
        return {
          label: 'Pendent',
          style: 'border-gray-400 text-gray-600 bg-gray-50',
          canEdit: false
        };
      case 'PUBLISHED':
        return {
          label: 'Publicada',
          style: 'border-gray-400 text-gray-700 bg-white',
          canEdit: true
        };
      case 'REJECTED':
        return {
          label: 'Rebutjada',
          style: 'border-gray-400 text-gray-600 bg-white',
          canEdit: true
        };
      case 'PAUSED':
        return {
          label: 'Pausada',
          style: 'border-gray-300 text-gray-500 bg-gray-50',
          canEdit: true
        };
      case 'EXPIRED':
        return {
          label: 'Caducada',
          style: 'border-gray-300 text-gray-500 bg-white',
          canEdit: true
        };
      default:
        return {
          label: 'Desconegut',
          style: 'border-gray-300 text-gray-500 bg-white',
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

  const formatCompactDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ca-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const getShortCategoryName = (categoryName: string) => {
    const shortNames: { [key: string]: string } = {
      'Restauració': 'Rest.',
      'Bellesa i Salut': 'Bellesa',
      'Entreteniment': 'Entret.',
      'Serveis professionals': 'Serveis',
      'Comerç local': 'Comerç',
      'Altres': 'Altres'
    };
    return shortNames[categoryName] || categoryName.substring(0, 8) + (categoryName.length > 8 ? '...' : '');
  };

  const truncateText = (text: string, maxLength: number = 30) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
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
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Crear Nova Oferta
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Esborranys</p>
            <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Pendents</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Publicades</p>
            <p className="text-2xl font-bold text-gray-900">{stats.published}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Rebutjades</p>
            <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Pausades</p>
            <p className="text-2xl font-bold text-gray-900">{stats.paused}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Caducades</p>
            <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Destacades</p>
            <p className="text-2xl font-bold text-gray-900">{stats.featured}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cercar ofertes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
          >
            <option value="">Totes les categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
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
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
            <p className="mt-4 text-gray-600">Carregant ofertes...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hi ha ofertes</h3>
            <p className="text-gray-600 mb-6">Comença creant la teva primera oferta</p>
            <Link
              href="/empresa/ofertas/crear"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Crear Primera Oferta
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-[35%] px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Oferta</th>
                  <th className="w-[15%] px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Categoria</th>
                  <th className="w-[12%] px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Preu</th>
                  <th className="w-[15%] px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Estat</th>
                  <th className="w-[13%] px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Data</th>
                  <th className="w-[10%] px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Accions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {offers.map(offer => (
                  <tr key={offer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {truncateText(offer.title, 40)}
                          {offer.featured && (
                            <span className="ml-2 text-xs text-gray-500">(Destacada)</span>
                          )}
                        </p>
                        {offer.shortDescription && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                            {truncateText(offer.shortDescription, 50)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-700">
                        {offer.category.name}
                      </span>
                    </td>
                    <td className="px-2 py-3">
                      <span className="text-xs font-semibold text-gray-900">
                        {formatPrice(offer.price, offer.originalPrice)}
                      </span>
                    </td>
                    <td className="px-2 py-3">
                      {(() => {
                        const statusInfo = getStatusInfo(offer.status);
                        return (
                          <button
                            onClick={() => toggleStatus(offer.id, offer.status)}
                            disabled={!statusInfo.canEdit}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border transition-colors ${statusInfo.style} ${
                              !statusInfo.canEdit ? 'cursor-not-allowed opacity-75' : 'hover:bg-gray-100'
                            }`}
                          >
                            {statusInfo.label}
                          </button>
                        );
                      })()}
                    </td>
                    <td className="px-2 py-3">
                      <div className="text-xs text-gray-600 space-y-0.5">
                        <p>{formatCompactDate(offer.createdAt)}</p>
                        {offer.publishedAt && (
                          <p className="text-xs text-gray-400">
                            Pub: {formatCompactDate(offer.publishedAt)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          href={`/empresa/ofertas/${offer.id}/analytics`}
                          className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                          title="Analytics"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/empresa/ofertas/${offer.id}`}
                          className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(offer.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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