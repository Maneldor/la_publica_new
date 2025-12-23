'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Star,
  Edit,
  Trash2,
  Eye,
  MousePointer,
  TrendingUp,
  Calendar,
  ExternalLink,
  Building2,
  Clock,
  RefreshCw,
  Pause,
  Play
} from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { ca } from 'date-fns/locale'
import { useRouter } from 'next/navigation'

interface FeaturedAdDetail {
  id: string
  title: string
  slug: string
  description: string
  shortDescription?: string
  images: string[]
  level: 'PREMIUM' | 'STANDARD' | 'BASIC'
  source: 'LA_PUBLICA' | 'PARTNER' | 'COMPANY'
  ctaText?: string
  ctaUrl?: string
  targetBlank: boolean
  isActive: boolean
  startsAt: string
  endsAt: string
  position: number
  impressions: number
  clicks: number
  company?: { id: string; name: string; logo?: string }
  publisherName?: string
  publisherLogo?: string
  createdBy: { id: string; name: string; email: string }
  createdAt: string
  updatedAt: string
}

interface DailyAnalytics {
  date: string
  impressions: number
  clicks: number
}

interface Analytics {
  total: {
    impressions: number
    clicks: number
    ctr: string
  }
  daily: DailyAnalytics[]
  period: {
    startsAt: string
    endsAt: string
  }
}

const LEVEL_CONFIG = {
  PREMIUM: { label: 'Premium', icon: '🌟', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
  STANDARD: { label: 'Standard', icon: '⭐', bgColor: 'bg-amber-100', textColor: 'text-amber-700' },
  BASIC: { label: 'Bàsic', icon: '📌', bgColor: 'bg-gray-100', textColor: 'text-gray-700' }
}

const SOURCE_CONFIG = {
  LA_PUBLICA: { label: 'La Pública', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
  PARTNER: { label: 'Partner', bgColor: 'bg-green-100', textColor: 'text-green-700' },
  COMPANY: { label: 'Empresa', bgColor: 'bg-slate-100', textColor: 'text-slate-700' }
}

export default function AnunciDestavatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [ad, setAd] = useState<FeaturedAdDetail | null>(null)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/gestio/anuncis-destacats/${id}`)
        if (res.ok) {
          const data = await res.json()
          setAd(data.ad)
          setAnalytics(data.analytics)
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleToggleActive = async () => {
    if (!ad) return
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/gestio/anuncis-destacats/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !ad.isActive })
      })
      if (res.ok) {
        setAd(prev => prev ? { ...prev, isActive: !prev.isActive } : null)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Segur que vols eliminar aquest anunci destacat?')) return

    try {
      const res = await fetch(`/api/gestio/anuncis-destacats/${id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/gestio/anuncis-destacats')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!ad) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-gray-500">Anunci no trobat</p>
          <Link href="/gestio/anuncis-destacats" className="text-purple-600 hover:underline mt-4 inline-block">
            Tornar al llistat
          </Link>
        </div>
      </div>
    )
  }

  const levelConfig = LEVEL_CONFIG[ad.level]
  const sourceConfig = SOURCE_CONFIG[ad.source]

  const now = new Date()
  const start = new Date(ad.startsAt)
  const end = new Date(ad.endsAt)
  const daysRemaining = differenceInDays(end, now)

  const getStatus = () => {
    if (!ad.isActive) return { label: 'Pausat', bgColor: 'bg-gray-100', textColor: 'text-gray-700' }
    if (now < start) return { label: 'Programat', bgColor: 'bg-blue-100', textColor: 'text-blue-700' }
    if (now > end) return { label: 'Finalitzat', bgColor: 'bg-red-100', textColor: 'text-red-700' }
    return { label: 'Actiu', bgColor: 'bg-green-100', textColor: 'text-green-700' }
  }

  const status = getStatus()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/gestio/anuncis-destacats"
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{ad.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-sm font-medium ${levelConfig.bgColor} ${levelConfig.textColor}`}>
                    {levelConfig.icon} {levelConfig.label}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor}`}>
                    {status.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleActive}
              disabled={isUpdating}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                ad.isActive
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {ad.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {ad.isActive ? 'Pausar' : 'Activar'}
            </button>
            <Link
              href={`/gestio/anuncis-destacats/${id}/editar`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Editar
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main content */}
          <div className="col-span-2 space-y-6">
            {/* Images */}
            {ad.images.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Imatges</h2>
                <div className="grid grid-cols-2 gap-4">
                  {ad.images.map((img, i) => (
                    <div key={i} className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden">
                      <Image src={img} alt="" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contingut</h2>
              {ad.shortDescription && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Descripció curta</p>
                  <p className="text-gray-700">{ad.shortDescription}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 mb-1">Descripció completa</p>
                <p className="text-gray-700 whitespace-pre-wrap">{ad.description}</p>
              </div>
            </div>

            {/* Analytics Chart */}
            {analytics && analytics.daily.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Rendiment diari</h2>
                <div className="space-y-3">
                  {analytics.daily.slice(-7).map((day) => (
                    <div key={day.date} className="flex items-center gap-4">
                      <span className="w-20 text-sm text-gray-500">
                        {format(new Date(day.date), 'dd MMM', { locale: ca })}
                      </span>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${Math.min(100, (day.impressions / Math.max(...analytics.daily.map(d => d.impressions))) * 100)}%` }}
                          />
                        </div>
                        <span className="w-16 text-sm text-gray-600">{day.impressions} imp</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-100 rounded-full h-4 overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${Math.min(100, (day.clicks / Math.max(...analytics.daily.map(d => d.clicks), 1)) * 100)}%` }}
                          />
                        </div>
                        <span className="w-12 text-sm text-gray-600">{day.clicks} clics</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Estadístiques</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Eye className="w-5 h-5" />
                    <span>Impressions</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">{ad.impressions.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MousePointer className="w-5 h-5" />
                    <span>Clics</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">{ad.clicks.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <TrendingUp className="w-5 h-5" />
                    <span>CTR</span>
                  </div>
                  <span className="text-xl font-bold text-purple-600">
                    {analytics?.total.ctr || '0.00%'}
                  </span>
                </div>
              </div>
            </div>

            {/* Period */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Període</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Inici</p>
                    <p className="font-medium text-gray-900">
                      {format(start, "d MMMM yyyy", { locale: ca })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Fi</p>
                    <p className="font-medium text-gray-900">
                      {format(end, "d MMMM yyyy", { locale: ca })}
                    </p>
                  </div>
                </div>
                {daysRemaining > 0 && now >= start && now <= end && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <p className="text-amber-600 font-medium">{daysRemaining} dies restants</p>
                  </div>
                )}
              </div>
            </div>

            {/* Publisher */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Publicador</h2>
              <div className="flex items-center gap-3">
                {ad.company?.logo || ad.publisherLogo ? (
                  <Image
                    src={ad.company?.logo || ad.publisherLogo || ''}
                    alt=""
                    width={48}
                    height={48}
                    className="rounded-xl object-contain bg-gray-100"
                  />
                ) : (
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-purple-600" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {ad.company?.name || ad.publisherName}
                  </p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sourceConfig.bgColor} ${sourceConfig.textColor}`}>
                    {sourceConfig.label}
                  </span>
                </div>
              </div>
            </div>

            {/* CTA */}
            {ad.ctaUrl && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Crida a l'acció</h2>
                <a
                  href={ad.ctaUrl}
                  target={ad.targetBlank ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                >
                  {ad.ctaText || 'Veure oferta'}
                  <ExternalLink className="w-4 h-4" />
                </a>
                <p className="text-xs text-gray-500 mt-2 break-all">{ad.ctaUrl}</p>
              </div>
            )}

            {/* Meta */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informació</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Creat per</span>
                  <span className="text-gray-900">{ad.createdBy.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Creat el</span>
                  <span className="text-gray-900">
                    {format(new Date(ad.createdAt), "d MMM yyyy", { locale: ca })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Actualitzat</span>
                  <span className="text-gray-900">
                    {format(new Date(ad.updatedAt), "d MMM yyyy", { locale: ca })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Posició</span>
                  <span className="text-gray-900">#{ad.position}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
