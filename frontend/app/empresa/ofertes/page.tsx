'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Tag,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  ArrowUpDown,
  LucideIcon
} from 'lucide-react'
import { getCategoriesAsOptions, getCategoryLabel, getCategoryColors } from '@/lib/constants/categories'

export default function OfertesEmpresaPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  return (
    <div className="space-y-6">
      {/* Header de pàgina */}
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
            <Tag className="h-6 w-6 text-slate-600" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Ofertes</h1>
            <p className="text-slate-500">Gestiona les ofertes i promocions de la teva empresa</p>
          </div>
        </div>

        <Link
          href="/empresa/ofertes/crear"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Nova oferta
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total ofertes" value="12" icon={Tag} />
        <StatCard title="Actives" value="5" icon={CheckCircle} color="green" />
        <StatCard title="Pendents" value="3" icon={Clock} color="amber" />
        <StatCard title="Visualitzacions" value="1,234" icon={Eye} change="+12%" />
      </div>

      {/* Filtres i cerca */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Cerca */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Cercar ofertes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Filtre estat */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="all">Tots els estats</option>
            <option value="active">Actives</option>
            <option value="pending">Pendents</option>
            <option value="draft">Esborranys</option>
            <option value="expired">Caducades</option>
          </select>

          {/* Filtre categoria */}
          <select
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="all">Totes les categories</option>
            {getCategoriesAsOptions().map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          {/* Botó filtres avançats */}
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            <Filter className="h-4 w-4" strokeWidth={1.5} />
            Filtres
          </button>
        </div>
      </div>

      {/* Taula d'ofertes */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <button className="flex items-center gap-1 hover:text-slate-700">
                  Oferta
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Categoria
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Estat
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Visualitzacions
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Validesa
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Accions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Fila exemple */}
            <OfertaRow
              id="1"
              title="20% en Assegurances de Llar"
              category="serveis"
              status="active"
              views={234}
              validUntil="31/12/2025"
            />
            <OfertaRow
              id="2"
              title="Assessoria fiscal gratuïta"
              category="serveis"
              status="pending"
              views={45}
              validUntil="15/01/2026"
            />
            <OfertaRow
              id="3"
              title="Pack empresarial especial"
              category="serveis"
              status="draft"
              views={0}
              validUntil="-"
            />
            {/* Més files... */}
          </tbody>
        </table>

        {/* Paginació */}
        <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Mostrant 1-10 de 12 ofertes
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50" disabled>
              Anterior
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">
              1
            </button>
            <button className="px-3 py-1 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">
              2
            </button>
            <button className="px-3 py-1 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">
              Següent
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Components auxiliars per Ofertes

interface OfertaRowProps {
  id: string
  title: string
  category: string
  status: 'active' | 'pending' | 'draft' | 'expired'
  views: number
  validUntil: string
}

const statusConfig = {
  active: { label: 'Activa', bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
  pending: { label: 'Pendent', bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
  draft: { label: 'Esborrany', bg: 'bg-slate-100', text: 'text-slate-700', icon: Edit },
  expired: { label: 'Caducada', bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
}

function OfertaRow({ id, title, category, status, views, validUntil }: OfertaRowProps) {
  const statusStyle = statusConfig[status]
  const StatusIcon = statusStyle.icon

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-4 py-3">
        <p className="font-medium text-slate-900">{title}</p>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColors(category).bg} ${getCategoryColors(category).text}`}
        >
          {getCategoryLabel(category)}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
          <StatusIcon className="h-3 w-3" />
          {statusStyle.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-slate-600">{views.toLocaleString()}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-slate-600">{validUntil}</span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <Eye className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <Edit className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </td>
    </tr>
  )
}

function StatCard({ title, value, icon: Icon, color = 'slate', change }: {
  title: string
  value: string
  icon: LucideIcon
  color?: 'slate' | 'green' | 'amber' | 'red'
  change?: string
}) {
  const colorStyles = {
    slate: 'bg-slate-100 text-slate-600',
    green: 'bg-green-100 text-green-600',
    amber: 'bg-amber-100 text-amber-600',
    red: 'bg-red-100 text-red-600',
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
          {change && (
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
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