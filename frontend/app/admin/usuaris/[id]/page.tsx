'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft,
    User,
    Mail,
    Shield,
    Building2,
    Calendar,
    Clock,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    AlertCircle,
    Key,
    MoreHorizontal,
    Activity,
    Ban,
    Unlock,
    Send
} from 'lucide-react'

// Reutilitzar tipus i configs de la pàgina de llistat
type UserRole =
    | 'SUPER_ADMIN'
    | 'ADMIN'
    | 'ADMIN_GESTIO'
    | 'ADMIN_ADMINISTRACIONS'
    | 'CRM_COMERCIAL'
    | 'CRM_CONTINGUT'
    | 'CRM_ADMINISTRACIONS'
    | 'GESTOR_ESTANDARD'
    | 'GESTOR_ESTRATEGIC'
    | 'GESTOR_ENTERPRISE'
    | 'MODERATOR'
    | 'COMPANY'
    | 'ADMINISTRATION'
    | 'USER'

interface UserDetail {
    id: string
    email: string
    name: string | null
    image: string | null
    role: UserRole
    userType: string
    isActive: boolean
    isEmailVerified: boolean
    communityId: string | null
    communityName?: string
    cargo: string | null
    createdAt: string
    updatedAt: string
    lastLogin: string | null
    // Estadístiques
    stats: {
        leadsAssignats: number
        tasquesCompletades: number
        empresesGestionades: number
        logsActivitat: number
    }
    // Activitat recent
    recentActivity: {
        id: string
        action: string
        description: string
        createdAt: string
    }[]
}

const ROLE_CONFIG: Record<UserRole, { label: string; color: string; bg: string }> = {
    SUPER_ADMIN: { label: 'Super Admin', color: 'text-red-700', bg: 'bg-red-100' },
    ADMIN: { label: 'Admin', color: 'text-red-600', bg: 'bg-red-50' },
    ADMIN_GESTIO: { label: 'Admin Gestió', color: 'text-orange-700', bg: 'bg-orange-100' },
    ADMIN_ADMINISTRACIONS: { label: 'Admin Administracions', color: 'text-emerald-700', bg: 'bg-emerald-100' },
    CRM_COMERCIAL: { label: 'CRM Comercial', color: 'text-purple-700', bg: 'bg-purple-100' },
    CRM_CONTINGUT: { label: 'CRM Contingut', color: 'text-indigo-700', bg: 'bg-indigo-100' },
    CRM_ADMINISTRACIONS: { label: 'CRM Administracions', color: 'text-green-700', bg: 'bg-green-100' },
    GESTOR_ESTANDARD: { label: 'Gestor Estàndard', color: 'text-blue-700', bg: 'bg-blue-100' },
    GESTOR_ESTRATEGIC: { label: 'Gestor Estratègic', color: 'text-cyan-700', bg: 'bg-cyan-100' },
    GESTOR_ENTERPRISE: { label: 'Gestor Enterprise', color: 'text-teal-700', bg: 'bg-teal-100' },
    MODERATOR: { label: 'Moderador', color: 'text-amber-700', bg: 'bg-amber-100' },
    COMPANY: { label: 'Empresa', color: 'text-indigo-700', bg: 'bg-indigo-100' },
    ADMINISTRATION: { label: 'Adm. Pública', color: 'text-emerald-700', bg: 'bg-emerald-100' },
    USER: { label: 'Usuari', color: 'text-slate-700', bg: 'bg-slate-100' },
}

export default function DetallUsuariPage() {
    const params = useParams()
    const router = useRouter()
    const userId = params.id as string

    const [user, setUser] = useState<UserDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const loadUser = async () => {
            setLoading(true)
            try {
                const response = await fetch(`/api/admin/users/${userId}`)
                const data = await response.json()
                
                if (data.success && data.user) {
                    setUser(data.user)
                } else {
                    setError(data.error || 'Error carregant usuari')
                }
            } catch (err) {
                console.error('Error carregant usuari:', err)
                setError('Error carregant usuari')
            } finally {
                setLoading(false)
            }
        }

        loadUser()
    }, [userId])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false)
            }
        }

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showDropdown])

    const handleToggleStatus = async () => {
        if (!user) return
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !user.isActive })
            })
            const data = await response.json()
            if (data.success) {
                setUser(prev => prev ? { ...prev, isActive: !prev.isActive } : null)
            } else {
                alert(data.error || 'Error canviant estat')
            }
        } catch (err) {
            console.error('Error:', err)
            alert('Error canviant estat de l\'usuari')
        }
    }

    const handleResetPassword = async () => {
        // Por ahora solo muestra mensaje - implementar email más adelante
        alert('Funcionalitat de reset password pendent d\'implementar amb servei de correu')
    }

    const handleDelete = async () => {
        if (!user) return
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE'
            })
            const data = await response.json()
            if (data.success) {
                router.push('/admin/usuaris')
            } else {
                alert(data.error || 'Error eliminant usuari')
            }
        } catch (err) {
            console.error('Error:', err)
            alert('Error eliminant usuari')
        }
        setShowDeleteModal(false)
    }

    const handleResendVerification = async () => {
        // Por ahora solo muestra mensaje - implementar email más adelante
        alert('Funcionalitat de reenviar verificació pendent d\'implementar amb servei de correu')
    }

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'Mai'
        return new Date(dateStr).toLocaleString('ca-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    if (loading) {
        return (
            <div className="p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 w-48 bg-slate-200 rounded" />
                        <div className="h-64 bg-slate-200 rounded-xl" />
                    </div>
                </div>
            </div>
        )
    }

    if (error || !user) {
        return (
            <div className="p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
                        <p className="text-red-600">{error || 'Usuari no trobat'}</p>
                        <Link
                            href="/admin/usuaris"
                            className="inline-flex items-center gap-2 mt-4 text-red-700 hover:text-red-800"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Tornar al llistat
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    const roleConfig = ROLE_CONFIG[user.role]
    const initials = user.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : user.email[0].toUpperCase()

    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/usuaris"
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-slate-500" strokeWidth={1.5} />
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-medium">
                                {initials}
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-xl font-semibold text-slate-900">{user.name || 'Sense nom'}</h1>
                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${roleConfig.bg} ${roleConfig.color}`}>
                                        {roleConfig.label}
                                    </span>
                                </div>
                                <p className="text-slate-500">{user.email}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/admin/usuaris/${user.id}/editar`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            <Edit className="h-4 w-4" strokeWidth={1.5} />
                            Editar
                        </Link>
                        <div className="relative" ref={dropdownRef}>
                            <button 
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <MoreHorizontal className="h-5 w-5 text-slate-500" strokeWidth={1.5} />
                            </button>
                            
                            {showDropdown && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                setShowDropdown(false)
                                                // TODO: Implementar funcionalidad de enviar mensaje
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                        >
                                            <Send className="h-4 w-4" strokeWidth={1.5} />
                                            Enviar mensaje
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowDropdown(false)
                                                // TODO: Implementar funcionalidad de resetear contraseña
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                        >
                                            <Key className="h-4 w-4" strokeWidth={1.5} />
                                            Resetear contraseña
                                        </button>
                                        <div className="border-t border-slate-200 my-1"></div>
                                        <button
                                            onClick={() => {
                                                setShowDropdown(false)
                                                // TODO: Implementar funcionalidad de ver logs de actividad
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                        >
                                            <Activity className="h-4 w-4" strokeWidth={1.5} />
                                            Ver logs de actividad
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                {!user.isEmailVerified && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-600" strokeWidth={1.5} />
                            <div>
                                <p className="font-medium text-amber-800">Email no verificat</p>
                                <p className="text-sm text-amber-700">L'usuari encara no ha verificat el seu email</p>
                            </div>
                        </div>
                        <button
                            onClick={handleResendVerification}
                            className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                        >
                            Reenviar verificació
                        </button>
                    </div>
                )}

                {!user.isActive && (
                    <div className="bg-slate-100 border border-slate-300 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Ban className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
                            <div>
                                <p className="font-medium text-slate-800">Usuari desactivat</p>
                                <p className="text-sm text-slate-600">Aquest usuari no pot accedir al sistema</p>
                            </div>
                        </div>
                        <button
                            onClick={handleToggleStatus}
                            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Activar usuari
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Columna principal */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Informació */}
                        <div className="bg-white border border-slate-200 rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">Informació</h2>
                            <dl className="grid grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm text-slate-500">Email</dt>
                                    <dd className="font-medium text-slate-900 flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                                        {user.email}
                                        {user.isEmailVerified && (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        )}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-slate-500">Rol</dt>
                                    <dd className="font-medium text-slate-900 flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                                        {roleConfig.label}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-slate-500">Tipus d'usuari</dt>
                                    <dd className="font-medium text-slate-900">{user.userType}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-slate-500">Càrrec</dt>
                                    <dd className="font-medium text-slate-900">{user.cargo || '-'}</dd>
                                </div>
                                {user.communityName && (
                                    <div className="col-span-2">
                                        <dt className="text-sm text-slate-500">Comunitat</dt>
                                        <dd className="font-medium text-slate-900 flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                                            {user.communityName}
                                        </dd>
                                    </div>
                                )}
                                <div>
                                    <dt className="text-sm text-slate-500">Registrat</dt>
                                    <dd className="font-medium text-slate-900 flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                                        {formatDate(user.createdAt)}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-slate-500">Última connexió</dt>
                                    <dd className="font-medium text-slate-900 flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                                        {formatDate(user.lastLogin)}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Activitat recent */}
                        <div className="bg-white border border-slate-200 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-slate-900">Activitat recent</h2>
                                <Link
                                    href={`/admin/logs?userId=${user.id}`}
                                    className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                    Veure tot
                                </Link>
                            </div>
                            <div className="space-y-4">
                                {user.recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-3">
                                        <div className="p-1.5 bg-slate-100 rounded-lg">
                                            <Activity className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-slate-900">{activity.description}</p>
                                            <p className="text-xs text-slate-500">{formatDate(activity.createdAt)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Columna lateral */}
                    <div className="space-y-6">
                        {/* Estadístiques */}
                        <div className="bg-white border border-slate-200 rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">Estadístiques</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500">Leads assignats</span>
                                    <span className="font-medium text-slate-900">{user.stats.leadsAssignats}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500">Tasques completades</span>
                                    <span className="font-medium text-slate-900">{user.stats.tasquesCompletades}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500">Empreses gestionades</span>
                                    <span className="font-medium text-slate-900">{user.stats.empresesGestionades}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500">Accions registrades</span>
                                    <span className="font-medium text-slate-900">{user.stats.logsActivitat}</span>
                                </div>
                            </div>
                        </div>

                        {/* Accions ràpides */}
                        <div className="bg-white border border-slate-200 rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">Accions</h2>
                            <div className="space-y-2">
                                <button
                                    onClick={handleResetPassword}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                    <Key className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                                    Restablir contrasenya
                                </button>
                                <button
                                    className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                    <Send className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                                    Enviar missatge
                                </button>
                                {user.isActive ? (
                                    <button
                                        onClick={handleToggleStatus}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                                    >
                                        <Ban className="h-4 w-4" strokeWidth={1.5} />
                                        Desactivar usuari
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleToggleStatus}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                                    >
                                        <Unlock className="h-4 w-4" strokeWidth={1.5} />
                                        Activar usuari
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                                    Eliminar usuari
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal eliminar */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Eliminar usuari?</h3>
                        <p className="text-slate-600 mb-6">
                            Aquesta acció no es pot desfer. S'eliminaran totes les dades associades a aquest usuari.
                        </p>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
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
