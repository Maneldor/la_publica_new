'use client'

import { useState, useEffect } from 'react'
import {
  Star,
  Plus,
  Search,
  Eye,
  MousePointer,
  TrendingUp,
  Calendar,
  Edit,
  Trash2,
  BarChart3,
  Building2,
  ExternalLink,
  RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'
import { ca } from 'date-fns/locale'
import Link from 'next/link'
import Image from 'next/image'

interface FeaturedAd {
  id: string
  title: string
  slug: string
  level: 'PREMIUM' | 'STANDARD' | 'BASIC'
  source: 'LA_PUBLICA' | 'PARTNER' | 'COMPANY'
  isActive: boolean
  startsAt: string
  endsAt: string
  impressions: number
  clicks: number
  ctaUrl?: string
  company?: { id: string; name: string; logo?: string }
  publisherName?: string
  createdBy: { id: string; name: string }
  createdAt: string
}

interface Stats {
  total: number
  active: number
  byLevel: Record<string, number>
  totalImpressions: number
  totalClicks: number
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

export default function GestioAnuncisDestacatsPage() {
  const [anuncis, setAnuncis] = useState<FeaturedAd[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'scheduled' | 'expired'>('all')
  const [search, setSearch] = useState('')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const fetchAnuncis = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/gestio/anuncis-destacats?status=${filter}`)
      const data = await res.json()
      setAnuncis(data.anuncis || [])
      setStats(data.stats || null)
    } catch (error) {
      console.error('Error carregant anuncis:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnuncis()
  }, [filter])

  const handleDelete = async (id: string) => {
    if (!confirm('Segur que vols eliminar aquest anunci destacat?')) return

    setIsDeleting(id)
    try {
      const res = await fetch(`/api/gestio/anuncis-destacats/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setAnuncis(prev => prev.filter(a => a.id !== id))
      }
    } catch (error) {
      console.error('Error eliminant:', error)
    } finally {
      setIsDeleting(null)
    }
  }

  const filteredAnuncis = anuncis.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.company?.name.toLowerCase().includes(search.toLowerCase()) ||
    a.publisherName?.toLowerCase().includes(search.toLowerCase())
  )

  const getStatus = (ad: FeaturedAd) => {
    const now = new Date()
    const start = new Date(ad.startsAt)
    const end = new Date(ad.endsAt)

    if (!ad.isActive) return { label: 'Pausat', bgColor: 'bg-gray-100', textColor: 'text-gray-700' }
    if (now < start) return { label: 'Programat', bgColor: 'bg-blue-100', textColor: 'text-blue-700' }
    if (now > end) return { label: 'Finalitzat', bgColor: 'bg-red-100', textColor: 'text-red-700' }
    return { label: 'Actiu', bgColor: 'bg-green-100', textColor: 'text-green-700' }
  }

  const calculateCTR = (impressions: number, clicks: number) => {
    if (impressions === 0) return '0.00'
    return ((clicks / impressions) * 100).toFixed(2)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-xl">
            <Star className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Anuncis Destacats</h1>
            <p className="text-gray-500">Gestiona els anuncis patrocinats i destacats</p>
          </div>
        </div>
        <Link
          href="/gestio/anuncis-destacats/crear"
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nou Anunci Destacat
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 bg-white rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                <p className="text-sm text-gray-500">Actius</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalImpressions.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Impressions</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <MousePointer className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalClicks.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Clics</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {calculateCTR(stats.totalImpressions, stats.totalClicks)}%
                </p>
                <p className="text-sm text-gray-500">CTR mitjà</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cercador i filtres */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cercar per títol o empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'scheduled', 'expired'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                filter === f
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? 'Tots' : f === 'active' ? 'Actius' : f === 'scheduled' ? 'Programats' : 'Finalitzats'}
            </button>
          ))}
          <button
            onClick={fetchAnuncis}
            className="p-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
            title="Refrescar"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Taula */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Anunci</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nivell</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Origen</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Període</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rendiment</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estat</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Accions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Carregant...
                    </div>
                  </td>
                </tr>
              ) : filteredAnuncis.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No s'han trobat anuncis destacats
                  </td>
                </tr>
              ) : (
                filteredAnuncis.map((ad) => {
                  const levelConfig = LEVEL_CONFIG[ad.level]
                  const sourceConfig = SOURCE_CONFIG[ad.source]
                  const status = getStatus(ad)

                  return (
                    <tr key={ad.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {ad.company?.logo ? (
                            <Image
                              src={ad.company.logo}
                              alt={ad.company.name}
                              width={40}
                              height={40}
                              className="rounded-lg object-contain bg-gray-100"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Star className="w-5 h-5 text-purple-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{ad.title}</p>
                            <p className="text-sm text-gray-500">
                              {ad.company?.name || ad.publisherName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium ${levelConfig.bgColor} ${levelConfig.textColor}`}>
                          {levelConfig.icon} {levelConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${sourceConfig.bgColor} ${sourceConfig.textColor}`}>
                          {sourceConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900">
                            {format(new Date(ad.startsAt), 'dd MMM', { locale: ca })} - {format(new Date(ad.endsAt), 'dd MMM yyyy', { locale: ca })}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900">{ad.impressions.toLocaleString()} imp.</p>
                          <p className="text-gray-500">{ad.clicks} clics ({calculateCTR(ad.impressions, ad.clicks)}%)</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {ad.ctaUrl && (
                            <a
                              href={ad.ctaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Veure enllaç"
                            >
                              <ExternalLink className="w-5 h-5" />
                            </a>
                          )}
                          <Link
                            href={`/gestio/anuncis-destacats/${ad.id}`}
                            className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Veure detalls"
                          >
                            <BarChart3 className="w-5 h-5" />
                          </Link>
                          <Link
                            href={`/gestio/anuncis-destacats/${ad.id}/editar`}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(ad.id)}
                            disabled={isDeleting === ad.id}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Eliminar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
