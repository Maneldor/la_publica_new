'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Filter, Heart, TrendingUp, Star, MapPin, Tag } from 'lucide-react';

interface Offer {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  images: string[];
  price: number;
  originalPrice: number;
  discountPercentage: number;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  company: {
    id: string;
    name: string;
    logo: string;
    plan: string;
    verified: boolean;
  };
  location: string;
  remote: boolean;
  featured: boolean;
  expiresAt: string | null;
  isFavorite: boolean;
  stats: {
    couponsGenerated: number;
    couponsUsed: number;
    saves: number;
    conversionRate: number;
  };
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
}

export default function OfertesPublicPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Estado
  const [offers, setOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTab, setSelectedTab] = useState<'totes' | 'destacades' | 'favorits' | 'noves'>('totes');
  const [sortBy, setSortBy] = useState('recent');

  // Paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Cargar datos
  useEffect(() => {
    loadOffers();
  }, [selectedCategory, sortBy, page, selectedTab]);

  const loadOffers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      if (selectedCategory) {
        params.append('categoryId', selectedCategory);
      }

      if (selectedTab === 'destacades') {
        params.append('featured', 'true');
      }

      params.append('sort', selectedTab === 'destacades' ? 'featured' : sortBy);
      params.append('page', page.toString());
      params.append('limit', '12');

      console.log('🔍 Fetching offers with params:', params.toString());

      const response = await fetch(`/api/ofertas?${params}`);

      if (!response.ok) {
        throw new Error('Error al carregar les ofertes');
      }

      const data = await response.json();

      console.log('✅ Offers loaded:', data.offers.length);

      setOffers(data.offers);
      setCategories(data.categories || []);
      setTotalPages(data.pagination.totalPages);
      setHasMore(data.pagination.hasMore);

    } catch (err) {
      console.error('❌ Error loading offers:', err);
      setError(err instanceof Error ? err.message : 'Error desconegut');
    } finally {
      setLoading(false);
    }
  };

  // Toggle favorito
  const handleToggleFavorite = async (offerId: string, currentFavorite: boolean) => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=/dashboard/ofertes');
      return;
    }

    try {
      const method = currentFavorite ? 'DELETE' : 'POST';
      const response = await fetch(`/api/ofertas/${offerId}/favorite`, { method });

      if (!response.ok) {
        throw new Error('Error al gestionar favorit');
      }

      // Actualizar estado local
      setOffers(offers.map(offer =>
        offer.id === offerId
          ? { ...offer, isFavorite: !currentFavorite, stats: { ...offer.stats, saves: offer.stats.saves + (currentFavorite ? -1 : 1) } }
          : offer
      ));

      console.log(`${currentFavorite ? '💔' : '❤️'} Favorite toggled for offer ${offerId}`);

    } catch (err) {
      console.error('Error toggling favorite:', err);
      alert('Error al gestionar favorit');
    }
  };

  // Filtrar ofertas según tab
  const filteredOffers = offers.filter(offer => {
    // Filtro de búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        offer.title.toLowerCase().includes(query) ||
        offer.shortDescription?.toLowerCase().includes(query)
      );
    }

    // Filtro por tab
    switch (selectedTab) {
      case 'favorits':
        return offer.isFavorite;
      case 'noves':
        // Ofertas de la última semana
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(offer.createdAt) > weekAgo;
      default:
        return true;
    }
  });

  // Calcular stats para tabs
  const tabCounts = {
    totes: offers.length,
    destacades: offers.filter(o => o.featured).length,
    favorits: offers.filter(o => o.isFavorite).length,
    noves: offers.filter(o => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(o.createdAt) > weekAgo;
    }).length
  };

  const getDiscountBadgeColor = (percentage: number) => {
    if (percentage >= 50) return 'bg-red-500';
    if (percentage >= 30) return 'bg-orange-500';
    if (percentage >= 15) return 'bg-green-500';
    return 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-4">
            Ofertes Exclusives per Empleats Públics
          </h1>
          <p className="text-xl text-blue-100">
            {session
              ? `Hola ${session.user?.name || 'empleat/da'}, descobreix les millors ofertes!`
              : 'Descobreix descomptes i avantatges exclusius'
            }
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ofertes Disponibles</p>
                <p className="text-2xl font-bold text-blue-600">{tabCounts.totes}</p>
              </div>
              <Tag className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Destacades</p>
                <p className="text-2xl font-bold text-yellow-600">{tabCounts.destacades}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Els Meus Favorits</p>
                <p className="text-2xl font-bold text-red-600">{tabCounts.favorits}</p>
              </div>
              <Heart className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Noves Aquesta Setmana</p>
                <p className="text-2xl font-bold text-green-600">{tabCounts.noves}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            {[
              { key: 'totes', label: 'Totes', count: tabCounts.totes },
              { key: 'destacades', label: 'Destacades', count: tabCounts.destacades },
              { key: 'favorits', label: 'Favorits', count: tabCounts.favorits },
              { key: 'noves', label: 'Noves', count: tabCounts.noves }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => {
                  setSelectedTab(tab.key as any);
                  setPage(1);
                }}
                className={`
                  py-4 px-2 border-b-2 font-medium transition-colors
                  ${selectedTab === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar ofertes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Categoría */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Totes les categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>

            {/* Ordenar */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="recent">Més recents</option>
              <option value="discount">Millor descompte</option>
              <option value="expiring">Acaben aviat</option>
              <option value="popular">Més populars</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">❌ {error}</p>
            <button
              onClick={loadOffers}
              className="mt-2 text-red-600 hover:text-red-800 font-medium"
            >
              Tornar a intentar
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregant ofertes...</p>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No s&apos;han trobat ofertes</p>
            <p className="text-gray-400 text-sm mt-2">Prova a canviar els filtres</p>
          </div>
        ) : (
          <>
            {/* Grid de ofertas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredOffers.map(offer => (
                <div
                  key={offer.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden group relative"
                >
                  {/* Botón favorito */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleToggleFavorite(offer.id, offer.isFavorite);
                    }}
                    className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        offer.isFavorite
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-400'
                      }`}
                    />
                  </button>

                  <Link href={`/dashboard/ofertes/${offer.slug}`}>
                    {/* Imagen */}
                    <div className="relative h-48 bg-gray-200">
                      {offer.images[0] ? (
                        <Image
                          src={offer.images[0]}
                          alt={offer.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Tag className="w-12 h-12 text-gray-400" />
                        </div>
                      )}

                      {/* Badge destacada */}
                      {offer.featured && (
                        <div className="absolute top-3 left-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                          <Star className="w-4 h-4 fill-white" />
                          Destacada
                        </div>
                      )}

                      {/* Badge descuento */}
                      {offer.discountPercentage > 0 && (
                        <div className={`absolute bottom-3 right-3 ${getDiscountBadgeColor(offer.discountPercentage)} text-white px-3 py-1 rounded-full text-sm font-bold`}>
                          -{offer.discountPercentage}%
                        </div>
                      )}
                    </div>

                    {/* Contenido */}
                    <div className="p-4">
                      {/* Categoría */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <span>{offer.category.icon}</span>
                        <span>{offer.category.name}</span>
                      </div>

                      {/* Título */}
                      <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {offer.title}
                      </h3>

                      {/* Descripción */}
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {offer.shortDescription}
                      </p>

                      {/* Empresa */}
                      <div className="flex items-center gap-2 mb-3 text-sm">
                        <span className="font-medium text-gray-700">{offer.company.name}</span>
                        {offer.company.verified && (
                          <span className="text-blue-600">✓</span>
                        )}
                      </div>

                      {/* Precio */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          {offer.originalPrice > 0 && (
                            <span className="text-gray-400 line-through text-sm mr-2">
                              {offer.originalPrice.toFixed(2)}€
                            </span>
                          )}
                          <span className="text-2xl font-bold text-blue-600">
                            {offer.price.toFixed(2)}€
                          </span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t">
                        <span title="Cupons generats">
                          🎫 {offer.stats.couponsGenerated}
                        </span>
                        <span title="Cupons usats">
                          ✅ {offer.stats.couponsUsed}
                        </span>
                        <span title="Guardades com a favorit">
                          ❤️ {offer.stats.saves}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  ← Anterior
                </button>

                <span className="text-gray-600">
                  Pàgina {page} de {totalPages}
                </span>

                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={!hasMore}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Següent →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}