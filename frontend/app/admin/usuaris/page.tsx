'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    Users,
    Plus,
    Search,
    Filter,
    Eye,
    Edit,
    Trash2,
    Download,
    ArrowUpDown,
    CheckCircle,
    XCircle,
    Clock,
    Shield,
    UserPlus,
    MoreHorizontal,
    Mail,
    RefreshCw,
    AlertTriangle,
    Loader2,
    UserX,
    UserCheck
} from 'lucide-react'

// Tipus basats en Prisma schema
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

type UserType = 'EMPLOYEE' | 'COMPANY_OWNER' | 'COMPANY_MEMBER' | 'ACCOUNT_MANAGER' | 'ADMIN'

interface User {
    id: string
    nick: string
    email: string
    name: string | null
    image: string | null
    role: UserRole
    userType: UserType
    isActive: boolean
    isEmailVerified: boolean
    communityId: string | null
    cargo: string | null
    createdAt: string
    lastLogin: string | null
}

// Configuració de rols (excloem COMPANY que es crea a /gestio/)
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

const USER_TYPE_CONFIG: Record<UserType, { label: string }> = {
    EMPLOYEE: { label: 'Empleat' },
    COMPANY_OWNER: { label: 'Propietari Empresa' },
    COMPANY_MEMBER: { label: 'Membre Empresa' },
    ACCOUNT_MANAGER: { label: 'Account Manager' },
    ADMIN: { label: 'Administrador' },
}

// Grups de rols per al filtre
const ROLE_GROUPS = {
    admins: ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO', 'ADMIN_ADMINISTRACIONS'],
    crm: ['CRM_COMERCIAL', 'CRM_CONTINGUT', 'CRM_ADMINISTRACIONS'],
    gestors: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE'],
    altres: ['MODERATOR', 'USER'],
}

export default function AdminUsuarisPage() {
    const router = useRouter()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState<string>('all')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [selectedUsers, setSelectedUsers] = useState<string[]>([])

    // Estado para el modal de confirmación de eliminación
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; user: User | null }>({
        open: false,
        user: null,
    })
    const [isDeleting, setIsDeleting] = useState(false)
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
        show: false,
        message: '',
        type: 'success'
    })

    // Estado para el modal de activar/desactivar
    const [toggleActiveModal, setToggleActiveModal] = useState<{
        open: boolean
        user: User | null
        action: 'activate' | 'deactivate'
    }>({
        open: false,
        user: null,
        action: 'deactivate',
    })
    const [isToggling, setIsToggling] = useState(false)

    // Función para cargar usuarios
    const loadUsers = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/admin/users')
            const data = await response.json()

            if (data.success && data.data?.users) {
                setUsers(data.data.users)
            } else {
                console.error('Error carregant usuaris:', data.error)
            }
        } catch (err) {
            console.error('Error carregant usuaris:', err)
        } finally {
            setLoading(false)
        }
    }

    // Carregar usuaris
    useEffect(() => {
        loadUsers()
    }, [])

    // Mostrar toast
    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ show: true, message, type })
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
    }

    // Función para eliminar usuario
    const handleDeleteUser = async () => {
        if (!deleteModal.user) return

        setIsDeleting(true)
        try {
            const res = await fetch(`/api/admin/users/${deleteModal.user.id}`, {
                method: 'DELETE',
            })

            if (res.ok) {
                showToast('Usuari eliminat correctament', 'success')
                loadUsers()
                setDeleteModal({ open: false, user: null })
            } else {
                const error = await res.json()
                showToast(error.error || 'Error eliminant usuari', 'error')
            }
        } catch (error) {
            console.error('Error:', error)
            showToast('Error de connexió', 'error')
        } finally {
            setIsDeleting(false)
        }
    }

    // Función para abrir modal de eliminación
    const openDeleteModal = (user: User) => {
        setDeleteModal({ open: true, user })
    }

    // Función para activar/desactivar usuario
    const handleToggleActive = async () => {
        if (!toggleActiveModal.user) return

        setIsToggling(true)
        try {
            const res = await fetch(`/api/admin/users/${toggleActiveModal.user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isActive: toggleActiveModal.action === 'activate'
                }),
            })

            if (res.ok) {
                showToast(
                    toggleActiveModal.action === 'activate'
                        ? 'Usuari activat correctament'
                        : 'Usuari desactivat correctament',
                    'success'
                )
                loadUsers()
                setToggleActiveModal({ open: false, user: null, action: 'deactivate' })
            } else {
                const error = await res.json()
                showToast(error.error || "Error canviant estat de l'usuari", 'error')
            }
        } catch (error) {
            console.error('Error:', error)
            showToast('Error de connexió', 'error')
        } finally {
            setIsToggling(false)
        }
    }

    // Función para abrir modal de activar/desactivar
    const openToggleActiveModal = (user: User) => {
        setToggleActiveModal({
            open: true,
            user,
            action: user.isActive ? 'deactivate' : 'activate'
        })
    }

    // Filtrar usuaris
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesRole = roleFilter === 'all' || user.role === roleFilter

        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'active' && user.isActive) ||
            (statusFilter === 'inactive' && !user.isActive) ||
            (statusFilter === 'unverified' && !user.isEmailVerified)

        return matchesSearch && matchesRole && matchesStatus
    })

    // Stats
    const stats = {
        total: users.length,
        admins: users.filter(u => ROLE_GROUPS.admins.includes(u.role)).length,
        crm: users.filter(u => ROLE_GROUPS.crm.includes(u.role)).length,
        gestors: users.filter(u => ROLE_GROUPS.gestors.includes(u.role)).length,
        empleats: users.filter(u => u.role === 'USER').length,
        actius: users.filter(u => u.isActive).length,
        administracions: users.filter(u => ['ADMIN_ADMINISTRACIONS', 'CRM_ADMINISTRACIONS'].includes(u.role)).length,
    }

    const toggleSelectAll = () => {
        if (selectedUsers.length === filteredUsers.length) {
            setSelectedUsers([])
        } else {
            setSelectedUsers(filteredUsers.map(u => u.id))
        }
    }

    const toggleSelectUser = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header de pàgina */}
            <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                        <Users className="h-6 w-6 text-slate-600" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Usuaris</h1>
                        <p className="text-slate-500">Gestiona tots els usuaris del sistema (excepte empreses)</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                        <Download className="h-4 w-4" strokeWidth={1.5} />
                        Exportar
                    </button>
                    <Link
                        href="/admin/usuaris/crear"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <UserPlus className="h-4 w-4" strokeWidth={1.5} />
                        Nou usuari
                    </Link>
                </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard title="Total" value={stats.total} icon={Users} />
                <StatCard title="Admins" value={stats.admins} icon={Shield} color="red" />
                <StatCard title="CRM" value={stats.crm} icon={Users} color="purple" />
                <StatCard title="Gestors" value={stats.gestors} icon={Users} color="blue" />
                <StatCard title="Empleats" value={stats.empleats} icon={Users} color="slate" />
                <StatCard title="Actius" value={stats.actius} icon={CheckCircle} color="green" />
            </div>

            {/* Filtres i cerca */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Cerca */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
                        <input
                            type="text"
                            placeholder="Cercar per nom o email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>

                    {/* Filtre rol */}
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white text-gray-700 text-sm min-w-[180px] cursor-pointer"
                    >
                        <option value="all">Tots els rols</option>
                        <optgroup label="Administradors">
                            <option value="SUPER_ADMIN">Super Admin</option>
                            <option value="ADMIN">Admin</option>
                            <option value="ADMIN_GESTIO">Admin Gestió</option>
                            <option value="ADMIN_ADMINISTRACIONS">Admin Administracions</option>
                        </optgroup>
                        <optgroup label="CRM">
                            <option value="CRM_COMERCIAL">CRM Comercial</option>
                            <option value="CRM_CONTINGUT">CRM Contingut</option>
                            <option value="CRM_ADMINISTRACIONS">CRM Administracions</option>
                        </optgroup>
                        <optgroup label="Gestors">
                            <option value="GESTOR_ESTANDARD">Gestor Estàndard</option>
                            <option value="GESTOR_ESTRATEGIC">Gestor Estratègic</option>
                            <option value="GESTOR_ENTERPRISE">Gestor Enterprise</option>
                        </optgroup>
                        <optgroup label="Altres">
                            <option value="MODERATOR">Moderador</option>
                            <option value="COMPANY">Empresa</option>
                            <option value="ADMINISTRATION">Adm. Pública</option>
                            <option value="USER">Usuari</option>
                        </optgroup>
                    </select>


                    {/* Filtre estat */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white text-gray-700 text-sm min-w-[160px] cursor-pointer"
                    >
                        <option value="all">Tots els estats</option>
                        <option value="active">Actius</option>
                        <option value="inactive">Inactius</option>
                        <option value="unverified">Email no verificat</option>
                    </select>

                    {/* Refresc */}
                    <button
                        onClick={() => window.location.reload()}
                        className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        <RefreshCw className="h-5 w-5 text-slate-500" strokeWidth={1.5} />
                    </button>
                </div>

                {/* Accions massives */}
                {selectedUsers.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-4">
                        <span className="text-sm text-slate-600">
                            {selectedUsers.length} usuari(s) seleccionat(s)
                        </span>
                        <button className="text-sm text-blue-600 hover:text-blue-700">
                            Activar
                        </button>
                        <button className="text-sm text-amber-600 hover:text-amber-700">
                            Desactivar
                        </button>
                        <button className="text-sm text-red-600 hover:text-red-700">
                            Eliminar
                        </button>
                    </div>
                )}
            </div>

            {/* Taula d'usuaris */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <RefreshCw className="h-8 w-8 text-slate-400 animate-spin mx-auto mb-4" />
                        <p className="text-slate-500">Carregant usuaris...</p>
                    </div>
                ) : (
                    <>
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                            onChange={toggleSelectAll}
                                            className="rounded border-slate-300"
                                        />
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        <button className="flex items-center gap-1 hover:text-slate-700">
                                            Usuari
                                            <ArrowUpDown className="h-3 w-3" />
                                        </button>
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Rol
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Càrrec
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Estat
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        <button className="flex items-center gap-1 hover:text-slate-700">
                                            Última connexió
                                            <ArrowUpDown className="h-3 w-3" />
                                        </button>
                                    </th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Accions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredUsers.map((user) => (
                                    <UserRow
                                        key={user.id}
                                        user={user}
                                        isSelected={selectedUsers.includes(user.id)}
                                        onToggleSelect={() => toggleSelectUser(user.id)}
                                        onDelete={openDeleteModal}
                                        onToggleActive={openToggleActiveModal}
                                    />
                                ))}
                            </tbody>
                        </table>

                        {/* Paginació */}
                        <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                Mostrant {filteredUsers.length} de {users.length} usuaris
                            </p>
                            <div className="flex items-center gap-2">
                                <button className="px-3 py-1 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50" disabled>
                                    Anterior
                                </button>
                                <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">1</button>
                                <button className="px-3 py-1 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">
                                    Següent
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
            {/* Modal de confirmación de eliminación */}
            {deleteModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Eliminar usuari</h3>
                                    <p className="text-gray-500 text-sm">Aquesta acció no es pot desfer</p>
                                </div>
                            </div>

                            <p className="text-gray-600 mb-6">
                                Estàs segur que vols eliminar l&apos;usuari <strong>{deleteModal.user?.name || deleteModal.user?.email}</strong>?
                                <br />
                                Es perdran totes les seves dades, publicacions i activitat.
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setDeleteModal({ open: false, user: null })}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    disabled={isDeleting}
                                >
                                    Cancel·lar
                                </button>
                                <button
                                    onClick={handleDeleteUser}
                                    disabled={isDeleting}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Eliminant...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            Eliminar
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Activar/Desactivar */}
            {toggleActiveModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                    toggleActiveModal.action === 'activate'
                                        ? 'bg-green-100'
                                        : 'bg-amber-100'
                                }`}>
                                    {toggleActiveModal.action === 'activate' ? (
                                        <UserCheck className="w-6 h-6 text-green-600" />
                                    ) : (
                                        <UserX className="w-6 h-6 text-amber-600" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {toggleActiveModal.action === 'activate' ? 'Activar usuari' : 'Desactivar usuari'}
                                    </h3>
                                    <p className="text-gray-500 text-sm">
                                        {toggleActiveModal.action === 'activate'
                                            ? "L'usuari podrà accedir al sistema"
                                            : "L'usuari no podrà accedir al sistema"}
                                    </p>
                                </div>
                            </div>

                            <p className="text-gray-600 mb-6">
                                Estàs segur que vols {toggleActiveModal.action === 'activate' ? 'activar' : 'desactivar'} l&apos;usuari{' '}
                                <strong>{toggleActiveModal.user?.name || toggleActiveModal.user?.email}</strong>?
                                {toggleActiveModal.action === 'deactivate' && (
                                    <>
                                        <br />
                                        <span className="text-amber-600">No podrà iniciar sessió fins que el tornis a activar.</span>
                                    </>
                                )}
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setToggleActiveModal({ open: false, user: null, action: 'deactivate' })}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    disabled={isToggling}
                                >
                                    Cancel·lar
                                </button>
                                <button
                                    onClick={handleToggleActive}
                                    disabled={isToggling}
                                    className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${
                                        toggleActiveModal.action === 'activate'
                                            ? 'bg-green-600 hover:bg-green-700'
                                            : 'bg-amber-600 hover:bg-amber-700'
                                    }`}
                                >
                                    {isToggling ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            {toggleActiveModal.action === 'activate' ? 'Activant...' : 'Desactivant...'}
                                        </>
                                    ) : (
                                        <>
                                            {toggleActiveModal.action === 'activate' ? (
                                                <UserCheck className="w-4 h-4" />
                                            ) : (
                                                <UserX className="w-4 h-4" />
                                            )}
                                            {toggleActiveModal.action === 'activate' ? 'Activar' : 'Desactivar'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast de notificación */}
            {toast.show && (
                <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
                    toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}>
                    {toast.type === 'success' ? (
                        <CheckCircle className="w-5 h-5" />
                    ) : (
                        <XCircle className="w-5 h-5" />
                    )}
                    {toast.message}
                </div>
            )}
        </div>
    )
}

// =====================
// COMPONENTS AUXILIARS
// =====================

interface StatCardProps {
    title: string
    value: number
    icon: React.ElementType
    color?: 'slate' | 'red' | 'purple' | 'blue' | 'green' | 'amber'
}

const colorStyles = {
    slate: 'bg-slate-100 text-slate-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    amber: 'bg-amber-100 text-amber-600',
}

function StatCard({ title, value, icon: Icon, color = 'slate' }: StatCardProps) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500">{title}</p>
                    <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
                </div>
                <div className={`p-2 rounded-lg ${colorStyles[color]}`}>
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
            </div>
        </div>
    )
}

interface UserRowProps {
    user: User
    isSelected: boolean
    onToggleSelect: () => void
    onDelete: (user: User) => void
    onToggleActive: (user: User) => void
}

function UserRow({ user, isSelected, onToggleSelect, onDelete, onToggleActive }: UserRowProps) {
    const roleConfig = ROLE_CONFIG[user.role]
    const initials = user.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : user.email[0].toUpperCase()

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'Mai'
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 60) return `Fa ${diffMins} min`
        if (diffHours < 24) return `Fa ${diffHours}h`
        if (diffDays < 7) return `Fa ${diffDays} dies`
        return date.toLocaleDateString('ca-ES')
    }

    return (
        <tr className="hover:bg-slate-50">
            <td className="px-4 py-3">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={onToggleSelect}
                    className="rounded border-slate-300"
                />
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {initials}
                    </div>
                    <div>
                        <p className="font-medium text-slate-900">{user.name || 'Sense nom'}</p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3">
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${roleConfig.bg} ${roleConfig.color}`}>
                    {roleConfig.label}
                </span>
            </td>
            <td className="px-4 py-3">
                <span className="text-sm text-slate-600">{user.cargo || '-'}</span>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    {user.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3" />
                            Actiu
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            <XCircle className="h-3 w-3" />
                            Inactiu
                        </span>
                    )}
                    {!user.isEmailVerified && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            <Clock className="h-3 w-3" />
                            No verificat
                        </span>
                    )}
                </div>
            </td>
            <td className="px-4 py-3">
                <span className="text-sm text-slate-600">{formatDate(user.lastLogin)}</span>
            </td>
            <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                    <Link
                        href={`/admin/usuaris/${user.nick || user.id}`}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Veure detalls"
                    >
                        <Eye className="h-4 w-4" strokeWidth={1.5} />
                    </Link>
                    <Link
                        href={user.role === 'USER' && user.nick ? `/admin/usuaris/${user.nick}/wizard` : `/admin/usuaris/${user.nick || user.id}/editar`}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title={user.role === 'USER' ? 'Editar perfil complet' : 'Editar'}
                    >
                        <Edit className="h-4 w-4" strokeWidth={1.5} />
                    </Link>
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Mail className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                    <button
                        onClick={() => onToggleActive(user)}
                        className={`p-1.5 rounded-lg transition-colors ${
                            user.isActive
                                ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-amber-500 hover:text-green-600 hover:bg-green-50'
                        }`}
                        title={user.isActive ? 'Desactivar' : 'Activar'}
                    >
                        {user.isActive ? (
                            <UserX className="h-4 w-4" strokeWidth={1.5} />
                        ) : (
                            <UserCheck className="h-4 w-4" strokeWidth={1.5} />
                        )}
                    </button>
                    <button
                        onClick={() => onDelete(user)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                    >
                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                </div>
            </td>
        </tr>
    )
}
