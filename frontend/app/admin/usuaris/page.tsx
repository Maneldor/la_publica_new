'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
    RefreshCw
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
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState<string>('all')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [selectedUsers, setSelectedUsers] = useState<string[]>([])

    // Carregar usuaris (mock - substituir per API real)
    useEffect(() => {
        const loadUsers = async () => {
            setLoading(true)
            // TODO: Substituir per fetch a API
            const mockUsers: User[] = [
                {
                    id: '1',
                    email: 'superadmin@lapublica.cat',
                    name: 'Super Administrador',
                    image: null,
                    role: 'SUPER_ADMIN',
                    userType: 'ADMIN',
                    isActive: true,
                    isEmailVerified: true,
                    communityId: null,
                    cargo: 'Director Tecnologia',
                    createdAt: '2023-01-15T10:00:00Z',
                    lastLogin: '2024-12-11T08:30:00Z',
                },
                {
                    id: '2',
                    email: 'crm.comercial@lapublica.cat',
                    name: 'Laura Sánchez',
                    image: null,
                    role: 'CRM_COMERCIAL',
                    userType: 'ACCOUNT_MANAGER',
                    isActive: true,
                    isEmailVerified: true,
                    communityId: null,
                    cargo: 'Responsable Comercial',
                    createdAt: '2023-06-20T10:00:00Z',
                    lastLogin: '2024-12-11T09:15:00Z',
                },
                {
                    id: '3',
                    email: 'gestor1@lapublica.cat',
                    name: 'Marc Fernández',
                    image: null,
                    role: 'GESTOR_ESTRATEGIC',
                    userType: 'ACCOUNT_MANAGER',
                    isActive: true,
                    isEmailVerified: true,
                    communityId: null,
                    cargo: 'Gestor Comercial',
                    createdAt: '2023-09-10T10:00:00Z',
                    lastLogin: '2024-12-10T17:45:00Z',
                },
                {
                    id: '4',
                    email: 'maria.garcia@gencat.cat',
                    name: 'Maria Garcia López',
                    image: null,
                    role: 'USER',
                    userType: 'EMPLOYEE',
                    isActive: true,
                    isEmailVerified: true,
                    communityId: 'com_gencat',
                    cargo: 'Administrativa',
                    createdAt: '2024-03-15T10:00:00Z',
                    lastLogin: '2024-12-09T12:00:00Z',
                },
                {
                    id: '5',
                    email: 'joan.perez@ajbcn.cat',
                    name: 'Joan Pérez',
                    image: null,
                    role: 'USER',
                    userType: 'EMPLOYEE',
                    isActive: false,
                    isEmailVerified: true,
                    communityId: 'com_ajbcn',
                    cargo: 'Tècnic',
                    createdAt: '2024-01-20T10:00:00Z',
                    lastLogin: '2024-06-15T09:00:00Z',
                },
                {
                    id: '6',
                    email: 'moderador@lapublica.cat',
                    name: 'Anna Moderadora',
                    image: null,
                    role: 'MODERATOR',
                    userType: 'ADMIN',
                    isActive: true,
                    isEmailVerified: false,
                    communityId: null,
                    cargo: 'Moderadora Contingut',
                    createdAt: '2024-06-01T10:00:00Z',
                    lastLogin: null,
                },
            ]

            setTimeout(() => {
                setUsers(mockUsers)
                setLoading(false)
            }, 500)
        }

        loadUsers()
    }, [])

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
                    <button className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
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
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
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
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
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
        </div >
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
}

function UserRow({ user, isSelected, onToggleSelect }: UserRowProps) {
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
                        href={`/admin/usuaris/${user.id}`}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <Eye className="h-4 w-4" strokeWidth={1.5} />
                    </Link>
                    <Link
                        href={`/admin/usuaris/${user.id}/editar`}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <Edit className="h-4 w-4" strokeWidth={1.5} />
                    </Link>
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Mail className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                </div>
            </td>
        </tr>
    )
}
