'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import {
  AlertTriangle,
  Search,
  Shield,
  ShieldAlert,
  ShieldX,
  ShieldCheck,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Package,
  ExternalLink,
  MessageSquare,
  TrendingUp,
  Copy,
  Link as LinkIcon,
  DollarSign,
  Users,
  FileWarning,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

interface AdAlert {
  id: string
  type: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description: string
  metadata: Record<string, any> | null
  isResolved: boolean
  resolution: string | null
  actionTaken: string | null
  createdAt: string
  resolvedAt: string | null
  user: {
    id: string
    name: string | null
    nick: string | null
    email: string
    image: string | null
    adWarningCount: number
    adBlockedUntil: string | null
    isAdBanned: boolean
  }
  anuncio: {
    id: string
    title: string
    slug: string | null
    status: string
    imageUrl: string | null
  } | null
  resolvedBy: {
    id: string
    name: string | null
    nick: string | null
  } | null
}

interface Stats {
  totalAlerts: number
  unresolvedAlerts: number
  criticalAlerts: number
  blockedUsers: number
  alertsByType: { type: string; count: number }[]
}

const SEVERITY_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: typeof AlertTriangle }> = {
  LOW: {
    label: 'Baixa',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: Shield,
  },
  MEDIUM: {
    label: 'Mitjana',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    icon: ShieldAlert,
  },
  HIGH: {
    label: 'Alta',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    icon: ShieldX,
  },
  CRITICAL: {
    label: 'Critica',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: ShieldX,
  },
}

const ALERT_TYPE_LABELS: Record<string, { label: string; icon: typeof AlertTriangle }> = {
  DUPLICATE_CONTENT: { label: 'Contingut duplicat', icon: Copy },
  HIGH_VOLUME: { label: 'Volum alt', icon: TrendingUp },
  REPEATED_CONTACT: { label: 'Contacte repetitiu', icon: MessageSquare },
  SUSPICIOUS_PRICE: { label: 'Preu sospitós', icon: DollarSign },
  KEYWORD_SPAM: { label: 'Spam de paraules clau', icon: FileWarning },
  EXTERNAL_REDIRECT: { label: 'Redirecció externa', icon: ExternalLink },
  COMMERCIAL_PATTERN: { label: 'Patró comercial', icon: Package },
  USER_REPORT: { label: 'Report d\'usuari', icon: Users },
  SIMILAR_IMAGES: { label: 'Imatges similars', icon: Copy },
  MULTIPLE_ACCOUNTS: { label: 'Múltiples comptes', icon: Users },
}

export default function AlertesAnuncisPage() {
  const [alerts, setAlerts] = useState<AdAlert[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })

  // Filtres
  const [statusFilter, setStatusFilter] = useState('pending')
  const [severityFilter, setSeverityFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals
  const [selectedAlert, setSelectedAlert] = useState<AdAlert | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionType, setActionType] = useState<string>('')
  const [blockDays, setBlockDays] = useState(7)
  const [resolution, setResolution] = useState('')
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetchAlerts()
  }, [statusFilter, severityFilter, typeFilter, pagination.page])

  const fetchAlerts = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '20',
        status: statusFilter,
      })
      if (severityFilter) params.set('severity', severityFilter)
      if (typeFilter) params.set('type', typeFilter)

      const res = await fetch(`/api/gestio/anuncis/alertes?${params}`)
      const data = await res.json()

      if (data.success) {
        setAlerts(data.data)
        setStats(data.stats)
        setPagination(prev => ({
          ...prev,
          totalPages: data.pagination.totalPages,
          total: data.pagination.total
        }))
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error carregant alertes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async () => {
    if (!selectedAlert) return

    try {
      setIsProcessing(selectedAlert.id)
      const res = await fetch(`/api/gestio/anuncis/alertes/${selectedAlert.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          resolution,
          blockDays: actionType === 'block_temp' ? blockDays : undefined,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(data.message)
        setShowActionModal(false)
        setSelectedAlert(null)
        setResolution('')
        fetchAlerts()
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error('Error processant l\'acció')
    } finally {
      setIsProcessing(null)
    }
  }

  const openActionModal = (alert: AdAlert, action: string) => {
    setSelectedAlert(alert)
    setActionType(action)
    setShowActionModal(true)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ca-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-orange-600" />
            Alertes de Frau en Anuncis
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona les alertes de contingut sospitós i ús comercial no autoritzat
          </p>
        </div>
        <button
          onClick={fetchAlerts}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualitzar
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Pendents</p>
                  <p className="text-2xl font-bold text-orange-700">{stats.unresolvedAlerts}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">Crítiques</p>
                  <p className="text-2xl font-bold text-red-700">{stats.criticalAlerts}</p>
                </div>
                <ShieldX className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Usuaris Bloquejats</p>
                  <p className="text-2xl font-bold text-purple-700">{stats.blockedUsers}</p>
                </div>
                <Ban className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Alertes</p>
                  <p className="text-2xl font-bold text-gray-700">{stats.totalAlerts}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => { setStatusFilter('pending'); setPagination(p => ({ ...p, page: 1 })) }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'pending'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pendents
              </button>
              <button
                onClick={() => { setStatusFilter('resolved'); setPagination(p => ({ ...p, page: 1 })) }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'resolved'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Resoltes
              </button>
              <button
                onClick={() => { setStatusFilter('all'); setPagination(p => ({ ...p, page: 1 })) }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Totes
              </button>
            </div>

            <select
              value={severityFilter}
              onChange={(e) => { setSeverityFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })) }}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Totes les severitats</option>
              <option value="CRITICAL">Crítiques</option>
              <option value="HIGH">Altes</option>
              <option value="MEDIUM">Mitjanes</option>
              <option value="LOW">Baixes</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })) }}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Tots els tipus</option>
              {Object.entries(ALERT_TYPE_LABELS).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-gray-500">
              <ShieldCheck className="w-16 h-16 text-green-300 mb-4" />
              <p className="text-lg font-medium">No hi ha alertes</p>
              <p className="text-sm">Molt bé! No hi ha alertes pendents.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {alerts.map((alert) => {
                const severityConfig = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.MEDIUM
                const typeConfig = ALERT_TYPE_LABELS[alert.type] || { label: alert.type, icon: AlertTriangle }
                const SeverityIcon = severityConfig.icon
                const TypeIcon = typeConfig.icon

                return (
                  <div
                    key={alert.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      alert.severity === 'CRITICAL' && !alert.isResolved ? 'bg-red-50' : ''
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Severity indicator */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${severityConfig.bgColor} flex items-center justify-center`}>
                        <SeverityIcon className={`w-5 h-5 ${severityConfig.color}`} />
                      </div>

                      {/* Main content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${severityConfig.bgColor} ${severityConfig.color}`}>
                                {severityConfig.label}
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                <TypeIcon className="w-3 h-3" />
                                {typeConfig.label}
                              </span>
                              {alert.isResolved && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                  <CheckCircle className="w-3 h-3" />
                                  Resolta
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-900 font-medium">{alert.description}</p>
                          </div>

                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {formatDate(alert.createdAt)}
                          </span>
                        </div>

                        {/* User info */}
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                              {alert.user.image ? (
                                <Image
                                  src={alert.user.image}
                                  alt=""
                                  width={24}
                                  height={24}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-3 h-3 text-gray-500" />
                              )}
                            </div>
                            <span className="text-sm text-gray-700">
                              {alert.user.name || alert.user.nick || alert.user.email}
                            </span>
                            {alert.user.isAdBanned && (
                              <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded">Bloquejat</span>
                            )}
                            {alert.user.adWarningCount > 0 && (
                              <span className="text-xs text-amber-600">
                                ({alert.user.adWarningCount} avisos)
                              </span>
                            )}
                          </div>

                          {alert.anuncio && (
                            <Link
                              href={`/anuncis/${alert.anuncio.slug || alert.anuncio.id}`}
                              className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
                            >
                              <Package className="w-3 h-3" />
                              {alert.anuncio.title.substring(0, 30)}...
                            </Link>
                          )}
                        </div>

                        {/* Actions */}
                        {!alert.isResolved && (
                          <div className="flex items-center gap-2 mt-3">
                            <button
                              onClick={() => openActionModal(alert, 'dismiss')}
                              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              Descartar
                            </button>
                            <button
                              onClick={() => openActionModal(alert, 'warn')}
                              className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors"
                            >
                              Avís
                            </button>
                            <button
                              onClick={() => openActionModal(alert, 'block_temp')}
                              className="px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors"
                            >
                              Bloquejar temporalment
                            </button>
                            <button
                              onClick={() => openActionModal(alert, 'block_perm')}
                              className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              Bloquejar permanentment
                            </button>
                            {alert.anuncio && (
                              <button
                                onClick={() => openActionModal(alert, 'delete_ad')}
                                className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                              >
                                Eliminar anunci
                              </button>
                            )}
                          </div>
                        )}

                        {/* Resolution info */}
                        {alert.isResolved && alert.resolution && (
                          <div className="mt-2 p-2 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-700">
                              <strong>Resolució:</strong> {alert.resolution}
                            </p>
                            {alert.resolvedBy && (
                              <p className="text-xs text-green-600 mt-1">
                                Per {alert.resolvedBy.name || alert.resolvedBy.nick} - {alert.resolvedAt && formatDate(alert.resolvedAt)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Mostrant {alerts.length} de {pagination.total} alertes
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                  disabled={pagination.page <= 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600">
                  Pàgina {pagination.page} de {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Modal */}
      {showActionModal && selectedAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {actionType === 'dismiss' && 'Descartar alerta'}
                {actionType === 'warn' && 'Emetre avís'}
                {actionType === 'block_temp' && 'Bloqueig temporal'}
                {actionType === 'block_perm' && 'Bloqueig permanent'}
                {actionType === 'delete_ad' && 'Eliminar anunci'}
              </h3>
              <button
                onClick={() => { setShowActionModal(false); setSelectedAlert(null) }}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 font-medium">{selectedAlert.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Usuari: {selectedAlert.user.name || selectedAlert.user.nick || selectedAlert.user.email}
                </p>
              </div>

              {actionType === 'block_temp' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dies de bloqueig
                  </label>
                  <select
                    value={blockDays}
                    onChange={(e) => setBlockDays(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value={3}>3 dies</option>
                    <option value={7}>7 dies</option>
                    <option value={14}>14 dies</option>
                    <option value={30}>30 dies</option>
                    <option value={90}>90 dies</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes / Resolució
                </label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Afegeix notes sobre aquesta acció..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {(actionType === 'block_perm' || actionType === 'delete_ad') && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    {actionType === 'block_perm' && 'Aquesta acció bloquejarà permanentment l\'usuari per publicar anuncis. L\'usuari haurà de contactar suport per desbloquejar-se.'}
                    {actionType === 'delete_ad' && 'L\'anunci serà eliminat permanentment.'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 p-4 border-t">
              <button
                onClick={() => { setShowActionModal(false); setSelectedAlert(null) }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel·lar
              </button>
              <button
                onClick={handleAction}
                disabled={isProcessing === selectedAlert.id}
                className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 ${
                  actionType === 'dismiss' ? 'bg-gray-600 hover:bg-gray-700' :
                  actionType === 'warn' ? 'bg-amber-600 hover:bg-amber-700' :
                  actionType === 'block_temp' ? 'bg-orange-600 hover:bg-orange-700' :
                  'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isProcessing === selectedAlert.id && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
