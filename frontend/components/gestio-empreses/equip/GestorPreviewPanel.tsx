'use client'

import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Target,
  TrendingUp,
  Euro,
  Building2,
  MessageSquare,
  CheckSquare
} from 'lucide-react'
import { format } from 'date-fns'
import { ca } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Lead {
  id: string
  companyName: string
  contactName: string | null
  status: string
  priority: string
  estimatedRevenue: number | null
}

interface PerformanceData {
  month: string
  won: number
  created: number
}

interface GestorDetail {
  id: string
  name: string | null
  email: string
  phone: string | null
  image: string | null
  userType: string
  createdAt: Date | string
  assignedLeads: Lead[]
  performanceHistory?: PerformanceData[]
}

interface GestorPreviewPanelProps {
  gestor: GestorDetail | null
  onClose: () => void
}

const roleLabels: Record<string, string> = {
  EMPLOYEE: 'Estàndard',
  ADMIN: 'Administrador',
  ACCOUNT_MANAGER: 'Account Manager',
}

const statusLabels: Record<string, string> = {
  NEW: 'Nou',
  CONTACTED: 'Contactat',
  QUALIFIED: 'Qualificat',
  NEGOTIATION: 'Negociant',
  WON: 'Guanyat',
  LOST: 'Perdut',
}

const priorityColors: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  LOW: 'bg-slate-100 text-slate-700',
}

export function GestorPreviewPanel({ gestor, onClose }: GestorPreviewPanelProps) {
  if (!gestor) {
    return (
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 text-center h-full flex flex-col items-center justify-center">
        <User className="h-12 w-12 text-slate-300 mb-4" strokeWidth={1.5} />
        <p className="text-slate-500">Selecciona un gestor per veure els detalls</p>
      </div>
    )
  }

  const formatCurrency = (value: number | null) => {
    if (!value) return '-'
    if (value >= 1000) return `${Math.round(value / 1000)}K €`
    return `${value} €`
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {gestor.image ? (
            <img
              src={gestor.image}
              alt={gestor.name || ''}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
              <User className="h-6 w-6 text-slate-400" strokeWidth={1.5} />
            </div>
          )}
          <div>
            <h2 className="font-semibold text-slate-900">{gestor.name || 'Sense nom'}</h2>
            <p className="text-sm text-slate-500">{roleLabels[gestor.userType] || gestor.userType}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-100"
        >
          <X className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
        </button>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Contact info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
            <span className="text-slate-600 truncate">{gestor.email}</span>
          </div>
          {gestor.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
              <span className="text-slate-600">{gestor.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
            <span className="text-slate-600">
              Des de {format(new Date(gestor.createdAt), 'MMM yyyy', { locale: ca })}
            </span>
          </div>
        </div>

        {/* Performance chart placeholder */}
        {gestor.performanceHistory && gestor.performanceHistory.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-slate-900 mb-3">
              Evolució (últims 6 mesos)
            </h3>
            <div className="h-32 bg-slate-50 rounded-lg flex items-center justify-center">
              <p className="text-sm text-slate-500">Gràfic d'evolució (recharts requerit)</p>
            </div>
          </div>
        )}

        {/* Recent leads */}
        <div>
          <h3 className="text-sm font-medium text-slate-900 mb-3">
            Leads recents ({gestor.assignedLeads?.length || 0})
          </h3>
          <div className="space-y-2">
            {!gestor.assignedLeads || gestor.assignedLeads.length === 0 ? (
              <p className="text-sm text-slate-400">Cap lead assignat</p>
            ) : (
              gestor.assignedLeads.slice(0, 5).map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{lead.companyName}</p>
                    <p className="text-xs text-slate-500">{lead.contactName || 'Sense contacte'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">
                      {formatCurrency(lead.estimatedRevenue)}
                    </span>
                    <span className={cn(
                      'px-2 py-0.5 text-xs font-medium rounded-full',
                      priorityColors[lead.priority] || 'bg-slate-100 text-slate-700'
                    )}>
                      {statusLabels[lead.status] || lead.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}