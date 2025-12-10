'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  User,
  Euro,
  Calendar,
  FileText,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  Send,
  CreditCard,
  UserPlus,
  RefreshCw,
  Search,
  Filter,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getLeadsPendentsRegistre,
  getLeadsPendentsStats,
  updateLeadAdminNotes,
  LeadPendentRegistre,
  LeadsPendentsStats
} from '@/lib/admin/actions/empreses-pendents-actions'
import { toast } from 'sonner'

// ============================================
// COMPONENT PRINCIPAL
// ============================================

export default function EmpresesPendentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [leads, setLeads] = useState<LeadPendentRegistre[]>([])
  const [stats, setStats] = useState<LeadsPendentsStats>({
    total: 0,
    perContactar: 0,
    contactats: 0,
    pagamentPendent: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<LeadPendentRegistre | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Verificar permisos
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    const role = session.user?.role as string
    if (!['SUPER_ADMIN', 'ADMIN'].includes(role)) {
      router.push('/dashboard')
      toast.error('No tens permisos per accedir a aquesta pàgina')
    }
  }, [session, status, router])

  // Carregar dades
  const loadData = async () => {
    setLoading(true)
    try {
      const [leadsResult, statsResult] = await Promise.all([
        getLeadsPendentsRegistre(),
        getLeadsPendentsStats()
      ])

      if (leadsResult.success && leadsResult.data) {
        setLeads(leadsResult.data)
      }
      if (statsResult.success && statsResult.data) {
        console.log('Stats carregades:', statsResult.data)
        setStats(statsResult.data)
      } else {
        console.log('Error carregant stats:', statsResult)
      }
    } catch (error) {
      console.error('Error carregant dades:', error)
      toast.error('Error carregant dades')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      loadData()
    }
  }, [session])

  // Filtrar leads
  const filteredLeads = leads.filter(lead => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      lead.companyName.toLowerCase().includes(search) ||
      lead.cif?.toLowerCase().includes(search) ||
      lead.contactName?.toLowerCase().includes(search) ||
      lead.email?.toLowerCase().includes(search)
    )
  })

  // Navegar a crear empresa amb dades pre-omplertes
  const handleCrearEmpresa = (lead: LeadPendentRegistre) => {
    // Passar l'ID del lead per pre-omplir el formulari
    router.push(`/admin/usuarios/crear/empresa?leadId=${lead.id}`)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Empreses Pendents de Registre
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Leads aprovats per CRM pendents de formalitzar contracte i registre
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <RefreshCw className="h-4 w-4" strokeWidth={1.5} />
          Actualitzar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total pendents"
            value={stats.total}
            icon={Building2}
            color="blue"
            subtitle="Leads aprovats per CRM"
          />
          <StatCard
            label="Per contactar"
            value={stats.perContactar}
            icon={Clock}
            color="amber"
            subtitle="Sense contacte encara"
          />
          <StatCard
            label="Contactats"
            value={stats.contactats}
            icon={Phone}
            color="purple"
            subtitle="Amb notes d'admin"
          />
          <StatCard
            label="Pagament pendent"
            value={stats.pagamentPendent}
            icon={CreditCard}
            color="green"
            subtitle="Llest per registrar"
          />
      </div>

      {/* Barra de cerca */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cercar per nom, CIF, contacte, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Contingut principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Llista de leads */}
        <div className="lg:col-span-2 space-y-3">
          {filteredLeads.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
              <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">
                {searchTerm
                  ? 'No s\'han trobat leads amb aquests criteris'
                  : 'No hi ha leads pendents de registre'
                }
              </p>
            </div>
          ) : (
            filteredLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                isSelected={selectedLead?.id === lead.id}
                onSelect={() => setSelectedLead(lead)}
                onCrearEmpresa={() => handleCrearEmpresa(lead)}
              />
            ))
          )}
        </div>

        {/* Panel de detalls */}
        <div className="lg:col-span-1">
          {selectedLead ? (
            <LeadDetailPanel
              lead={selectedLead}
              onCrearEmpresa={() => handleCrearEmpresa(selectedLead)}
              onNotesUpdate={(notes) => {
                updateLeadAdminNotes(selectedLead.id, notes)
                setSelectedLead({ ...selectedLead, internalNotes: notes })
              }}
            />
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg p-8 text-center sticky top-6">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">
                Selecciona un lead per veure els detalls
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================
// COMPONENTS AUXILIARS
// ============================================

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  subtitle
}: {
  label: string
  value: number
  icon: any
  color: 'blue' | 'amber' | 'purple' | 'green' | 'red'
  subtitle?: string
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600'
  }

  const valueColors = {
    blue: 'text-blue-600',
    amber: 'text-amber-600',
    purple: 'text-purple-600',
    green: 'text-green-600',
    red: 'text-red-600'
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className={cn('text-2xl font-semibold mt-1', valueColors[color])}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={cn('p-2 rounded-lg', colorClasses[color])}>
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  )
}

function LeadCard({
  lead,
  isSelected,
  onSelect,
  onCrearEmpresa
}: {
  lead: LeadPendentRegistre
  isSelected: boolean
  onSelect: () => void
  onCrearEmpresa: () => void
}) {
  const priorityColors = {
    HIGH: 'bg-red-100 text-red-700',
    MEDIUM: 'bg-amber-100 text-amber-700',
    LOW: 'bg-green-100 text-green-700'
  }

  return (
    <div
      onClick={onSelect}
      className={cn(
        'bg-white border rounded-lg p-4 cursor-pointer transition-all',
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-100'
          : 'border-slate-200 hover:border-slate-300'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-slate-900 truncate">
              {lead.companyName}
            </h3>
            <span className={cn(
              'px-2 py-0.5 text-xs font-medium rounded-full',
              priorityColors[lead.priority as keyof typeof priorityColors] || priorityColors.MEDIUM
            )}>
              {lead.priority}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-500">
            {lead.cif && (
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {lead.cif}
              </span>
            )}
            {lead.sector && (
              <span>{lead.sector}</span>
            )}
            {lead.estimatedValue && (
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <Euro className="h-3.5 w-3.5" />
                {lead.estimatedValue.toLocaleString('ca-ES')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
            {lead.contactName && (
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {lead.contactName}
              </span>
            )}
            {lead.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {lead.email}
              </span>
            )}
          </div>

          {lead.assignedTo && (
            <p className="text-xs text-slate-400 mt-2">
              Gestor: {lead.assignedTo.name || lead.assignedTo.email}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onCrearEmpresa()
            }}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="h-4 w-4" strokeWidth={1.5} />
            Registrar
          </button>
          <ChevronRight className="h-5 w-5 text-slate-400" />
        </div>
      </div>
    </div>
  )
}

function LeadDetailPanel({
  lead,
  onCrearEmpresa,
  onNotesUpdate
}: {
  lead: LeadPendentRegistre
  onCrearEmpresa: () => void
  onNotesUpdate: (notes: string) => void
}) {
  const [notes, setNotes] = useState(lead.internalNotes || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setNotes(lead.internalNotes || '')
  }, [lead.id])

  const handleSaveNotes = async () => {
    setSaving(true)
    await onNotesUpdate(notes)
    setSaving(false)
    toast.success('Notes guardades')
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 sticky top-6 space-y-5">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{lead.companyName}</h3>
        {lead.cif && (
          <p className="text-sm text-slate-500">CIF: {lead.cif}</p>
        )}
      </div>

      {/* Dades de contacte */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-slate-700">Dades de contacte</h4>

        {lead.contactName && (
          <div className="flex items-center gap-3 text-sm">
            <User className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
            <div>
              <p className="text-slate-900">{lead.contactName}</p>
              {lead.contactRole && (
                <p className="text-slate-500 text-xs">{lead.contactRole}</p>
              )}
            </div>
          </div>
        )}

        {lead.phone && (
          <a
            href={`tel:${lead.phone}`}
            className="flex items-center gap-3 text-sm text-blue-600 hover:text-blue-700"
          >
            <Phone className="h-4 w-4" strokeWidth={1.5} />
            {lead.phone}
          </a>
        )}

        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            className="flex items-center gap-3 text-sm text-blue-600 hover:text-blue-700"
          >
            <Mail className="h-4 w-4" strokeWidth={1.5} />
            {lead.email}
          </a>
        )}

        {lead.website && (
          <a
            href={lead.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm text-blue-600 hover:text-blue-700"
          >
            <Globe className="h-4 w-4" strokeWidth={1.5} />
            {lead.website}
            <ExternalLink className="h-3 w-3" />
          </a>
        )}

        {(lead.address || lead.city) && (
          <div className="flex items-start gap-3 text-sm">
            <MapPin className="h-4 w-4 text-slate-400 mt-0.5" strokeWidth={1.5} />
            <p className="text-slate-600">
              {[lead.address, lead.city].filter(Boolean).join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Valor estimat */}
      {lead.estimatedValue && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-700">Valor estimat</p>
          <p className="text-xl font-semibold text-green-800">
            {lead.estimatedValue.toLocaleString('ca-ES')} €
          </p>
        </div>
      )}

      {/* Notes del CRM */}
      {lead.notes && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-700">Notes CRM</h4>
          <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
            {lead.notes}
          </p>
        </div>
      )}

      {/* Notes internes Admin */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-slate-700">Notes internes (Admin)</h4>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Afegeix notes sobre el contacte, pagament, etc."
          rows={3}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <button
          onClick={handleSaveNotes}
          disabled={saving}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
        >
          {saving ? 'Desant...' : 'Desar notes'}
        </button>
      </div>

      {/* Data */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Calendar className="h-3.5 w-3.5" />
        Creat: {new Date(lead.createdAt).toLocaleDateString('ca-ES')}
      </div>

      {/* Botó principal */}
      <button
        onClick={onCrearEmpresa}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        <UserPlus className="h-5 w-5" strokeWidth={1.5} />
        Crear Usuari i Empresa
      </button>

      <p className="text-xs text-slate-500 text-center">
        Les dades del lead s'ompliran automàticament al formulari
      </p>
    </div>
  )
}