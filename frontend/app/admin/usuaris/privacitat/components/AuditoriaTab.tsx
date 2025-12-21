'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { TYPOGRAPHY, INPUTS } from '@/lib/design-system'
import {
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertCircle,
  RefreshCw
} from 'lucide-react'

interface AuditLog {
  id: string
  userId: string
  changedById: string
  changedByRole: 'USER' | 'ADMIN' | 'SYSTEM'
  fieldChanged: string
  oldValue?: string | null
  newValue?: string | null
  reason?: string | null
  createdAt: string
  user?: {
    name: string | null
    nick: string | null
  } | null
  changedBy?: {
    name: string | null
    nick: string | null
  } | null
}

export function AuditoriaTab() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadLogs()
  }, [page, filterRole])

  const loadLogs = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })

      if (filterRole !== 'all') {
        params.set('role', filterRole)
      }

      const res = await fetch(`/api/admin/privacy/audit?${params.toString()}`)

      if (!res.ok) {
        const errorText = await res.text()
        console.error('API Error:', errorText)
        throw new Error('Error carregant logs')
      }

      const data = await res.json()

      // Assegurar que logs es sempre un array
      setLogs(Array.isArray(data.logs) ? data.logs : [])
      setTotalPages(typeof data.totalPages === 'number' ? data.totalPages : 1)
    } catch (err) {
      console.error('Error loading audit logs:', err)
      setError("No s'han pogut carregar els logs d'auditoria")
      setLogs([])
    } finally {
      setIsLoading(false)
    }
  }

  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      sensitiveJobCategory: 'Categoria sensible',
      showRealName: 'Mostrar nom real',
      showPosition: 'Mostrar posicio',
      showDepartment: 'Mostrar departament',
      showBio: 'Mostrar bio',
      showLocation: 'Mostrar ubicacio',
      showPhone: 'Mostrar telefon',
      showEmail: 'Mostrar email',
      showSocialLinks: 'Mostrar xarxes socials',
      showJoinedDate: 'Mostrar data registre',
      showLastActive: 'Mostrar ultima activitat',
      showConnections: 'Mostrar connexions',
      showGroups: 'Mostrar grups',
      global_config_updated: 'Configuracio global',
      category_created: 'Categoria creada',
      category_updated: 'Categoria actualitzada',
      category_deleted: 'Categoria eliminada',
      category_deactivated: 'Categoria desactivada',
    }
    return labels[field] || field
  }

  const getRoleBadgeClass = (role: string): string => {
    switch (role) {
      case 'USER': return 'bg-blue-100 text-blue-700'
      case 'ADMIN': return 'bg-amber-100 text-amber-700'
      case 'SYSTEM': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-500'
    }
  }

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return dateStr
      return date.toLocaleString('ca-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateStr
    }
  }

  const formatValue = (value: string | null | undefined): string => {
    if (value === undefined || value === null || value === 'undefined' || value === 'null') {
      return '-'
    }
    if (value === 'true') return 'Visible'
    if (value === 'false') return 'Ocult'
    // Truncar valors llargs (com JSON)
    const str = String(value)
    if (str.length > 40) {
      return str.substring(0, 40) + '...'
    }
    return str
  }

  // IMPORTANT: Sempre retornar JSX valid
  return (
    <div className="space-y-6">
      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar per usuari..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${INPUTS.base} pl-10`}
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value)
                setPage(1)
              }}
              className={INPUTS.select}
            >
              <option value="all">Tots els canvis</option>
              <option value="USER">Canvis d&apos;usuari</option>
              <option value="ADMIN">Canvis d&apos;admin</option>
              <option value="SYSTEM">Canvis de sistema</option>
            </select>
            <button
              onClick={() => loadLogs()}
              disabled={isLoading}
              className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              title="Refrescar"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Loading state */}
      {isLoading && (
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className={TYPOGRAPHY.small}>Carregant registres...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
              <button
                onClick={() => loadLogs()}
                className="ml-auto px-3 py-1 text-sm bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
              >
                Reintentar
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && !error && logs.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className={`${TYPOGRAPHY.sectionTitle} mb-2`}>
              No hi ha registres d&apos;auditoria
            </h3>
            <p className={TYPOGRAPHY.body}>
              Els canvis de privacitat es registraran aqui automaticament
            </p>
          </CardContent>
        </Card>
      )}

      {/* Logs table */}
      {!isLoading && !error && logs.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className={`px-4 py-3 text-left ${TYPOGRAPHY.small} uppercase font-medium`}>
                      Data
                    </th>
                    <th className={`px-4 py-3 text-left ${TYPOGRAPHY.small} uppercase font-medium`}>
                      Usuari afectat
                    </th>
                    <th className={`px-4 py-3 text-left ${TYPOGRAPHY.small} uppercase font-medium`}>
                      Canviat per
                    </th>
                    <th className={`px-4 py-3 text-left ${TYPOGRAPHY.small} uppercase font-medium`}>
                      Camp
                    </th>
                    <th className={`px-4 py-3 text-left ${TYPOGRAPHY.small} uppercase font-medium`}>
                      Valor anterior
                    </th>
                    <th className={`px-4 py-3 text-left ${TYPOGRAPHY.small} uppercase font-medium`}>
                      Nou valor
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className={`px-4 py-3 ${TYPOGRAPHY.small} whitespace-nowrap`}>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(log.createdAt)}
                        </div>
                      </td>
                      <td className={`px-4 py-3 ${TYPOGRAPHY.body}`}>
                        <span className="font-medium text-gray-900">
                          {log.userId === 'SYSTEM' ? 'Sistema' : (log.user?.name || 'Usuari desconegut')}
                        </span>
                        {log.user?.nick && (
                          <span className="text-gray-500 ml-1">@{log.user.nick}</span>
                        )}
                      </td>
                      <td className={`px-4 py-3 ${TYPOGRAPHY.body}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900">
                            {log.changedBy?.name || log.changedByRole}
                          </span>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getRoleBadgeClass(log.changedByRole)}`}>
                            {log.changedByRole}
                          </span>
                        </div>
                      </td>
                      <td className={`px-4 py-3 ${TYPOGRAPHY.body} text-gray-900`}>
                        {getFieldLabel(log.fieldChanged)}
                      </td>
                      <td className={`px-4 py-3 ${TYPOGRAPHY.small}`}>
                        <span className="max-w-[150px] truncate block">
                          {formatValue(log.oldValue)}
                        </span>
                      </td>
                      <td className={`px-4 py-3 ${TYPOGRAPHY.body} font-medium text-gray-900`}>
                        <span className="max-w-[150px] truncate block">
                          {formatValue(log.newValue)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
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
    </div>
  )
}
