'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Megaphone,
  Search,
  Plus,
  Grid,
  List,
  User,
  Tag,
  Heart,
  MapPin,
  Camera,
  Package,
  X,
  Loader2,
  Eye,
  MessageCircle,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  MoreVertical,
  ShoppingBag,
} from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardContent } from '@/components/ui/card'
import { FeaturedAdsSlider, FeaturedAdsSidebar } from '@/components/anuncis'

// Types
interface AnunciItem {
  id: string
  title: string
  description: string
  type: 'oferta' | 'demanda'
  category: string
  price: number
  priceType: 'fix' | 'negociable' | 'gratuït'
  location: string
  images: string[]
  author: string
  authorAvatar: string
  authorDepartment: string
  status: string
  createdAt: string
  views: number
  favorites: number
  contacts: number
  isFavorite: boolean
}

interface MyAnuncioStats {
  total: number
  published: number
  pending: number
  rejected: number
  sold: number
  draft: number
  expired: number
  totalViews: number
  totalReactions: number
  totalContacts: number
}

// Tabs (sin "Tots" - se empieza por Ofertes)
const TABS = [
  { id: 'ofertes', label: 'Ofertes' },
  { id: 'demandes', label: 'Demandes' },
  { id: 'favorits', label: 'Preferits' },
  { id: 'meus', label: 'Els Meus' },
]

// Status tabs para "Els Meus" (sin "Tots" - se empieza por Publicats)
const STATUS_TABS = [
  { id: 'published', label: 'Publicats', icon: CheckCircle },
  { id: 'pending', label: 'Pendents', icon: Clock },
  { id: 'rejected', label: 'Rebutjats', icon: XCircle },
  { id: 'sold', label: 'Venuts', icon: ShoppingBag },
]

// Categories
const CATEGORIES = [
  { value: '', label: 'Totes les categories' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'immobiliaria', label: 'Immobiliària' },
  { value: 'electronica', label: 'Electrònica' },
  { value: 'llar', label: 'Llar i jardí' },
  { value: 'esports', label: 'Esports' },
  { value: 'serveis', label: 'Serveis' },
  { value: 'altres', label: 'Altres' },
]

// Hook para obtener anuncios públicos
function usePublicAnuncios(filters?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ['public-anuncios', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.page) params.append('page', String(filters.page))
      if (filters?.limit) params.append('limit', String(filters.limit))
      if (filters?.search) params.append('search', filters.search)

      const response = await fetch(`/api/announcements?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success && result.data) {
        return {
          data: result.data,
          pagination: result.pagination || {
            total: result.data.length,
            page: 1,
            limit: 20,
            totalPages: 1
          }
        }
      }

      return result
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Hook para obtener mis anuncios
function useMyAnuncios(filters?: { page?: number; limit?: number; status?: string; search?: string }) {
  return useQuery({
    queryKey: ['my-anuncios', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.page) params.append('page', String(filters.page))
      if (filters?.limit) params.append('limit', String(filters.limit))
      if (filters?.status) params.append('status', filters.status)
      if (filters?.search) params.append('search', filters.search)

      const response = await fetch(`/api/announcements/my?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      return response.json()
    },
    staleTime: 2 * 60 * 1000,
  })
}

// Hook para marcar como vendido
function useMarkAsSold() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/announcements/${id}/sold`, {
        method: 'PATCH',
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al marcar como vendido')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-anuncios'] })
      toast.success('Anunci marcat com a venut')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

// Hook para renovar anuncio
function useRenewAnuncio() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/announcements/${id}/renew`, {
        method: 'PATCH',
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al renovar')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-anuncios'] })
      toast.success('Anunci renovat correctament')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

// Hook para eliminar anuncio
function useDeleteAnuncio() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al eliminar')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-anuncios'] })
      toast.success('Anunci eliminat correctament')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

// Hook per obtenir els IDs dels favorits de l'usuari
function useFavoriteIds() {
  return useQuery({
    queryKey: ['favorite-ids'],
    queryFn: async () => {
      const response = await fetch('/api/announcements/favorites')
      if (!response.ok) return { favoriteIds: [] }
      return response.json()
    },
    staleTime: 30 * 1000, // 30 segons
  })
}

// Hook per afegir/eliminar favorit
function useToggleFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ anuncioId, isFavorite }: { anuncioId: string; isFavorite: boolean }) => {
      const response = await fetch(`/api/announcements/${anuncioId}/favorite`, {
        method: isFavorite ? 'DELETE' : 'POST',
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error')
      }
      return response.json()
    },
    onSuccess: (data, variables) => {
      // Actualitzar la llista de favorits
      queryClient.invalidateQueries({ queryKey: ['favorite-ids'] })
      queryClient.invalidateQueries({ queryKey: ['public-anuncios'] })

      if (data.isFavorite) {
        toast.success('Afegit als preferits')
      } else {
        toast.success('Eliminat dels preferits')
      }
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

// AnunciCard Component
function AnunciCard({ anunci, viewMode, onToggleFavorite }: {
  anunci: AnunciItem;
  viewMode: 'grid' | 'list';
  onToggleFavorite?: (anuncioId: string, isFavorite: boolean) => void;
}) {
  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onToggleFavorite) {
      onToggleFavorite(anunci.id, anunci.isFavorite)
    }
  }

  const formatPrice = (price: number, priceType: string) => {
    if (priceType === 'gratuït' || price === 0) return 'Gratuït'
    return `${price.toLocaleString('ca-ES')} €`
  }

  if (viewMode === 'list') {
    return (
      <Link href={`/dashboard/anuncis/${anunci.id}`}>
        <Card className="mb-3 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Image */}
              <div className="w-32 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                {anunci.images?.[0] ? (
                  <Image
                    src={anunci.images[0]}
                    alt={anunci.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-lg font-bold text-indigo-600">
                      {formatPrice(anunci.price, anunci.priceType)}
                    </p>
                    <h3 className="font-medium text-gray-900 line-clamp-1 hover:text-indigo-600 transition-colors">
                      {anunci.title}
                    </h3>
                  </div>
                  <button
                    onClick={handleFavorite}
                    className={`p-2 rounded-full transition-colors flex-shrink-0 ${
                      anunci.isFavorite
                        ? 'bg-red-100 text-red-500'
                        : 'bg-gray-100 text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${anunci.isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                    {anunci.category}
                  </span>
                  {anunci.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {anunci.location}
                    </span>
                  )}
                  <span>{anunci.createdAt}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Link href={`/dashboard/anuncis/${anunci.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all group h-full flex flex-col">
        {/* Image */}
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          {anunci.images?.[0] ? (
            <Image
              src={anunci.images[0]}
              alt={anunci.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
          )}

          {/* Type badge */}
          <span className={`absolute top-3 left-3 px-2 py-1 text-xs font-medium rounded-full backdrop-blur-sm ${
            anunci.type === 'oferta'
              ? 'bg-green-500/90 text-white'
              : 'bg-amber-500/90 text-white'
          }`}>
            {anunci.type === 'oferta' ? 'Oferta' : 'Demanda'}
          </span>

          {/* Favorite button */}
          <button
            onClick={handleFavorite}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-colors ${
              anunci.isFavorite
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-gray-600 hover:bg-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${anunci.isFavorite ? 'fill-current' : ''}`} />
          </button>

          {/* Multiple images indicator */}
          {anunci.images?.length > 1 && (
            <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 text-white text-xs rounded-full backdrop-blur-sm flex items-center gap-1">
              <Camera className="w-3 h-3" />
              {anunci.images.length}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Price */}
          <p className="text-xl font-bold text-indigo-600">
            {formatPrice(anunci.price, anunci.priceType)}
          </p>

          {/* Title */}
          <h3 className="font-medium text-gray-900 mt-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {anunci.title}
          </h3>

          {/* Category & Location */}
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 flex-wrap">
            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
              {anunci.category}
            </span>
            {anunci.location && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {anunci.location}
                </span>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200">
                {anunci.authorAvatar ? (
                  <Image
                    src={anunci.authorAvatar}
                    alt=""
                    width={24}
                    height={24}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-xs font-bold">
                    {anunci.author?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-500 truncate max-w-[100px]">{anunci.author}</span>
            </div>
            <span className="text-xs text-gray-400">{anunci.createdAt}</span>
          </div>
        </div>
      </Card>
    </Link>
  )
}

// MyAnunciCard Component - para la sección "Els Meus"
function MyAnunciCard({
  anunci,
  onMarkSold,
  onRenew,
  onDelete
}: {
  anunci: any
  onMarkSold: (id: string) => void
  onRenew: (id: string) => void
  onDelete: (id: string) => void
}) {
  const [showMenu, setShowMenu] = useState(false)
  const router = useRouter()

  const marketplace = anunci.metadata?.marketplace || anunci.metadata || {}
  const price = marketplace?.price || 0
  const imageUrl = anunci.imageUrl || marketplace?.coverImage || marketplace?.images?.[0]

  const formatPrice = (price: number) => {
    if (price === 0) return 'Gratuït'
    return `${price.toLocaleString('ca-ES')} €`
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      PUBLISHED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Publicat' },
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendent' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rebutjat' },
      SOLD: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Venut' },
      DRAFT: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Esborrany' },
      EXPIRED: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Expirat' },
    }
    return badges[status] || badges.DRAFT
  }

  const badge = getStatusBadge(anunci.status)

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          {/* Image */}
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={anunci.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                  {price > 0 && (
                    <span className="text-sm font-bold text-indigo-600">
                      {formatPrice(price)}
                    </span>
                  )}
                </div>
                <h3 className="font-medium text-gray-900 line-clamp-1">
                  {anunci.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">
                  {anunci.summary || anunci.content?.substring(0, 100)}
                </p>
              </div>

              {/* Actions menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                      <button
                        onClick={() => {
                          router.push(`/dashboard/anuncis/${anunci.id}`)
                          setShowMenu(false)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Veure
                      </button>
                      {anunci.status !== 'SOLD' && (
                        <button
                          onClick={() => {
                            router.push(`/dashboard/anuncis/crear?edit=${anunci.id}`)
                            setShowMenu(false)
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </button>
                      )}
                      {anunci.status === 'PUBLISHED' && (
                        <button
                          onClick={() => {
                            onMarkSold(anunci.id)
                            setShowMenu(false)
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Marcar com a venut
                        </button>
                      )}
                      {(anunci.status === 'EXPIRED' || anunci.status === 'SOLD') && (
                        <button
                          onClick={() => {
                            onRenew(anunci.id)
                            setShowMenu(false)
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Renovar
                        </button>
                      )}
                      <hr className="my-1" />
                      <button
                        onClick={() => {
                          if (confirm('Estàs segur que vols eliminar aquest anunci?')) {
                            onDelete(anunci.id)
                          }
                          setShowMenu(false)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {anunci.views || 0}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {anunci.reactions || 0}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {anunci.contactsCount || 0}
              </span>
              <span className="text-gray-400">
                {new Date(anunci.createdAt).toLocaleDateString('ca-ES')}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AnuncisPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  // Hooks de mutación
  const markAsSoldMutation = useMarkAsSold()
  const renewMutation = useRenewAnuncio()
  const deleteMutation = useDeleteAnuncio()
  const toggleFavoriteMutation = useToggleFavorite()

  // Local state
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('ofertes')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [myStatusFilter, setMyStatusFilter] = useState('published')

  // Fetch anuncios públicos
  const { data: anunciosResponse, isLoading, error } = usePublicAnuncios({
    page: 1,
    limit: 20,
    search: searchTerm || undefined
  })

  // Fetch mis anuncios
  const { data: myAnunciosResponse, isLoading: isLoadingMy } = useMyAnuncios({
    page: 1,
    limit: 50,
    status: myStatusFilter,
  })

  // Fetch favorits de l'usuari
  const { data: favoritesData } = useFavoriteIds()
  const favoriteIds = favoritesData?.favoriteIds || []

  // Handler per toggle favorit
  const handleToggleFavorite = (anuncioId: string, isFavorite: boolean) => {
    toggleFavoriteMutation.mutate({ anuncioId, isFavorite })
  }

  // Convert backend data
  const allAnuncis = useMemo(() => {
    if (!anunciosResponse?.data || !Array.isArray(anunciosResponse.data)) return []

    return anunciosResponse.data.map((anuncio: any) => {
      const marketplace = anuncio.metadata?.marketplace || anuncio.metadata || {}
      const price = marketplace?.price || 0
      const priceType = marketplace?.priceType || 'gratuït'

      let finalPriceType: 'fix' | 'negociable' | 'gratuït' = 'gratuït'
      if (price > 0) {
        finalPriceType = priceType === 'negociable' ? 'negociable' : 'fix'
      }

      return {
        id: anuncio.id,
        title: anuncio.title || 'Sense títol',
        description: anuncio.content || anuncio.summary || '',
        type: anuncio.type === 'urgent' ? 'demanda' : 'oferta',
        category: marketplace?.category || 'general',
        price: price,
        priceType: finalPriceType,
        location: marketplace?.location?.city || 'La Pública',
        images: [
          anuncio.imageUrl || marketplace?.coverImage || marketplace?.images?.[0],
          ...(marketplace?.galleryImages || marketplace?.images?.slice?.(1) || [])
        ].filter(Boolean),
        author: anuncio.author?.name || anuncio.author?.email || 'Usuari',
        authorAvatar: anuncio.author?.image || '',
        authorDepartment: anuncio.community?.nombre || 'Comunitat',
        status: anuncio.status,
        createdAt: new Date(anuncio.createdAt).toLocaleDateString('ca-ES'),
        views: anuncio.views || 0,
        favorites: anuncio.reactions || 0,
        contacts: anuncio.contactsCount || 0,
        isFavorite: favoriteIds.includes(anuncio.id)
      } as AnunciItem
    })
  }, [anunciosResponse, favoriteIds])

  // Filter anuncios públicos
  const filteredAnuncis = useMemo(() => {
    let filtered = [...allAnuncis]

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(a =>
        a.category.toLowerCase().includes(categoryFilter.toLowerCase())
      )
    }

    // Tab filter
    switch (activeTab) {
      case 'ofertes':
        filtered = filtered.filter(a => a.type === 'oferta')
        break
      case 'demandes':
        filtered = filtered.filter(a => a.type === 'demanda')
        break
      case 'favorits':
        filtered = filtered.filter(a => a.isFavorite)
        break
    }

    return filtered
  }, [allAnuncis, categoryFilter, activeTab])

  // Stats para el header
  const stats = useMemo(() => ({
    total: allAnuncis.length,
    mine: myAnunciosResponse?.stats?.total || 0,
    active: allAnuncis.filter(a => a.status === 'PUBLISHED').length,
    favorites: allAnuncis.filter(a => a.isFavorite).length,
  }), [allAnuncis, myAnunciosResponse])

  // Tab counts
  const tabCounts = useMemo(() => ({
    ofertes: allAnuncis.filter(a => a.type === 'oferta').length,
    demandes: allAnuncis.filter(a => a.type === 'demanda').length,
    favorits: allAnuncis.filter(a => a.isFavorite).length,
    meus: myAnunciosResponse?.stats?.total || 0,
  }), [allAnuncis, myAnunciosResponse])

  // Loading state
  if (isLoading && activeTab !== 'meus') {
    return (
      <PageLayout
        title="Anuncis"
        subtitle="Carregant anuncis..."
        icon={<Megaphone className="w-6 h-6" />}
      >
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregant anuncis...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  // Error state
  if (error && activeTab !== 'meus') {
    return (
      <PageLayout
        title="Anuncis"
        subtitle="Error carregant anuncis"
        icon={<Megaphone className="w-6 h-6" />}
      >
        <Card>
          <CardContent className="p-12 text-center">
            <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-900 font-medium">Error carregant els anuncis</p>
            <p className="text-gray-500 mt-1">Si us plau, refresca la pàgina</p>
          </CardContent>
        </Card>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Anuncis"
      subtitle="Compra, ven i intercanvia amb la comunitat"
      icon={<Megaphone className="w-6 h-6" />}
      actions={
        <button
          onClick={() => router.push('/dashboard/anuncis/crear')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nou anunci
        </button>
      }
    >
      {/* Featured Ads Slider - Anuncis Premium */}
      <FeaturedAdsSlider className="mb-6" />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total anuncis</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('meus')}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-left hover:border-indigo-300 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-600">{stats.mine}</p>
              <p className="text-sm text-gray-500">Els meus</p>
            </div>
          </div>
        </button>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Tag className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              <p className="text-sm text-gray-500">Actius</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.favorites}</p>
              <p className="text-sm text-gray-500">Preferits</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cercar anuncis per títol, descripció..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Category filter - solo para tabs que no son "meus" */}
          {activeTab !== 'meus' && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          )}

          {/* View mode - solo para tabs que no son "meus" */}
          {activeTab !== 'meus' && (
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Vista graella"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Vista llista"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Counter */}
          <span className="text-sm text-gray-500 whitespace-nowrap self-center">
            {activeTab === 'meus'
              ? `${myAnunciosResponse?.data?.length || 0} anuncis`
              : `${filteredAnuncis.length} anuncis`
            }
          </span>
        </div>
      </div>

      {/* Main content area with sidebar */}
      <div className="flex gap-6">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Tabs */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-200 overflow-x-auto">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[100px] px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                  {tabCounts[tab.id as keyof typeof tabCounts] > 0 && (
                    <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                      activeTab === tab.id
                        ? 'bg-indigo-100 text-indigo-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tabCounts[tab.id as keyof typeof tabCounts]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-4">
              {/* "Els Meus" tab content */}
              {activeTab === 'meus' ? (
                <>
                  {/* Status filters */}
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {STATUS_TABS.map(tab => {
                      const count = myAnunciosResponse?.stats?.[tab.id] || 0
                      const Icon = tab.icon
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setMyStatusFilter(tab.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                            myStatusFilter === tab.id
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {tab.label}
                          <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                            myStatusFilter === tab.id
                              ? 'bg-indigo-200 text-indigo-700'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {count}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Stats resumen */}
                  {myAnunciosResponse?.stats && (
                    <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{myAnunciosResponse.stats.totalViews}</p>
                        <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                          <Eye className="w-3 h-3" /> Vistes totals
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{myAnunciosResponse.stats.totalReactions}</p>
                        <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                          <Heart className="w-3 h-3" /> Favorits
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{myAnunciosResponse.stats.totalContacts}</p>
                        <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                          <MessageCircle className="w-3 h-3" /> Contactes
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Lista de mis anuncios */}
                  {isLoadingMy ? (
                    <div className="py-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
                      <p className="text-gray-600">Carregant els teus anuncis...</p>
                    </div>
                  ) : myAnunciosResponse?.data?.length > 0 ? (
                    <div className="space-y-3">
                      {myAnunciosResponse.data.map((anunci: any) => (
                        <MyAnunciCard
                          key={anunci.id}
                          anunci={anunci}
                          onMarkSold={(id) => markAsSoldMutation.mutate(id)}
                          onRenew={(id) => renewMutation.mutate(id)}
                          onDelete={(id) => deleteMutation.mutate(id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No tens anuncis
                      </h3>
                      <p className="text-gray-500 mb-6">
                        {myStatusFilter !== 'published'
                          ? `No tens anuncis amb aquest estat`
                          : 'Comença publicant el teu primer anunci'
                        }
                      </p>
                      <button
                        onClick={() => router.push('/dashboard/anuncis/crear')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Crear anunci
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* Public anuncis content */
                filteredAnuncis.length > 0 ? (
                  <div className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                      : 'space-y-0'
                  }>
                    {filteredAnuncis.map(anunci => (
                      <AnunciCard
                        key={anunci.id}
                        anunci={anunci}
                        viewMode={viewMode}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No s'han trobat anuncis
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {searchTerm
                        ? `No hi ha anuncis que coincideixin amb "${searchTerm}"`
                        : activeTab === 'favorits'
                          ? 'No tens anuncis preferits'
                          : 'No hi ha anuncis disponibles amb aquests filtres'
                      }
                    </p>
                    <button
                      onClick={() => router.push('/dashboard/anuncis/crear')}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Publica el primer anunci
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Anuncis Standard/Basic destacats */}
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <FeaturedAdsSidebar />
        </aside>
      </div>
    </PageLayout>
  )
}
