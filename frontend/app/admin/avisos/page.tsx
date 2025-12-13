'use client'

import { useState, useEffect } from 'react'
import {
  Bell,
  Plus,
  Search,
  RefreshCw,
  Info,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Wrench,
  Megaphone,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  X,
  Check,
  Calendar,
  Users,
  Monitor,
  MessageSquare,
  ExternalLink,
  Clock,
  ChevronDown,
  Sparkles,
  Layout,
  Square,
  PanelTop,
  PanelBottom,
} from 'lucide-react'

// =====================
// TIPUS
// =====================

type NoticeType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'MAINTENANCE' | 'ANNOUNCEMENT'
type NoticePosition = 'TOP_BANNER' | 'BOTTOM_BANNER' | 'MODAL' | 'TOAST'
type NoticeAudience = 'ALL' | 'USERS' | 'COMPANIES' | 'ADMINS' | 'GESTORS'

interface PlatformNotice {
  id: string
  type: NoticeType
  title: string
  message: string
  ctaText: string | null
  ctaUrl: string | null
  position: NoticePosition
  icon: string | null
  audience: NoticeAudience
  startDate: string
  endDate: string | null
  dismissible: boolean
  persistent: boolean
  priority: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy: {
    id: string
    name: string | null
    email: string
  } | null
  _count?: {
    dismissals: number
  }
}

// =====================
// CONFIGURACIÓ
// =====================

const NOTICE_TYPES: Record<NoticeType, { label: string; icon: any; color: string; bg: string; border: string }> = {
  INFO: { label: 'Informació', icon: Info, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-300' },
  SUCCESS: { label: 'Novetat', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-300' },
  WARNING: { label: 'Advertència', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-300' },
  ERROR: { label: 'Error', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-300' },
  MAINTENANCE: { label: 'Manteniment', icon: Wrench, color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-300' },
  ANNOUNCEMENT: { label: 'Comunicat', icon: Megaphone, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-300' },
}

const NOTICE_POSITIONS: Record<NoticePosition, { label: string; icon: any }> = {
  TOP_BANNER: { label: 'Banner superior', icon: PanelTop },
  BOTTOM_BANNER: { label: 'Banner inferior', icon: PanelBottom },
  MODAL: { label: 'Modal centrat', icon: Square },
  TOAST: { label: 'Notificació', icon: MessageSquare },
}

const NOTICE_AUDIENCES: Record<NoticeAudience, { label: string; description: string }> = {
  ALL: { label: 'Tots', description: 'Tots els usuaris de la plataforma' },
  USERS: { label: 'Empleats', description: 'Només empleats públics' },
  COMPANIES: { label: 'Empreses', description: 'Només usuaris d\'empreses' },
  ADMINS: { label: 'Administradors', description: 'Només administradors' },
  GESTORS: { label: 'Gestors', description: 'Només gestors CRM' },
}

// =====================
// COMPONENT PRINCIPAL
// =====================

export default function AvisosPage() {
  const [notices, setNotices] = useState<PlatformNotice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtres
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedNotice, setSelectedNotice] = useState<PlatformNotice | null>(null)

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    scheduled: 0,
    expired: 0,
  })

  // =====================
  // CARREGAR DADES
  // =====================

  const fetchNotices = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (filterType) params.set('type', filterType)
      if (filterStatus) params.set('status', filterStatus)

      const response = await fetch(`/api/admin/notices?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error carregant avisos')
      }

      const allNotices = data.notices || []
      setNotices(allNotices)

      // Calcular stats
      const now = new Date()
      setStats({
        total: allNotices.length,
        active: allNotices.filter((n: PlatformNotice) => {
          const start = new Date(n.startDate)
          const end = n.endDate ? new Date(n.endDate) : null
          return n.isActive && start <= now && (!end || end >= now)
        }).length,
        scheduled: allNotices.filter((n: PlatformNotice) => {
          const start = new Date(n.startDate)
          return n.isActive && start > now
        }).length,
        expired: allNotices.filter((n: PlatformNotice) => {
          const end = n.endDate ? new Date(n.endDate) : null
          return end && end < now
        }).length,
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconegut')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotices()
  }, [filterType, filterStatus])

  // Cerca amb debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotices()
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // =====================
  // ACCIONS
  // =====================

  const handleToggleActive = async (notice: PlatformNotice) => {
    try {
      const response = await fetch(`/api/admin/notices/${notice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !notice.isActive }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error canviant estat')
      }

      fetchNotices()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error')
    }
  }

  const handleDelete = async () => {
    if (!selectedNotice) return

    try {
      const response = await fetch(`/api/admin/notices/${selectedNotice.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error eliminant avís')
      }

      setShowDeleteModal(false)
      setSelectedNotice(null)
      fetchNotices()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error')
    }
  }

  // =====================
  // HELPERS
  // =====================

  const getNoticeStatus = (notice: PlatformNotice): { label: string; color: string; bg: string } => {
    if (!notice.isActive) {
      return { label: 'Inactiu', color: 'text-slate-600', bg: 'bg-slate-100' }
    }
    
    const now = new Date()
    const start = new Date(notice.startDate)
    const end = notice.endDate ? new Date(notice.endDate) : null

    if (start > now) {
      return { label: 'Programat', color: 'text-blue-600', bg: 'bg-blue-100' }
    }
    
    if (end && end < now) {
      return { label: 'Expirat', color: 'text-slate-600', bg: 'bg-slate-100' }
    }

    return { label: 'Actiu', color: 'text-green-600', bg: 'bg-green-100' }
  }

  // =====================
  // RENDER
  // =====================

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Bell className="h-6 w-6 text-purple-600" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Avisos de Plataforma</h1>
            <p className="text-slate-500">Gestiona banners, alertes i comunicats</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchNotices}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Refrescar"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => {
              setSelectedNotice(null)
              setShowCreateModal(true)
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            Nou avís
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Bell className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total</p>
              <p className="text-2xl font-semibold text-slate-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="h-5 w-5 text-green-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Actius</p>
              <p className="text-2xl font-semibold text-green-600">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Programats</p>
              <p className="text-2xl font-semibold text-blue-600">{stats.scheduled}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <EyeOff className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Expirats</p>
              <p className="text-2xl font-semibold text-slate-600">{stats.expired}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Cercar avisos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white"
          >
            <option value="">Tots els tipus</option>
            {Object.entries(NOTICE_TYPES).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white"
          >
            <option value="">Tots els estats</option>
            <option value="active">Actius</option>
            <option value="scheduled">Programats</option>
            <option value="inactive">Inactius</option>
            <option value="expired">Expirats</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" strokeWidth={1.5} />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Llista d'avisos */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="h-8 w-8 text-slate-400 animate-spin mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-slate-500">Carregant avisos...</p>
          </div>
        ) : notices.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="h-12 w-12 text-slate-300 mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-slate-500 mb-4">No hi ha avisos</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              Crear primer avís
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notices.map((notice) => {
              const typeConfig = NOTICE_TYPES[notice.type]
              const positionConfig = NOTICE_POSITIONS[notice.position]
              const audienceConfig = NOTICE_AUDIENCES[notice.audience]
              const status = getNoticeStatus(notice)
              const TypeIcon = typeConfig.icon
              const PositionIcon = positionConfig.icon

              return (
                <div
                  key={notice.id}
                  className="p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Icona tipus */}
                    <div className={`p-2 rounded-lg ${typeConfig.bg} shrink-0`}>
                      <TypeIcon className={`h-5 w-5 ${typeConfig.color}`} strokeWidth={1.5} />
                    </div>

                    {/* Contingut */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-medium text-slate-900">{notice.title}</h3>
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{notice.message}</p>
                        </div>
                        
                        {/* Badges */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                            {status.label}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeConfig.bg} ${typeConfig.color}`}>
                            {typeConfig.label}
                          </span>
                        </div>
                      </div>

                      {/* Meta info */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <PositionIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
                          {positionConfig.label}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" strokeWidth={1.5} />
                          {audienceConfig.label}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
                          {new Date(notice.startDate).toLocaleDateString('ca-ES', {
                            day: '2-digit',
                            month: 'short',
                          })}
                          {notice.endDate && (
                            <> → {new Date(notice.endDate).toLocaleDateString('ca-ES', {
                              day: '2-digit',
                              month: 'short',
                            })}</>
                          )}
                        </span>
                        {notice._count && notice._count.dismissals > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                            {notice._count.dismissals} tancats
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Accions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleToggleActive(notice)}
                        className={`p-2 rounded-lg transition-colors ${
                          notice.isActive
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-slate-400 hover:bg-slate-100'
                        }`}
                        title={notice.isActive ? 'Desactivar' : 'Activar'}
                      >
                        {notice.isActive ? (
                          <Eye className="h-4 w-4" strokeWidth={1.5} />
                        ) : (
                          <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedNotice(notice)
                          setShowCreateModal(true)
                        }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedNotice(notice)
                          setShowDeleteModal(true)
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal Crear/Editar */}
      {showCreateModal && (
        <NoticeFormModal
          notice={selectedNotice}
          onClose={() => {
            setShowCreateModal(false)
            setSelectedNotice(null)
          }}
          onSuccess={() => {
            setShowCreateModal(false)
            setSelectedNotice(null)
            fetchNotices()
          }}
        />
      )}

      {/* Modal Eliminar */}
      {showDeleteModal && selectedNotice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="h-5 w-5 text-red-600" strokeWidth={1.5} />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Eliminar avís</h2>
            </div>
            <p className="text-slate-600 mb-6">
              Estàs segur que vols eliminar l'avís <strong>"{selectedNotice.title}"</strong>?
              Aquesta acció no es pot desfer.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedNotice(null)
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel·lar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// =====================
// MODAL FORMULARI
// =====================

function NoticeFormModal({
  notice,
  onClose,
  onSuccess,
}: {
  notice: PlatformNotice | null
  onClose: () => void
  onSuccess: () => void
}) {
  const isEditing = !!notice
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: notice?.title || '',
    message: notice?.message || '',
    type: notice?.type || 'INFO' as NoticeType,
    position: notice?.position || 'TOP_BANNER' as NoticePosition,
    audience: notice?.audience || 'ALL' as NoticeAudience,
    ctaText: notice?.ctaText || '',
    ctaUrl: notice?.ctaUrl || '',
    startDate: notice?.startDate ? notice.startDate.slice(0, 16) : '',
    endDate: notice?.endDate ? notice.endDate.slice(0, 16) : '',
    dismissible: notice?.dismissible ?? true,
    persistent: notice?.persistent ?? false,
    priority: notice?.priority || 0,
    isActive: notice?.isActive ?? true,
  })

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      alert('El títol i el missatge són obligatoris')
      return
    }

    setLoading(true)
    try {
      const url = isEditing
        ? `/api/admin/notices/${notice.id}`
        : '/api/admin/notices'

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          startDate: formData.startDate || new Date().toISOString(),
          endDate: formData.endDate || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error guardant avís')
      }

      onSuccess()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  const typeConfig = NOTICE_TYPES[formData.type]
  const TypeIcon = typeConfig.icon

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEditing ? 'Editar avís' : 'Nou avís'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Vista prèvia */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Vista prèvia</p>
            <div className={`p-4 rounded-lg border ${typeConfig.bg} ${typeConfig.border}`}>
              <div className="flex items-start gap-3">
                <TypeIcon className={`h-5 w-5 ${typeConfig.color} shrink-0 mt-0.5`} strokeWidth={1.5} />
                <div className="flex-1">
                  <p className={`font-medium ${typeConfig.color}`}>
                    {formData.title || 'Títol de l\'avís'}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    {formData.message || 'Missatge de l\'avís...'}
                  </p>
                  {formData.ctaText && (
                    <button className={`mt-2 inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-lg ${typeConfig.bg} ${typeConfig.color} border ${typeConfig.border}`}>
                      {formData.ctaText}
                      <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                  )}
                </div>
                {formData.dismissible && (
                  <button className="p-1 text-slate-400 hover:text-slate-600 shrink-0">
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Columna esquerra */}
            <div className="space-y-4">
              {/* Títol */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Títol *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Manteniment programat"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                />
              </div>

              {/* Missatge */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Missatge *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Escriu el contingut del avís..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                />
              </div>

              {/* CTA */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Text botó (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.ctaText}
                    onChange={(e) => setFormData(prev => ({ ...prev, ctaText: e.target.value }))}
                    placeholder="Més info"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    URL botó
                  </label>
                  <input
                    type="url"
                    value={formData.ctaUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, ctaUrl: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Columna dreta */}
            <div className="space-y-4">
              {/* Tipus */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tipus *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(NOTICE_TYPES).map(([key, config]) => {
                    const Icon = config.icon
                    const isSelected = formData.type === key
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, type: key as NoticeType }))}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors ${
                          isSelected
                            ? `${config.bg} ${config.border}`
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${isSelected ? config.color : 'text-slate-400'}`} strokeWidth={1.5} />
                        <span className={`text-xs ${isSelected ? config.color : 'text-slate-600'}`}>
                          {config.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Posició */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Posició
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(NOTICE_POSITIONS).map(([key, config]) => {
                    const Icon = config.icon
                    const isSelected = formData.position === key
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, position: key as NoticePosition }))}
                        className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                          isSelected
                            ? 'border-red-500 bg-red-50'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${isSelected ? 'text-red-600' : 'text-slate-400'}`} strokeWidth={1.5} />
                        <span className={`text-xs ${isSelected ? 'text-red-600' : 'text-slate-600'}`}>
                          {config.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Audiència */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Audiència
                </label>
                <select
                  value={formData.audience}
                  onChange={(e) => setFormData(prev => ({ ...prev, audience: e.target.value as NoticeAudience }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white"
                >
                  {Object.entries(NOTICE_AUDIENCES).map(([key, config]) => (
                    <option key={key} value={key}>{config.label} - {config.description}</option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Data inici
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Data fi (opcional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  />
                </div>
              </div>

              {/* Opcions */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.dismissible}
                    onChange={(e) => setFormData(prev => ({ ...prev, dismissible: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-slate-700">Es pot tancar</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.persistent}
                    onChange={(e) => setFormData(prev => ({ ...prev, persistent: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-slate-700">Persistent (reapareix)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-slate-700">Actiu</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel·lar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.title.trim() || !formData.message.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                Guardant...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" strokeWidth={2} />
                {isEditing ? 'Guardar canvis' : 'Crear avís'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
