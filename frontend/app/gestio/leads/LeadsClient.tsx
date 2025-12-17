'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Target, Plus, ChevronRight, UserPlus, MoreVertical } from 'lucide-react'

import { PageHeader } from '@/components/gestio-empreses/shared/PageHeader'
import { StatCard } from '@/components/gestio-empreses/ui/StatCard'
import { getLeadsAction } from '@/lib/gestio-empreses/leads-actions'
import { AssignGestorModal } from '@/components/gestio-empreses/leads/AssignGestorModal'
import { cn } from '@/lib/utils'
import { getCategoriesAsOptions, getCategoryLabel, getCategoryColors } from '@/lib/constants/categories'

const LEAD_TABS = [
    { id: 'NOUS', label: 'Nous', stages: ['NOU'] },
    { id: 'GESTOR', label: 'Gestor', stages: ['ASSIGNAT', 'TREBALLANT'] },
    { id: 'CRM', label: 'CRM', stages: ['PER_VERIFICAR', 'VERIFICAT'] },
    { id: 'ADMIN', label: 'Admin', stages: ['PRE_CONTRACTE'] },
    { id: 'GUANYATS', label: 'Guanyats', stages: ['CONTRACTAT'] },
    { id: 'PERDUTS', label: 'Perduts', stages: ['PERDUT'] },
]

interface LeadsClientProps {
    initialLeads: any[]
    currentUser: {
        id: string
        role: string
    } | null
}

export function LeadsClient({ initialLeads, currentUser }: LeadsClientProps) {
    const router = useRouter()
    const [leads, setLeads] = useState<any[]>(initialLeads)
    const [isLoading, setIsLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [activeTab, setActiveTab] = useState('NOUS')
    const [filters, setFilters] = useState({
        priority: '',
        sector: '',
    })
    const [selectedLeads, setSelectedLeads] = useState<string[]>([])
    const [showAssignModal, setShowAssignModal] = useState(false)
    const [openDropdown, setOpenDropdown] = useState<string | null>(null)

    // Ref para controlar la carga inicial vs actualizaciones
    const [isFirstRender, setIsFirstRender] = useState(true)

    useEffect(() => {
        // Si es el primer render y tenemos datos iniciales, no hacemos fetch
        if (isFirstRender) {
            setIsFirstRender(false)
            return
        }

        fetchLeads()
    }, [filters]) // Solo refetch si cambian los filtros. La búsqueda y tabs son filtrado en local según implementación original.

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement
            if (!target.closest('.dropdown-container')) {
                setOpenDropdown(null)
            }
        }
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [])

    const fetchLeads = async () => {
        setIsLoading(true)
        try {
            const result = await getLeadsAction(filters)
            if (result.success) {
                setLeads(result.leads)
            }
        } catch (error) {
            console.error('❌ Error cridant Server Action:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Calcular estadístiques
    const stats = {
        total: leads.length,
        new: leads.filter(l => l.status === 'NEW').length,
        contacted: leads.filter(l => l.status === 'CONTACTED').length,
        qualified: leads.filter(l => l.status === 'QUALIFIED').length,
        won: leads.filter(l => l.status === 'WON').length
    }

    // Obtenir comptadors per pestanyes
    const getCountForTab = (tabId: string) => {
        const tab = LEAD_TABS.find(t => t.id === tabId)
        if (!tab) return 0
        return leads.filter(lead => tab.stages.includes(lead.stage || 'NOU')).length
    }

    // Filtrar leads per cerca i pestanya activa
    const filteredLeads = leads.filter(lead => {
        // Filtre per pestanya activa
        const activeTabData = LEAD_TABS.find(tab => tab.id === activeTab)
        const matchesTab = activeTabData ? activeTabData.stages.includes(lead.stage || 'NOU') : true

        // Filtre per cerca
        const matchesSearch = !search ||
            (lead.company?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (lead.contact?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (lead.email?.toLowerCase() || '').includes(search.toLowerCase())

        // Filtres adicionals (que ja venen filtrats del server si s'apliquen, però mantenim lògica local si cal)
        // Nota: Si el fetchLeads aplica filtres al backend, aquest filtrado local pot ser redundant o complementari.
        // Com que fetchLeads usa `filters`, assumim que el backend ja filtra.
        // PERO: La implementació original filtrava visualment TAMBÉ.
        // Si el backend ja filtra per priority/sector, aquí no caldria tornar a filtrar, però mal no fa.

        // Per coherència amb original:
        const matchesPriority = !filters.priority || lead.priority === filters.priority
        const matchesSector = !filters.sector || lead.sector === filters.sector

        return matchesTab && matchesSearch && matchesPriority && matchesSector
    })

    // Nota: Si el backend ja filtra (fetchLeads usa filters), llavors 'leads' ja ve filtrat.
    // Tot i així, activeTab i search són purament clients-side en l'original.

    const handleLeadClick = (leadId: string) => {
        router.push(`/gestio/pipeline?leadId=${leadId}`)
    }

    const formatValue = (value: number | null | undefined) => {
        if (!value) return '-'
        return new Intl.NumberFormat('ca-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0
        }).format(value)
    }

    const formatDate = (dateString: string | Date) => {
        return new Date(dateString).toLocaleDateString('ca-ES')
    }

    // Verificar si el usuario puede asignar leads
    const canAssignLeads = currentUser?.role &&
        ['CRM_COMERCIAL', 'ADMIN', 'ADMIN_GESTIO', 'SUPER_ADMIN'].includes(currentUser.role)

    // Funciones para manejo de selección
    const handleSelectLead = (leadId: string) => {
        setSelectedLeads(prev =>
            prev.includes(leadId)
                ? prev.filter(id => id !== leadId)
                : [...prev, leadId]
        )
    }

    const handleSelectAll = () => {
        if (selectedLeads.length === filteredLeads.length) {
            setSelectedLeads([])
        } else {
            setSelectedLeads(filteredLeads.map(lead => lead.id))
        }
    }

    const handleAssignSuccess = () => {
        setSelectedLeads([])
        fetchLeads() // Recargar los leads
    }

    const getSelectedLeadNames = () => {
        return filteredLeads
            .filter(lead => selectedLeads.includes(lead.id))
            .map(lead => lead.company || 'Sin nombre')
    }

    const handleAssignSingle = (leadId: string) => {
        setSelectedLeads([leadId])
        setShowAssignModal(true)
        setOpenDropdown(null)
    }

    const toggleDropdown = (leadId: string, event: React.MouseEvent) => {
        event.stopPropagation()
        setOpenDropdown(openDropdown === leadId ? null : leadId)
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Leads"
                description="Visualitza i accedeix al pipeline dels teus leads"
                icon={Target}
                actions={
                    <div className="flex gap-2">
                        {/* Botones de asignación cuando hay leads seleccionados */}
                        {canAssignLeads && selectedLeads.length > 0 && (
                            <>
                                <button
                                    onClick={() => setShowAssignModal(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                                >
                                    <UserPlus className="h-4 w-4" strokeWidth={1.5} />
                                    Assignar {selectedLeads.length === 1 ? 'lead' : `${selectedLeads.length} leads`}
                                </button>
                                <button
                                    onClick={() => setSelectedLeads([])}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
                                >
                                    Cancel·lar selecció
                                </button>
                            </>
                        )}
                        <Link
                            href="/gestio/leads/ia"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors"
                        >
                            <Target className="h-4 w-4" strokeWidth={1.5} />
                            IA Leads
                        </Link>
                        <Link
                            href="/gestio/leads/nou"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="h-4 w-4" strokeWidth={1.5} />
                            Nou lead
                        </Link>
                    </div>
                }
            />

            {/* Estadístiques */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard title="Total leads" value={stats.total} icon={Target} />
                <StatCard title="Nous" value={stats.new} />
                <StatCard title="Contactats" value={stats.contacted} />
                <StatCard title="Qualificats" value={stats.qualified} />
                <StatCard title="Guanyats" value={stats.won} />
            </div>

            {/* Cercador i filtres */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Cercador */}
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Cercar per empresa, contacte o email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Filtres */}
                    <div className="flex gap-3">
                        <select
                            value={filters.priority}
                            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                            className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Totes les prioritats</option>
                            <option value="LOW">Baixa</option>
                            <option value="MEDIUM">Mitjana</option>
                            <option value="HIGH">Alta</option>
                            <option value="URGENT">Urgent</option>
                        </select>

                        <select
                            value={filters.sector}
                            onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
                            className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Tots els sectors</option>
                            {getCategoriesAsOptions().map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Pestanyes d'estat */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex gap-2 border-b pb-3 mb-4">
                    {LEAD_TABS.map(tab => {
                        const count = getCountForTab(tab.id)
                        const isActive = activeTab === tab.id

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2",
                                    isActive
                                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                )}
                            >
                                {tab.label}
                                <span className={cn(
                                    "text-xs px-1.5 py-0.5 rounded-full",
                                    isActive
                                        ? "bg-blue-200 text-blue-800"
                                        : "bg-slate-200 text-slate-600"
                                )}>
                                    {count}
                                </span>
                            </button>
                        )
                    })}
                </div>
                <p className="text-xs text-slate-500">
                    Filtra els leads per estat de la fase actual
                </p>
            </div>

            {/* Taula de leads */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                {canAssignLeads && (
                                    <th className="px-6 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                                            onChange={handleSelectAll}
                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                )}
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Empresa</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contacte</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estat</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Prioritat</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Valor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Data</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acció</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        {canAssignLeads && (
                                            <td className="px-6 py-4">
                                                <div className="animate-pulse h-4 w-4 bg-slate-200 rounded"></div>
                                            </td>
                                        )}
                                        <td className="px-6 py-4">
                                            <div className="animate-pulse h-4 bg-slate-200 rounded"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="animate-pulse h-4 bg-slate-200 rounded"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="animate-pulse h-4 bg-slate-200 rounded"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="animate-pulse h-4 bg-slate-200 rounded"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="animate-pulse h-4 bg-slate-200 rounded"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="animate-pulse h-4 bg-slate-200 rounded"></div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="animate-pulse h-4 w-4 bg-slate-200 rounded ml-auto"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={canAssignLeads ? 8 : 7} className="px-6 py-12 text-center text-slate-500">
                                        No s'han trobat leads
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead) => {
                                    const stageConfigs: Record<string, { label: string; color: string }> = {
                                        NOU: { label: 'Nou', color: 'bg-blue-100 text-blue-800' },
                                        ASSIGNAT: { label: 'Assignat', color: 'bg-purple-100 text-purple-800' },
                                        TREBALLANT: { label: 'Treballant', color: 'bg-cyan-100 text-cyan-800' },
                                        PER_VERIFICAR: { label: 'Per verificar', color: 'bg-amber-100 text-amber-800' },
                                        VERIFICAT: { label: 'Verificat', color: 'bg-green-100 text-green-800' },
                                        PRE_CONTRACTE: { label: 'Pre-contracte', color: 'bg-indigo-100 text-indigo-800' },
                                        CONTRACTAT: { label: 'Contractat', color: 'bg-emerald-100 text-emerald-800' },
                                        PERDUT: { label: 'Perdut', color: 'bg-slate-100 text-slate-800' },
                                    }
                                    const stageConfig = stageConfigs[lead.stage || 'NOU'] || { label: lead.stage || 'Nou', color: 'bg-slate-100 text-slate-800' }

                                    const priorityConfig: any = {
                                        LOW: { label: 'Baixa', color: 'bg-slate-100 text-slate-600' },
                                        MEDIUM: { label: 'Mitjana', color: 'bg-blue-100 text-blue-600' },
                                        HIGH: { label: 'Alta', color: 'bg-orange-100 text-orange-600' },
                                        URGENT: { label: 'Urgent', color: 'bg-red-100 text-red-600' },
                                    }[lead.priority] || { label: lead.priority, color: 'bg-slate-100 text-slate-600' }

                                    return (
                                        <tr
                                            key={lead.id}
                                            className={cn(
                                                "hover:bg-slate-50 transition-colors",
                                                selectedLeads.includes(lead.id) && "bg-blue-50"
                                            )}
                                        >
                                            {canAssignLeads && (
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedLeads.includes(lead.id)}
                                                        onChange={() => handleSelectLead(lead.id)}
                                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                </td>
                                            )}
                                            <td
                                                className="px-6 py-4 cursor-pointer"
                                                onClick={() => handleLeadClick(lead.id)}
                                            >
                                                <div>
                                                    <div className="text-sm font-medium text-slate-900">{lead.company}</div>
                                                    {lead.sector && (
                                                        <span className={cn(
                                                            "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1",
                                                            getCategoryColors(lead.sector)
                                                        )}>
                                                            {getCategoryLabel(lead.sector)}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td
                                                className="px-6 py-4 cursor-pointer"
                                                onClick={() => handleLeadClick(lead.id)}
                                            >
                                                <div>
                                                    <div className="text-sm text-slate-900">{lead.contact || '-'}</div>
                                                    <div className="text-xs text-slate-500">{lead.email || '-'}</div>
                                                </div>
                                            </td>
                                            <td
                                                className="px-6 py-4 cursor-pointer"
                                                onClick={() => handleLeadClick(lead.id)}
                                            >
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stageConfig.color}`}>
                                                    {stageConfig.label}
                                                </span>
                                            </td>
                                            <td
                                                className="px-6 py-4 cursor-pointer"
                                                onClick={() => handleLeadClick(lead.id)}
                                            >
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${priorityConfig.color}`}>
                                                    {priorityConfig.label}
                                                </span>
                                            </td>
                                            <td
                                                className="px-6 py-4 text-sm text-slate-900 cursor-pointer"
                                                onClick={() => handleLeadClick(lead.id)}
                                            >
                                                {formatValue(lead.value)}
                                            </td>
                                            <td
                                                className="px-6 py-4 text-sm text-slate-500 cursor-pointer"
                                                onClick={() => handleLeadClick(lead.id)}
                                            >
                                                {formatDate(lead.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleLeadClick(lead.id)}
                                                        className="text-slate-400 hover:text-slate-600"
                                                    >
                                                        <ChevronRight className="h-4 w-4" />
                                                    </button>
                                                    {canAssignLeads && (
                                                        <div className="relative dropdown-container">
                                                            <button
                                                                onClick={(e) => toggleDropdown(lead.id, e)}
                                                                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                                                            >
                                                                <MoreVertical className="h-4 w-4" />
                                                            </button>
                                                            {openDropdown === lead.id && (
                                                                <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                                                                    <button
                                                                        onClick={() => handleAssignSingle(lead.id)}
                                                                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 rounded-t-lg"
                                                                    >
                                                                        <UserPlus className="h-4 w-4" />
                                                                        Assignar a gestor
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleLeadClick(lead.id)}
                                                                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 rounded-b-lg"
                                                                    >
                                                                        <ChevronRight className="h-4 w-4" />
                                                                        Veure detalls
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
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
                <div className="text-sm text-slate-500 text-center">
                    Mostrant {filteredLeads.length} de {leads.length} leads
                </div>
            )}

            {/* Modal de asignación */}
            <AssignGestorModal
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                leadIds={selectedLeads}
                leadNames={getSelectedLeadNames()}
                onSuccess={handleAssignSuccess}
                currentUserId={currentUser?.id || ''}
            />
        </div>
    )
}
