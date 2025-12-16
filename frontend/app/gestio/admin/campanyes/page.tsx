'use client'

import { useState, useEffect } from 'react'
import {
    Megaphone,
    Plus,
    Search,
    Filter,
    RefreshCw,
    Mail,
    Bell,
    MessageSquare,
    Image,
    Star,
    Volume2,
    MoreHorizontal,
    Play,
    Pause,
    Send,
    Eye,
    Edit,
    Trash2,
    X,
    Check,
    Calendar,
    Users,
    BarChart3,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    ChevronDown,
    FileText,
    Sparkles,
    Database,
} from 'lucide-react'

// =====================
// TIPUS
// =====================

type CampaignType = 'EMAIL' | 'PUSH' | 'SMS' | 'BANNER' | 'FEATURED' | 'ANNOUNCEMENT'
type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
type SegmentationType = 'ALL' | 'ADMINISTRATION' | 'SECTOR' | 'SUBSCRIPTION' | 'CUSTOM' | 'BEHAVIOR'

interface Campaign {
    id: string
    name: string
    slug: string
    description: string | null
    type: CampaignType
    status: CampaignStatus
    subject: string | null
    content: string | null
    ctaText: string | null
    ctaUrl: string | null
    imageUrl: string | null
    segmentationType: SegmentationType
    scheduledAt: string | null
    startDate: string | null
    endDate: string | null
    priority: number
    totalRecipients: number
    sent: number
    delivered: number
    opened: number
    clicked: number
    converted: number
    createdAt: string
    updatedAt: string
    createdBy: {
        id: string
        name: string | null
        email: string
    } | null
    _count?: {
        recipients: number
        events: number
    }
}

// =====================
// CONFIGURACIÓ
// =====================

const CAMPAIGN_TYPES: Record<CampaignType, { label: string; icon: any; color: string; bg: string }> = {
    EMAIL: { label: 'Email', icon: Mail, color: 'text-blue-600', bg: 'bg-blue-100' },
    PUSH: { label: 'Push', icon: Bell, color: 'text-purple-600', bg: 'bg-purple-100' },
    SMS: { label: 'SMS', icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-100' },
    BANNER: { label: 'Banner', icon: Image, color: 'text-orange-600', bg: 'bg-orange-100' },
    FEATURED: { label: 'Destacat', icon: Star, color: 'text-amber-600', bg: 'bg-amber-100' },
    ANNOUNCEMENT: { label: 'Comunicat', icon: Volume2, color: 'text-red-600', bg: 'bg-red-100' },
}

const CAMPAIGN_STATUS: Record<CampaignStatus, { label: string; color: string; bg: string; icon: any }> = {
    DRAFT: { label: 'Esborrany', color: 'text-slate-600', bg: 'bg-slate-100', icon: FileText },
    SCHEDULED: { label: 'Programada', color: 'text-blue-600', bg: 'bg-blue-100', icon: Clock },
    ACTIVE: { label: 'Activa', color: 'text-green-600', bg: 'bg-green-100', icon: Play },
    PAUSED: { label: 'Pausada', color: 'text-amber-600', bg: 'bg-amber-100', icon: Pause },
    COMPLETED: { label: 'Completada', color: 'text-emerald-600', bg: 'bg-emerald-100', icon: CheckCircle },
    CANCELLED: { label: 'Cancel·lada', color: 'text-red-600', bg: 'bg-red-100', icon: XCircle },
}

const SEGMENTATION_TYPES: Record<SegmentationType, string> = {
    ALL: 'Tots els usuaris',
    ADMINISTRATION: 'Per administració',
    SECTOR: 'Per sector',
    SUBSCRIPTION: 'Per subscripció',
    CUSTOM: 'Personalitzada',
    BEHAVIOR: 'Per comportament',
}

// =====================
// COMPONENT PRINCIPAL
// =====================

export default function CampanyesPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [seeding, setSeeding] = useState(false)

    // Filtres
    const [search, setSearch] = useState('')
    const [filterType, setFilterType] = useState<CampaignType | ''>('')
    const [filterStatus, setFilterStatus] = useState<CampaignStatus | ''>('')

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showViewModal, setShowViewModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        scheduled: 0,
        draft: 0,
    })

    // =====================
    // CARREGAR DADES
    // =====================

    const fetchCampaigns = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (search) params.set('search', search)
            if (filterType) params.set('type', filterType)
            if (filterStatus) params.set('status', filterStatus)

            const response = await fetch(`/api/gestio/campaigns?${params}`)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Error carregant campanyes')
            }

            setCampaigns(data.campaigns || [])

            // Calcular stats
            const all = data.campaigns || []
            setStats({
                total: all.length,
                active: all.filter((c: Campaign) => c.status === 'ACTIVE').length,
                scheduled: all.filter((c: Campaign) => c.status === 'SCHEDULED').length,
                draft: all.filter((c: Campaign) => c.status === 'DRAFT').length,
            })

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconegut')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCampaigns()
    }, [search, filterType, filterStatus])

    // =====================
    // ACCIONS
    // =====================

    const handleStatusChange = async (campaign: Campaign, newStatus: CampaignStatus) => {
        try {
            const response = await fetch(`/api/gestio/campaigns/${campaign.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Error canviant estat')
            }

            fetchCampaigns()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Error')
        }
    }

    const handleSend = async (campaign: Campaign) => {
        if (!confirm(`Enviar la campanya "${campaign.name}" ara?`)) return

        try {
            const response = await fetch(`/api/gestio/campaigns/${campaign.id}/send`, {
                method: 'POST',
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Error enviant campanya')
            }

            alert(`Campanya enviada a ${data.recipientsCount} destinataris`)
            fetchCampaigns()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Error')
        }
    }

    const handleDelete = async () => {
        if (!selectedCampaign) return

        try {
            const response = await fetch(`/api/gestio/campaigns/${selectedCampaign.id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Error eliminant campanya')
            }

            setShowDeleteModal(false)
            setSelectedCampaign(null)
            fetchCampaigns()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Error')
        }
    }

    const handleSeedCampaigns = async () => {
        if (!confirm('Crear 6 campanyes d\'exemple (Email, Push, Banner)? Això eliminarà campanyes d\'exemple anteriors.')) return

        setSeeding(true)
        try {
            const response = await fetch('/api/gestio/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'seed' })
            })
            const data = await response.json()

            if (response.ok) {
                alert(data.message || 'Campanyes creades!')
                fetchCampaigns()
            } else {
                alert(data.error || 'Error creant campanyes')
            }
        } catch (err) {
            console.error('Error seeding campaigns:', err)
            alert('Error creant campanyes d\'exemple')
        } finally {
            setSeeding(false)
        }
    }

    // =====================
    // RENDER
    // =====================

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Megaphone className="h-6 w-6 text-green-600" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Campanyes</h1>
                        <p className="text-slate-500">Gestiona les campanyes de màrqueting</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchCampaigns}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Refrescar"
                    >
                        <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
                    </button>
                    <button
                        onClick={handleSeedCampaigns}
                        disabled={seeding || loading}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-300 rounded-lg hover:bg-amber-100 disabled:opacity-50"
                    >
                        <Database className={`h-4 w-4 ${seeding ? 'animate-pulse' : ''}`} strokeWidth={1.5} />
                        {seeding ? 'Creant...' : 'Generar Exemples'}
                    </button>
                    <button
                        onClick={() => {
                            setSelectedCampaign(null)
                            setShowCreateModal(true)
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Plus className="h-4 w-4" strokeWidth={2} />
                        Nova campanya
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-lg">
                            <Megaphone className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total</p>
                            <p className="text-2xl font-semibold text-slate-900">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Play className="h-5 w-5 text-green-600" strokeWidth={1.5} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Actives</p>
                            <p className="text-2xl font-semibold text-green-600">{stats.active}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Clock className="h-5 w-5 text-blue-600" strokeWidth={1.5} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Programades</p>
                            <p className="text-2xl font-semibold text-blue-600">{stats.scheduled}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-lg">
                            <FileText className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Esborranys</p>
                            <p className="text-2xl font-semibold text-slate-600">{stats.draft}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtres */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
                    <input
                        type="text"
                        placeholder="Cercar campanyes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as CampaignType | '')}
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
                    >
                        <option value="">Tots els tipus</option>
                        {Object.entries(CAMPAIGN_TYPES).map(([key, { label }]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as CampaignStatus | '')}
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
                    >
                        <option value="">Tots els estats</option>
                        {Object.entries(CAMPAIGN_STATUS).map(([key, { label }]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600" strokeWidth={1.5} />
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Llista de campanyes */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <RefreshCw className="h-8 w-8 text-slate-400 animate-spin mx-auto mb-4" strokeWidth={1.5} />
                        <p className="text-slate-500">Carregant campanyes...</p>
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="p-12 text-center">
                        <Megaphone className="h-12 w-12 text-slate-300 mx-auto mb-4" strokeWidth={1.5} />
                        <p className="text-slate-500 mb-4">No hi ha campanyes</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Plus className="h-4 w-4" strokeWidth={2} />
                            Crear primera campanya
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Campanya</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Tipus</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Estat</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Audiència</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Mètriques</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Data</th>
                                    <th className="text-right px-4 py-3 text-sm font-semibold text-slate-700">Accions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {campaigns.map((campaign) => {
                                    const typeConfig = CAMPAIGN_TYPES[campaign.type]
                                    const statusConfig = CAMPAIGN_STATUS[campaign.status]
                                    const TypeIcon = typeConfig.icon
                                    const StatusIcon = statusConfig.icon

                                    const openRate = campaign.sent > 0 ? Math.round((campaign.opened / campaign.sent) * 100) : 0
                                    const clickRate = campaign.opened > 0 ? Math.round((campaign.clicked / campaign.opened) * 100) : 0

                                    return (
                                        <tr key={campaign.id} className="hover:bg-slate-50">
                                            {/* Campanya */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${typeConfig.bg}`}>
                                                        <TypeIcon className={`h-4 w-4 ${typeConfig.color}`} strokeWidth={1.5} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{campaign.name}</p>
                                                        {campaign.subject && (
                                                            <p className="text-sm text-slate-500 truncate max-w-[200px]">{campaign.subject}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Tipus */}
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${typeConfig.bg} ${typeConfig.color}`}>
                                                    {typeConfig.label}
                                                </span>
                                            </td>

                                            {/* Estat */}
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                                                    <StatusIcon className="h-3 w-3" strokeWidth={2} />
                                                    {statusConfig.label}
                                                </span>
                                            </td>

                                            {/* Audiència */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                                                    <span className="text-sm text-slate-600">
                                                        {campaign.totalRecipients > 0 ? campaign.totalRecipients.toLocaleString() : SEGMENTATION_TYPES[campaign.segmentationType]}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Mètriques */}
                                            <td className="px-4 py-3">
                                                {campaign.sent > 0 ? (
                                                    <div className="flex items-center gap-3 text-xs">
                                                        <div className="text-center">
                                                            <p className="font-semibold text-slate-900">{campaign.sent}</p>
                                                            <p className="text-slate-500">Enviats</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="font-semibold text-green-600">{openRate}%</p>
                                                            <p className="text-slate-500">Oberts</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="font-semibold text-blue-600">{clickRate}%</p>
                                                            <p className="text-slate-500">Clics</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-slate-400">—</span>
                                                )}
                                            </td>

                                            {/* Data */}
                                            <td className="px-4 py-3">
                                                <div className="text-sm">
                                                    {campaign.scheduledAt ? (
                                                        <div className="flex items-center gap-1 text-blue-600">
                                                            <Calendar className="h-3 w-3" strokeWidth={1.5} />
                                                            {new Date(campaign.scheduledAt).toLocaleDateString('ca-ES', {
                                                                day: '2-digit',
                                                                month: 'short',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-500">
                                                            {new Date(campaign.createdAt).toLocaleDateString('ca-ES', {
                                                                day: '2-digit',
                                                                month: 'short',
                                                            })}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Accions */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    {/* Enviar (només esborranys) */}
                                                    {campaign.status === 'DRAFT' && (
                                                        <button
                                                            onClick={() => handleSend(campaign)}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Enviar ara"
                                                        >
                                                            <Send className="h-4 w-4" strokeWidth={1.5} />
                                                        </button>
                                                    )}

                                                    {/* Pausar/Reprendre */}
                                                    {campaign.status === 'ACTIVE' && (
                                                        <button
                                                            onClick={() => handleStatusChange(campaign, 'PAUSED')}
                                                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                            title="Pausar"
                                                        >
                                                            <Pause className="h-4 w-4" strokeWidth={1.5} />
                                                        </button>
                                                    )}
                                                    {campaign.status === 'PAUSED' && (
                                                        <button
                                                            onClick={() => handleStatusChange(campaign, 'ACTIVE')}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Reprendre"
                                                        >
                                                            <Play className="h-4 w-4" strokeWidth={1.5} />
                                                        </button>
                                                    )}

                                                    {/* Veure */}
                                                    <button
                                                        onClick={() => {
                                                            setSelectedCampaign(campaign)
                                                            setShowViewModal(true)
                                                        }}
                                                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                        title="Veure detalls"
                                                    >
                                                        <Eye className="h-4 w-4" strokeWidth={1.5} />
                                                    </button>

                                                    {/* Editar (només esborranys) */}
                                                    {['DRAFT', 'SCHEDULED'].includes(campaign.status) && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedCampaign(campaign)
                                                                setShowCreateModal(true)
                                                            }}
                                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Editar"
                                                        >
                                                            <Edit className="h-4 w-4" strokeWidth={1.5} />
                                                        </button>
                                                    )}

                                                    {/* Eliminar */}
                                                    {!['ACTIVE', 'COMPLETED'].includes(campaign.status) && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedCampaign(campaign)
                                                                setShowDeleteModal(true)
                                                            }}
                                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Crear/Editar */}
            {showCreateModal && (
                <CampaignFormModal
                    campaign={selectedCampaign}
                    onClose={() => {
                        setShowCreateModal(false)
                        setSelectedCampaign(null)
                    }}
                    onSuccess={() => {
                        setShowCreateModal(false)
                        setSelectedCampaign(null)
                        fetchCampaigns()
                    }}
                />
            )}

            {/* Modal Veure */}
            {showViewModal && selectedCampaign && (
                <CampaignViewModal
                    campaign={selectedCampaign}
                    onClose={() => {
                        setShowViewModal(false)
                        setSelectedCampaign(null)
                    }}
                />
            )}

            {/* Modal Eliminar */}
            {showDeleteModal && selectedCampaign && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <Trash2 className="h-5 w-5 text-red-600" strokeWidth={1.5} />
                            </div>
                            <h2 className="text-lg font-semibold text-slate-900">Eliminar campanya</h2>
                        </div>
                        <p className="text-slate-600 mb-6">
                            Estàs segur que vols eliminar la campanya <strong>"{selectedCampaign.name}"</strong>?
                            Aquesta acció no es pot desfer.
                        </p>
                        <div className="flex items-center justify-end gap-2">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false)
                                    setSelectedCampaign(null)
                                }}
                                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Cancel·lar
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// =====================
// MODAL FORMULARI
// =====================

function CampaignFormModal({
    campaign,
    onClose,
    onSuccess,
}: {
    campaign: Campaign | null
    onClose: () => void
    onSuccess: () => void
}) {
    const isEditing = !!campaign
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(1)

    const [formData, setFormData] = useState({
        name: campaign?.name || '',
        description: campaign?.description || '',
        type: campaign?.type || 'EMAIL' as CampaignType,
        subject: campaign?.subject || '',
        content: campaign?.content || '',
        ctaText: campaign?.ctaText || '',
        ctaUrl: campaign?.ctaUrl || '',
        imageUrl: campaign?.imageUrl || '',
        segmentationType: campaign?.segmentationType || 'ALL' as SegmentationType,
        scheduledAt: campaign?.scheduledAt ? campaign.scheduledAt.slice(0, 16) : '',
        priority: campaign?.priority || 0,
    })

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            alert('El nom és obligatori')
            return
        }

        setLoading(true)
        try {
            const url = isEditing
                ? `/api/gestio/campaigns/${campaign.id}`
                : '/api/gestio/campaigns'

            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    scheduledAt: formData.scheduledAt || null,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Error guardant campanya')
            }

            onSuccess()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Error')
        } finally {
            setLoading(false)
        }
    }

    const TypeIcon = CAMPAIGN_TYPES[formData.type].icon

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">
                        {isEditing ? 'Editar campanya' : 'Nova campanya'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                    >
                        <X className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                </div>

                {/* Steps */}
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
                    {[1, 2, 3].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStep(s)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${step === s
                                    ? 'bg-green-600 text-white'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step === s ? 'bg-white/20' : 'bg-slate-100'
                                }`}>
                                {s}
                            </span>
                            {s === 1 && 'Bàsic'}
                            {s === 2 && 'Contingut'}
                            {s === 3 && 'Configuració'}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {step === 1 && (
                        <>
                            {/* Nom */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Nom de la campanya *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Ex: Newsletter Gener 2025"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                />
                            </div>

                            {/* Descripció */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Descripció
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Descripció interna de la campanya..."
                                    rows={2}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                                />
                            </div>

                            {/* Tipus */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Tipus de campanya *
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {Object.entries(CAMPAIGN_TYPES).map(([key, config]) => {
                                        const Icon = config.icon
                                        const isSelected = formData.type === key
                                        return (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, type: key as CampaignType }))}
                                                className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${isSelected
                                                        ? 'border-green-500 bg-green-50'
                                                        : 'border-slate-200 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <div className={`p-1.5 rounded ${config.bg}`}>
                                                    <Icon className={`h-4 w-4 ${config.color}`} strokeWidth={1.5} />
                                                </div>
                                                <span className={`text-sm font-medium ${isSelected ? 'text-green-900' : 'text-slate-700'}`}>
                                                    {config.label}
                                                </span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            {/* Assumpte */}
                            {['EMAIL', 'PUSH', 'ANNOUNCEMENT'].includes(formData.type) && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Assumpte / Títol
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.subject}
                                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                                        placeholder="Assumpte del missatge..."
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                    />
                                </div>
                            )}

                            {/* Contingut */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Contingut
                                </label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                    placeholder="Escriu el contingut del missatge..."
                                    rows={8}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none font-mono text-sm"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Pots utilitzar HTML per emails. Variables: {'{{nom}}'}, {'{{email}}'}, etc.
                                </p>
                            </div>

                            {/* CTA */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Text del botó (CTA)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.ctaText}
                                        onChange={(e) => setFormData(prev => ({ ...prev, ctaText: e.target.value }))}
                                        placeholder="Ex: Veure oferta"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        URL del botó
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.ctaUrl}
                                        onChange={(e) => setFormData(prev => ({ ...prev, ctaUrl: e.target.value }))}
                                        placeholder="https://..."
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Imatge */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    URL de la imatge
                                </label>
                                <input
                                    type="url"
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                                    placeholder="https://..."
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                />
                            </div>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            {/* Segmentació */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Audiència
                                </label>
                                <div className="space-y-2">
                                    {Object.entries(SEGMENTATION_TYPES).map(([key, label]) => (
                                        <label
                                            key={key}
                                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${formData.segmentationType === key
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-slate-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="segmentation"
                                                checked={formData.segmentationType === key}
                                                onChange={() => setFormData(prev => ({ ...prev, segmentationType: key as SegmentationType }))}
                                                className="sr-only"
                                            />
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.segmentationType === key
                                                    ? 'border-green-600'
                                                    : 'border-slate-300'
                                                }`}>
                                                {formData.segmentationType === key && (
                                                    <div className="w-2 h-2 rounded-full bg-green-600" />
                                                )}
                                            </div>
                                            <span className="text-sm text-slate-700">{label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Programació */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Programar enviament (opcional)
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.scheduledAt}
                                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Deixa buit per enviar manualment
                                </p>
                            </div>

                            {/* Prioritat */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Prioritat
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.priority}
                                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                                    className="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    0 = normal, 100 = màxima prioritat
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50">
                    <div>
                        {step > 1 && (
                            <button
                                onClick={() => setStep(s => s - 1)}
                                className="px-4 py-2 text-slate-600 hover:text-slate-800"
                            >
                                ← Anterior
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Cancel·lar
                        </button>
                        {step < 3 ? (
                            <button
                                onClick={() => setStep(s => s + 1)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Següent →
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading || !formData.name.trim()}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                                        Guardant...
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-4 w-4" strokeWidth={2} />
                                        {isEditing ? 'Guardar canvis' : 'Crear campanya'}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// =====================
// MODAL VEURE
// =====================

function CampaignViewModal({
    campaign,
    onClose,
}: {
    campaign: Campaign
    onClose: () => void
}) {
    const typeConfig = CAMPAIGN_TYPES[campaign.type]
    const statusConfig = CAMPAIGN_STATUS[campaign.status]
    const TypeIcon = typeConfig.icon
    const StatusIcon = statusConfig.icon

    const openRate = campaign.sent > 0 ? Math.round((campaign.opened / campaign.sent) * 100) : 0
    const clickRate = campaign.opened > 0 ? Math.round((campaign.clicked / campaign.opened) * 100) : 0
    const conversionRate = campaign.clicked > 0 ? Math.round((campaign.converted / campaign.clicked) * 100) : 0

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${typeConfig.bg}`}>
                            <TypeIcon className={`h-5 w-5 ${typeConfig.color}`} strokeWidth={1.5} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">{campaign.name}</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                                    <StatusIcon className="h-3 w-3" strokeWidth={2} />
                                    {statusConfig.label}
                                </span>
                                <span className="text-xs text-slate-500">
                                    {typeConfig.label}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                    >
                        <X className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Mètriques */}
                    {campaign.sent > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-slate-700 mb-3">Mètriques</h3>
                            <div className="grid grid-cols-4 gap-3">
                                <div className="bg-slate-50 rounded-lg p-3 text-center">
                                    <p className="text-2xl font-semibold text-slate-900">{campaign.sent.toLocaleString()}</p>
                                    <p className="text-xs text-slate-500">Enviats</p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-3 text-center">
                                    <p className="text-2xl font-semibold text-green-600">{openRate}%</p>
                                    <p className="text-xs text-slate-500">Taxa obertura</p>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-3 text-center">
                                    <p className="text-2xl font-semibold text-blue-600">{clickRate}%</p>
                                    <p className="text-xs text-slate-500">Taxa clics</p>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-3 text-center">
                                    <p className="text-2xl font-semibold text-purple-600">{conversionRate}%</p>
                                    <p className="text-xs text-slate-500">Conversió</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Detalls */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">Detalls</h3>
                        <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                            {campaign.description && (
                                <div>
                                    <p className="text-xs text-slate-500">Descripció</p>
                                    <p className="text-sm text-slate-700">{campaign.description}</p>
                                </div>
                            )}
                            {campaign.subject && (
                                <div>
                                    <p className="text-xs text-slate-500">Assumpte</p>
                                    <p className="text-sm text-slate-700">{campaign.subject}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-slate-500">Audiència</p>
                                <p className="text-sm text-slate-700">{SEGMENTATION_TYPES[campaign.segmentationType]}</p>
                            </div>
                            <div className="flex gap-6">
                                <div>
                                    <p className="text-xs text-slate-500">Creat</p>
                                    <p className="text-sm text-slate-700">
                                        {new Date(campaign.createdAt).toLocaleDateString('ca-ES', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>
                                {campaign.scheduledAt && (
                                    <div>
                                        <p className="text-xs text-slate-500">Programat</p>
                                        <p className="text-sm text-slate-700">
                                            {new Date(campaign.scheduledAt).toLocaleDateString('ca-ES', {
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Contingut */}
                    {campaign.content && (
                        <div>
                            <h3 className="text-sm font-semibold text-slate-700 mb-3">Contingut</h3>
                            <div className="bg-slate-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                                <div
                                    className="prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: campaign.content }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end p-4 border-t border-slate-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        Tancar
                    </button>
                </div>
            </div>
        </div>
    )
}
