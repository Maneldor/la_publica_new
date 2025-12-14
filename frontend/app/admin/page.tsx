'use client'

import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  UserPlus,
  Activity,
  LucideIcon,
  Server,
  Database,
  Shield,
  Settings,
  Bell,
  Building2,
  Tag
} from 'lucide-react'
import Link from 'next/link'

interface DashboardMetrics {
  users: { total: number; active: number; newToday: number; growth: number; growthPercent: number }
  companies: { total: number; active: number; pending: number; approved: number }
  offers: { total: number; published: number; pending: number }
  coupons: { total: number; active: number; used: number }
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch('/api/admin/dashboard')
        const data = await res.json()
        if (data.success) {
          setMetrics(data.metrics)
        } else {
          setError(data.error || 'Error carregant dades')
        }
      } catch (err) {
        setError('Error de connexió')
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [])

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
          <LayoutDashboard className="h-6 w-6 text-slate-600" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Panell d Administració</h1>
          <p className="text-slate-500">Gestió del sistema i usuaris de La Pública</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Usuaris totals"
          value={metrics?.users.total.toString() || '0'}
          change={`+${metrics?.users.growth || 0} últims 7 dies`}
          changeType="positive"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Empreses"
          value={metrics?.companies.total.toString() || '0'}
          change={`${metrics?.companies.pending || 0} pendents`}
          changeType={metrics?.companies.pending ? 'negative' : 'positive'}
          icon={Building2}
          color="green"
        />
        <StatCard
          title="Ofertes publicades"
          value={metrics?.offers.published.toString() || '0'}
          change={`${metrics?.offers.total || 0} totals`}
          changeType="positive"
          icon={Tag}
          color="purple"
        />
        <StatCard
          title="Cupons actius"
          value={metrics?.coupons.active.toString() || '0'}
          change={`${metrics?.coupons.used || 0} utilitzats`}
          changeType="positive"
          icon={CheckCircle}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl lg:col-span-2">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Resum del sistema</h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Usuaris actius</span>
              <span className="font-semibold">{metrics?.users.active || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Nous avui</span>
              <span className="font-semibold text-green-600">+{metrics?.users.newToday || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Empreses actives</span>
              <span className="font-semibold">{metrics?.companies.active || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-600">Ofertes pendents revisió</span>
              <span className="font-semibold text-amber-600">{metrics?.offers.pending || 0}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h2 className="font-semibold text-slate-900 mb-4">Accions ràpides</h2>
            <div className="space-y-2">
              <QuickAction href="/admin/usuaris/crear" icon={UserPlus} label="Crear usuari" description="Afegir nou usuari" color="blue" />
              <QuickAction href="/admin/empreses-pendents" icon={Building2} label="Empreses pendents" description="Revisar sol·licituds" color="green" />
              <QuickAction href="/admin/rols" icon={Shield} label="Gestió de Permisos" description="Editar rols" color="purple" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h2 className="font-semibold text-slate-900 mb-4">Estat dels serveis</h2>
            <div className="space-y-3">
              <SystemStatus label="Base de dades" status="online" />
              <SystemStatus label="Redis Cache" status="online" />
              <SystemStatus label="Servei de Correu" status="online" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string; value: string; change?: string; changeType?: 'positive' | 'negative'; icon: LucideIcon; color?: 'slate' | 'green' | 'amber' | 'red' | 'blue' | 'purple'
}

const colorStyles = { slate: 'bg-slate-100 text-slate-600', green: 'bg-green-100 text-green-600', amber: 'bg-amber-100 text-amber-600', red: 'bg-red-100 text-red-600', blue: 'bg-blue-100 text-blue-600', purple: 'bg-purple-100 text-purple-600' }

function StatCard({ title, value, change, changeType, icon: Icon, color = 'slate' }: StatCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
          {change && <p className={`text-xs mt-1 ${changeType === 'positive' ? 'text-green-600' : 'text-amber-600'}`}>{change}</p>}
        </div>
        <div className={`p-2 rounded-lg ${colorStyles[color]}`}><Icon className="h-5 w-5" strokeWidth={1.5} /></div>
      </div>
    </div>
  )
}

function QuickAction({ href, icon: Icon, label, description, color }: { href: string; icon: LucideIcon; label: string; description: string; color: 'blue' | 'green' | 'purple' }) {
  const bgStyles = { blue: 'bg-blue-600 hover:bg-blue-700', green: 'bg-green-600 hover:bg-green-700', purple: 'bg-purple-600 hover:bg-purple-700' }
  return (
    <Link href={href} className={`flex items-center gap-3 p-3 rounded-lg text-white ${bgStyles[color]} transition-colors`}>
      <Icon className="h-5 w-5" strokeWidth={1.5} />
      <div><p className="font-medium text-sm">{label}</p><p className="text-xs opacity-80">{description}</p></div>
    </Link>
  )
}

function SystemStatus({ label, status }: { label: string; status: 'online' | 'offline' }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className={`text-xs font-medium ${status === 'online' ? 'text-green-700' : 'text-red-700'}`}>{status === 'online' ? 'Operatiu' : 'Fora de línia'}</span>
      </div>
    </div>
  )
}
