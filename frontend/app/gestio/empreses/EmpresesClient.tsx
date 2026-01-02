'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
    Building2,
    CheckCircle,
    Activity,
    Clock,
    FileEdit,
    Loader2,
    Eye,
    Shield,
    Power,
    Search,
    Filter,
    ChevronDown,
    AlertCircle,
    User,
    RefreshCw,
    Users,
    MessageSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
    toggleEmpresaVerificacio,
    toggleEmpresaActiva,
    getEmpresesLlista,
    getEmpresesStats,
    getGestorsPerFiltre,
    EmpresaLlista,
    EmpresaStats,
    EmpresaFilters
} from '@/lib/gestio-empreses/actions/empreses-llista-actions'
import { getCategoryLabel, getCategoryColors } from '@/lib/constants/categories'
import { AssignarGestorModal } from './AssignarGestorModal'


interface EmpresesClientPageProps {
    initialEmpreses: EmpresaLlista[]
    initialStats: EmpresaStats | null
    initialGestors: { id: string; name: string; email: string }[]
    initialFilters?: EmpresaFilters
}

export function EmpresesClientPage({
    initialEmpreses,
    initialStats,
    initialGestors
}: EmpresesClientPageProps) {
    const router = useRouter()
    const { data: session } = useSession()

    // State
    const [empreses, setEmpreses] = useState<EmpresaLlista[]>(initialEmpreses)
    const [stats, setStats] = useState<EmpresaStats | null>(initialStats)
    const [gestors, setGestors] = useState<{ id: string; name: string; email: string }[]>(initialGestors)
    const [isLoading, setIsLoading] = useState(false) // Inicialment false pq tenim dades
    const [isRefreshing, setIsRefreshing] = useState(false)
    const isFirstRender = useRef(true)

    // Filtres
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedStatus, setSelectedStatus] = useState<string[]>([])
    const [selectedPlan, setSelectedPlan] = useState<string[]>([])
    const [selectedSector, setSelectedSector] = useState<string>('')
    const [selectedGestor, setSelectedGestor] = useState<string>('')
    const [showFilters, setShowFilters] = useState(false)

    // Modal d'assignació
    const [modalAssignar, setModalAssignar] = useState<{
        isOpen: boolean
        empresa: { id: string; name: string; accountManagerId: string | null; accountManager?: any } | null
    }>({
        isOpen: false,
        empresa: null
    })

    // Determinar si té accés complet (Admin/CRM) o limitat (Gestor)
    const hasFullAccess = useMemo(() => {
        const role = session?.user?.role as string
        return ['SUPER_ADMIN', 'ADMIN', 'CRM_COMERCIAL'].includes(role)
    }, [session])

    // Paginació
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const LIMIT = 50

    // Carregar dades (client-side)
    const loadData = async (targetPage = 1) => {
        if (!session) return

        setIsLoading(true)

        try {
            const filters: EmpresaFilters = {
                search: searchTerm || undefined,
                status: selectedStatus.length > 0 ? selectedStatus : undefined,
                planTier: selectedPlan.length > 0 ? selectedPlan : undefined,
                sector: selectedSector ? [selectedSector] : undefined,
                accountManagerId: selectedGestor === 'UNASSIGNED' ? 'NULL' : selectedGestor || undefined
            }

            // Peticiones en paralelo. 
            // Nota: Podriamos usar las Server Actions directamente invocadas aqui en vez de fetch a API Routes si existieran.
            // Dado que el codigo original usaba fetch a /api/..., migramos a usar la Server Action directamente para aprovechar la paginacion nueva
            // sin tener que refactorizar todo el API route handler (que no he tocado).
            // IMPORTANTE: Para mantener consistencia con el refactor anterior, invocare las Server Actions importadas.

            const [empresesRes, statsRes, gestorsRes] = await Promise.all([
                getEmpresesLlista(filters, targetPage, LIMIT),
                getEmpresesStats(),
                hasFullAccess ? getGestorsPerFiltre() : Promise.resolve({ success: true, data: [] })
            ])

            if (empresesRes.success && empresesRes.data) {
                setEmpreses(empresesRes.data)
                // Actualizar metadatos de paginacion si existen
                if (empresesRes.metadata) {
                    setTotalPages(empresesRes.metadata.totalPages)
                    setPage(empresesRes.metadata.page)
                }
            } else {
                toast.error('Error carregant empreses: ' + empresesRes.error)
            }

            if (statsRes.success && statsRes.data) {
                setStats(statsRes.data)
            }

            if (gestorsRes.success && gestorsRes.data) {
                setGestors(gestorsRes.data)
            }

        } catch (error) {
            console.error('Error carregant dades:', error)
            toast.error('Error carregant les empreses')
        } finally {
            setIsLoading(false)
        }
    }

    // Effect per recarregar quan canvien els filtres
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }

        // Debounce search
        const timer = setTimeout(() => {
            if (session) {
                // Reset page to 1 on filter change
                setPage(1)
                loadData(1)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [session, searchTerm, selectedStatus, selectedPlan, selectedGestor, selectedSector])

    // Handler para cambio de pagina
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage)
            loadData(newPage)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    // Refrescar
    const handleRefresh = async () => {
        setIsRefreshing(true)
        await loadData()
        setIsRefreshing(false)
        toast.success('Llista actualitzada')
    }

    // Accions
    const handleVerificar = async (empresaId: string) => {
        const result = await toggleEmpresaVerificacio(empresaId)
        if (result.success) {
            toast.success('Estat de verificació actualitzat')
            loadData()
        } else {
            toast.error(result.error || 'Error')
        }
    }

    const handleToggleActiva = async (empresaId: string) => {
        const result = await toggleEmpresaActiva(empresaId)
        if (result.success) {
            toast.success('Estat actualitzat')
            loadData()
        } else {
            toast.error(result.error || 'Error')
        }
    }

    // Obrir modal d'assignació
    const handleOpenAssignar = (empresa: EmpresaLlista) => {
        setModalAssignar({
            isOpen: true,
            empresa: {
                id: empresa.id,
                name: empresa.name,
                accountManagerId: empresa.accountManagerId,
                accountManager: empresa.accountManager
            }
        })
    }

    // Obrir missatgeria amb empresa
    const handleOpenMissatgeria = async (empresa: EmpresaLlista) => {
        try {
            router.push(`/gestio/missatgeria?company=${empresa.id}`)
        } catch (error) {
            toast.error('Error obrint missatgeria')
        }
    }

    // Netejar filtres
    const clearFilters = () => {
        setSearchTerm('')
        setSelectedStatus([])
        setSelectedPlan([])
        setSelectedSector('')
        setSelectedGestor('')
    }

    const activeFiltersCount = [
        searchTerm ? 1 : 0,
        selectedStatus.length,
        selectedPlan.length,
        selectedSector ? 1 : 0,
        selectedGestor ? 1 : 0
    ].reduce((a, b) => a + b, 0)

    // Plans disponibles
    const PLANS = [
        { value: 'PIONERES', label: 'Pioneres', color: 'bg-purple-100 text-purple-700' },
        { value: 'STANDARD', label: 'Estàndard', color: 'bg-blue-100 text-blue-700' },
        { value: 'STRATEGIC', label: 'Estratègic', color: 'bg-indigo-100 text-indigo-700' },
        { value: 'ENTERPRISE', label: 'Enterprise', color: 'bg-amber-100 text-amber-700' }
    ]

    // Estats disponibles
    const STATUSES = [
        { value: 'PENDING', label: 'Pendent', color: 'bg-amber-100 text-amber-700' },
        { value: 'APPROVED', label: 'Aprovada', color: 'bg-green-100 text-green-700' },
        { value: 'PUBLISHED', label: 'Publicada', color: 'bg-blue-100 text-blue-700' },
        { value: 'SUSPENDED', label: 'Suspesa', color: 'bg-red-100 text-red-700' }
    ]

    if (isLoading && empreses.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" strokeWidth={1.5} />
                <span className="ml-2 text-sm text-slate-500">Carregant empreses...</span>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
                        Gestió d'Empreses
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {hasFullAccess
                            ? 'Administra totes les empreses col·laboradores'
                            : 'Gestiona les empreses que tens assignades'
                        }
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} strokeWidth={1.5} />
                    </button>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <StatCard
                        icon={Building2}
                        label="Total Empreses"
                        value={stats.total}
                        color="blue"
                    />
                    <StatCard
                        icon={CheckCircle}
                        label="Verificades"
                        value={stats.verificades}
                        color="green"
                    />
                    <StatCard
                        icon={Activity}
                        label="Actives"
                        value={stats.actives}
                        color="purple"
                    />
                    <StatCard
                        icon={Clock}
                        label="Pendents"
                        value={stats.pendents}
                        color="amber"
                    />
                    <StatCard
                        icon={FileEdit}
                        label="Pendents Completar"
                        value={stats.pendentsCompletar}
                        color="orange"
                    />
                </div>
            )}

            {/* Filtres */}
            <div className="bg-white border border-slate-200 rounded-lg">
                <div
                    className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
                        <span className="text-sm font-medium text-slate-700">Filtres</span>
                        {activeFiltersCount > 0 && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                {activeFiltersCount}
                            </span>
                        )}
                    </div>
                    <ChevronDown className={cn(
                        "h-4 w-4 text-slate-400 transition-transform",
                        showFilters && "rotate-180"
                    )} strokeWidth={1.5} />
                </div>

                {showFilters && (
                    <div className="px-4 py-4 border-t border-slate-100 space-y-4">
                        {/* Cerca */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Cercar per nom, CIF, email o sector..."
                                className="w-full h-10 pl-10 pr-4 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Estat */}
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-2">ESTAT</label>
                                <div className="flex flex-wrap gap-2">
                                    {STATUSES.map(status => (
                                        <button
                                            key={status.value}
                                            onClick={() => {
                                                setSelectedStatus(prev =>
                                                    prev.includes(status.value)
                                                        ? prev.filter(s => s !== status.value)
                                                        : [...prev, status.value]
                                                )
                                            }}
                                            className={cn(
                                                "px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
                                                selectedStatus.includes(status.value)
                                                    ? status.color
                                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            )}
                                        >
                                            {status.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Pla */}
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-2">PLA</label>
                                <div className="flex flex-wrap gap-2">
                                    {PLANS.map(plan => (
                                        <button
                                            key={plan.value}
                                            onClick={() => {
                                                setSelectedPlan(prev =>
                                                    prev.includes(plan.value)
                                                        ? prev.filter(p => p !== plan.value)
                                                        : [...prev, plan.value]
                                                )
                                            }}
                                            className={cn(
                                                "px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
                                                selectedPlan.includes(plan.value)
                                                    ? plan.color
                                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            )}
                                        >
                                            {plan.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sector */}
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-2">SECTOR</label>
                                <select
                                    value={selectedSector}
                                    onChange={(e) => setSelectedSector(e.target.value)}
                                    className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Tots els sectors</option>
                                    {getCategoriesAsOptions().map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Gestor (només visible per Admin/CRM) */}
                            {gestors.length > 0 && hasFullAccess && (
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-2">GESTOR ASSIGNAT</label>
                                    <select
                                        value={selectedGestor}
                                        onChange={(e) => setSelectedGestor(e.target.value)}
                                        className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Tots els gestors</option>
                                        <option value="UNASSIGNED">Sense assignar</option>
                                        {gestors.map(gestor => (
                                            <option key={gestor.id} value={gestor.id}>
                                                {gestor.name || gestor.email}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {activeFiltersCount > 0 && (
                            <div className="pt-2 border-t border-slate-100">
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-slate-500 hover:text-slate-700"
                                >
                                    Netejar filtres
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Llista */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-sm font-medium text-slate-900">
                        Empreses ({empreses.length})
                    </h2>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Activity className="h-5 w-5 animate-spin text-slate-400" strokeWidth={1.5} />
                        <span className="ml-2 text-sm text-slate-500">Carregant...</span>
                    </div>
                ) : empreses.length === 0 ? (
                    <div className="py-12 text-center">
                        <Building2 className="h-8 w-8 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
                        <p className="text-sm text-slate-500">
                            {activeFiltersCount > 0
                                ? "No hi ha empreses que coincideixin amb els filtres"
                                : hasFullAccess
                                    ? "No hi ha empreses registrades"
                                    : "No tens empreses assignades"
                            }
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {empreses.map((empresa) => (
                            <EmpresaRow
                                key={empresa.id}
                                empresa={empresa}
                                hasFullAccess={hasFullAccess}
                                onVerificar={handleVerificar}
                                onToggleActiva={handleToggleActiva}
                                onOpenAssignar={handleOpenAssignar}
                                onOpenMissatgeria={handleOpenMissatgeria}
                                router={router}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Paginació UI */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1 || isLoading}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Anterior
                    </button>
                    <span className="text-sm text-slate-600">
                        Pàgina {page} de {totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages || isLoading}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Següent
                    </button>
                </div>
            )}

            {/* Modal d'assignació */}
            {modalAssignar.empresa && (
                <AssignarGestorModal
                    isOpen={modalAssignar.isOpen}
                    onClose={() => setModalAssignar({ isOpen: false, empresa: null })}
                    empresa={modalAssignar.empresa}
                    onAssigned={() => { loadData(); /* Reload to reflect changes */ }}
                />
            )}
        </div>
    )
}

// ============================================
// COMPONENTS AUXILIARS
// ============================================

function StatCard({
    icon: Icon,
    label,
    value,
    color
}: {
    icon: any
    label: string
    value: number
    color: string
}) {
    const colors: Record<string, string> = {
        blue: 'text-blue-600 bg-blue-50',
        green: 'text-green-600 bg-green-50',
        purple: 'text-purple-600 bg-purple-50',
        amber: 'text-amber-600 bg-amber-50',
        orange: 'text-orange-600 bg-orange-50'
    }

    return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-slate-500">{label}</p>
                    <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
                </div>
                <div className={cn("p-2 rounded-lg", colors[color])}>
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
            </div>
        </div>
    )
}

function EmpresaRow({
    empresa,
    hasFullAccess,
    onVerificar,
    onToggleActiva,
    onOpenAssignar,
    onOpenMissatgeria,
    router
}: {
    empresa: EmpresaLlista
    hasFullAccess: boolean
    onVerificar: (id: string) => void
    onToggleActiva: (id: string) => void
    onOpenAssignar: (empresa: EmpresaLlista) => void
    onOpenMissatgeria: (empresa: EmpresaLlista) => void
    router: any
}) {
    const statusColors: Record<string, string> = {
        PENDING: 'bg-amber-100 text-amber-700',
        APPROVED: 'bg-green-100 text-green-700',
        PUBLISHED: 'bg-blue-100 text-blue-700',
        SUSPENDED: 'bg-red-100 text-red-700',
        PENDING_VERIFICATION: 'bg-purple-100 text-purple-700'
    }

    const statusLabels: Record<string, string> = {
        PENDING: 'Pendent',
        APPROVED: 'Aprovada',
        PUBLISHED: 'Publicada',
        SUSPENDED: 'Suspesa',
        PENDING_VERIFICATION: 'En verificació'
    }

    const planColors: Record<string, string> = {
        PIONERES: 'bg-purple-100 text-purple-700',
        STANDARD: 'bg-blue-100 text-blue-700',
        STRATEGIC: 'bg-indigo-100 text-indigo-700',
        ENTERPRISE: 'bg-amber-100 text-amber-700'
    }

    return (
        <div className="p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between gap-4">
                {/* Info principal */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Logo */}
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {empresa.logo ? (
                            <img src={empresa.logo} alt={empresa.name} className="w-full h-full object-cover" />
                        ) : (
                            <Building2 className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
                        )}
                    </div>

                    {/* Nom i info */}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-medium text-slate-900 truncate">{empresa.name}</h3>
                            {empresa.completionPercentage < 100 && (
                                <span className="flex items-center gap-1 text-xs text-amber-600">
                                    <AlertCircle className="h-3 w-3" strokeWidth={1.5} />
                                    {empresa.completionPercentage}%
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            {empresa.accountManager ? (
                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                    <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                                        <User className="h-2.5 w-2.5 text-blue-600" strokeWidth={1.5} />
                                    </div>
                                    <span className="truncate max-w-[120px]">
                                        {empresa.accountManager.name || empresa.accountManager.email}
                                    </span>
                                </div>
                            ) : hasFullAccess && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onOpenAssignar(empresa)
                                    }}
                                    className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 hover:underline cursor-pointer"
                                >
                                    <AlertCircle className="h-3 w-3" strokeWidth={1.5} />
                                    <span>Sense assignar</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2">
                    {/* Estat */}
                    <span className={cn(
                        "px-2.5 py-1 text-xs font-medium rounded-full",
                        statusColors[empresa.status] || 'bg-slate-100 text-slate-600'
                    )}>
                        {statusLabels[empresa.status] || empresa.status}
                    </span>

                    {/* Pla */}
                    {empresa.currentPlan && (
                        <span className={cn(
                            "px-2.5 py-1 text-xs font-medium rounded-full",
                            planColors[empresa.currentPlan.tier] || 'bg-slate-100 text-slate-600'
                        )}>
                            {empresa.currentPlan.nombreCorto || empresa.currentPlan.tier}
                        </span>
                    )}

                    {/* Sector */}
                    {empresa.sector && (
                        <span className={cn(
                            "px-2.5 py-1 text-xs font-medium rounded-full",
                            getCategoryColors(empresa.sector)
                        )}>
                            {getCategoryLabel(empresa.sector)}
                        </span>
                    )}

                    {/* Data */}
                    <span className="text-xs text-slate-400 hidden md:block">
                        {new Date(empresa.updatedAt).toLocaleDateString('ca-ES')}
                    </span>
                </div>

                {/* Accions */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => router.push(`/gestio/empreses/${empresa.id}`)}
                        className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Veure"
                    >
                        <Eye className="h-4 w-4" strokeWidth={1.5} />
                    </button>

                    <Link
                        href={`/gestio/empreses/${empresa.id}/completar`}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Completar perfil"
                    >
                        <FileEdit className="h-4 w-4" strokeWidth={1.5} />
                    </Link>

                    {hasFullAccess && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onOpenAssignar(empresa)
                                }}
                                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title={empresa.accountManager ? `Reassignar (actual: ${empresa.accountManager.name})` : 'Assignar gestor'}
                            >
                                <Users className="h-4 w-4" strokeWidth={1.5} />
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onOpenMissatgeria(empresa)
                                }}
                                className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Enviar missatge a l'empresa"
                            >
                                <MessageSquare className="h-4 w-4" strokeWidth={1.5} />
                            </button>

                            <button
                                onClick={() => onVerificar(empresa.id)}
                                className={cn(
                                    "p-2 rounded-lg transition-colors",
                                    empresa.isVerified
                                        ? "text-green-600 hover:bg-green-50"
                                        : "text-slate-500 hover:text-green-600 hover:bg-green-50"
                                )}
                                title={empresa.isVerified ? 'Verificada' : 'Verificar'}
                            >
                                <Shield className="h-4 w-4" strokeWidth={1.5} />
                            </button>

                            <button
                                onClick={() => onToggleActiva(empresa.id)}
                                className={cn(
                                    "p-2 rounded-lg transition-colors",
                                    empresa.isActive
                                        ? "text-amber-600 hover:bg-amber-50"
                                        : "text-slate-500 hover:text-green-600 hover:bg-green-50"
                                )}
                                title={empresa.isActive ? 'Desactivar' : 'Activar'}
                            >
                                <Power className="h-4 w-4" strokeWidth={1.5} />
                            </button>

                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
