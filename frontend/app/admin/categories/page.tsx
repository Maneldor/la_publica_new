'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    FolderTree,
    Plus,
    Search,
    RefreshCw,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Tag,
    Utensils,
    Plane,
    ShoppingBag,
    Car,
    Home,
    Dumbbell,
    Palette,
    Briefcase,
    GraduationCap,
    Heart,
    Music,
    Camera,
    Wifi,
    Gift,
    Star,
    AlertCircle,
    X,
    Save,
    ToggleLeft,
    ToggleRight,
    ChevronDown,
    ChevronRight,
    Building2,
    MessageSquare,
    FileText,
    Megaphone,
    Users,
    Calendar,
    FolderOpen,
    Landmark,
    Box,
    Layers,
    Check,
    Sparkles
} from 'lucide-react'

// =====================
// CONFIGURACIÓ
// =====================

// Mapatge d'icones
const ICON_MAP: Record<string, React.ElementType> = {
    Tag,
    Utensils,
    Plane,
    ShoppingBag,
    Car,
    Home,
    Dumbbell,
    Palette,
    Briefcase,
    GraduationCap,
    Heart,
    Music,
    Camera,
    Wifi,
    Gift,
    Star,
    FolderTree,
    Building2,
    MessageSquare,
    FileText,
    Megaphone,
    Users,
    Calendar,
    FolderOpen,
    Landmark,
    Box,
    Layers,
    Folder: FolderTree,
    Sparkles,
}

const AVAILABLE_ICONS = Object.keys(ICON_MAP)

// Colors disponibles
const COLOR_OPTIONS = [
    { name: 'slate', label: 'Gris', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
    { name: 'red', label: 'Vermell', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    { name: 'orange', label: 'Taronja', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
    { name: 'amber', label: 'Ambre', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
    { name: 'yellow', label: 'Groc', bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
    { name: 'lime', label: 'Llima', bg: 'bg-lime-100', text: 'text-lime-700', border: 'border-lime-200' },
    { name: 'green', label: 'Verd', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    { name: 'emerald', label: 'Maragda', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
    { name: 'teal', label: 'Blau-verd', bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
    { name: 'cyan', label: 'Cian', bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
    { name: 'blue', label: 'Blau', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    { name: 'indigo', label: 'Indi', bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
    { name: 'purple', label: 'Porpra', bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
    { name: 'pink', label: 'Rosa', bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
]

// =====================
// TIPUS
// =====================

interface SystemComponent {
    id: string
    code: string
    name: string
    namePlural: string
    description: string | null
    icon: string
    color: string
    supportsCategorization: boolean
    isCore: boolean
    isActive: boolean
}

interface CategoryScope {
    id: string
    name: string
    label: string
    description: string | null
    icon: string
    color: string
    order: number
    isSystem: boolean
    isActive: boolean
    components: SystemComponent[]
    categoriesCount: number
    activeCategoriesCount: number
}

interface Category {
    id: string
    scopeId: string
    name: string
    slug: string
    description: string | null
    icon: string | null
    color: string
    order: number
    isActive: boolean
    isFeatured: boolean
    parentId: string | null
    scope?: {
        id: string
        name: string
        label: string
    }
    parent?: {
        id: string
        name: string
    } | null
    _count?: {
        children: number
    }
}

// =====================
// HELPERS
// =====================

function getColorClasses(color: string | null) {
    return COLOR_OPTIONS.find(c => c.name === color) || COLOR_OPTIONS[0]
}

function getIcon(iconName: string | null) {
    return ICON_MAP[iconName || ''] || Tag
}

// =====================
// COMPONENT PRINCIPAL
// =====================

export default function CategoriesPage() {
    // Estats principals
    const [components, setComponents] = useState<SystemComponent[]>([])
    const [scopes, setScopes] = useState<CategoryScope[]>([])
    const [categoriesByScope, setCategoriesByScope] = useState<Record<string, Category[]>>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Estats d'expansió
    const [expandedScopes, setExpandedScopes] = useState<string[]>([])

    // Cerca
    const [search, setSearch] = useState('')

    // Modals
    const [showCreateScopeModal, setShowCreateScopeModal] = useState(false)
    const [editingScope, setEditingScope] = useState<CategoryScope | null>(null)
    const [deletingScope, setDeletingScope] = useState<CategoryScope | null>(null)
    const [creatingCategoryForScope, setCreatingCategoryForScope] = useState<CategoryScope | null>(null)
    const [editingCategory, setEditingCategory] = useState<{ category: Category; scope: CategoryScope } | null>(null)
    const [deletingCategory, setDeletingCategory] = useState<{ category: Category; scope: CategoryScope } | null>(null)

    // =====================
    // CARREGAR DADES
    // =====================

    const loadComponents = useCallback(async () => {
        try {
            const response = await fetch('/api/admin/system-components?categorizable=true')
            const data = await response.json()
            if (response.ok) {
                setComponents(data)
            }
        } catch (err) {
            console.error('Error carregant components:', err)
        }
    }, [])

    const loadScopes = useCallback(async () => {
        try {
            const response = await fetch('/api/admin/category-scopes')
            const data = await response.json()
            if (response.ok) {
                setScopes(data)
                // Expandir el primer scope per defecte
                if (data.length > 0 && expandedScopes.length === 0) {
                    setExpandedScopes([data[0].id])
                }
            }
        } catch (err) {
            console.error('Error carregant scopes:', err)
        }
    }, [])

    const loadCategoriesForScope = useCallback(async (scopeId: string) => {
        try {
            const response = await fetch(`/api/admin/categories?scopeId=${scopeId}`)
            const data = await response.json()
            if (response.ok) {
                setCategoriesByScope(prev => ({ ...prev, [scopeId]: data }))
            }
        } catch (err) {
            console.error('Error carregant categories:', err)
        }
    }, [])

    const loadAllData = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            await Promise.all([loadComponents(), loadScopes()])
        } catch (err) {
            setError('Error carregant dades')
        } finally {
            setLoading(false)
        }
    }, [loadComponents, loadScopes])

    useEffect(() => {
        loadAllData()
    }, [loadAllData])

    // Carregar categories quan s'expandeix un scope
    useEffect(() => {
        expandedScopes.forEach(scopeId => {
            if (!categoriesByScope[scopeId]) {
                loadCategoriesForScope(scopeId)
            }
        })
    }, [expandedScopes, categoriesByScope, loadCategoriesForScope])

    // =====================
    // HANDLERS
    // =====================

    const toggleScopeExpansion = (scopeId: string) => {
        setExpandedScopes(prev =>
            prev.includes(scopeId)
                ? prev.filter(id => id !== scopeId)
                : [...prev, scopeId]
        )
    }

    const toggleCategoryStatus = async (category: Category, scope: CategoryScope) => {
        try {
            const response = await fetch(`/api/admin/categories/${category.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !category.isActive }),
            })

            if (response.ok) {
                loadCategoriesForScope(scope.id)
            }
        } catch (err) {
            console.error('Error actualitzant categoria:', err)
        }
    }

    const toggleCategoryFeatured = async (category: Category, scope: CategoryScope) => {
        try {
            const response = await fetch(`/api/admin/categories/${category.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isFeatured: !category.isFeatured }),
            })

            if (response.ok) {
                loadCategoriesForScope(scope.id)
            }
        } catch (err) {
            console.error('Error actualitzant categoria:', err)
        }
    }

    // =====================
    // ESTADÍSTIQUES
    // =====================

    const stats = {
        totalCategories: scopes.reduce((sum, s) => sum + s.categoriesCount, 0),
        totalScopes: scopes.length,
        activeCategories: scopes.reduce((sum, s) => sum + s.activeCategoriesCount, 0),
        totalComponents: components.length,
    }

    // =====================
    // FILTRAR CATEGORIES
    // =====================

    const filterCategories = (categories: Category[]) => {
        if (!search) return categories
        const searchLower = search.toLowerCase()
        return categories.filter(cat =>
            cat.name.toLowerCase().includes(searchLower) ||
            cat.description?.toLowerCase().includes(searchLower) ||
            cat.slug.toLowerCase().includes(searchLower)
        )
    }

    // =====================
    // RENDERITZAT
    // =====================

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                        <FolderTree className="h-6 w-6 text-slate-600" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Categories</h1>
                        <p className="text-slate-500">Gestiona les categories de tots els components del sistema</p>
                    </div>
                </div>
                <button
                    onClick={loadAllData}
                    disabled={loading}
                    className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                    title="Refrescar"
                >
                    <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <p className="text-sm text-slate-500">Total categories</p>
                    <p className="text-2xl font-semibold text-slate-900">{stats.totalCategories}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <p className="text-sm text-slate-500">Tipus de categories</p>
                    <p className="text-2xl font-semibold text-slate-900">{stats.totalScopes}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <p className="text-sm text-slate-500">Categories actives</p>
                    <p className="text-2xl font-semibold text-green-600">{stats.activeCategories}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <p className="text-sm text-slate-500">Components disponibles</p>
                    <p className="text-2xl font-semibold text-slate-900">{stats.totalComponents}</p>
                </div>
            </div>

            {/* Crear nou tipus + Cerca */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <button
                    onClick={() => setShowCreateScopeModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    <Layers className="h-4 w-4" strokeWidth={1.5} />
                    Crear nou tipus de categoria
                </button>

                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cercar categories..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    />
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" strokeWidth={1.5} />
                    <div className="flex-1">
                        <p className="font-medium text-red-800">Error</p>
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                        <X className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
                    <RefreshCw className="h-8 w-8 mx-auto mb-3 text-slate-300 animate-spin" strokeWidth={1.5} />
                    <p className="text-slate-500">Carregant categories...</p>
                </div>
            ) : scopes.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
                    <Layers className="h-12 w-12 mx-auto mb-3 text-slate-200" strokeWidth={1.5} />
                    <p className="text-slate-500 mb-4">No hi ha tipus de categories</p>
                    <button
                        onClick={() => setShowCreateScopeModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <Plus className="h-4 w-4" strokeWidth={1.5} />
                        Crear el primer tipus
                    </button>
                </div>
            ) : (
                /* Llista de Scopes amb Categories */
                <div className="space-y-4">
                    {scopes.map((scope) => {
                        const ScopeIcon = getIcon(scope.icon)
                        const colorClasses = getColorClasses(scope.color)
                        const isExpanded = expandedScopes.includes(scope.id)
                        const categories = categoriesByScope[scope.id] || []
                        const filteredCats = filterCategories(categories)

                        return (
                            <div
                                key={scope.id}
                                className={`bg-white border rounded-xl overflow-hidden transition-all ${colorClasses.border}`}
                            >
                                {/* Header del Scope */}
                                <div className="p-4 flex items-center justify-between">
                                    <button
                                        onClick={() => toggleScopeExpansion(scope.id)}
                                        className="flex items-center gap-3 flex-1 text-left"
                                    >
                                        <div className={`p-2.5 rounded-lg ${colorClasses.bg}`}>
                                            <ScopeIcon className={`h-5 w-5 ${colorClasses.text}`} strokeWidth={1.5} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-semibold text-slate-900">{scope.label}</h3>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorClasses.bg} ${colorClasses.text}`}>
                                                    {scope.categoriesCount} categories
                                                </span>
                                                {scope.isSystem && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                        Sistema
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 mt-0.5">
                                                {scope.components.map(c => c.namePlural).join(', ')}
                                            </p>
                                        </div>
                                        {isExpanded ? (
                                            <ChevronDown className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
                                        ) : (
                                            <ChevronRight className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
                                        )}
                                    </button>

                                    {/* Accions del Scope */}
                                    <div className="flex items-center gap-1 ml-4">
                                        <button
                                            onClick={() => setCreatingCategoryForScope(scope)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                                        >
                                            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                                            Nova categoria
                                        </button>
                                        {!scope.isSystem && (
                                            <>
                                                <button
                                                    onClick={() => setEditingScope(scope)}
                                                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                    title="Editar tipus"
                                                >
                                                    <Edit className="h-4 w-4" strokeWidth={1.5} />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingScope(scope)}
                                                    disabled={scope.categoriesCount > 0}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                    title={scope.categoriesCount > 0 ? 'No es pot eliminar: té categories' : 'Eliminar tipus'}
                                                >
                                                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Categories del Scope */}
                                {isExpanded && (
                                    <div className="border-t border-slate-100">
                                        {categories.length === 0 ? (
                                            <div className="p-8 text-center bg-slate-50">
                                                <Tag className="h-8 w-8 mx-auto mb-2 text-slate-300" strokeWidth={1.5} />
                                                <p className="text-slate-500 text-sm">Encara no hi ha categories</p>
                                                <button
                                                    onClick={() => setCreatingCategoryForScope(scope)}
                                                    className="mt-2 text-sm text-red-600 hover:underline"
                                                >
                                                    Crear la primera categoria
                                                </button>
                                            </div>
                                        ) : filteredCats.length === 0 ? (
                                            <div className="p-8 text-center bg-slate-50">
                                                <Search className="h-8 w-8 mx-auto mb-2 text-slate-300" strokeWidth={1.5} />
                                                <p className="text-slate-500 text-sm">Cap categoria coincideix amb la cerca</p>
                                            </div>
                                        ) : (
                                            <table className="w-full">
                                                <thead className="bg-slate-50">
                                                    <tr>
                                                        <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Categoria</th>
                                                        <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Slug</th>
                                                        <th className="text-center px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Destacada</th>
                                                        <th className="text-center px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Estat</th>
                                                        <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Accions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {filteredCats.map((category) => {
                                                        const CatIcon = getIcon(category.icon)
                                                        const catColorClasses = getColorClasses(category.color)

                                                        return (
                                                            <tr key={category.id} className="hover:bg-slate-50 transition-colors">
                                                                {/* Categoria */}
                                                                <td className="px-4 py-3">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`p-1.5 rounded-lg ${catColorClasses.bg}`}>
                                                                            <CatIcon className={`h-4 w-4 ${catColorClasses.text}`} strokeWidth={1.5} />
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-medium text-slate-900">{category.name}</p>
                                                                            {category.description && (
                                                                                <p className="text-xs text-slate-500 truncate max-w-xs">
                                                                                    {category.description}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                {/* Slug */}
                                                                <td className="px-4 py-3">
                                                                    <code className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                                                        {category.slug}
                                                                    </code>
                                                                </td>

                                                                {/* Destacada */}
                                                                <td className="px-4 py-3 text-center">
                                                                    <button
                                                                        onClick={() => toggleCategoryFeatured(category, scope)}
                                                                        className={`p-1 rounded transition-colors ${category.isFeatured
                                                                            ? 'text-amber-500 hover:text-amber-600'
                                                                            : 'text-slate-300 hover:text-amber-400'
                                                                            }`}
                                                                        title={category.isFeatured ? 'Treure destacat' : 'Destacar'}
                                                                    >
                                                                        <Star
                                                                            className="h-4 w-4"
                                                                            strokeWidth={1.5}
                                                                            fill={category.isFeatured ? 'currentColor' : 'none'}
                                                                        />
                                                                    </button>
                                                                </td>

                                                                {/* Estat */}
                                                                <td className="px-4 py-3 text-center">
                                                                    <button
                                                                        onClick={() => toggleCategoryStatus(category, scope)}
                                                                        className="inline-flex items-center gap-1.5 transition-colors"
                                                                        title={category.isActive ? 'Desactivar' : 'Activar'}
                                                                    >
                                                                        {category.isActive ? (
                                                                            <>
                                                                                <ToggleRight className="h-5 w-5 text-green-600" strokeWidth={1.5} />
                                                                                <span className="text-xs font-medium text-green-700">Activa</span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <ToggleLeft className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
                                                                                <span className="text-xs font-medium text-slate-500">Inactiva</span>
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                </td>

                                                                {/* Accions */}
                                                                <td className="px-4 py-3">
                                                                    <div className="flex items-center justify-end gap-1">
                                                                        <button
                                                                            onClick={() => setEditingCategory({ category, scope })}
                                                                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                                            title="Editar"
                                                                        >
                                                                            <Edit className="h-4 w-4" strokeWidth={1.5} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setDeletingCategory({ category, scope })}
                                                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                            title="Eliminar"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )
                                                    })}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Modals */}
            {showCreateScopeModal && (
                <ScopeFormModal
                    mode="create"
                    components={components}
                    onClose={() => setShowCreateScopeModal(false)}
                    onSuccess={() => {
                        setShowCreateScopeModal(false)
                        loadScopes()
                    }}
                />
            )}

            {editingScope && (
                <ScopeFormModal
                    mode="edit"
                    scope={editingScope}
                    components={components}
                    onClose={() => setEditingScope(null)}
                    onSuccess={() => {
                        setEditingScope(null)
                        loadScopes()
                    }}
                />
            )}

            {deletingScope && (
                <DeleteScopeModal
                    scope={deletingScope}
                    onClose={() => setDeletingScope(null)}
                    onSuccess={() => {
                        setDeletingScope(null)
                        loadScopes()
                    }}
                />
            )}

            {creatingCategoryForScope && (
                <CategoryFormModal
                    mode="create"
                    scope={creatingCategoryForScope}
                    onClose={() => setCreatingCategoryForScope(null)}
                    onSuccess={() => {
                        loadCategoriesForScope(creatingCategoryForScope.id)
                        loadScopes() // Actualitzar comptadors
                        setCreatingCategoryForScope(null)
                    }}
                />
            )}

            {editingCategory && (
                <CategoryFormModal
                    mode="edit"
                    scope={editingCategory.scope}
                    category={editingCategory.category}
                    onClose={() => setEditingCategory(null)}
                    onSuccess={() => {
                        loadCategoriesForScope(editingCategory.scope.id)
                        setEditingCategory(null)
                    }}
                />
            )}

            {deletingCategory && (
                <DeleteCategoryModal
                    category={deletingCategory.category}
                    scope={deletingCategory.scope}
                    onClose={() => setDeletingCategory(null)}
                    onSuccess={() => {
                        loadCategoriesForScope(deletingCategory.scope.id)
                        loadScopes() // Actualitzar comptadors
                        setDeletingCategory(null)
                    }}
                />
            )}
        </div>
    )
}

// =====================
// MODAL SCOPE (CREAR/EDITAR)
// =====================

interface ScopeFormModalProps {
    mode: 'create' | 'edit'
    scope?: CategoryScope
    components: SystemComponent[]
    onClose: () => void
    onSuccess: () => void
}

function ScopeFormModal({ mode, scope, components, onClose, onSuccess }: ScopeFormModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    // NOU: Estat pel modal de crear component
    const [showCreateComponent, setShowCreateComponent] = useState(false)
    const [newComponentData, setNewComponentData] = useState({
        name: '',
        namePlural: '',
        description: '',
        icon: 'Box',
        color: 'slate',
    })
    const [creatingComponent, setCreatingComponent] = useState(false)
    const [localComponents, setLocalComponents] = useState(components)

    // Actualitzar localComponents quan canvien els props
    useEffect(() => {
        setLocalComponents(components)
    }, [components])

    const [formData, setFormData] = useState({
        label: scope?.label || '',
        description: scope?.description || '',
        icon: scope?.icon || 'Folder',
        color: scope?.color || 'slate',
        componentIds: scope?.components.map(c => c.id) || [],
    })

    const handleCreateComponent = async () => {
        if (!newComponentData.name.trim()) return

        setCreatingComponent(true)
        try {
            // Generar codi automàticament
            const code = newComponentData.name
                .toUpperCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^A-Z0-9]+/g, '_')
                .replace(/(^_|_$)/g, '')

            const response = await fetch('/api/admin/system-components', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    name: newComponentData.name.trim(),
                    namePlural: newComponentData.namePlural.trim() || newComponentData.name.trim(),
                    description: newComponentData.description.trim() || null,
                    icon: newComponentData.icon,
                    color: newComponentData.color,
                    supportsCategorization: true,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Error creant component')
            }

            // Afegir a la llista local i seleccionar-lo
            setLocalComponents(prev => [...prev, data])
            setFormData(prev => ({
                ...prev,
                componentIds: [...prev.componentIds, data.id],
            }))

            // Tancar modal i reset
            setShowCreateComponent(false)
            setNewComponentData({
                name: '',
                namePlural: '',
                description: '',
                icon: 'Box',
                color: 'slate',
            })
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Error creant component')
        } finally {
            setCreatingComponent(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const url = mode === 'create'
                ? '/api/admin/category-scopes'
                : `/api/admin/category-scopes/${scope?.id}`

            const response = await fetch(url, {
                method: mode === 'create' ? 'POST' : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (!response.ok) {
                if (data.details && Array.isArray(data.details)) {
                    throw new Error(data.details.join('. '))
                }
                throw new Error(data.error || 'Error guardant')
            }

            onSuccess()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconegut')
        } finally {
            setLoading(false)
        }
    }

    const toggleComponent = (componentId: string) => {
        setFormData(prev => ({
            ...prev,
            componentIds: prev.componentIds.includes(componentId)
                ? prev.componentIds.filter(id => id !== componentId)
                : [...prev.componentIds, componentId],
        }))
    }

    const colorClasses = getColorClasses(formData.color)
    const IconComponent = getIcon(formData.icon)

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">
                        {mode === 'create' ? 'Crear nou tipus de categoria' : 'Editar tipus de categoria'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                </div>

                {/* Formulari */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Error */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Preview */}
                    <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 mb-2">Vista prèvia:</p>
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-lg ${colorClasses.bg}`}>
                                <IconComponent className={`h-5 w-5 ${colorClasses.text}`} strokeWidth={1.5} />
                            </div>
                            <span className="font-medium text-slate-900">
                                {formData.label || 'Nom del tipus'}
                            </span>
                        </div>
                    </div>

                    {/* Nom */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Nom del tipus *
                        </label>
                        <input
                            type="text"
                            value={formData.label}
                            onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                            placeholder="Ex: Fòrums, Anuncis..."
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                            required
                            maxLength={100}
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
                            placeholder="Breu descripció del tipus de categories..."
                            rows={2}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                            maxLength={500}
                        />
                    </div>

                    {/* Components */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Components associats *
                        </label>
                        <p className="text-xs text-slate-500 mb-2">
                            Selecciona els components que utilitzaran aquestes categories
                        </p>
                        <div className="border border-slate-200 rounded-lg p-2">
                            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                                {localComponents.map((comp) => {
                                    const CompIcon = getIcon(comp.icon)
                                    const compColor = getColorClasses(comp.color)
                                    const isSelected = formData.componentIds.includes(comp.id)

                                    return (
                                        <label
                                            key={comp.id}
                                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-red-50 border border-red-200' : 'hover:bg-slate-50 border border-transparent'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleComponent(comp.id)}
                                                className="sr-only"
                                            />
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected
                                                ? 'bg-red-600 border-red-600 text-white'
                                                : 'border-slate-300'
                                                }`}>
                                                {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
                                            </div>
                                            <div className={`p-1 rounded ${compColor.bg}`}>
                                                <CompIcon className={`h-3.5 w-3.5 ${compColor.text}`} strokeWidth={1.5} />
                                            </div>
                                            <span className={`text-sm ${isSelected ? 'text-red-900 font-medium' : 'text-slate-700'}`}>
                                                {comp.namePlural}
                                            </span>
                                        </label>
                                    )
                                })}
                            </div>

                            {/* Botó per crear nou component */}
                            <div className="border-t border-slate-200 mt-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateComponent(true)}
                                    className="w-full flex items-center justify-center gap-2 p-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Plus className="h-4 w-4" strokeWidth={1.5} />
                                    Crear nou component
                                </button>
                            </div>
                        </div>
                        {formData.componentIds.length === 0 && (
                            <p className="text-xs text-red-600 mt-1">Selecciona almenys un component</p>
                        )}
                    </div>

                    {/* Color */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Color
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {COLOR_OPTIONS.map(color => (
                                <button
                                    key={color.name}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, color: color.name }))}
                                    className={`w-8 h-8 rounded-full ${color.bg} transition-all ${formData.color === color.name
                                        ? 'ring-2 ring-offset-2 ring-red-500 scale-110'
                                        : 'hover:scale-105'
                                        }`}
                                    title={color.label}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Icona */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Icona
                        </label>
                        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                            {AVAILABLE_ICONS.slice(0, 20).map((iconName) => {
                                const Icon = ICON_MAP[iconName]
                                return (
                                    <button
                                        key={iconName}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, icon: iconName }))}
                                        className={`p-2 rounded-lg border transition-all ${formData.icon === iconName
                                            ? 'border-red-500 bg-red-50 text-red-600 scale-110'
                                            : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:scale-105'
                                            }`}
                                        title={iconName}
                                    >
                                        <Icon className="h-4 w-4" strokeWidth={1.5} />
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Botons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                            Cancel·lar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.label.trim() || formData.componentIds.length === 0}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                                    {mode === 'create' ? 'Creant...' : 'Guardant...'}
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" strokeWidth={1.5} />
                                    {mode === 'create' ? 'Crear' : 'Guardar'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
                {/* Mini-modal crear component */}
                {showCreateComponent && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-slate-900">Nou component</h3>
                                <button
                                    onClick={() => setShowCreateComponent(false)}
                                    className="p-1 text-slate-400 hover:text-slate-600 rounded"
                                >
                                    <X className="h-4 w-4" strokeWidth={1.5} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {/* Nom */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Nom (singular) *
                                    </label>
                                    <input
                                        type="text"
                                        value={newComponentData.name}
                                        onChange={(e) => setNewComponentData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Ex: Encuesta, Wiki..."
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                    />
                                </div>

                                {/* Nom plural */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Nom (plural)
                                    </label>
                                    <input
                                        type="text"
                                        value={newComponentData.namePlural}
                                        onChange={(e) => setNewComponentData(prev => ({ ...prev, namePlural: e.target.value }))}
                                        placeholder="Ex: Encuestas, Wikis..."
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                    />
                                </div>

                                {/* Descripció */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Descripció
                                    </label>
                                    <input
                                        type="text"
                                        value={newComponentData.description}
                                        onChange={(e) => setNewComponentData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Breu descripció..."
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                    />
                                </div>

                                {/* Color i Icona en una fila */}
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Color */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Color</label>
                                        <div className="flex flex-wrap gap-1">
                                            {COLOR_OPTIONS.slice(0, 8).map(color => (
                                                <button
                                                    key={color.name}
                                                    type="button"
                                                    onClick={() => setNewComponentData(prev => ({ ...prev, color: color.name }))}
                                                    className={`w-6 h-6 rounded-full ${color.bg} transition-all ${newComponentData.color === color.name
                                                        ? 'ring-2 ring-offset-1 ring-red-500'
                                                        : ''
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Icona */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Icona</label>
                                        <div className="flex flex-wrap gap-1">
                                            {['Box', 'Folder', 'FileText', 'MessageSquare', 'Star', 'Tag', 'Layers', 'Users'].map(iconName => {
                                                const Icon = ICON_MAP[iconName] || Box
                                                return (
                                                    <button
                                                        key={iconName}
                                                        type="button"
                                                        onClick={() => setNewComponentData(prev => ({ ...prev, icon: iconName }))}
                                                        className={`p-1.5 rounded border transition-all ${newComponentData.icon === iconName
                                                            ? 'border-red-500 bg-red-50 text-red-600'
                                                            : 'border-slate-200 text-slate-500'
                                                            }`}
                                                    >
                                                        <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Botons */}
                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateComponent(false)}
                                    className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
                                >
                                    Cancel·lar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCreateComponent}
                                    disabled={creatingComponent || !newComponentData.name.trim()}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                >
                                    {creatingComponent ? (
                                        <>
                                            <RefreshCw className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
                                            Creant...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                                            Crear
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// =====================
// MODAL ELIMINAR SCOPE
// =====================

interface DeleteScopeModalProps {
    scope: CategoryScope
    onClose: () => void
    onSuccess: () => void
}

function DeleteScopeModal({ scope, onClose, onSuccess }: DeleteScopeModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleDelete = async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/admin/category-scopes/${scope.id}`, {
                method: 'DELETE',
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Error eliminant')
            }

            onSuccess()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconegut')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="h-6 w-6 text-red-600" strokeWidth={1.5} />
                </div>

                <h3 className="text-lg font-semibold text-slate-900 text-center mb-2">
                    Eliminar tipus de categoria?
                </h3>

                <p className="text-slate-600 text-center mb-4">
                    Estàs segur que vols eliminar <strong>"{scope.label}"</strong>?
                    <br />
                    <span className="text-sm text-slate-500">Aquesta acció no es pot desfer.</span>
                </p>

                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">
                        {error}
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                        Cancel·lar
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <RefreshCw className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                                Eliminant...
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                                Eliminar
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

// =====================
// MODAL CATEGORIA (CREAR/EDITAR)
// =====================

interface CategoryFormModalProps {
    mode: 'create' | 'edit'
    scope: CategoryScope
    category?: Category
    onClose: () => void
    onSuccess: () => void
}

function CategoryFormModal({ mode, scope, category, onClose, onSuccess }: CategoryFormModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        name: category?.name || '',
        description: category?.description || '',
        icon: category?.icon || 'Tag',
        color: category?.color || 'slate',
        isActive: category?.isActive ?? true,
        isFeatured: category?.isFeatured ?? false,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const url = mode === 'create'
                ? '/api/admin/categories'
                : `/api/admin/categories/${category?.id}`

            const body = mode === 'create'
                ? { ...formData, scopeId: scope.id }
                : formData

            const response = await fetch(url, {
                method: mode === 'create' ? 'POST' : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })

            const data = await response.json()

            if (!response.ok) {
                if (data.details && Array.isArray(data.details)) {
                    throw new Error(data.details.join('. '))
                }
                throw new Error(data.error || 'Error guardant categoria')
            }

            onSuccess()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconegut')
        } finally {
            setLoading(false)
        }
    }

    const colorClasses = getColorClasses(formData.color)
    const IconComponent = getIcon(formData.icon)

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            {mode === 'create' ? 'Nova categoria' : 'Editar categoria'}
                        </h2>
                        <p className="text-sm text-slate-500">en {scope.label}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                </div>

                {/* Formulari */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Error */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Preview */}
                    <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 mb-2">Vista prèvia:</p>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${colorClasses.bg}`}>
                                <IconComponent className={`h-5 w-5 ${colorClasses.text}`} strokeWidth={1.5} />
                            </div>
                            <span className="font-medium text-slate-900">
                                {formData.name || 'Nom de la categoria'}
                            </span>
                            {formData.isFeatured && (
                                <Star className="h-4 w-4 text-amber-500" fill="currentColor" strokeWidth={1.5} />
                            )}
                        </div>
                    </div>

                    {/* Nom */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Nom *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Ex: Restauració, Viatges..."
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                            required
                            maxLength={100}
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
                            placeholder="Breu descripció de la categoria..."
                            rows={2}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                            maxLength={500}
                        />
                    </div>

                    {/* Color */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Color
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {COLOR_OPTIONS.map(color => (
                                <button
                                    key={color.name}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, color: color.name }))}
                                    className={`w-8 h-8 rounded-full ${color.bg} transition-all ${formData.color === color.name
                                        ? 'ring-2 ring-offset-2 ring-red-500 scale-110'
                                        : 'hover:scale-105'
                                        }`}
                                    title={color.label}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Icona */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Icona
                        </label>
                        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                            {AVAILABLE_ICONS.map((iconName) => {
                                const Icon = ICON_MAP[iconName]
                                return (
                                    <button
                                        key={iconName}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, icon: iconName }))}
                                        className={`p-2 rounded-lg border transition-all ${formData.icon === iconName
                                            ? 'border-red-500 bg-red-50 text-red-600 scale-110'
                                            : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:scale-105'
                                            }`}
                                        title={iconName}
                                    >
                                        <Icon className="h-4 w-4" strokeWidth={1.5} />
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Opcions */}
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                                className="flex items-center gap-2"
                            >
                                {formData.isActive ? (
                                    <ToggleRight className="h-6 w-6 text-green-600" strokeWidth={1.5} />
                                ) : (
                                    <ToggleLeft className="h-6 w-6 text-slate-400" strokeWidth={1.5} />
                                )}
                                <span className="text-sm text-slate-700">Activa</span>
                            </button>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, isFeatured: !prev.isFeatured }))}
                                className="flex items-center gap-2"
                            >
                                <Star
                                    className={`h-5 w-5 ${formData.isFeatured ? 'text-amber-500' : 'text-slate-300'}`}
                                    fill={formData.isFeatured ? 'currentColor' : 'none'}
                                    strokeWidth={1.5}
                                />
                                <span className="text-sm text-slate-700">Destacada</span>
                            </button>
                        </label>
                    </div>

                    {/* Botons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                            Cancel·lar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.name.trim()}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                                    {mode === 'create' ? 'Creant...' : 'Guardant...'}
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" strokeWidth={1.5} />
                                    {mode === 'create' ? 'Crear' : 'Guardar'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// =====================
// MODAL ELIMINAR CATEGORIA
// =====================

interface DeleteCategoryModalProps {
    category: Category
    scope: CategoryScope
    onClose: () => void
    onSuccess: () => void
}

function DeleteCategoryModal({ category, scope, onClose, onSuccess }: DeleteCategoryModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleDelete = async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/admin/categories/${category.id}`, {
                method: 'DELETE',
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Error eliminant categoria')
            }

            onSuccess()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconegut')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="h-6 w-6 text-red-600" strokeWidth={1.5} />
                </div>

                <h3 className="text-lg font-semibold text-slate-900 text-center mb-2">
                    Eliminar categoria?
                </h3>

                <p className="text-slate-600 text-center mb-4">
                    Estàs segur que vols eliminar <strong>"{category.name}"</strong> de {scope.label}?
                    <br />
                    <span className="text-sm text-slate-500">Aquesta acció no es pot desfer.</span>
                </p>

                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">
                        {error}
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                        Cancel·lar
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <RefreshCw className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                                Eliminant...
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                                Eliminar
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
