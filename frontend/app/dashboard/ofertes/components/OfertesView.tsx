'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Search,
  Tag,
  Heart,
  Star,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  TrendingUp,
  Ticket
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Offer {
  id: string
  title: string
  slug: string
  shortDescription: string
  images: string[]
  price: number
  originalPrice: number
  discountPercentage: number
  category: {
    id: string
    name: string
    icon: string
    color: string
  }
  company: {
    id: string
    name: string
    logo: string
    plan: string
    verified: boolean
  }
  location: string
  remote: boolean
  featured: boolean
  expiresAt: string | null
  isFavorite: boolean
  stats: {
    couponsGenerated: number
    couponsUsed: number
    saves: number
    conversionRate: number
  }
  createdAt: string
}

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  color: string
}

interface OfertesViewProps {
  userId: string
}

type TabType = 'totes' | 'destacades' | 'favorits' | 'noves'

export function OfertesView({ userId }: OfertesViewProps) {
  const [offers, setOffers] = useState<Offer[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('totes')
  const [sortBy, setSortBy] = useState('recent')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 })
  const [stats, setStats] = useState({ total: 0, destacades: 0, favorits: 0, noves: 0 })
  const [showFilters, setShowFilters] = useState(false)

  // Cargar ofertas
  useEffect(() => {
    loadOffers()
  }, [page, activeTab, selectedCategory, sortBy])

  const loadOffers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      })

      if (selectedCategory) params.set('categoryId', selectedCategory)
      if (activeTab === 'destacades') params.set('featured', 'true')
      params.set('sort', activeTab === 'destacades' ? 'featured' : sortBy)

      const response = await fetch(`/api/ofertas?${params}`)
      const data = await response.json()

      if (response.ok) {
        setOffers(data.offers || [])
        setCategories(data.categories || [])
        setPagination({
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 1
        })

        // Calcular stats
        const allOffers = data.offers || []
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)

        setStats({
          total: data.pagination?.total || allOffers.length,
          destacades: allOffers.filter((o: Offer) => o.featured).length,
          favorits: allOffers.filter((o: Offer) => o.isFavorite).length,
          noves: allOffers.filter((o: Offer) => new Date(o.createdAt) > weekAgo).length
        })
      }
    } catch (error) {
      console.error('Error carregant ofertes:', error)
    } finally {
      setLoading(false)
    }
  }

  // Debounce para búsqueda
  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(debouncedSearch)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [debouncedSearch])

  // Filtrar ofertas localmente por búsqueda y tab
  const filteredOffers = offers.filter(offer => {
    // Filtro de búsqueda
    if (searchTerm) {
      const query = searchTerm.toLowerCase()
      const matchesSearch =
        offer.title.toLowerCase().includes(query) ||
        offer.shortDescription?.toLowerCase().includes(query) ||
        offer.company.name.toLowerCase().includes(query)
      if (!matchesSearch) return false
    }

    // Filtro por tab
    switch (activeTab) {
      case 'favorits':
        return offer.isFavorite
      case 'noves':
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return new Date(offer.createdAt) > weekAgo
      default:
        return true
    }
  })

  // Toggle favorito
  const handleToggleFavorite = async (e: React.MouseEvent, offerId: string, currentFavorite: boolean) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const method = currentFavorite ? 'DELETE' : 'POST'
      const response = await fetch(`/api/ofertas/${offerId}/favorite`, { method })

      if (response.ok) {
        setOffers(offers.map(offer =>
          offer.id === offerId
            ? {
                ...offer,
                isFavorite: !currentFavorite,
                stats: {
                  ...offer.stats,
                  saves: offer.stats.saves + (currentFavorite ? -1 : 1)
                }
              }
            : offer
        ))
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const getDiscountBadgeColor = (percentage: number) => {
    if (percentage >= 50) return 'bg-red-500'
    if (percentage >= 30) return 'bg-orange-500'
    if (percentage >= 15) return 'bg-green-500'
    return 'bg-slate-500'
  }

  const tabs = [
    { id: 'totes' as TabType, label: 'Totes', count: stats.total },
    { id: 'destacades' as TabType, label: 'Destacades', count: stats.destacades },
    { id: 'favorits' as TabType, label: 'Favorits', count: stats.favorits },
    { id: 'noves' as TabType, label: 'Noves', count: stats.noves }
  ]

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Ofertes"
          value={stats.total}
          icon={<Tag className="h-5 w-5 text-blue-600" />}
        />
        <StatCard
          label="Destacades"
          value={stats.destacades}
          icon={<Star className="h-5 w-5 text-yellow-500" />}
        />
        <StatCard
          label="Els Meus Favorits"
          value={stats.favorits}
          icon={<Heart className="h-5 w-5 text-red-500" />}
        />
        <StatCard
          label="Noves Aquesta Setmana"
          value={stats.noves}
          icon={<TrendingUp className="h-5 w-5 text-green-600" />}
        />
      </div>

      {/* Búsqueda y filtros */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Barra de búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cercar ofertes per nom, empresa o categoria..."
              value={debouncedSearch}
              onChange={(e) => setDebouncedSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Selector de categoría */}
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1) }}
            className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          >
            <option value="">Totes les categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>

          {/* Selector de ordenación */}
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1) }}
            className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          >
            <option value="recent">Més recents</option>
            <option value="discount">Millor descompte</option>
            <option value="expiring">Acaben aviat</option>
            <option value="popular">Més populars</option>
          </select>

          {/* Botón filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors",
              showFilters
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-slate-200 text-slate-700 hover:bg-slate-50"
            )}
          >
            <Filter className="h-4 w-4" />
            Filtres
          </button>
        </div>

        {/* Panel de filtros expandible */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setSelectedCategory(''); setPage(1) }}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-full transition-colors",
                  !selectedCategory
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                )}
              >
                Totes les categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setPage(1) }}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-full transition-colors",
                    selectedCategory === cat.id
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  )}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setPage(1) }}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab.id
                ? "text-blue-600 border-blue-600"
                : "text-slate-500 border-transparent hover:text-slate-700"
            )}
          >
            {tab.label}
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              activeTab === tab.id
                ? "bg-blue-100 text-blue-700"
                : "bg-slate-100 text-slate-600"
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Resultados */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {filteredOffers.length} oferta{filteredOffers.length !== 1 ? 's' : ''} trobada{filteredOffers.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <Tag className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">No s'han trobat ofertes</h3>
          <p className="text-sm text-slate-500">Prova a ajustar els filtres o el terme de cerca</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map(offer => (
            <OfferCard
              key={offer.id}
              offer={offer}
              onToggleFavorite={handleToggleFavorite}
              getDiscountBadgeColor={getDiscountBadgeColor}
            />
          ))}
        </div>
      )}

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm text-slate-600">
            Pàgina {page} de {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
            className="p-2 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}

// Componente StatCard
function StatCard({ label, value, icon }: { label: string; value: number; icon?: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-semibold text-slate-900">{value}</p>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

// Componente OfferCard
function OfferCard({
  offer,
  onToggleFavorite,
  getDiscountBadgeColor
}: {
  offer: Offer
  onToggleFavorite: (e: React.MouseEvent, offerId: string, isFavorite: boolean) => void
  getDiscountBadgeColor: (percentage: number) => string
}) {
  return (
    <Link
      href={`/dashboard/ofertes/${offer.slug}`}
      className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all"
    >
      {/* Imagen */}
      <div className="relative h-48 bg-slate-100">
        {offer.images[0] ? (
          <Image
            src={offer.images[0]}
            alt={offer.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tag className="w-12 h-12 text-slate-300" />
          </div>
        )}

        {/* Botón favorito */}
        <button
          onClick={(e) => onToggleFavorite(e, offer.id, offer.isFavorite)}
          className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
        >
          <Heart
            className={cn(
              "w-5 h-5",
              offer.isFavorite
                ? "fill-red-500 text-red-500"
                : "text-slate-400"
            )}
          />
        </button>

        {/* Badge destacada */}
        {offer.featured && (
          <div className="absolute top-3 left-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Star className="w-3 h-3 fill-white" />
            Destacada
          </div>
        )}

        {/* Badge descuento */}
        {offer.discountPercentage > 0 && (
          <div className={cn(
            "absolute bottom-3 right-3 text-white px-3 py-1 rounded-full text-sm font-bold",
            getDiscountBadgeColor(offer.discountPercentage)
          )}>
            -{offer.discountPercentage}%
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Categoría */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <span>{offer.category.icon}</span>
          <span>{offer.category.name}</span>
        </div>

        {/* Título */}
        <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {offer.title}
        </h3>

        {/* Descripción */}
        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
          {offer.shortDescription}
        </p>

        {/* Empresa */}
        <div className="flex items-center gap-2 mb-3 text-sm">
          <span className="font-medium text-slate-700">{offer.company.name}</span>
          {offer.company.verified && (
            <span className="text-blue-600 text-xs">Verificada</span>
          )}
        </div>

        {/* Precio */}
        <div className="flex items-center gap-2 mb-3">
          {offer.originalPrice > 0 && (
            <span className="text-slate-400 line-through text-sm">
              {offer.originalPrice.toFixed(2)}
            </span>
          )}
          <span className="text-xl font-bold text-blue-600">
            {offer.price.toFixed(2)}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-slate-500 pt-3 border-t border-slate-100">
          <span className="flex items-center gap-1">
            <Ticket className="w-3 h-3" />
            {offer.stats.couponsGenerated}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {offer.stats.saves}
          </span>
        </div>
      </div>
    </Link>
  )
}
