'use client'

import { useState, useEffect } from 'react'
import { 
  Wrench, Database, RefreshCw, Trash2, Clock, UserX, 
  HardDrive, Download, Archive, CheckCircle, XCircle, 
  AlertTriangle, Play, Pause
} from 'lucide-react'

interface MaintenanceData {
  maintenanceMode: {
    enabled: boolean
    message: string
    estimatedTime: string
  }
  storage: {
    used: number
    total: number
    percentage: number
  }
  cleanup: {
    expiredSessions: number
    oldLogs: number
    expiredTokens: number
    unverifiedUsers: number
  }
  backups: {
    id: string
    filename: string
    size: string
    created: string
  }[]
}

export default function MantenimentPage() {
  const [data, setData] = useState<MaintenanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [maintenanceMessage, setMaintenanceMessage] = useState('')
  const [estimatedTime, setEstimatedTime] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/sistema/maintenance')
      const result = await res.json()
      if (result.success) {
        setData(result.data)
        setMaintenanceMode(result.data.maintenanceMode.enabled)
        setMaintenanceMessage(result.data.maintenanceMode.message)
        setEstimatedTime(result.data.maintenanceMode.estimatedTime)
      }
    } catch (err) {
      console.error('Error loading maintenance data:', err)
    } finally {
      setLoading(false)
    }
  }

  const executeAction = async (action: string, params?: any) => {
    setActionLoading(action)
    try {
      const res = await fetch('/api/admin/sistema/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...params })
      })
      const result = await res.json()
      if (result.success) {
        await loadData()
      }
    } catch (err) {
      console.error('Error executing action:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const toggleMaintenance = async () => {
    await executeAction('toggleMaintenance', {
      enabled: !maintenanceMode,
      message: maintenanceMessage,
      estimatedTime: estimatedTime
    })
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading && !data) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-48 bg-slate-200 rounded-xl"></div>)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
          <Wrench className="h-6 w-6 text-slate-600" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Manteniment del Sistema</h1>
          <p className="text-slate-500">Gestió de manteniment, neteja i optimització</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mode Manteniment */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Pause className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
            Mode Manteniment
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Estat del manteniment</span>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${maintenanceMode ? 'bg-amber-500' : 'bg-green-500'}`} />
                <span className={`text-sm font-medium ${maintenanceMode ? 'text-amber-700' : 'text-green-700'}`}>
                  {maintenanceMode ? 'Actiu' : 'Inactiu'}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-2">Missatge personalitzat</label>
              <textarea
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400"
                rows={2}
                placeholder="El sistema està en manteniment..."
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-2">Temps estimat</label>
              <select
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900"
              >
                <option value="">Selecciona temps estimat</option>
                <option value="15 minuts">15 minuts</option>
                <option value="30 minuts">30 minuts</option>
                <option value="1 hora">1 hora</option>
                <option value="2 hores">2 hores</option>
                <option value="4 hores">4 hores</option>
                <option value="8 hores">8 hores</option>
                <option value="24 hores">24 hores</option>
                <option value="Indefinit">Indefinit</option>
              </select>
            </div>
            <button
              onClick={toggleMaintenance}
              disabled={actionLoading === 'toggleMaintenance'}
              className={`w-full px-4 py-2 text-white rounded-lg font-medium transition-colors ${
                maintenanceMode 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-amber-600 hover:bg-amber-700'
              } disabled:opacity-50`}
            >
              {actionLoading === 'toggleMaintenance' ? (
                <RefreshCw className="h-4 w-4 animate-spin mx-auto" />
              ) : maintenanceMode ? (
                'Desactivar Manteniment'
              ) : (
                'Activar Manteniment'
              )}
            </button>
          </div>
        </div>

        {/* Gestió de Caché */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
            Gestió de Caché
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => executeAction('clearRedisCache')}
              disabled={actionLoading === 'clearRedisCache'}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {actionLoading === 'clearRedisCache' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" strokeWidth={1.5} />
              )}
              Netejar caché Redis
            </button>
            <button
              onClick={() => executeAction('clearStatsCache')}
              disabled={actionLoading === 'clearStatsCache'}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {actionLoading === 'clearStatsCache' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" strokeWidth={1.5} />
              )}
              Netejar caché estadístiques
            </button>
          </div>
        </div>

        {/* Neteja de Base de Dades */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
            Neteja de Base de Dades
          </h2>
          <div className="space-y-3">
            <CleanupButton 
              action="purgeExpiredSessions"
              count={data?.cleanup.expiredSessions || 0}
              label="Purgar sessions expirades"
              icon={Clock}
              loading={actionLoading === 'purgeExpiredSessions'}
              onClick={() => executeAction('purgeExpiredSessions')}
            />
            <CleanupButton 
              action="deleteOldLogs"
              count={data?.cleanup.oldLogs || 0}
              label="Eliminar logs >30 dies"
              icon={Clock}
              loading={actionLoading === 'deleteOldLogs'}
              onClick={() => executeAction('deleteOldLogs')}
            />
            <CleanupButton 
              action="deleteExpiredTokens"
              count={data?.cleanup.expiredTokens || 0}
              label="Eliminar tokens expirats"
              icon={Clock}
              loading={actionLoading === 'deleteExpiredTokens'}
              onClick={() => executeAction('deleteExpiredTokens')}
            />
            <CleanupButton 
              action="deleteUnverifiedUsers"
              count={data?.cleanup.unverifiedUsers || 0}
              label="Eliminar usuaris no verificats >30 dies"
              icon={UserX}
              loading={actionLoading === 'deleteUnverifiedUsers'}
              onClick={() => setShowDeleteConfirm(true)}
              destructive
            />
          </div>
        </div>

        {/* Emmagatzematge */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
            Emmagatzematge
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Espai utilitzat</span>
                <span className="text-slate-900 font-medium">
                  {data?.storage.used || 0} GB / {data?.storage.total || 100} GB
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    (data?.storage.percentage || 0) > 80 ? 'bg-red-500' :
                    (data?.storage.percentage || 0) > 60 ? 'bg-amber-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${data?.storage.percentage || 0}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {data?.storage.percentage || 0}% de l'espai utilitzat
              </p>
            </div>
            <button
              onClick={() => executeAction('cleanTempFiles')}
              disabled={actionLoading === 'cleanTempFiles'}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {actionLoading === 'cleanTempFiles' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
              )}
              Netejar fitxers temporals
            </button>
          </div>
        </div>

        {/* Backups */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <Archive className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
              Backups
            </h2>
            <button
              onClick={() => executeAction('createManualBackup')}
              disabled={actionLoading === 'createManualBackup'}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {actionLoading === 'createManualBackup' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" strokeWidth={1.5} />
              )}
              Crear backup manual
            </button>
          </div>
          <div className="space-y-3">
            {!data?.backups.length ? (
              <p className="text-slate-500 text-sm">No hi ha backups disponibles</p>
            ) : (
              data.backups.map(backup => (
                <div key={backup.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Archive className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{backup.filename}</p>
                      <p className="text-xs text-slate-500">{backup.size} • {backup.created}</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm">
                    Descarregar
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmació per eliminar usuaris */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500" strokeWidth={1.5} />
              <h3 className="text-lg font-semibold text-slate-900">Confirmar eliminació</h3>
            </div>
            <p className="text-slate-600 mb-6">
              Estàs segur que vols eliminar {data?.cleanup.unverifiedUsers || 0} usuaris no verificats? 
              Aquesta acció no es pot desfer.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                Cancel·lar
              </button>
              <button
                onClick={() => {
                  executeAction('deleteUnverifiedUsers')
                  setShowDeleteConfirm(false)
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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

function CleanupButton({ 
  action, 
  count, 
  label, 
  icon: Icon, 
  loading, 
  onClick, 
  destructive = false 
}: {
  action: string
  count: number
  label: string
  icon: any
  loading: boolean
  onClick: () => void
  destructive?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading || count === 0}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors disabled:opacity-50 ${
        destructive 
          ? 'border-red-200 bg-red-50 hover:bg-red-100 text-red-700'
          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
      }`}
    >
      <div className="flex items-center gap-2">
        {loading ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <Icon className="h-4 w-4" strokeWidth={1.5} />
        )}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
        count > 0 
          ? destructive ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
          : 'bg-green-100 text-green-700'
      }`}>
        {count}
      </span>
    </button>
  )
}