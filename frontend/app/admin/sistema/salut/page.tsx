'use client'

import { useState, useEffect } from 'react'
import { Activity, Database, Server, Mail, Cloud, AlertTriangle, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react'

interface ServiceStatus {
  status: 'online' | 'offline' | 'degraded'
  latency: number
  message: string
}

interface HealthData {
  services: {
    database: ServiceStatus
    redis: ServiceStatus
    email: ServiceStatus
    storage: ServiceStatus
  }
  alerts: {
    pendingCompanies: number
    pendingOffers: number
    unverifiedUsers: number
    total: number
  }
  timestamp: string
}

export default function SalutPage() {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const loadHealth = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/sistema/health')
      const data = await res.json()
      if (data.success) {
        setHealth(data)
        setLastUpdate(new Date())
      }
    } catch (err) {
      console.error('Error loading health:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHealth()
    const interval = setInterval(loadHealth, 60000) // Auto-refresh cada 60s
    return () => clearInterval(interval)
  }, [])

  if (loading && !health) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>)}
          </div>
        </div>
      </div>
    )
  }

  const services = [
    { key: 'database', label: 'Base de Dades', icon: Database, data: health?.services.database },
    { key: 'redis', label: 'Redis Cache', icon: Server, data: health?.services.redis },
    { key: 'email', label: 'Servei de Correu', icon: Mail, data: health?.services.email },
    { key: 'storage', label: 'Emmagatzematge', icon: Cloud, data: health?.services.storage },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
            <Activity className="h-6 w-6 text-slate-600" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Salut del Sistema</h1>
            <p className="text-slate-500">Monitorització en temps real dels serveis</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdate && (
            <span className="text-sm text-slate-500 flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Última actualització: {lastUpdate.toLocaleTimeString('ca-ES')}
            </span>
          )}
          <button
            onClick={loadHealth}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refrescar
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map(service => (
          <ServiceCard key={service.key} label={service.label} icon={service.icon} data={service.data} />
        ))}
      </div>

      {/* Alerts Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Alertes Actives
          {health?.alerts.total ? (
            <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">{health.alerts.total}</span>
          ) : (
            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Tot correcte</span>
          )}
        </h2>
        
        <div className="space-y-3">
          <AlertRow 
            label="Empreses pendents d'aprovació (>3 dies)" 
            count={health?.alerts.pendingCompanies || 0} 
            href="/admin/empreses-pendents"
          />
          <AlertRow 
            label="Ofertes pendents de revisió (>2 dies)" 
            count={health?.alerts.pendingOffers || 0} 
            href="/admin/ofertas"
          />
          <AlertRow 
            label="Usuaris sense verificar email (>7 dies)" 
            count={health?.alerts.unverifiedUsers || 0} 
            href="/admin/usuaris"
          />
        </div>
      </div>

      {/* System Info */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-sm text-slate-600">
          🔄 Auto-actualització cada 60 segons | 
          📊 Dades en temps real | 
          🕐 Timestamp: {health?.timestamp ? new Date(health.timestamp).toLocaleString('ca-ES') : '-'}
        </p>
      </div>
    </div>
  )
}

function ServiceCard({ label, icon: Icon, data }: { label: string; icon: any; data?: ServiceStatus }) {
  const status = data?.status || 'offline'
  const statusConfig = {
    online: { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle, label: 'Operatiu' },
    offline: { color: 'text-red-600', bg: 'bg-red-100', icon: XCircle, label: 'Fora de línia' },
    degraded: { color: 'text-amber-600', bg: 'bg-amber-100', icon: AlertTriangle, label: 'Degradat' },
  }
  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${config.bg}`}>
          <Icon className={`h-5 w-5 ${config.color}`} strokeWidth={1.5} />
        </div>
        <div className="flex items-center gap-1">
          <StatusIcon className={`h-4 w-4 ${config.color}`} />
          <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
        </div>
      </div>
      <h3 className="font-medium text-slate-900">{label}</h3>
      <p className="text-sm text-slate-500 mt-1">{data?.message || 'Sense informació'}</p>
      {data?.latency ? (
        <p className="text-xs text-slate-400 mt-2">Latència: {data.latency}ms</p>
      ) : null}
    </div>
  )
}

function AlertRow({ label, count, href }: { label: string; count: number; href: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="flex items-center gap-3">
        <span className={`text-sm font-semibold ${count > 0 ? 'text-amber-600' : 'text-green-600'}`}>
          {count}
        </span>
        {count > 0 && (
          <a href={href} className="text-xs text-blue-600 hover:underline">Veure</a>
        )}
      </div>
    </div>
  )
}
