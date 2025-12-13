'use client'

import { useState, useEffect } from 'react'
import {
  ScrollText,
  Search,
  Filter,
  RefreshCw,
  Download,
  Calendar,
  User,
  AlertTriangle,
  AlertCircle,
  Info,
  Bug,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  Globe,
  Monitor,
  FileText,
  Shield,
  Activity,
  TrendingUp,
  Eye,
} from 'lucide-react'

// =====================
// TIPUS
// =====================

type AuditLevel = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'

interface AuditLog {
  id: string
  timestamp: string
  userId: string | null
  userEmail: string | null
  userRole: string | null
  action: string
  category: string
  entity: string | null
  entityId: string | null
  entityName: string | null
  description: string | null
  changes: any
  metadata: any
  ipAddress: string | null
  userAgent: string | null
  requestPath: string | null
  requestMethod: string | null
  level: AuditLevel
  success: boolean
  errorMessage: string | null
  user?: {
    id: string
    name: string | null
    email: string
    role: string
  } | null
}

interface Stats {
  totalLogs: number
  recentErrors: number
  failedLogins: number
  byLevel: Record<string, number>
  byCategory: { category: string; count: number }[]
  byAction: { action: string; count: number }[]
  topUsers: { userId: string; email: string; count: number }[]
  activityByDay: { date: string; count: number }[]
}

// =====================
// CONFIGURACIÓ
// =====================

const LEVEL_CONFIG: Record<AuditLevel, { label: string; icon: any; color: string; bg: string }> = {
  DEBUG: { label: 'Debug', icon: Bug, color: 'text-slate-500', bg: 'bg-slate-100' },
  INFO: { label: 'Info', icon: Info, color: 'text-blue-600', bg: 'bg-blue-100' },
  WARNING: { label: 'Avís', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100' },
  ERROR: { label: 'Error', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
  CRITICAL: { label: 'Crític', icon: AlertCircle, color: 'text-red-800', bg: 'bg-red-200' },
}

const CATEGORIES = [
  'AUTH', 'USER', 'ROLE', 'PERMISSION', 'COMPANY', 'OFFER',
  'LEAD', 'CAMPAIGN', 'CONTENT', 'CATEGORY', 'SUBSCRIPTION',
  'BILLING', 'SYSTEM', 'SECURITY', 'API'
]

const ACTIONS = [
  'LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'CREATE', 'UPDATE', 'DELETE',
  'VIEW', 'APPROVE', 'REJECT', 'ACTIVATE', 'DEACTIVATE', 'SEND',
  'PUBLISH', 'EXPORT', 'ERROR', 'CONFIG_CHANGE'
]

// =====================
// COMPONENT PRINCIPAL
// =====================

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtres
  const [search, setSearch] = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterAction, setFilterAction] = useState('')
  const [filterSuccess, setFilterSuccess] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Paginació
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 50

  // Modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  // =====================
  // CARREGAR DADES
  // =====================

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', limit.toString())

      if (search) params.set('search', search)
      if (filterLevel) params.set('level', filterLevel)
      if (filterCategory) params.set('category', filterCategory)
      if (filterAction) params.set('action', filterAction)
      if (filterSuccess) params.set('success', filterSuccess)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)

      const response = await fetch(`/api/admin/audit-logs?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error carregant logs')
      }

      setLogs(data.logs || [])
      setTotal(data.pagination?.total || 0)
      setTotalPages(data.pagination?.totalPages || 1)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconegut')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/audit-logs/stats?days=7')
      const data = await response.json()
      if (response.ok) {
        setStats(data)
      }
    } catch (err) {
      console.error('Error carregant stats:', err)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [page, filterLevel, filterCategory, filterAction, filterSuccess, dateFrom, dateTo])

  useEffect(() => {
    fetchStats()
  }, [])

  // Cerca amb debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      fetchLogs()
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // =====================
  // EXPORTAR
  // =====================

  const handleExport = async () => {
    try {
      const params = new URLSearchParams()
      if (filterCategory) params.set('category', filterCategory)
      if (filterLevel) params.set('level', filterLevel)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)

      const response = await fetch(`/api/admin/audit-logs/export?${params}`)

      if (!response.ok) {
        throw new Error('Error exportant logs')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error exportant')
    }
  }

  // =====================
  // RESET FILTRES
  // =====================

  const resetFilters = () => {
    setSearch('')
    setFilterLevel('')
    setFilterCategory('')
    setFilterAction('')
    setFilterSuccess('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  const hasFilters = search || filterLevel || filterCategory || filterAction || filterSuccess || dateFrom || dateTo

  // =====================
  // RENDER
  // =====================

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
            <ScrollText className="h-6 w-6 text-slate-600" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Logs d'Auditoria</h1>
            <p className="text-slate-500">Registre de totes les accions del sistema</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { fetchLogs(); fetchStats(); }}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Refrescar"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download className="h-4 w-4" strokeWidth={1.5} />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Activity className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total logs</p>
                <p className="text-2xl font-semibold text-slate-900">{stats.totalLogs.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Errors (7 dies)</p>
                <p className="text-2xl font-semibold text-red-600">{stats.recentErrors}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Shield className="h-5 w-5 text-amber-600" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Logins fallits</p>
                <p className="text-2xl font-semibold text-amber-600">{stats.failedLogins}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Avui</p>
                <p className="text-2xl font-semibold text-green-600">
                  {stats.activityByDay.length > 0
                    ? stats.activityByDay[stats.activityByDay.length - 1].count
                    : 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Filter className="h-4 w-4" strokeWidth={1.5} />
          Filtres
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="ml-2 text-xs text-red-600 hover:text-red-700"
            >
              Esborrar filtres
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Cerca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Cercar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            />
          </div>

          {/* Nivell */}
          <select
            value={filterLevel}
            onChange={(e) => { setFilterLevel(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white"
          >
            <option value="">Tots els nivells</option>
            {Object.entries(LEVEL_CONFIG).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          {/* Categoria */}
          <select
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white"
          >
            <option value="">Totes les categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Acció */}
          <select
            value={filterAction}
            onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white"
          >
            <option value="">Totes les accions</option>
            {ACTIONS.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Èxit */}
          <select
            value={filterSuccess}
            onChange={(e) => { setFilterSuccess(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white"
          >
            <option value="">Tots els resultats</option>
            <option value="true">Èxit</option>
            <option value="false">Error</option>
          </select>

          {/* Data inici */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="Des de"
            />
          </div>

          {/* Data fi */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="Fins a"
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" strokeWidth={1.5} />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Taula */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="h-8 w-8 text-slate-400 animate-spin mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-slate-500">Carregant logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <ScrollText className="h-12 w-12 text-slate-300 mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-slate-500">No hi ha logs amb aquests filtres</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Data/Hora</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Nivell</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Categoria</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Acció</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Usuari</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Descripció</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Resultat</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Accions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => {
                    const levelConfig = LEVEL_CONFIG[log.level] || LEVEL_CONFIG.INFO
                    const LevelIcon = levelConfig.icon

                    return (
                      <tr key={log.id} className="hover:bg-slate-50">
                        {/* Data/Hora */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.5} />
                            <span className="text-slate-600">
                              {new Date(log.timestamp).toLocaleDateString('ca-ES', {
                                day: '2-digit',
                                month: 'short',
                              })}
                            </span>
                            <span className="text-slate-400">
                              {new Date(log.timestamp).toLocaleTimeString('ca-ES', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </span>
                          </div>
                        </td>

                        {/* Nivell */}
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${levelConfig.bg} ${levelConfig.color}`}>
                            <LevelIcon className="h-3 w-3" strokeWidth={2} />
                            {levelConfig.label}
                          </span>
                        </td>

                        {/* Categoria */}
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                            {log.category}
                          </span>
                        </td>

                        {/* Acció */}
                        <td className="px-4 py-3">
                          <span className="text-sm text-slate-700">{log.action}</span>
                        </td>

                        {/* Usuari */}
                        <td className="px-4 py-3">
                          {log.userEmail ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
                                <User className="h-3 w-3 text-slate-500" strokeWidth={1.5} />
                              </div>
                              <span className="text-sm text-slate-600 truncate max-w-[150px]" title={log.userEmail}>
                                {log.userEmail}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">Sistema</span>
                          )}
                        </td>

                        {/* Descripció */}
                        <td className="px-4 py-3">
                          <span className="text-sm text-slate-600 truncate block max-w-[200px]" title={log.description || ''}>
                            {log.description || log.entityName || '-'}
                          </span>
                        </td>

                        {/* Resultat */}
                        <td className="px-4 py-3">
                          {log.success ? (
                            <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                              <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                              Èxit
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-600 text-sm">
                              <XCircle className="h-4 w-4" strokeWidth={1.5} />
                              Error
                            </span>
                          )}
                        </td>

                        {/* Accions */}
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Veure detalls"
                          >
                            <Eye className="h-4 w-4" strokeWidth={1.5} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginació */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
              <p className="text-sm text-slate-600">
                Mostrant {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} de {total.toLocaleString()} logs
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
                </button>
                <span className="text-sm text-slate-600">
                  Pàgina {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal Detalls */}
      {selectedLog && (
        <LogDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  )
}

// =====================
// MODAL DETALLS
// =====================

function LogDetailModal({
  log,
  onClose,
}: {
  log: AuditLog
  onClose: () => void
}) {
  const levelConfig = LEVEL_CONFIG[log.level] || LEVEL_CONFIG.INFO
  const LevelIcon = levelConfig.icon

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${levelConfig.bg}`}>
              <LevelIcon className={`h-5 w-5 ${levelConfig.color}`} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Detalls del log</h2>
              <p className="text-sm text-slate-500">{log.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Informació principal */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Data/Hora</p>
              <p className="text-sm text-slate-900">
                {new Date(log.timestamp).toLocaleString('ca-ES', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Nivell</p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${levelConfig.bg} ${levelConfig.color}`}>
                <LevelIcon className="h-3 w-3" strokeWidth={2} />
                {levelConfig.label}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Categoria</p>
              <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-700">
                {log.category}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Acció</p>
              <p className="text-sm text-slate-900">{log.action}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Resultat</p>
              {log.success ? (
                <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                  Èxit
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-red-600 text-sm">
                  <XCircle className="h-4 w-4" strokeWidth={1.5} />
                  Error
                </span>
              )}
            </div>
          </div>

          {/* Usuari */}
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-xs text-slate-500 uppercase font-semibold mb-2 flex items-center gap-2">
              <User className="h-3.5 w-3.5" strokeWidth={1.5} />
              Usuari
            </p>
            {log.userEmail ? (
              <div className="space-y-1">
                <p className="text-sm text-slate-900">{log.userEmail}</p>
                {log.userRole && (
                  <span className="text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-600">
                    {log.userRole}
                  </span>
                )}
                {log.userId && (
                  <p className="text-xs text-slate-400 font-mono">{log.userId}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Acció de sistema</p>
            )}
          </div>

          {/* Entitat */}
          {log.entity && (
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-xs text-slate-500 uppercase font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
                Entitat afectada
              </p>
              <div className="space-y-1">
                <p className="text-sm text-slate-900">{log.entity}</p>
                {log.entityName && <p className="text-sm text-slate-600">{log.entityName}</p>}
                {log.entityId && <p className="text-xs text-slate-400 font-mono">{log.entityId}</p>}
              </div>
            </div>
          )}

          {/* Descripció */}
          {log.description && (
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Descripció</p>
              <p className="text-sm text-slate-700">{log.description}</p>
            </div>
          )}

          {/* Error */}
          {log.errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-xs text-red-600 uppercase font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
                Missatge d'error
              </p>
              <p className="text-sm text-red-800 font-mono">{log.errorMessage}</p>
            </div>
          )}

          {/* Context */}
          {(log.ipAddress || log.requestPath || log.userAgent) && (
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-xs text-slate-500 uppercase font-semibold mb-2 flex items-center gap-2">
                <Globe className="h-3.5 w-3.5" strokeWidth={1.5} />
                Context de la petició
              </p>
              <div className="space-y-2 text-sm">
                {log.ipAddress && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">IP:</span>
                    <span className="font-mono text-slate-700">{log.ipAddress}</span>
                  </div>
                )}
                {log.requestPath && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Path:</span>
                    <span className="font-mono text-slate-700">
                      {log.requestMethod && <span className="text-blue-600">{log.requestMethod}</span>}{' '}
                      {log.requestPath}
                    </span>
                  </div>
                )}
                {log.userAgent && (
                  <div className="flex items-start gap-2">
                    <Monitor className="h-4 w-4 text-slate-400 mt-0.5" strokeWidth={1.5} />
                    <span className="text-xs text-slate-500 break-all">{log.userAgent}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Canvis */}
          {log.changes && (
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Canvis</p>
              <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-xs text-green-400 font-mono">
                  {JSON.stringify(log.changes, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Metadata */}
          {log.metadata && (
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Metadades</p>
              <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-xs text-blue-400 font-mono">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Tancar
          </button>
        </div>
      </div>
    </div>
  )
}