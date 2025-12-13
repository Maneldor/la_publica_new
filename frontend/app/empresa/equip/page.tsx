'use client'

import { useState } from 'react'
import {
  Users,
  Plus,
  Search,
  Mail,
  MoreHorizontal,
  Shield,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  UserPlus,
  LucideIcon
} from 'lucide-react'

export default function EquipEmpresaPage() {
  return (
    <div className="space-y-6">
      {/* Header de pàgina */}
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
            <Users className="h-6 w-6 text-slate-600" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Equip</h1>
            <p className="text-slate-500">Gestiona els membres de l'equip i els seus permisos</p>
          </div>
        </div>
        <button
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="h-4 w-4" strokeWidth={1.5} />
          Convidar membre
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total membres" value="3" icon={Users} />
        <StatCard title="Administradors" value="1" icon={Shield} color="amber" />
        <StatCard title="Invitacions pendents" value="2" icon={Clock} color="blue" />
      </div>

      {/* Cerca */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Cercar membres..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Llista de membres */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Membres actius</h2>
        </div>
        <div className="divide-y divide-slate-100">
          <MemberRow
            name="Joan Pérez"
            email="joan.perez@mapfre.cat"
            role="admin"
            status="active"
            avatar="JP"
          />
          <MemberRow
            name="Maria Garcia"
            email="maria.garcia@mapfre.cat"
            role="editor"
            status="active"
            avatar="MG"
          />
          <MemberRow
            name="Pere López"
            email="pere.lopez@mapfre.cat"
            role="viewer"
            status="active"
            avatar="PL"
          />
        </div>
      </div>

      {/* Invitacions pendents */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Invitacions pendents</h2>
        </div>
        <div className="divide-y divide-slate-100">
          <InvitationRow
            email="anna.martinez@mapfre.cat"
            role="editor"
            sentAt="Fa 2 dies"
          />
          <InvitationRow
            email="carles.font@mapfre.cat"
            role="viewer"
            sentAt="Fa 5 dies"
          />
        </div>
      </div>
    </div>
  )
}

// Components auxiliars per Equip

// StatCard (Simplificat)
function StatCard({ title, value, icon: Icon, color = 'slate' }: {
  title: string
  value: string
  icon: LucideIcon
  color?: 'slate' | 'green' | 'amber' | 'blue'
}) {
  const colorStyles = {
    slate: 'bg-slate-100 text-slate-600',
    green: 'bg-green-100 text-green-600',
    amber: 'bg-amber-100 text-amber-600',
    blue: 'bg-blue-100 text-blue-600',
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${colorStyles[color]}`}>
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  )
}

interface MemberRowProps {
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  status: 'active' | 'inactive'
  avatar: string
}

const roleConfig = {
  admin: { label: 'Administrador', bg: 'bg-purple-100', text: 'text-purple-700' },
  editor: { label: 'Editor', bg: 'bg-blue-100', text: 'text-blue-700' },
  viewer: { label: 'Lector', bg: 'bg-slate-100', text: 'text-slate-700' },
}

function MemberRow({ name, email, role, status, avatar }: MemberRowProps) {
  const roleStyle = roleConfig[role]

  return (
    <div className="px-4 py-3 flex items-center justify-between hover:bg-slate-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
          {avatar}
        </div>
        <div>
          <p className="font-medium text-slate-900">{name}</p>
          <p className="text-sm text-slate-500">{email}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleStyle.bg} ${roleStyle.text}`}>
          {roleStyle.label}
        </span>
        <div className="flex items-center gap-1">
          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <Edit className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  )
}

function InvitationRow({ email, role, sentAt }: { email: string; role: 'admin' | 'editor' | 'viewer'; sentAt: string }) {
  const roleStyle = roleConfig[role]

  return (
    <div className="px-4 py-3 flex items-center justify-between hover:bg-slate-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
          <Mail className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
        </div>
        <div>
          <p className="font-medium text-slate-900">{email}</p>
          <p className="text-sm text-slate-500">Enviat {sentAt}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleStyle.bg} ${roleStyle.text}`}>
          {roleStyle.label}
        </span>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            Reenviar
          </button>
          <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            Cancel·lar
          </button>
        </div>
      </div>
    </div>
  )
}