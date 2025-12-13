'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, RefreshCw, Download } from 'lucide-react'
import { VerificationStats } from '@/components/gestio-empreses/crm/VerificationStats'
import { VerificationCard } from '@/components/gestio-empreses/crm/VerificationCard'
import { LeadPreviewPanel } from '@/components/gestio-empreses/crm/LeadPreviewPanel'
import { BulkVerificationBar } from '@/components/gestio-empreses/crm/BulkVerificationBar'
import {
    getVerificationStats,
    getPendingVerificationLeads,
    getLeadPreview
} from '@/lib/gestio-empreses/verification-actions'

interface VerificacioClientProps {
    initialStats: any
    initialLeads: any[]
    currentUserId: string
}

export function VerificacioClient({
    initialStats,
    initialLeads,
    currentUserId
}: VerificacioClientProps) {
    const router = useRouter()
    const [stats, setStats] = useState<any>(initialStats)
    const [leads, setLeads] = useState<any[]>(initialLeads)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [activeLead, setActiveLead] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)

    const loadData = async () => {
        setIsLoading(true)
        try {
            const [statsData, leadsData] = await Promise.all([
                getVerificationStats(),
                getPendingVerificationLeads(),
            ])
            setStats(statsData)
            setLeads(leadsData)
            router.refresh() // Refresca también los datos de servidor por si acaso
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
        // Si ya tenemos el lead cargado completo no hace falta pedirlo, 
        // pero getLeadPreview trae más detalles (actividades).
        const fullLead = await getLeadPreview(lead.id)
        setActiveLead(fullLead)
    }

    const handleSuccess = () => {
        loadData()
        setActiveLead(null)
        setSelectedIds([])
    }

    // Valors per defecte pels stats
    const defaultStats = {
        pending: 0,
        approvedToday: 0,
        rejectedToday: 0,
        approvedWeek: 0,
        avgWaitTime: 0,
        slaCompliance: 100,
        outsideSLA: 0,
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="h-7 w-7 text-slate-600" strokeWidth={1.5} />
                    <div>
                        <h1 className="text-xl font-semibold text-slate-900">Verificació CRM</h1>
                        <p className="text-sm text-slate-500">
                            Revisa i aprova els leads en documentació per contractar-los
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

            {/* Stats - SEMPRE VISIBLES */}
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
        </div>
    )
}
