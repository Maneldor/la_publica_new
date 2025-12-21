'use client'

import { useState, useEffect } from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardContent } from '@/components/ui/card'
import { StatsGrid } from '@/components/ui/StatsGrid'
import { TYPOGRAPHY, INPUTS } from '@/lib/design-system'
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  Eye,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  Shield,
  RefreshCw
} from 'lucide-react'
import { AlertDetailModal } from './components/AlertDetailModal'

interface AdminAlert {
  id: string
  type: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'DISMISSED'
  title: string
  message: string
  metadata: Record<string, unknown>
  isRead: boolean
  createdAt: string
  resolvedAt?: string
  resolution?: string
  user: {
    id: string
    name: string | null
    nick: string | null
    email: string
    image?: string | null
  }
  resolvedBy?: {
    id: string
    name: string | null
  }
}

export default function AlertesAdminPage() {
  const [alerts, setAlerts] = useState<AdminAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [unreadCount, setUnreadCount] = useState(0)
  const [total, setTotal] = useState(0)

  // Filtres
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal
  const [selectedAlert, setSelectedAlert] = useState<AdminAlert | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    loadAlerts()
  }, [page, filterStatus, filterType, filterSeverity])

  const loadAlerts = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        status: filterStatus,
        type: filterType,
        severity: filterSeverity,
      })

      const res = await fetch(`/api/admin/alerts?${params}`)
      if (!res.ok) throw new Error('Error carregant alertes')

      const data = await res.json()
      setAlerts(data.alerts || [])
      setTotalPages(data.totalPages || 1)
      setUnreadCount(data.unreadCount || 0)
      setTotal(data.total || 0)
    } catch {
      setError("No s'han pogut carregar les alertes")
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewAlert = (alert: AdminAlert) => {
    setSelectedAlert(alert)
    setIsModalOpen(true)
  }

  const handleResolveAlert = async (alertId: string, resolution: string, action?: string) => {
    try {
      const res = await fetch(`/api/admin/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RESOLVED', resolution, action })
      })

      if (!res.ok) throw new Error('Error resolent alerta')

      loadAlerts()
      setIsModalOpen(false)
    } catch {
      alert("Hi ha hagut un error resolent l'alerta")
    }
  }

  const handleDismissAlert = async (alertId: string) => {
    try {
      const res = await fetch(`/api/admin/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DISMISSED', resolution: 'Descartada' })
      })

      if (!res.ok) throw new Error('Error descartant alerta')

      loadAlerts()
    } catch {
      alert("Hi ha hagut un error descartant l'alerta")
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-200'
      case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'MEDIUM': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'LOW': return 'bg-blue-100 text-blue-700 border-blue-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700'
      case 'RESOLVED': return 'bg-green-100 text-green-700'
      case 'DISMISSED': return 'bg-gray-100 text-gray-500'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'MULTIPLE_PROFESSIONAL_GROUP_ATTEMPT': return 'Intent multiple grup'
      case 'PROFESSIONAL_GROUP_CHANGE_REQUEST': return 'Sol-licitud canvi grup'
      case 'SUSPICIOUS_ACTIVITY': return 'Activitat sospitosa'
      case 'PRIVACY_VIOLATION': return 'Violacio privacitat'
      default: return type
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('ca-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Stats
  const pendingCount = alerts.filter(a => a.status === 'PENDING').length
  const resolvedTodayCount = alerts.filter(a =>
    a.status === 'RESOLVED' &&
    a.resolvedAt &&
    new Date(a.resolvedAt).toDateString() === new Date().toDateString()
  ).length

  const stats = [
    {
      label: 'Alertes pendents',
      value: pendingCount,
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'amber' as const,
    },
    {
      label: 'No llegides',
      value: unreadCount,
      icon: <Bell className="w-5 h-5" />,
      color: 'red' as const,
    },
    {
      label: 'Resoltes avui',
      value: resolvedTodayCount,
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'green' as const,
    },
    {
      label: 'Total alertes',
      value: total,
      icon: <Shield className="w-5 h-5" />,
      color: 'indigo' as const,
    },
  ]

  return (
    <PageLayout
      title="Alertes"
      subtitle="Gestiona les alertes i sol-licituds dels usuaris"
      icon={<Bell className="w-6 h-6" />}
    >
      {/* Stats */}
      <StatsGrid stats={stats} columns={4} />

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar alertes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${INPUTS.base} pl-10`}
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
              className={INPUTS.select}
            >
              <option value="all">Tots els estats</option>
              <option value="PENDING">Pendents</option>
              <option value="IN_PROGRESS">En progres</option>
              <option value="RESOLVED">Resoltes</option>
              <option value="DISMISSED">Descartades</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setPage(1) }}
              className={INPUTS.select}
            >
              <option value="all">Tots els tipus</option>
              <option value="MULTIPLE_PROFESSIONAL_GROUP_ATTEMPT">Intent multiple grup</option>
              <option value="PROFESSIONAL_GROUP_CHANGE_REQUEST">Sol-licitud canvi</option>
              <option value="SUSPICIOUS_ACTIVITY">Activitat sospitosa</option>
            </select>

            <select
              value={filterSeverity}
              onChange={(e) => { setFilterSeverity(e.target.value); setPage(1) }}
              className={INPUTS.select}
            >
              <option value="all">Totes les severitats</option>
              <option value="CRITICAL">Critica</option>
              <option value="HIGH">Alta</option>
              <option value="MEDIUM">Mitjana</option>
              <option value="LOW">Baixa</option>
            </select>

            <button
              onClick={() => loadAlerts()}
              disabled={isLoading}
              className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              title="Refrescar"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {isLoading && (
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className={TYPOGRAPHY.small}>Carregant alertes...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {!isLoading && error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty */}
      {!isLoading && !error && alerts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
            <h3 className={`${TYPOGRAPHY.sectionTitle} mb-2`}>
              Tot esta en ordre!
            </h3>
            <p className={TYPOGRAPHY.body}>
              No hi ha alertes pendents de revisio
            </p>
          </CardContent>
        </Card>
      )}

      {/* Llista d'alertes */}
      {!isLoading && !error && alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alertItem) => (
            <Card
              key={alertItem.id}
              className={`transition-all hover:shadow-md cursor-pointer ${
                !alertItem.isRead ? 'border-l-4 border-l-indigo-500' : ''
              } ${alertItem.status === 'RESOLVED' ? 'opacity-70' : ''}`}
              onClick={() => handleViewAlert(alertItem)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Icona severitat */}
                  <div className={`p-2 rounded-lg ${
                    alertItem.severity === 'CRITICAL' ? 'bg-red-100' :
                    alertItem.severity === 'HIGH' ? 'bg-orange-100' :
                    alertItem.severity === 'MEDIUM' ? 'bg-amber-100' : 'bg-blue-100'
                  }`}>
                    <AlertTriangle className={`w-5 h-5 ${
                      alertItem.severity === 'CRITICAL' ? 'text-red-600' :
                      alertItem.severity === 'HIGH' ? 'text-orange-600' :
                      alertItem.severity === 'MEDIUM' ? 'text-amber-600' : 'text-blue-600'
                    }`} />
                  </div>

                  {/* Contingut */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{alertItem.title}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getSeverityBadge(alertItem.severity)}`}>
                        {alertItem.severity}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(alertItem.status)}`}>
                        {alertItem.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {alertItem.message}
                    </p>

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {alertItem.user.name || 'Usuari'} (@{alertItem.user.nick || 'sense-nick'})
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(alertItem.createdAt)}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {getTypeLabel(alertItem.type)}
                      </span>
                    </div>
                  </div>

                  {/* Accions rapides */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleViewAlert(alertItem) }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                      title="Veure detalls"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    {alertItem.status === 'PENDING' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleResolveAlert(alertItem.id, 'Resolt rapidament')
                          }}
                          className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600"
                          title="Marcar com resolt"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDismissAlert(alertItem.id)
                          }}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                          title="Descartar"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Paginacio */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className={TYPOGRAPHY.small}>
            Pagina {page} de {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Modal de detall */}
      {selectedAlert && (
        <AlertDetailModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedAlert(null) }}
          alert={selectedAlert}
          onResolve={handleResolveAlert}
        />
      )}
    </PageLayout>
  )
}
