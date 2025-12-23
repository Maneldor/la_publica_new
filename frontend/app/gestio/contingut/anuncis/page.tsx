'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import {
  Megaphone,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  Calendar,
  Package,
  AlertTriangle,
  Loader2,
  RefreshCw,
  X,
  FileText,
  Euro,
} from 'lucide-react'
import { toast } from 'sonner'

interface Anunci {
  id: string
  title: string
  content: string
  summary?: string
  imageUrl?: string
  tags: string[]
  status: string
  createdAt: string
  author: {
    id: string
    name: string
    nick?: string
    email: string
    image?: string
  }
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  PENDING: {
    label: 'Pendent',
    color: 'bg-amber-100 text-amber-700',
    icon: Clock,
  },
  PUBLISHED: {
    label: 'Publicat',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle,
  },
  ARCHIVED: {
    label: 'Arxivat/Rebutjat',
    color: 'bg-red-100 text-red-700',
    icon: XCircle,
  },
  DRAFT: {
    label: 'Esborrany',
    color: 'bg-gray-100 text-gray-700',
    icon: FileText,
  },
}

const CATEGORIES = [
  { value: '', label: 'Totes les categories' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'immobiliaria', label: 'Immobiliària' },
  { value: 'electronica', label: 'Electrònica' },
  { value: 'informatica', label: 'Informàtica' },
  { value: 'llar', label: 'Llar i jardí' },
  { value: 'moda', label: 'Moda' },
  { value: 'esports', label: 'Esports' },
  { value: 'serveis', label: 'Serveis' },
  { value: 'altres', label: 'Altres' },
]

export default function GestioAnuncisPage() {
  const [anuncis, setAnuncis] = useState<Anunci[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({ pending: 0, published: 0, archived: 0, draft: 0, total: 0 })
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })

  // Filtres
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals
  const [selectedAnunci, setSelectedAnunci] = useState<Anunci | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  useEffect(() => {
    loadAnuncis()
  }, [statusFilter, categoryFilter, pagination.page])

  const loadAnuncis = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        status: statusFilter,
        page: pagination.page.toString(),
        limit: '20',
      })
      if (categoryFilter) params.set('category', categoryFilter)
      if (searchQuery) params.set('search', searchQuery)

      const res = await fetch(`/api/gestio/anuncis?${params}`)
      if (res.ok) {
        const data = await res.json()
        setAnuncis(data.anuncis || [])
        setStats(data.stats || { pending: 0, published: 0, archived: 0, draft: 0, total: 0 })
        setPagination(prev => ({
          ...prev,
          totalPages: data.pagination?.totalPages || 1,
          total: data.pagination?.total || 0,
        }))
      } else {
        const error = await res.json()
        toast.error(error.error || 'Error carregant anuncis')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error de connexió')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    loadAnuncis()
  }

  const handleApprove = async (anunci: Anunci) => {
    if (!confirm(`Aprovar l'anunci "${anunci.title}"?`)) return

    try {
      setIsProcessing(anunci.id)
      const res = await fetch(`/api/gestio/anuncis/${anunci.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' })
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message || 'Anunci aprovat!')
        loadAnuncis()
      } else {
        toast.error(data.error || 'Error aprovant anunci')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error de connexió')
    } finally {
      setIsProcessing(null)
    }
  }

  const handleReject = async () => {
    if (!selectedAnunci || !rejectionReason.trim()) {
      toast.error('El motiu del rebuig és obligatori')
      return
    }

    try {
      setIsProcessing(selectedAnunci.id)
      const res = await fetch(`/api/gestio/anuncis/${selectedAnunci.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          rejectionReason: rejectionReason.trim()
        })
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message || 'Anunci rebutjat')
        setShowRejectModal(false)
        setSelectedAnunci(null)
        setRejectionReason('')
        loadAnuncis()
      } else {
        toast.error(data.error || 'Error rebutjant anunci')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error de connexió')
    } finally {
      setIsProcessing(null)
    }
  }

  const openRejectModal = (anunci: Anunci) => {
    setSelectedAnunci(anunci)
    setRejectionReason('')
    setShowRejectModal(true)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ca-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Extreure informació de marketplace dels tags o content
  const extractMarketplaceInfo = (anunci: Anunci) => {
    // Intentar parsejar metadata del content si existeix
    const priceMatch = anunci.content?.match(/Preu:\s*(\d+(?:,\d+)?)\s*€/i)
    const locationMatch = anunci.content?.match(/Ubicació:\s*([^,\n]+)/i)

    return {
      price: priceMatch ? priceMatch[1] : null,
      location: locationMatch ? locationMatch[1] : null,
      category: anunci.tags?.[0] || 'general',
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-100 rounded-xl">
            <Megaphone className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Moderació d'Anuncis</h1>
            <p className="text-gray-500">Revisa i aprova els anuncis dels usuaris</p>
          </div>
        </div>
        <button
          onClick={() => loadAnuncis()}
          disabled={isLoading}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card
          className={`p-4 cursor-pointer transition-all ${statusFilter === 'PENDING' ? 'ring-2 ring-amber-500' : 'hover:shadow-md'}`}
          onClick={() => { setStatusFilter('PENDING'); setPagination(p => ({ ...p, page: 1 })) }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              <p className="text-sm text-gray-500">Pendents</p>
            </div>
          </div>
        </Card>

        <Card
          className={`p-4 cursor-pointer transition-all ${statusFilter === 'PUBLISHED' ? 'ring-2 ring-green-500' : 'hover:shadow-md'}`}
          onClick={() => { setStatusFilter('PUBLISHED'); setPagination(p => ({ ...p, page: 1 })) }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.published}</p>
              <p className="text-sm text-gray-500">Publicats</p>
            </div>
          </div>
        </Card>

        <Card
          className={`p-4 cursor-pointer transition-all ${statusFilter === 'ARCHIVED' ? 'ring-2 ring-red-500' : 'hover:shadow-md'}`}
          onClick={() => { setStatusFilter('ARCHIVED'); setPagination(p => ({ ...p, page: 1 })) }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.archived}</p>
              <p className="text-sm text-gray-500">Arxivats</p>
            </div>
          </div>
        </Card>

        <Card
          className={`p-4 cursor-pointer transition-all ${statusFilter === 'DRAFT' ? 'ring-2 ring-gray-500' : 'hover:shadow-md'}`}
          onClick={() => { setStatusFilter('DRAFT'); setPagination(p => ({ ...p, page: 1 })) }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
              <p className="text-sm text-gray-500">Esborranys</p>
            </div>
          </div>
        </Card>

        <Card
          className={`p-4 cursor-pointer transition-all ${statusFilter === 'all' ? 'ring-2 ring-indigo-500' : 'hover:shadow-md'}`}
          onClick={() => { setStatusFilter('all'); setPagination(p => ({ ...p, page: 1 })) }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Megaphone className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-600">{stats.total}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtres i cerca */}
      <div className="flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cercar per títol, descripció o autor..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
          />
        </form>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })) }}
          className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-gray-900"
        >
          {CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Llista d'anuncis */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : anuncis.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-900 font-medium">No hi ha anuncis</p>
            <p className="text-gray-500 mt-1">
              {statusFilter === 'PENDING'
                ? 'No hi ha anuncis pendents de moderació'
                : 'No s\'han trobat anuncis amb aquests filtres'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {anuncis.map((anunci) => {
            const statusConfig = STATUS_CONFIG[anunci.status] || STATUS_CONFIG.DRAFT
            const StatusIcon = statusConfig.icon
            const marketInfo = extractMarketplaceInfo(anunci)

            return (
              <Card key={anunci.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Imatge */}
                    <div className="w-full md:w-48 h-48 md:h-auto bg-gray-100 relative flex-shrink-0">
                      {anunci.imageUrl ? (
                        <Image
                          src={anunci.imageUrl}
                          alt={anunci.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Contingut */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Status badge */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig.label}
                            </span>
                            {marketInfo.category && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                {marketInfo.category}
                              </span>
                            )}
                          </div>

                          {/* Títol i preu */}
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-gray-900 line-clamp-1">
                              {anunci.title}
                            </h3>
                            {marketInfo.price && (
                              <p className="text-lg font-bold text-indigo-600 flex-shrink-0">
                                {marketInfo.price} €
                              </p>
                            )}
                          </div>

                          {/* Descripció */}
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {anunci.summary || anunci.content?.substring(0, 200)}
                          </p>

                          {/* Meta info */}
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {anunci.author.name || anunci.author.nick || anunci.author.email}
                            </span>
                            {marketInfo.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {marketInfo.location}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(anunci.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Accions */}
                      {anunci.status === 'PENDING' && (
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => handleApprove(anunci)}
                            disabled={isProcessing === anunci.id}
                            className="flex-1 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                          >
                            {isProcessing === anunci.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            Aprovar
                          </button>
                          <button
                            onClick={() => openRejectModal(anunci)}
                            disabled={isProcessing === anunci.id}
                            className="flex-1 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Rebutjar
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAnunci(anunci)
                              setShowDetailModal(true)
                            }}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Veure detall"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      )}

                      {/* Botó veure detall per altres status */}
                      {anunci.status !== 'PENDING' && (
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => {
                              setSelectedAnunci(anunci)
                              setShowDetailModal(true)
                            }}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Veure detall
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Paginació */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-600">
            Pàgina {pagination.page} de {pagination.totalPages}
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.totalPages}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Modal Rebutjar */}
      {showRejectModal && selectedAnunci && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowRejectModal(false)} />

          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Rebutjar anunci
                </h3>
              </div>

              <p className="text-gray-600 mb-4">
                Estàs a punt de rebutjar l'anunci <strong>"{selectedAnunci.title}"</strong>.
                Si us plau, indica el motiu perquè l'usuari pugui corregir-lo.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motiu del rebuig *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ex: Les imatges no mostren clarament el producte, la descripció és massa curta..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 pt-0">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel·lar
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || isProcessing === selectedAnunci.id}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {isProcessing === selectedAnunci.id && <Loader2 className="w-4 h-4 animate-spin" />}
                Rebutjar anunci
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detall */}
      {showDetailModal && selectedAnunci && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDetailModal(false)} />

          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Detall de l'anunci</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Contingut */}
            <div className="p-6 space-y-6">
              {/* Imatge */}
              {selectedAnunci.imageUrl && (
                <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={selectedAnunci.imageUrl}
                    alt={selectedAnunci.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Info */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_CONFIG[selectedAnunci.status]?.color || 'bg-gray-100 text-gray-700'}`}>
                    {STATUS_CONFIG[selectedAnunci.status]?.label || selectedAnunci.status}
                  </span>
                </div>
                <h4 className="text-xl font-semibold text-gray-900">{selectedAnunci.title}</h4>
                <p className="text-gray-600 mt-2 whitespace-pre-wrap">{selectedAnunci.content}</p>
              </div>

              {/* Autor */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium text-gray-700 mb-2">Publicat per:</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                    {selectedAnunci.author.image ? (
                      <Image src={selectedAnunci.author.image} alt="" width={40} height={40} className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold">
                        {selectedAnunci.author.name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedAnunci.author.name || selectedAnunci.author.nick}</p>
                    <p className="text-sm text-gray-500">{selectedAnunci.author.email}</p>
                  </div>
                </div>
              </div>

              {/* Data */}
              <div className="text-sm text-gray-500">
                Creat el {formatDate(selectedAnunci.createdAt)}
              </div>
            </div>

            {/* Footer amb accions */}
            {selectedAnunci.status === 'PENDING' && (
              <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
                <button
                  onClick={() => {
                    setShowDetailModal(false)
                    handleApprove(selectedAnunci)
                  }}
                  disabled={isProcessing === selectedAnunci.id}
                  className="flex-1 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Aprovar
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false)
                    openRejectModal(selectedAnunci)
                  }}
                  className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Rebutjar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
