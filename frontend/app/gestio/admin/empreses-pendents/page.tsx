'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Building2, Phone, Mail, Globe, User, Euro, Calendar,
  ChevronRight, Clock, RefreshCw, Search, ArrowLeft,
  Users, FileCheck, Shield, Eye, Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getLeadsPipeline, LeadPipeline, LeadPhase, PipelineStats } from '@/lib/admin/actions/empreses-pendents-actions'
import { toast } from 'sonner'
import Link from 'next/link'
import { LeadEditPanel } from '@/app/gestio/leads/components/LeadEditPanel'

// Configuració de pestanyes
const TABS = [
  { id: 'TOTS', label: 'Tots', icon: Building2 },
  { id: 'GESTOR', label: 'Gestor', icon: Users },
  { id: 'CRM', label: 'CRM', icon: FileCheck },
  { id: 'ADMIN', label: 'Admin', icon: Shield },
] as const

type TabId = typeof TABS[number]['id']

// Configuració de fases/stages
const STAGE_CONFIG: Record<string, { label: string; color: string; phase: LeadPhase }> = {
  ASSIGNAT: { label: 'Assignat', color: 'bg-blue-100 text-blue-700', phase: 'GESTOR' },
  TREBALLANT: { label: 'Treballant', color: 'bg-cyan-100 text-cyan-700', phase: 'GESTOR' },
  PER_VERIFICAR: { label: 'Per verificar', color: 'bg-amber-100 text-amber-700', phase: 'CRM' },
  VERIFICAT: { label: 'Verificat', color: 'bg-green-100 text-green-700', phase: 'CRM' },
  PRE_CONTRACTE: { label: 'Pre-contracte', color: 'bg-purple-100 text-purple-700', phase: 'ADMIN' },
  EN_REVISIO: { label: 'En revisió', color: 'bg-indigo-100 text-indigo-700', phase: 'ADMIN' },
}

const PHASE_CONFIG: Record<LeadPhase, { label: string; color: string; bgColor: string }> = {
  GESTOR: { label: 'Gestor', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  CRM: { label: 'CRM', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  ADMIN: { label: 'Admin', color: 'text-purple-600', bgColor: 'bg-purple-50' },
}

export default function EmpresesPendentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [leads, setLeads] = useState<LeadPipeline[]>([])
  const [stats, setStats] = useState<PipelineStats>({ total: 0, gestor: 0, crm: 0, admin: 0 })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabId>('TOTS')
  const [searchTerm, setSearchTerm] = useState('')

  // Estado para el panel lateral
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false)
  const [isLoadingLead, setIsLoadingLead] = useState(false)

  // Verificar permisos
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    const role = session.user?.role as string
    if (!['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO'].includes(role)) {
      router.push('/gestio')
      toast.error('No tens permisos per accedir a aquesta pàgina')
    }
  }, [session, status, router])

  // Carregar dades
  const loadData = async () => {
    setLoading(true)
    try {
      const phaseFilter = activeTab === 'TOTS' ? undefined : activeTab as LeadPhase
      const result = await getLeadsPipeline(phaseFilter)
      if (result.success) {
        setLeads(result.data || [])
        if (result.stats) setStats(result.stats)
      }
    } catch (error) {
      console.error('Error carregant dades:', error)
      toast.error('Error carregant dades')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) loadData()
  }, [session, activeTab])

  // Filtrar per cerca
  const filteredLeads = leads.filter(lead => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      lead.companyName.toLowerCase().includes(search) ||
      lead.cif?.toLowerCase().includes(search) ||
      lead.contactName?.toLowerCase().includes(search) ||
      lead.email?.toLowerCase().includes(search) ||
      lead.assignedTo?.name?.toLowerCase().includes(search)
    )
  })

  // Obrir lead al panel lateral
  const handleOpenLead = async (leadId: string) => {
    setIsLoadingLead(true)
    try {
      const res = await fetch(`/api/gestio/leads/${leadId}`)
      if (!res.ok) throw new Error('Error carregant lead')
      const leadData = await res.json()
      setSelectedLead(leadData)
      setIsEditPanelOpen(true)
    } catch (error) {
      console.error('Error carregant lead:', error)
      toast.error('Error carregant les dades del lead')
    } finally {
      setIsLoadingLead(false)
    }
  }

  // Tancar panel i refrescar dades
  const handleClosePanel = () => {
    setIsEditPanelOpen(false)
    setSelectedLead(null)
  }

  const handleLeadSaved = () => {
    loadData()
    handleClosePanel()
  }

  const formatDate = (date: Date | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('ca-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
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
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/gestio" className="flex items-center gap-1 hover:text-slate-700 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Tornar al Dashboard
        </Link>
        <span>/</span>
        <span className="text-slate-700">Pipeline de Leads</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Pipeline de Leads</h1>
          <p className="text-sm text-slate-500 mt-1">
            Leads actius en gestió des de l'assignació fins a la conversió en empresa
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

      {/* Pestanyes amb comptadors */}
      <div className="bg-white border border-slate-200 rounded-lg p-1 inline-flex gap-1">
        {TABS.map(tab => {
          const Icon = tab.icon
          const count = tab.id === 'TOTS' ? stats.total :
            tab.id === 'GESTOR' ? stats.gestor :
            tab.id === 'CRM' ? stats.crm : stats.admin
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.5} />
              {tab.label}
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs",
                isActive ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-600"
              )}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Barra de cerca */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Cercar per empresa, CIF, contacte, gestor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
        />
      </div>

      {/* Taula de leads */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Empresa</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Fase</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Estat</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Gestor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Data Assignació</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Dies</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Valor</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Acció</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                    <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p>{searchTerm ? 'No s\'han trobat leads' : 'No hi ha leads actius en aquesta fase'}</p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map(lead => {
                  const stageConfig = STAGE_CONFIG[lead.stage || ''] || { label: lead.stage, color: 'bg-slate-100 text-slate-700', phase: 'GESTOR' }
                  const phaseConfig = PHASE_CONFIG[lead.phase]
                  const daysColor = lead.daysInPipeline > 14 ? 'text-red-600 font-semibold' :
                    lead.daysInPipeline > 7 ? 'text-amber-600' : 'text-slate-600'

                  return (
                    <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-900">{lead.companyName}</p>
                          {lead.sector && <p className="text-xs text-slate-500">{lead.sector}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("px-2 py-1 rounded-full text-xs font-medium", phaseConfig.bgColor, phaseConfig.color)}>
                          {phaseConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("px-2 py-1 rounded-full text-xs font-medium", stageConfig.color)}>
                          {stageConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {lead.assignedTo ? (
                          <span className="text-sm text-slate-700">{lead.assignedTo.name || lead.assignedTo.email}</span>
                        ) : (
                          <span className="text-sm text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-600 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {formatDate(lead.assignedAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("text-sm flex items-center gap-1", daysColor)}>
                          <Clock className="h-3.5 w-3.5" />
                          {lead.daysInPipeline}d
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {lead.estimatedValue ? (
                          <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                            <Euro className="h-3.5 w-3.5" />
                            {lead.estimatedValue.toLocaleString('ca-ES')}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleOpenLead(lead.id)}
                          disabled={isLoadingLead}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isLoadingLead ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          Veure
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resum */}
      {filteredLeads.length > 0 && (
        <p className="text-sm text-slate-500 text-center">
          Mostrant {filteredLeads.length} leads actius
        </p>
      )}

      {/* Panel lateral per veure detalls del lead */}
      <LeadEditPanel
        lead={selectedLead}
        isOpen={isEditPanelOpen}
        onClose={handleClosePanel}
        onSaved={handleLeadSaved}
      />
    </div>
  )
}
