'use client'

import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Users, CheckCircle, UserPlus, LucideIcon,
  Building2, Tag, Shield
} from 'lucide-react'
import Link from 'next/link'

interface DashboardMetrics {
  users: { total: number; active: number; newToday: number; growth: number }
  companies: { total: number; active: number; pending: number }
  offers: { total: number; published: number; pending: number }
  coupons: { total: number; active: number; used: number }
}

interface ChartData { day: string; date: string; count: number }
interface ActivityData { id: string; type: string; description: string; timestamp: string; icon: string }

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [activityData, setActivityData] = useState<ActivityData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [metricsRes, chartRes, activityRes] = await Promise.all([
          fetch('/api/admin/dashboard'),
          fetch('/api/admin/dashboard/users-chart'),
          fetch('/api/admin/dashboard/activity')
        ])
        
        const metricsData = await metricsRes.json()
        const chartDataRes = await chartRes.json()
        const activityDataRes = await activityRes.json()
        
        if (metricsData.success) setMetrics(metricsData.metrics)
        if (chartDataRes.success) setChartData(chartDataRes.data)
        if (activityDataRes.success) setActivityData(activityDataRes.data)
      } catch (err) {
        console.error('Error loading dashboard:', err)
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
            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>)}
          </div>
        </div>
      </div>
    )
  }

  const maxChartValue = Math.max(...chartData.map(d => d.count), 1)

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
        <StatCard title="Usuaris totals" value={metrics?.users.total.toString() || '0'} change={`+${metrics?.users.growth || 0} últims 7 dies`} changeType="positive" icon={Users} color="blue" />
        <StatCard title="Empreses" value={metrics?.companies.total.toString() || '0'} change={`${metrics?.companies.pending || 0} pendents`} changeType={metrics?.companies.pending ? 'negative' : 'positive'} icon={Building2} color="green" />
        <StatCard title="Ofertes publicades" value={metrics?.offers.published.toString() || '0'} change={`${metrics?.offers.total || 0} totals`} changeType="positive" icon={Tag} color="purple" />
        <StatCard title="Cupons actius" value={metrics?.coupons.active.toString() || '0'} change={`${metrics?.coupons.used || 0} utilitzats`} changeType="positive" icon={CheckCircle} color="amber" />
      </div>

      {/* Gráfico de usuarios */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Nous usuaris (últims 7 dies)</h2>
        <div className="h-48 flex items-end justify-between gap-2">
          {chartData.map(item => (
            <div key={item.date} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full h-32 bg-slate-100 rounded-lg relative overflow-hidden group">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-lg transition-all hover:bg-blue-600"
                  style={{ height: `${(item.count / maxChartValue) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-slate-800 text-white text-xs px-2 py-1 rounded">{item.count}</span>
                </div>
              </div>
              <span className="text-xs text-slate-500">{item.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actividad reciente */}
        <div className="bg-white border border-slate-200 rounded-xl lg:col-span-2">
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Activitat recent</h2>
          </div>
          <div className="p-4 space-y-4">
            {activityData.length === 0 ? (
              <p className="text-slate-500 text-sm">No hi ha activitat recent</p>
            ) : (
              activityData.map(item => (
                <ActivityItem key={item.id} type={item.type} text={item.description} time={formatTimeAgo(item.timestamp)} />
              ))
            )}
          </div>
        </div>

        {/* Acciones rápidas */}
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

function formatTimeAgo(timestamp: string): string {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
  if (seconds < 60) return 'Ara mateix'
  if (seconds < 3600) return `Fa ${Math.floor(seconds / 60)} minuts`
  if (seconds < 86400) return `Fa ${Math.floor(seconds / 3600)} hores`
  return `Fa ${Math.floor(seconds / 86400)} dies`
}

const iconColors = { USER_CREATED: 'bg-green-100 text-green-600', COMPANY_CREATED: 'bg-blue-100 text-blue-600', OFFER_CREATED: 'bg-purple-100 text-purple-600' }

function ActivityItem({ type, text, time }: { type: string; text: string; time: string }) {
  const Icon = type === 'USER_CREATED' ? UserPlus : type === 'COMPANY_CREATED' ? Building2 : Tag
  const colorClass = iconColors[type as keyof typeof iconColors] || 'bg-slate-100 text-slate-600'
  return (
    <div className="flex items-start gap-3">
      <div className={`p-1.5 rounded-lg ${colorClass}`}><Icon className="h-4 w-4" strokeWidth={1.5} /></div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700 truncate">{text}</p>
        <p className="text-xs text-slate-400">{time}</p>
      </div>
    </div>
  )
}

interface StatCardProps { title: string; value: string; change?: string; changeType?: 'positive' | 'negative'; icon: LucideIcon; color?: 'slate' | 'green' | 'amber' | 'blue' | 'purple' }
const colorStyles = { slate: 'bg-slate-100 text-slate-600', green: 'bg-green-100 text-green-600', amber: 'bg-amber-100 text-amber-600', blue: 'bg-blue-100 text-blue-600', purple: 'bg-purple-100 text-purple-600' }

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
