'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAnuncio } from '@/hooks/useAnuncios'
import { Card, CardContent } from '@/components/ui/card'
import {
  ArrowLeft,
  Heart,
  Share2,
  Flag,
  MapPin,
  Calendar,
  Eye,
  MessageCircle,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Package,
  User,
  Clock,
  Shield,
  CheckCircle,
  Loader2,
  X,
  Copy,
  ExternalLink,
  Send,
} from 'lucide-react'
import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'

// Hook para contactar vendedor
function useContactSeller() {
  return useMutation({
    mutationFn: async ({ anuncioId, message }: { anuncioId: string; message: string }) => {
      const response = await fetch(`/api/announcements/${anuncioId}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al enviar mensaje')
      }

      return response.json()
    },
  })
}

export default function AnunciSinglePage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const { data: anunci, isLoading, error } = useAnuncio(params.slug)
  const contactMutation = useContactSeller()

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [contactMessage, setContactMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  // Extreure metadata del marketplace
  const getMarketplaceData = () => {
    if (!anunci) return null
    const metadata = (anunci as any).metadata || {}
    return {
      price: metadata.price || 0,
      priceType: metadata.priceType || 'fixed',
      category: metadata.category || 'general',
      condition: metadata.condition || 'good',
      adType: metadata.adType || 'oferta',
      location: metadata.location || {},
      images: metadata.images || (anunci.imageUrl ? [anunci.imageUrl] : []),
    }
  }

  const marketplace = getMarketplaceData()
  const images = marketplace?.images || (anunci?.imageUrl ? [anunci.imageUrl] : [])

  const formatPrice = () => {
    if (!marketplace) return 'Gratuït'
    if (marketplace.priceType === 'free' || marketplace.price === 0) return 'Gratuït'
    const priceStr = marketplace.price.toLocaleString('ca-ES')
    return marketplace.priceType === 'negotiable' ? `${priceStr} € (Negociable)` : `${priceStr} €`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ca-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const handlePreviousImage = () => {
    setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)
  }

  const handleNextImage = () => {
    setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)
  }

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite)
    toast.success(isFavorite ? 'Eliminat de favorits' : 'Afegit a favorits')
  }

  const handleShare = () => {
    setShowShareModal(true)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Enllaç copiat!')
  }

  const handleSendMessage = async () => {
    if (!contactMessage.trim()) {
      toast.error('Escriu un missatge')
      return
    }

    if (!anunci?.id) {
      toast.error('Error: anunci no trobat')
      return
    }

    setIsSending(true)

    try {
      const result = await contactMutation.mutateAsync({
        anuncioId: anunci.id,
        message: contactMessage.trim(),
      })

      toast.success('Missatge enviat correctament!')
      setShowContactModal(false)
      setContactMessage('')

      // Opcional: redirigir a la conversación
      if (result.data?.conversationId) {
        const goToConversation = confirm('Vols anar a la conversa ara?')
        if (goToConversation) {
          router.push(`/dashboard/missatges?conversation=${result.data.conversationId}`)
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error enviant missatge')
    } finally {
      setIsSending(false)
    }
  }

  const getConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
      'new': 'Nou',
      'like_new': 'Com nou',
      'good': 'Bon estat',
      'fair': 'Acceptable',
    }
    return labels[condition] || condition
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'vehicles': 'Vehicles',
      'immobiliaria': 'Immobiliària',
      'electronica': 'Electrònica',
      'informatica': 'Informàtica',
      'mobil': 'Mòbils',
      'llar': 'Llar i jardí',
      'moda': 'Moda',
      'esports': 'Esports',
      'serveis': 'Serveis',
      'altres': 'Altres',
      'general': 'General',
    }
    return labels[category] || category
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregant anunci...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !anunci) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Anunci no trobat</h2>
            <p className="text-gray-500 mb-6">L'anunci que busques no existeix o ha estat eliminat.</p>
            <Link
              href="/dashboard/anuncis"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Tornar als anuncis
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const author = anunci.author || {}

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header amb navegació */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Tornar</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleFavorite}
                className={`p-2 rounded-lg transition-colors ${
                  isFavorite
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galeria d'imatges */}
            <Card className="overflow-hidden">
              <div className="relative aspect-[4/3] bg-gray-100">
                {images.length > 0 ? (
                  <>
                    <Image
                      src={images[currentImageIndex]}
                      alt={anunci.title}
                      fill
                      className="object-contain"
                      priority
                    />
                    {/* Navegació */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={handlePreviousImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        {/* Indicador */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/60 text-white text-sm rounded-full">
                          {currentImageIndex + 1} / {images.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-20 h-20 text-gray-300" />
                  </div>
                )}

                {/* Badge tipus */}
                <span className={`absolute top-4 left-4 px-3 py-1.5 text-sm font-medium rounded-full ${
                  marketplace?.adType === 'oferta'
                    ? 'bg-green-500 text-white'
                    : 'bg-amber-500 text-white'
                }`}>
                  {marketplace?.adType === 'oferta' ? 'Oferta' : 'Demanda'}
                </span>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="p-4 border-t flex gap-2 overflow-x-auto">
                  {images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                        idx === currentImageIndex ? 'border-indigo-500' : 'border-transparent'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`Imatge ${idx + 1}`}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Informació de l'anunci */}
            <Card>
              <CardContent className="p-6">
                {/* Preu i títol */}
                <div className="mb-4">
                  <p className="text-3xl font-bold text-indigo-600 mb-2">
                    {formatPrice()}
                  </p>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {anunci.title}
                  </h1>
                </div>

                {/* Meta info */}
                <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-500">
                  {marketplace?.location?.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {marketplace.location.city}
                      {marketplace.location.province && `, ${marketplace.location.province}`}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(anunci.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {anunci.views || 0} visualitzacions
                  </span>
                </div>

                {/* Descripció */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Descripció</h2>
                  <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                    {anunci.content || 'Sense descripció'}
                  </p>
                </div>

                {/* Especificacions */}
                <div className="border-t pt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalls</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Categoria</span>
                      <span className="font-medium text-gray-900">{getCategoryLabel(marketplace?.category || 'general')}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Estat</span>
                      <span className="font-medium text-gray-900">{getConditionLabel(marketplace?.condition || 'good')}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Tipus</span>
                      <span className="font-medium text-gray-900">{marketplace?.adType === 'oferta' ? 'Oferta' : 'Demanda'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Referència</span>
                      <span className="font-medium text-gray-900 text-xs">{anunci.id?.slice(0, 8)}...</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Targeta de contacte */}
            <Card className="sticky top-20">
              <CardContent className="p-6">
                {/* Autor */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    {author.image ? (
                      <Image
                        src={author.image}
                        alt={author.name || 'Autor'}
                        width={56}
                        height={56}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-xl font-bold">
                        {(author.name || author.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {author.name || author.nick || 'Usuari'}
                      </h3>
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    </div>
                    <p className="text-sm text-gray-500">
                      Membre des de {author.createdAt ? formatDate(author.createdAt) : 'recentment'}
                    </p>
                    {(author as any)._count?.anuncios > 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        {(author as any)._count.anuncios} anuncis publicats
                      </p>
                    )}
                  </div>
                </div>

                {/* Botons d'acció */}
                <div className="space-y-3">
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Contactar
                  </button>

                  {(anunci as any).contactPhone && (
                    <a
                      href={`tel:${(anunci as any).contactPhone}`}
                      className="w-full py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Phone className="w-5 h-5" />
                      Trucar
                    </a>
                  )}

                  {((anunci as any).contactEmail || author.email) && (
                    <a
                      href={`mailto:${(anunci as any).contactEmail || author.email}`}
                      className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Mail className="w-5 h-5" />
                      Enviar email
                    </a>
                  )}
                </div>

                {/* Consells de seguretat */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-start gap-3 text-sm">
                    <Shield className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="text-gray-500">
                      <p className="font-medium text-gray-700 mb-1">Consells de seguretat</p>
                      <ul className="space-y-1 text-xs">
                        <li>Fes les transaccions en persona</li>
                        <li>No enviïs diners per avançat</li>
                        <li>Verifica el producte abans de pagar</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reportar */}
            <button className="w-full py-2 text-sm text-gray-500 hover:text-red-600 transition-colors flex items-center justify-center gap-2">
              <Flag className="w-4 h-4" />
              Reportar anunci
            </button>
          </div>
        </div>
      </div>

      {/* Modal de contacte */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowContactModal(false)} />
          <Card className="relative w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Contactar amb el venedor</h3>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Sobre: <strong>{anunci.title}</strong></p>
                <p className="text-sm font-semibold text-indigo-600">{formatPrice()}</p>
              </div>

              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Hola, estic interessat/da en aquest anunci..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400 mb-4"
              />

              <button
                onClick={handleSendMessage}
                disabled={isSending || !contactMessage.trim()}
                className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enviant...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Enviar missatge
                  </>
                )}
              </button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de compartir */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowShareModal(false)} />
          <Card className="relative w-full max-w-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Compartir anunci</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCopyLink}
                  className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-5 h-5" />
                  Copiar enllaç
                </button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Mira aquest anunci: ${anunci.title} - ${window.location.href}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  Compartir per WhatsApp
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
