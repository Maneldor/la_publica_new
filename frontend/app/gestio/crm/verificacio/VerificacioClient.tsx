'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, RefreshCw, Download, Building2, Users, Check, X, Clock, Eye } from 'lucide-react'
import { VerificationStats } from '@/components/gestio-empreses/crm/VerificationStats'
import { VerificationCard } from '@/components/gestio-empreses/crm/VerificationCard'
import { LeadPreviewPanel } from '@/components/gestio-empreses/crm/LeadPreviewPanel'
import { BulkVerificationBar } from '@/components/gestio-empreses/crm/BulkVerificationBar'
import {
    getVerificationStats,
    getPendingVerificationLeads,
    getPendingVerificationCompanies,
    getCompanyVerificationStats,
    getLeadPreview,
    approveAndPublishCompany,
    rejectCompanyVerification
} from '@/lib/gestio-empreses/verification-actions'
import { toast } from 'sonner'

interface VerificacioClientProps {
    initialStats: any
    initialLeads: any[]
    initialCompanies: any[]
    initialCompanyStats: any
    currentUserId: string
}

export function VerificacioClient({
    initialStats,
    initialLeads,
    initialCompanies,
    initialCompanyStats,
    currentUserId
}: VerificacioClientProps) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'leads' | 'empreses'>('empreses')
    const [stats, setStats] = useState<any>(initialStats)
    const [leads, setLeads] = useState<any[]>(initialLeads)
    const [companies, setCompanies] = useState<any[]>(initialCompanies)
    const [companyStats, setCompanyStats] = useState<any>(initialCompanyStats)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [activeLead, setActiveLead] = useState<any>(null)
    const [activeCompany, setActiveCompany] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [rejectModal, setRejectModal] = useState<{ open: boolean; companyId: string | null }>({ open: false, companyId: null })
    const [rejectReason, setRejectReason] = useState('')

    const loadData = async () => {
        setIsLoading(true)
        try {
            const [statsData, leadsData, companiesData, companyStatsData] = await Promise.all([
                getVerificationStats(),
                getPendingVerificationLeads(),
                getPendingVerificationCompanies(),
                getCompanyVerificationStats(),
            ])
            setStats(statsData)
            setLeads(leadsData)
            setCompanies(companiesData)
            setCompanyStats(companyStatsData)
            router.refresh()
        } catch (error) {
            console.error('Error carregant dades:', error)
        }
        setIsLoading(false)
    }

    const handleSelectLead = (leadId: string) => {
        if (selectedIds.includes(leadId)) {
            setSelectedIds(selectedIds.filter((id) => id !== leadId))
        } else {
            setSelectedIds([...selectedIds, leadId])
        }
    }

    const handleSelectAll = () => {
        if (selectedIds.length === leads.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(leads.map((l) => l.id))
        }
    }

    const handleLeadClick = async (lead: any) => {
        const fullLead = await getLeadPreview(lead.id)
        setActiveLead(fullLead)
    }

    const handleSuccess = () => {
        loadData()
        setActiveLead(null)
        setActiveCompany(null)
        setSelectedIds([])
    }

    const handleApproveCompany = async (companyId: string) => {
        setActionLoading(companyId)
        try {
            await approveAndPublishCompany(companyId)
            toast.success('Empresa publicada correctament!')
            handleSuccess()
        } catch (error) {
            toast.error('Error publicant l\'empresa')
        }
        setActionLoading(null)
    }

    const handleRejectCompany = async () => {
        if (!rejectModal.companyId || !rejectReason.trim()) {
            toast.error('Has d\'indicar el motiu del rebuig')
            return
        }
        setActionLoading(rejectModal.companyId)
        try {
            await rejectCompanyVerification(rejectModal.companyId, currentUserId, rejectReason)
            toast.success('Empresa retornada al gestor per revisió')
            setRejectModal({ open: false, companyId: null })
            setRejectReason('')
            handleSuccess()
        } catch (error) {
            toast.error('Error retornant l\'empresa')
        }
        setActionLoading(null)
    }

    const defaultStats = {
        pending: 0,
        approvedToday: 0,
        rejectedToday: 0,
        approvedWeek: 0,
        avgWaitTime: 0,
        slaCompliance: 100,
        outsideSLA: 0,
    }

    const totalPending = (stats?.pending || 0) + (companyStats?.pending || 0)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="h-7 w-7 text-slate-600" strokeWidth={1.5} />
                    <div>
                        <h1 className="text-xl font-semibold text-slate-900">Verificació CRM</h1>
                        <p className="text-sm text-slate-500">
                            Revisa i aprova leads i empreses pendents de verificació
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={loadData}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
                        Actualitzar
                    </button>
                    <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
                        <Download className="h-4 w-4" strokeWidth={1.5} />
                        Exportar
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('empreses')}
                    className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                        activeTab === 'empreses'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <Building2 className="h-4 w-4" />
                    Empreses
                    {companyStats?.pending > 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                            {companyStats.pending}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('leads')}
                    className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                        activeTab === 'leads'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <Users className="h-4 w-4" />
                    Leads
                    {stats?.pending > 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                            {stats.pending}
                        </span>
                    )}
                </button>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'leads' ? (
                <>
                    {/* Stats */}
                    <VerificationStats stats={stats || defaultStats} />

                    {/* Select all */}
                    {leads.length > 0 && (
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleSelectAll}
                                className="text-sm text-blue-600 hover:text-blue-700"
                            >
                                {selectedIds.length === leads.length ? 'Deseleccionar tot' : 'Seleccionar tot'}
                            </button>
                            {selectedIds.length > 0 && (
                                <span className="text-sm text-slate-500">
                                    {selectedIds.length} de {leads.length} seleccionats
                                </span>
                            )}
                        </div>
                    )}

                    {/* Main content - List + Preview */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        {/* Lead list */}
                        <div className="lg:col-span-3 space-y-3">
                            {leads.length === 0 ? (
                                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                                    <ShieldCheck className="h-12 w-12 text-green-500 mx-auto mb-4" strokeWidth={1.5} />
                                    <h3 className="text-lg font-medium text-slate-900 mb-2">
                                        Tot verificat!
                                    </h3>
                                    <p className="text-slate-500">
                                        No hi ha leads pendents de verificació.
                                    </p>
                                </div>
                            ) : (
                                leads.map((lead) => (
                                    <VerificationCard
                                        key={lead.id}
                                        lead={lead}
                                        isSelected={selectedIds.includes(lead.id)}
                                        isActive={activeLead?.id === lead.id}
                                        onSelect={() => handleSelectLead(lead.id)}
                                        onClick={() => handleLeadClick(lead)}
                                    />
                                ))
                            )}
                        </div>

                        {/* Preview panel */}
                        <div className="lg:col-span-2 lg:sticky lg:top-6 h-fit">
                            <LeadPreviewPanel
                                lead={activeLead}
                                onClose={() => setActiveLead(null)}
                                onSuccess={handleSuccess}
                                userId={currentUserId}
                            />
                        </div>
                    </div>

                    {/* Bulk actions */}
                    <BulkVerificationBar
                        selectedIds={selectedIds}
                        onClear={() => setSelectedIds([])}
                        onSuccess={handleSuccess}
                        userId={currentUserId}
                    />
                </>
            ) : (
                <>
                    {/* Company Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl border border-slate-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-semibold text-slate-900">{companyStats?.pending || 0}</p>
                                    <p className="text-sm text-slate-500">Pendents de verificar</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Check className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-semibold text-slate-900">{companyStats?.publishedToday || 0}</p>
                                    <p className="text-sm text-slate-500">Publicades avui</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Building2 className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-semibold text-slate-900">{companyStats?.publishedWeek || 0}</p>
                                    <p className="text-sm text-slate-500">Publicades aquesta setmana</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Company list */}
                    <div className="space-y-3">
                        {companies.length === 0 ? (
                            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                                <ShieldCheck className="h-12 w-12 text-green-500 mx-auto mb-4" strokeWidth={1.5} />
                                <h3 className="text-lg font-medium text-slate-900 mb-2">
                                    Tot verificat!
                                </h3>
                                <p className="text-slate-500">
                                    No hi ha empreses pendents de verificació.
                                </p>
                            </div>
                        ) : (
                            companies.map((company) => (
                                <div
                                    key={company.id}
                                    className={`bg-white rounded-xl border p-4 transition-all ${
                                        activeCompany?.id === company.id
                                            ? 'border-blue-300 ring-2 ring-blue-100'
                                            : 'border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            {/* Logo */}
                                            <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                {company.logo ? (
                                                    <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Building2 className="h-6 w-6 text-slate-400" />
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-slate-900 truncate">{company.name}</h3>
                                                <p className="text-sm text-slate-500">{company.sector || 'Sense sector'}</p>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                                    {company.accountManager && (
                                                        <span className="flex items-center gap-1">
                                                            <Users className="h-3 w-3" />
                                                            {company.accountManager.name}
                                                        </span>
                                                    )}
                                                    {company.currentPlan && (
                                                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                                                            {company.currentPlan.nombreCorto || company.currentPlan.nombre}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {company.waitingHours}h esperant
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => window.open(`/empresa/${company.slug || company.id}`, '_blank')}
                                                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                                title="Veure empresa"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => setRejectModal({ open: true, companyId: company.id })}
                                                disabled={actionLoading === company.id}
                                                className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleApproveCompany(company.id)}
                                                disabled={actionLoading === company.id}
                                                className="px-4 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                                            >
                                                {actionLoading === company.id ? (
                                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Check className="h-4 w-4" />
                                                )}
                                                Publicar
                                            </button>
                                        </div>
                                    </div>

                                    {/* Description preview */}
                                    {company.description && (
                                        <p className="mt-3 text-sm text-slate-600 line-clamp-2">
                                            {company.description}
                                        </p>
                                    )}

                                    {/* Profile completeness */}
                                    <div className="mt-3 pt-3 border-t border-slate-100">
                                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                                            <span>Completitud del perfil</span>
                                            <span className="font-medium">{company.profileCompleteness || 0}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                                            <div
                                                className="bg-blue-600 h-1.5 rounded-full transition-all"
                                                style={{ width: `${company.profileCompleteness || 0}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}

            {/* Reject Modal */}
            {rejectModal.open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Retornar empresa</h3>
                        <p className="text-sm text-slate-600 mb-4">
                            Indica el motiu pel qual l'empresa necessita modificacions.
                        </p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Escriu el motiu..."
                            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24 placeholder:text-gray-400"
                        />
                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => {
                                    setRejectModal({ open: false, companyId: null })
                                    setRejectReason('')
                                }}
                                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Cancel·lar
                            </button>
                            <button
                                onClick={handleRejectCompany}
                                disabled={!rejectReason.trim() || actionLoading !== null}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Retornar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
