'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import {
    Gift,
    Plus,
    Filter,
    Download,
    Search,
    CheckCircle,
    Clock,
    Eye,
    Pencil,
    Trash2,
    ExternalLink,
    Package,
    X,
    Building2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { getCategoriesAsOptions, getCategoryLabel, getCategoryColors } from '@/lib/constants/categories'

// Tipus
interface Oferta {
    id: number | string
    title: string
    description: string
    category: string
    subcategory?: string
    company: { id: number, name: string, verified: boolean }
    originalPrice: number
    offerPrice: number
    discount: number
    discountType: 'percentage' | 'fixed'
    isFree: boolean
    validFrom: string
    validUntil: string
    status: 'draft' | 'pending' | 'published' | 'paused' | 'expired' | 'archived'
    featured: boolean
    exclusive: boolean
    isPinned: boolean
    views: number
    createdAt: string
    imageUrls?: string[]
}

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
    draft: { label: 'Esborrany', bg: 'bg-slate-100', text: 'text-slate-700' },
    pending: { label: 'Pendent', bg: 'bg-amber-100', text: 'text-amber-700' },
    published: { label: 'Publicat', bg: 'bg-green-100', text: 'text-green-700' },
    paused: { label: 'Pausat', bg: 'bg-orange-100', text: 'text-orange-700' },
    expired: { label: 'Expirat', bg: 'bg-red-100', text: 'text-red-700' },
    archived: { label: 'Arxivat', bg: 'bg-slate-100', text: 'text-slate-600' },
}

export default function GestioOfertesPage() {
    const router = useRouter()
    const [ofertes, setOfertes] = useState<Oferta[]>([])
    const [filteredOfertes, setFilteredOfertes] = useState<Oferta[]>([])
    const [loading, setLoading] = useState(true)
    const [showFilters, setShowFilters] = useState(false)
    const [categoryOptions, setCategoryOptions] = useState<{ value: string, label: string }[]>([])

    // Estats dels filtres
    const [searchText, setSearchText] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [selectedStatus, setSelectedStatus] = useState<string>('all')

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        actives: 0,
        pendents: 0,
        views: 0
    })

    // Cargar dades
    useEffect(() => {
        setCategoryOptions(getCategoriesAsOptions())
        const loadData = () => {
            try {
                const stored = localStorage.getItem('createdOfertas')
                if (stored) {
                    const parsed = JSON.parse(stored)
                    const data = Array.isArray(parsed) ? parsed : []
                    setOfertes(data)
                } else {
                    setOfertes([])
                }
            } catch (e) {
                console.error("Error carregant ofertes:", e)
                setOfertes([])
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    const handleLoadMockData = () => {
        const MOCK_DATA: Oferta[] = [
            {
                id: 1715000001,
                title: "Pack Consultoria Digital 360",
                description: "Auditoria completa de presència digital, SEO i xarxes socials per a PIMEs.",
                category: "Consultoria",
                subcategory: "Digital",
                company: { id: 1, name: "Consultoria Puig & Associats", verified: true },
                originalPrice: 1500,
                offerPrice: 999,
                discount: 33,
                discountType: "percentage",
                isFree: false,
                validFrom: "2024-01-01",
                validUntil: "2024-12-31",
                status: "published",
                featured: true,
                exclusive: false,
                isPinned: false,
                views: 1250,
                createdAt: "2024-01-01T10:00:00Z"
            },
            {
                id: 1715000002,
                title: "Llicència Software Gestió 1 any",
                description: "Llicència anual del software de gestió empresarial líder al mercat.",
                category: "Tecnologia",
                subcategory: "Software",
                company: { id: 2, name: "TechSolutions BCN", verified: true },
                originalPrice: 500,
                offerPrice: 250,
                discount: 50,
                discountType: "percentage",
                isFree: false,
                validFrom: "2024-03-01",
                validUntil: "2024-06-30",
                status: "published",
                featured: false,
                exclusive: true,
                isPinned: false,
                views: 840,
                createdAt: "2024-03-01T09:00:00Z"
            },
            {
                id: 1715000003,
                title: "Curs de Lideratge Sostenible (Online)",
                description: "Formació de 20 hores per a directius sobre lideratge i sostenibilitat empresarial.",
                category: "Formació",
                subcategory: "Lideratge",
                company: { id: 3, name: "EcoServeis Catalunya", verified: true },
                originalPrice: 300,
                offerPrice: 0,
                discount: 100,
                discountType: "percentage",
                isFree: true,
                validFrom: "2024-05-01",
                validUntil: "2024-08-01",
                status: "published",
                featured: false,
                exclusive: false,
                isPinned: false,
                views: 2100,
                createdAt: "2024-04-15T10:00:00Z"
            },
            {
                id: 1715000004,
                title: "Rènting vehicles elèctrics (Flota)",
                description: "Descompte especial per a rènting de flotes de més de 5 vehicles elèctrics.",
                category: "Mobilitat",
                subcategory: "Vehicles elèctrics",
                company: { id: 2, name: "TechSolutions BCN", verified: true },
                originalPrice: 0,
                offerPrice: 0,
                discount: 0,
                discountType: "fixed",
                isFree: false,
                validFrom: "2024-06-01",
                validUntil: "2024-12-31",
                status: "draft",
                featured: false,
                exclusive: false,
                isPinned: false,
                views: 45,
                createdAt: "2024-05-20T11:00:00Z"
            },
            {
                id: 1715000005,
                title: "Instal·lació Plaques Solars Industrials",
                description: "Estudi, instal·lació i manteniment amb un 15% de descompte inicial.",
                category: "Sostenibilitat",
                subcategory: "Energia",
                company: { id: 3, name: "EcoServeis Catalunya", verified: true },
                originalPrice: 10000,
                offerPrice: 8500,
                discount: 15,
                discountType: "percentage",
                isFree: false,
                validFrom: "2024-02-01",
                validUntil: "2024-11-30",
                status: "pending",
                featured: false,
                exclusive: false,
                isPinned: false,
                views: 320,
                createdAt: "2024-02-01T10:00:00Z"
            }
        ]

        localStorage.setItem('createdOfertas', JSON.stringify(MOCK_DATA))
        setOfertes(MOCK_DATA)
        alert('Dades de prova carregades correctament!')
    }

    // Filtrar i calcular stats
    useEffect(() => {
        let result = [...ofertes]

        // Filtre text
        if (searchText) {
            const lower = searchText.toLowerCase()
            result = result.filter(o =>
                o.title.toLowerCase().includes(lower) ||
                o.description.toLowerCase().includes(lower) ||
                o.company.name.toLowerCase().includes(lower)
            )
        }

        // Filtre categoria
        if (selectedCategory && selectedCategory !== 'all') {
            // Intentar trobar el label associat al value seleccionat
            const selectedOption = categoryOptions.find(c => c.value === selectedCategory);
            const label = selectedOption?.label;

            result = result.filter(o =>
                o.category === selectedCategory ||
                (label && o.category === label) ||
                o.category.toLowerCase().includes(selectedCategory.toLowerCase())
            )
        }

        // Filtre estat
        if (selectedStatus && selectedStatus !== 'all') {
            result = result.filter(o => o.status === selectedStatus)
        }

        setFilteredOfertes(result)

        // Stats
        const activeCount = ofertes.filter(o => o.status === 'published').length
        const pendingCount = ofertes.filter(o => o.status === 'pending').length
        const totalViews = ofertes.reduce((acc, curr) => acc + (curr.views || 0), 0)

        setStats({
            total: ofertes.length,
            actives: activeCount,
            pendents: pendingCount,
            views: totalViews
        })

    }, [ofertes, searchText, selectedCategory, selectedStatus, categoryOptions])

    const handleDelete = (id: number | string) => {
        if (confirm('Estàs segur que vols eliminar aquesta oferta?')) {
            const updated = ofertes.filter(o => o.id !== id)
            setOfertes(updated)
            localStorage.setItem('createdOfertas', JSON.stringify(updated))
        }
    }

    const clearFilters = () => {
        setSearchText('')
        setSelectedCategory('all')
        setSelectedStatus('all')
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* 1. Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Izquierda: Icono + Título */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Gift className="h-5 w-5 text-purple-600" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Gestió d'Ofertes</h1>
                                <p className="text-sm text-slate-600 mt-0.5">Administra les ofertes publicades a la plataforma</p>
                            </div>
                        </div>

                        {/* Derecha: Controles */}
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                                className={showFilters ? 'bg-slate-100 border-slate-300' : ''}
                            >
                                <Filter className="h-4 w-4" strokeWidth={1.5} />
                                <span className="hidden sm:inline ml-2">Filtres</span>
                            </Button>
                            <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                                <Download className="h-4 w-4" strokeWidth={1.5} />
                                <span className="hidden sm:inline ml-2">Excel</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                onClick={handleLoadMockData}
                            >
                                <Package className="h-4 w-4" strokeWidth={1.5} />
                                <span className="hidden sm:inline ml-2">Demo Data</span>
                            </Button>
                            <Button
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                                size="sm"
                                onClick={() => router.push('/gestio/ofertes/crear')}
                            >
                                <Plus className="h-4 w-4" strokeWidth={1.5} />
                                <span className="hidden sm:inline ml-2">Nova Oferta</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Breadcrumb */}
                <div className="px-6 pb-4">
                    <nav className="flex items-center gap-2 text-sm text-slate-500">
                        <span>Gestió</span>
                        <span>/</span>
                        <span className="text-slate-900 font-medium">Ofertes</span>
                    </nav>
                </div>
            </div>

            <div className="p-6">
                {/* 2. Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Total Ofertes */}
                    <div className="bg-white rounded-lg border border-slate-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Total Ofertes</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100">
                                <Gift className="h-5 w-5 text-blue-600" strokeWidth={1.5} />
                            </div>
                        </div>
                    </div>
                    {/* Actives */}
                    <div className="bg-white rounded-lg border border-slate-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Ofertes Actives</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.actives}</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-100">
                                <CheckCircle className="h-5 w-5 text-green-600" strokeWidth={1.5} />
                            </div>
                        </div>
                    </div>
                    {/* Pendents */}
                    <div className="bg-white rounded-lg border border-slate-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Pendent Revisió</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.pendents}</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-100">
                                <Clock className="h-5 w-5 text-amber-600" strokeWidth={1.5} />
                            </div>
                        </div>
                    </div>
                    {/* Vistes */}
                    <div className="bg-white rounded-lg border border-slate-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Visualitzacions</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.views}</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-100">
                                <Eye className="h-5 w-5 text-purple-600" strokeWidth={1.5} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Panel de Filtros */}
                {showFilters && (
                    <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Búsqueda */}
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Cercar per títol, empresa..."
                                    className="pl-9"
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                />
                            </div>

                            {/* Categoria */}
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Totes les categories</SelectItem>
                                    {categoryOptions.map(cat => (
                                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Estat */}
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Estat" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tots els estats</SelectItem>
                                    {Object.entries(statusConfig).map(([key, config]) => (
                                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Netejar */}
                            <Button variant="ghost" onClick={clearFilters} className="text-slate-600">
                                <X className="h-4 w-4 mr-2" />
                                Netejar filtres
                            </Button>
                        </div>
                    </div>
                )}

                {/* 4. Tabla de Ofertes */}
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Ofertes ({filteredOfertes.length})
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                <tr>

                                    <th className="px-6 py-3">Oferta</th>
                                    <th className="px-6 py-3">Empresa</th>
                                    <th className="px-6 py-3">Categoria</th>
                                    <th className="px-6 py-3">Preu</th>
                                    <th className="px-6 py-3">Validesa</th>
                                    <th className="px-6 py-3 text-center">Vistes</th>
                                    <th className="px-6 py-3 text-right">Accions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredOfertes.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                            <Package className="h-12 w-12 mx-auto text-slate-300 mb-3" strokeWidth={1} />
                                            <p className="text-lg font-medium text-slate-900">No s'han trobat ofertes</p>
                                            <p className="text-sm mt-1 mb-4">No hi ha ofertes que coincideixin amb els filtres aplicats.</p>
                                            <Button variant="outline" onClick={clearFilters}>
                                                Netejar filtres
                                            </Button>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOfertes.map((oferta) => {
                                        const status = statusConfig[oferta.status] || statusConfig.draft
                                        return (
                                            <tr key={oferta.id} className="hover:bg-slate-50 transition-colors group">

                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-slate-900">{oferta.title}</span>
                                                        <span className={cn(
                                                            "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium w-fit mt-1",
                                                            status.bg,
                                                            status.text
                                                        )}>
                                                            {status.label}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="h-4 w-4 text-slate-400" />
                                                        <span>{oferta.company?.name || '-'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={cn(
                                                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                                        getCategoryColors(oferta.category)
                                                    )}>
                                                        {getCategoryLabel(oferta.category)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-slate-900">
                                                            {oferta.isFree ? 'Gratuït' : `${oferta.offerPrice}€`}
                                                        </span>
                                                        {!oferta.isFree && oferta.originalPrice > oferta.offerPrice && (
                                                            <span className="text-xs text-slate-400 line-through">
                                                                {oferta.originalPrice}€
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">
                                                    {oferta.validUntil ? new Date(oferta.validUntil).toLocaleDateString() : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-center text-slate-600">
                                                    {oferta.views || 0}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-slate-500 hover:text-blue-600"
                                                            onClick={() => router.push(`/gestio/ofertes/${oferta.id}`)}
                                                        >
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-slate-500 hover:text-amber-600"
                                                            onClick={() => router.push(`/gestio/ofertes/${oferta.id}/editar`)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-slate-500 hover:text-red-600"
                                                            onClick={() => handleDelete(oferta.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
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
            </div>
        </div>
    )
}
