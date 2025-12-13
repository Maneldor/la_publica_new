'use client'

import { useState, useEffect } from 'react'
import {
    Shield,
    Users,
    ChevronDown,
    ChevronRight,
    Check,
    X,
    Info,
    Building2,
    MessageSquare,
    FileText,
    Settings,
    Tag,
    UserCog,
    Megaphone,
    Landmark,
    Plus,
    Copy,
    Edit,
    Trash2,
    RefreshCw,
    Search
} from 'lucide-react'
import Link from 'next/link'

// Mapatge d'icones
const ICON_MAP: Record<string, React.ElementType> = {
    Shield, Users, Building2, MessageSquare, FileText, Settings,
    Tag, UserCog, Megaphone, Landmark,
}

interface Permission {
    id: string
    key: string
    label: string
    description: string | null
    category: {
        id: string
        name: string
        label: string
        icon: string
    }
}

interface RolePermission {
    permission: Permission
}

interface Role {
    id: string
    name: string
    label: string
    description: string | null
    color: string
    icon: string
    dashboard: string | null
    isSystem: boolean
    copiedFromId: string | null
    copiedFrom?: { label: string } | null
    permissions: RolePermission[]
    _count: { users: number }
}

interface PermissionCategory {
    id: string
    name: string
    label: string
    icon: string
    permissions: {
        id: string
        key: string
        label: string
        description: string | null
    }[]
}

export default function RolsPermisosPage() {
    const [roles, setRoles] = useState<Role[]>([])
    const [permissionCategories, setPermissionCategories] = useState<PermissionCategory[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [expandedRole, setExpandedRole] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<'cards' | 'matrix'>('cards')
    const [showCopyModal, setShowCopyModal] = useState<Role | null>(null)
    const [showDeleteModal, setShowDeleteModal] = useState<Role | null>(null)

    // Carregar dades
    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        setError(null)
        try {
            const [rolesRes, permsRes] = await Promise.all([
                fetch('/api/admin/roles'),
                fetch('/api/admin/permissions'),
            ])

            if (!rolesRes.ok) {
                const errData = await rolesRes.json().catch(() => ({}))
                throw new Error(errData.error || `Error carregant rols: ${rolesRes.status} ${rolesRes.statusText}`)
            }

            if (!permsRes.ok) {
                const errData = await permsRes.json().catch(() => ({}))
                throw new Error(errData.error || `Error carregant permisos: ${permsRes.status} ${permsRes.statusText}`)
            }

            const rolesData = await rolesRes.json()
            const permsData = await permsRes.json()

            setRoles(rolesData)
            setPermissionCategories(permsData)
        } catch (error) {
            console.error('Error carregant dades:', error)
            setError(error instanceof Error ? error.message : 'Error desconegut al carregar dades')
        } finally {
            setLoading(false)
        }
    }

    // Agrupar rols
    const groupedRoles = {
        'Administradors': roles.filter(r => r.name.includes('ADMIN') || r.name === 'SUPER_ADMIN'),
        'Equip CRM': roles.filter(r => r.name.includes('CRM')),
        'Gestors Comercials': roles.filter(r => r.name.includes('GESTOR')),
        'Usuaris amb Dashboard': roles.filter(r => ['COMPANY', 'ADMINISTRATION'].includes(r.name)),
        'Altres': roles.filter(r => ['MODERATOR', 'USER'].includes(r.name)),
        'Personalitzats': roles.filter(r => !r.isSystem),
    }

    const totalUsers = roles.reduce((sum, role) => sum + role._count.users, 0)
    const totalPermissions = permissionCategories.reduce((sum, cat) => sum + cat.permissions.length, 0)

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <RefreshCw className="h-8 w-8 text-slate-400 animate-spin" />
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <div className="flex justify-center mb-4">
                        <Shield className="h-12 w-12 text-red-500" strokeWidth={1} />
                    </div>
                    <h3 className="text-lg font-semibold text-red-700 mb-2">Error carregant dades</h3>
                    <p className="text-red-600 mb-6">{error}</p>
                    <button
                        onClick={loadData}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Reintentar
                    </button>
                    <div className="mt-8 text-left max-w-lg mx-auto bg-white p-4 rounded-lg border border-red-100">
                        <p className="text-xs font-mono text-slate-500 mb-2">Debug Info:</p>
                        <ul className="text-xs text-slate-600 list-disc pl-4 space-y-1">
                            <li>Endpoint: /api/admin/roles</li>
                            <li>Check console for full error details</li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                        <Shield className="h-6 w-6 text-slate-600" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Rols i Permisos</h1>
                        <p className="text-slate-500">Configuració dinàmica de rols i permisos del sistema</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode('cards')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'cards'
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            Targetes
                        </button>
                        <button
                            onClick={() => setViewMode('matrix')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'matrix'
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            Matriu
                        </button>
                    </div>
                    <Link
                        href="/admin/rols/crear"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="h-4 w-4" strokeWidth={1.5} />
                        Nou rol
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <p className="text-sm text-slate-500">Total rols</p>
                    <p className="text-2xl font-semibold text-slate-900">{roles.length}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <p className="text-sm text-slate-500">Total usuaris</p>
                    <p className="text-2xl font-semibold text-slate-900">{totalUsers.toLocaleString()}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <p className="text-sm text-slate-500">Categories permisos</p>
                    <p className="text-2xl font-semibold text-slate-900">{permissionCategories.length}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <p className="text-sm text-slate-500">Total permisos</p>
                    <p className="text-2xl font-semibold text-slate-900">{totalPermissions}</p>
                </div>
            </div>

            {/* Vista Cards */}
            {viewMode === 'cards' && (
                <div className="space-y-8">
                    {Object.entries(groupedRoles).map(([groupName, groupRoles]) => {
                        if (groupRoles.length === 0) return null

                        return (
                            <div key={groupName}>
                                <h2 className="text-lg font-semibold text-slate-900 mb-4">{groupName}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {groupRoles.map((role) => {
                                        const RoleIcon = ICON_MAP[role.icon] || Users
                                        const isExpanded = expandedRole === role.id
                                        const colorClasses = getColorClasses(role.color)

                                        return (
                                            <div
                                                key={role.id}
                                                className={`bg-white border rounded-xl overflow-hidden transition-all ${colorClasses.border}`}
                                            >
                                                {/* Header */}
                                                <div className="p-4 flex items-start gap-4">
                                                    <button
                                                        onClick={() => setExpandedRole(isExpanded ? null : role.id)}
                                                        className="flex-1 flex items-start gap-4 text-left"
                                                    >
                                                        <div className={`p-2 rounded-lg ${colorClasses.bg}`}>
                                                            <RoleIcon className={`h-5 w-5 ${colorClasses.text}`} strokeWidth={1.5} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <h3 className="font-semibold text-slate-900">{role.label}</h3>
                                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorClasses.bg} ${colorClasses.text}`}>
                                                                    {role._count.users} usuaris
                                                                </span>
                                                                {role.isSystem && (
                                                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                                        Sistema
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-slate-500 mt-1">{role.description}</p>
                                                            {role.dashboard && (
                                                                <p className="text-xs text-blue-600 mt-1">Dashboard: {role.dashboard}</p>
                                                            )}
                                                            {role.copiedFrom && (
                                                                <p className="text-xs text-slate-400 mt-1">
                                                                    Copiat de: {role.copiedFrom.label}
                                                                </p>
                                                            )}
                                                            <p className="text-xs text-slate-400 mt-2">
                                                                {role.permissions.length} permisos assignats
                                                            </p>
                                                        </div>
                                                        {isExpanded ? (
                                                            <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0" strokeWidth={1.5} />
                                                        ) : (
                                                            <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0" strokeWidth={1.5} />
                                                        )}
                                                    </button>

                                                    {/* Accions */}
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => setShowCopyModal(role)}
                                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Copiar rol"
                                                        >
                                                            <Copy className="h-4 w-4" strokeWidth={1.5} />
                                                        </button>
                                                        {!role.isSystem && (
                                                            <>
                                                                <Link
                                                                    href={`/admin/rols/${role.id}/editar`}
                                                                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                                    title="Editar rol"
                                                                >
                                                                    <Edit className="h-4 w-4" strokeWidth={1.5} />
                                                                </Link>
                                                                <button
                                                                    onClick={() => setShowDeleteModal(role)}
                                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Eliminar rol"
                                                                    disabled={role._count.users > 0}
                                                                >
                                                                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Permisos expandits */}
                                                {isExpanded && (
                                                    <div className="border-t border-slate-100 p-4 bg-slate-50">
                                                        {role.permissions.length === 0 ? (
                                                            <p className="text-sm text-slate-500 italic">
                                                                Aquest rol només té accés bàsic de visualització
                                                            </p>
                                                        ) : (
                                                            <div className="space-y-3">
                                                                {permissionCategories.map((category) => {
                                                                    const categoryPermissions = role.permissions.filter(
                                                                        rp => rp.permission.category.id === category.id
                                                                    )
                                                                    if (categoryPermissions.length === 0) return null

                                                                    return (
                                                                        <div key={category.id}>
                                                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                                                                {category.label}
                                                                            </p>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {categoryPermissions.map((rp) => (
                                                                                    <span
                                                                                        key={rp.permission.id}
                                                                                        className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-700"
                                                                                        title={rp.permission.description || ''}
                                                                                    >
                                                                                        <Check className="h-3 w-3 text-green-500" strokeWidth={2} />
                                                                                        {rp.permission.label}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Vista Matriu */}
            {viewMode === 'matrix' && (
                <MatrixView roles={roles} categories={permissionCategories} />
            )}

            {/* Modal Copiar */}
            {showCopyModal && (
                <CopyRoleModal
                    role={showCopyModal}
                    onClose={() => setShowCopyModal(null)}
                    onSuccess={() => {
                        setShowCopyModal(null)
                        loadData()
                    }}
                />
            )}

            {/* Modal Eliminar */}
            {showDeleteModal && (
                <DeleteRoleModal
                    role={showDeleteModal}
                    onClose={() => setShowDeleteModal(null)}
                    onSuccess={() => {
                        setShowDeleteModal(null)
                        loadData()
                    }}
                />
            )}
        </div>
    )
}

// Helper per obtenir classes de color
function getColorClasses(color: string) {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
        red: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
        orange: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
        amber: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
        yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
        green: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
        emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
        teal: { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
        cyan: { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
        blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
        indigo: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
        purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
        slate: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
    }
    return colors[color] || colors.slate
}

// Component Vista Matriu
function MatrixView({ roles, categories }: { roles: Role[]; categories: PermissionCategory[] }) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="text-left px-4 py-3 font-semibold text-slate-700 sticky left-0 bg-slate-50 min-w-[200px] z-10">
                                Permís
                            </th>
                            {roles.map((role) => {
                                const colorClasses = getColorClasses(role.color)
                                return (
                                    <th
                                        key={role.id}
                                        className="px-2 py-3 text-center min-w-[90px]"
                                        title={role.description || ''}
                                    >
                                        <div className="flex flex-col items-center gap-1">
                                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${colorClasses.bg} ${colorClasses.text}`}>
                                                {role.label.length > 12 ? role.label.substring(0, 10) + '...' : role.label}
                                            </span>
                                            <span className="text-xs text-slate-400">{role._count.users}</span>
                                        </div>
                                    </th>
                                )
                            })}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {categories.map((category) => (
                            <>
                                <tr key={`cat-${category.id}`} className="bg-slate-50">
                                    <td
                                        colSpan={roles.length + 1}
                                        className="px-4 py-2 font-semibold text-slate-700 sticky left-0 bg-slate-50 z-10"
                                    >
                                        {category.label}
                                    </td>
                                </tr>
                                {category.permissions.map((perm) => (
                                    <tr key={perm.id} className="hover:bg-slate-50">
                                        <td
                                            className="px-4 py-2 text-slate-700 sticky left-0 bg-white z-10"
                                            title={perm.description || ''}
                                        >
                                            {perm.label}
                                        </td>
                                        {roles.map((role) => {
                                            const hasPermission = role.permissions.some(
                                                rp => rp.permission.key === perm.key
                                            )
                                            return (
                                                <td key={`${perm.id}-${role.id}`} className="px-2 py-2 text-center">
                                                    {hasPermission ? (
                                                        <Check className="h-4 w-4 text-green-500 mx-auto" strokeWidth={2} />
                                                    ) : (
                                                        <X className="h-4 w-4 text-slate-200 mx-auto" strokeWidth={2} />
                                                    )}
                                                </td>
                                            )
                                        })}
                                    </tr>
                                ))}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

// Modal Copiar Rol
function CopyRoleModal({
    role,
    onClose,
    onSuccess
}: {
    role: Role
    onClose: () => void
    onSuccess: () => void
}) {
    const [name, setName] = useState('')
    const [label, setLabel] = useState(`${role.label} (còpia)`)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/admin/roles/${role.id}/copy`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, label }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Error copiant rol')
            }

            onSuccess()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconegut')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Copiar rol: {role.label}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Identificador (sense espais)
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                            placeholder="GESTOR_GESTIO"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Nom visible
                        </label>
                        <input
                            type="text"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="Gestor Gestió"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                    </div>

                    <p className="text-sm text-slate-500">
                        Es copiarà amb tots els permisos de {role.label} ({role.permissions.length} permisos).
                    </p>

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Cancel·lar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !name || !label}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Copiant...' : 'Copiar rol'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Modal Eliminar Rol
function DeleteRoleModal({
    role,
    onClose,
    onSuccess
}: {
    role: Role
    onClose: () => void
    onSuccess: () => void
}) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleDelete = async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/admin/roles/${role.id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Error eliminant rol')
            }

            onSuccess()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconegut')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Eliminar rol?</h3>
                <p className="text-slate-600 mb-4">
                    Estàs segur que vols eliminar el rol <strong>{role.label}</strong>?
                </p>

                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">
                        {error}
                    </div>
                )}

                <div className="flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        Cancel·lar
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Eliminant...' : 'Eliminar'}
                    </button>
                </div>
            </div>
        </div>
    )
}
