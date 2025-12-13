'use client'

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
  Bell
} from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header de pàgina */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
          <LayoutDashboard className="h-6 w-6 text-slate-600" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Panell d'Administració</h1>
          <p className="text-slate-500">Gestió del sistema i usuaris de La Pública</p>
        </div>
      </div>

      {/* Alertes del sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AlertCard
          type="info"
          title="Sistema actualitzat"
          description="L'última actualització (v2.4.0) es va completar correctament."
          actionLabel="Veure logs"
          actionHref="/admin/logs"
        />
        <AlertCard
          type="success"
          title="Còpia de seguretat"
          description="El backup diari s'ha realitzat sense incidències."
          actionLabel="Detalls"
          actionHref="/admin/configuracio"
        />
      </div>

      {/* Stats principals - Sistema i Usuaris */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Usuaris totals"
          value="12,458"
          change="+234 aquest mes"
          changeType="positive"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Càrrega del servidor"
          value="12%"
          change="Estable"
          changeType="positive"
          icon={Server}
          color="slate"
        />
        <StatCard
          title="Incidències obertes"
          value="0"
          change="Tot correcte"
          changeType="positive"
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Emmagatzematge"
          value="45%"
          change="1.2TB lliures"
          changeType="positive"
          icon={Database}
          color="purple"
        />
      </div>

      {/* Contingut principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Columna 1: Logs del sistema */}
        <div className="bg-white border border-slate-200 rounded-xl lg:col-span-2">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Registre d'activitat del sistema</h2>
            <Link href="/admin/logs" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Veure tot <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="p-4 space-y-4">
            <ActivityItem
              icon={UserPlus}
              iconColor="green"
              text="Nou usuari registrat: maria.garcia@gmail.com"
              time="Fa 5 minuts"
            />
            <ActivityItem
              icon={Shield}
              iconColor="blue"
              text="Inici de sessió admin (Super Admin)"
              time="Fa 15 minuts"
            />
            <ActivityItem
              icon={Settings}
              iconColor="slate"
              text="Canvi de configuració: SMTP Server"
              time="Fa 2 hores"
            />
            <ActivityItem
              icon={Bell}
              iconColor="amber"
              text="Notificació enviada: Butlletí setmanal"
              time="Fa 4 hores"
            />
            <ActivityItem
              icon={Database}
              iconColor="purple"
              text="Backup automàtic completat"
              time="Fa 6 hores"
            />
          </div>
        </div>

        {/* Columna 2: Accions i Estat */}
        <div className="space-y-6">
          {/* Accions ràpides */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h2 className="font-semibold text-slate-900 mb-4">Accions ràpides</h2>
            <div className="space-y-2">
              <QuickAction
                href="/admin/usuaris/crear"
                icon={UserPlus}
                label="Crear usuari"
                description="Afegir nou usuari manualment"
                color="blue"
              />
              <QuickAction
                href="/admin/logs"
                icon={Activity}
                label="Veure logs d'error"
                description="Revisar incidències"
                color="slate"
              />
              <QuickAction
                href="/admin/rols"
                icon={Shield}
                label="Gestió de Permisos"
                description="Editar rols d'accés"
                color="purple"
              />
            </div>
          </div>

          {/* Resum del sistema */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h2 className="font-semibold text-slate-900 mb-4">Estat dels serveis</h2>
            <div className="space-y-3">
              <SystemStatus label="Base de dades" status="online" />
              <SystemStatus label="Servidor de fitxers" status="online" />
              <SystemStatus label="Redis Cache" status="online" />
              <SystemStatus label="Servei de Correu" status="online" />
              <SystemStatus label="Passarel·la de Pagaments" status="online" />
            </div>
          </div>
        </div>
      </div>

      {/* Gràfic d'usuaris */}
      <div className="grid grid-cols-1">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Nous usuaris (últims 7 dies)</h2>
          <div className="h-48 flex items-end justify-between gap-2">
            <ChartBar label="Dl" value={45} max={100} />
            <ChartBar label="Dm" value={62} max={100} />
            <ChartBar label="Dc" value={38} max={100} />
            <ChartBar label="Dj" value={85} max={100} />
            <ChartBar label="Dv" value={72} max={100} />
            <ChartBar label="Ds" value={28} max={100} />
            <ChartBar label="Dg" value={15} max={100} />
          </div>
        </div>
      </div>
    </div>
  )
}

// Components auxiliars

// StatCard
interface StatCardProps {
  title: string
  value: string
  change?: string
  changeType?: 'positive' | 'negative'
  icon: LucideIcon
  color?: 'slate' | 'green' | 'amber' | 'red' | 'blue' | 'purple'
}

const colorStyles = {
  slate: 'bg-slate-100 text-slate-600',
  green: 'bg-green-100 text-green-600',
  amber: 'bg-amber-100 text-amber-600',
  red: 'bg-red-100 text-red-600',
  blue: 'bg-blue-100 text-blue-600',
  purple: 'bg-purple-100 text-purple-600',
}

function StatCard({ title, value, change, changeType, icon: Icon, color = 'slate' }: StatCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
          {change && (
            <p className={`text-xs mt-1 flex items-center gap-1 ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
              {change}
            </p>
          )}
        </div>
        <div className={`p-2 rounded-lg ${colorStyles[color]}`}>
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  )
}

// AlertCard
interface AlertCardProps {
  type: 'warning' | 'info' | 'error' | 'success'
  title: string
  description: string
  actionLabel: string
  actionHref: string
}

const alertStyles = {
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertTriangle, iconColor: 'text-amber-600', titleColor: 'text-amber-800', textColor: 'text-amber-700' },
  info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: CheckCircle, iconColor: 'text-blue-600', titleColor: 'text-blue-800', textColor: 'text-blue-700' },
  error: { bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle, iconColor: 'text-red-600', titleColor: 'text-red-800', textColor: 'text-red-700' },
  success: { bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle, iconColor: 'text-green-600', titleColor: 'text-green-800', textColor: 'text-green-700' },
}

function AlertCard({ type, title, description, actionLabel, actionHref }: AlertCardProps) {
  const style = alertStyles[type]
  const Icon = style.icon

  return (
    <div className={`${style.bg} ${style.border} border rounded-xl p-4 flex items-start gap-3`}>
      <Icon className={`h-5 w-5 ${style.iconColor} mt-0.5`} strokeWidth={1.5} />
      <div className="flex-1">
        <p className={`font-medium ${style.titleColor}`}>{title}</p>
        <p className={`text-sm ${style.textColor}`}>{description}</p>
      </div>
      <Link
        href={actionHref}
        className={`text-sm font-medium ${style.iconColor} hover:underline`}
      >
        {actionLabel}
      </Link>
    </div>
  )
}

// ActivityItem
const iconColorStyles = {
  green: 'bg-green-100 text-green-600',
  blue: 'bg-blue-100 text-blue-600',
  purple: 'bg-purple-100 text-purple-600',
  orange: 'bg-orange-100 text-orange-600',
  amber: 'bg-amber-100 text-amber-600',
  red: 'bg-red-100 text-red-600',
  slate: 'bg-slate-100 text-slate-600',
}

function ActivityItem({ icon: Icon, iconColor, text, time }: {
  icon: LucideIcon
  iconColor: keyof typeof iconColorStyles
  text: string
  time: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`p-1.5 rounded-lg ${iconColorStyles[iconColor]}`}>
        <Icon className="h-4 w-4" strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700 truncate">{text}</p>
        <p className="text-xs text-slate-400">{time}</p>
      </div>
    </div>
  )
}

// QuickAction
function QuickAction({ href, icon: Icon, label, description, color }: {
  href: string
  icon: LucideIcon
  label: string
  description: string
  color: 'blue' | 'green' | 'amber' | 'purple' | 'slate'
}) {
  const bgStyles = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    amber: 'bg-amber-600 hover:bg-amber-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    slate: 'bg-slate-600 hover:bg-slate-700',
  }

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 p-3 rounded-lg text-white ${bgStyles[color]} transition-colors`}
    >
      <Icon className="h-5 w-5" strokeWidth={1.5} />
      <div>
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs opacity-80">{description}</p>
      </div>
    </Link>
  )
}

// SystemStatus
function SystemStatus({ label, status }: { label: string; status: 'online' | 'offline' | 'warning' }) {
  const statusStyles = {
    online: { dot: 'bg-green-500', text: 'text-green-700', label: 'Operatiu' },
    offline: { dot: 'bg-red-500', text: 'text-red-700', label: 'Fora de línia' },
    warning: { dot: 'bg-amber-500', text: 'text-amber-700', label: 'Alerta' },
  }
  const style = statusStyles[status]

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${style.dot}`} />
        <span className={`text-xs font-medium ${style.text}`}>{style.label}</span>
      </div>
    </div>
  )
}

// ChartBar (simple)
function ChartBar({ label, value, max }: { label: string; value: number; max: number }) {
  const height = (value / max) * 100

  return (
    <div className="flex-1 flex flex-col items-center gap-2">
      <div className="w-full h-32 bg-slate-100 rounded-lg relative overflow-hidden">
        <div
          className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-lg transition-all"
          style={{ height: `${height}%` }}
        />
      </div>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  )
}