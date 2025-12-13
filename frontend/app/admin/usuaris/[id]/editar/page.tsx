'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft,
    User,
    Mail,
    Shield,
    Building2,
    Briefcase,
    Save,
    AlertCircle,
    CheckCircle,
    Info
} from 'lucide-react'

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

type UserType = 'EMPLOYEE' | 'ACCOUNT_MANAGER' | 'ADMIN' | 'COMPANY_OWNER' | 'COMPANY_MEMBER'

interface FormData {
    email: string
    name: string
    role: UserRole
    userType: UserType
    cargo: string
    communityId: string
    isActive: boolean
}

// Configuració de rols amb informació addicional
const ROLES_INFO: Record<UserRole, {
    label: string
    description: string
    userType: UserType
    needsCommunity: boolean
    color: string
}> = {
    SUPER_ADMIN: {
        label: 'Super Admin',
        description: 'Accés total al sistema, pot gestionar altres admins',
        userType: 'ADMIN',
        needsCommunity: false,
        color: 'red'
    },
    ADMIN: {
        label: 'Admin',
        description: 'Administrador del sistema amb accés a /admin/',
        userType: 'ADMIN',
        needsCommunity: false,
        color: 'red'
    },
    ADMIN_GESTIO: {
        label: 'Admin Gestió',
        description: 'Administrador del dashboard /gestio/ CRM',
        userType: 'ADMIN',
        needsCommunity: false,
        color: 'orange'
    },
    ADMIN_ADMINISTRACIONS: {
        label: 'Admin Administracions',
        description: 'Administrador de comunitats i administracions públiques',
        userType: 'ADMIN',
        needsCommunity: false,
        color: 'emerald'
    },
    CRM_COMERCIAL: {
        label: 'CRM Comercial',
        description: 'Gestiona leads i pipeline comercial',
        userType: 'ACCOUNT_MANAGER',
        needsCommunity: false,
        color: 'purple'
    },
    CRM_CONTINGUT: {
        label: 'CRM Contingut',
        description: 'Gestiona contingut i comunicació',
        userType: 'ACCOUNT_MANAGER',
        needsCommunity: false,
        color: 'indigo'
    },
    CRM_ADMINISTRACIONS: {
        label: 'CRM Administracions',
        description: 'Gestiona relacions amb administracions públiques',
        userType: 'ACCOUNT_MANAGER',
        needsCommunity: false,
        color: 'green'
    },
    GESTOR_ESTANDARD: {
        label: 'Gestor Estàndard',
        description: 'Gestor comercial per empreses bàsiques',
        userType: 'ACCOUNT_MANAGER',
        needsCommunity: false,
        color: 'blue'
    },
    GESTOR_ESTRATEGIC: {
        label: 'Gestor Estratègic',
        description: 'Gestor comercial per empreses estratègiques',
        userType: 'ACCOUNT_MANAGER',
        needsCommunity: false,
        color: 'cyan'
    },
    GESTOR_ENTERPRISE: {
        label: 'Gestor Enterprise',
        description: 'Gestor comercial per comptes enterprise',
        userType: 'ACCOUNT_MANAGER',
        needsCommunity: false,
        color: 'teal'
    },
    MODERATOR: {
        label: 'Moderador',
        description: 'Modera contingut de la comunitat',
        userType: 'ADMIN',
        needsCommunity: false,
        color: 'amber'
    },
    COMPANY: {
        label: 'Empresa',
        description: 'Usuari d\'empresa col·laboradora',
        userType: 'COMPANY_OWNER',
        needsCommunity: false,
        color: 'indigo'
    },
    ADMINISTRATION: {
        label: 'Administració Pública',
        description: 'Usuari d\'administració pública',
        userType: 'ADMIN',
        needsCommunity: true,
        color: 'emerald'
    },
    USER: {
        label: 'Empleat Públic',
        description: 'Usuari bàsic del sistema',
        userType: 'EMPLOYEE',
        needsCommunity: true,
        color: 'slate'
    },
}

// Mock comunitats
const COMMUNITIES = [
    { id: 'com_gencat', name: 'Generalitat de Catalunya' },
    { id: 'com_ajbcn', name: 'Ajuntament de Barcelona' },
    { id: 'com_diba', name: 'Diputació de Barcelona' },
    { id: 'com_age', name: 'Administració General de l\'Estat' },
]

export default function EditarUsuariPage() {
    const router = useRouter()
    const params = useParams()
    const userId = params.id as string

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const [formData, setFormData] = useState<FormData>({
        email: '',
        name: '',
        role: 'USER',
        userType: 'EMPLOYEE',
        cargo: '',
        communityId: '',
        isActive: true,
    })

    // Carregar dades existents
    useEffect(() => {
        const loadUser = async () => {
            setLoading(true)
            try {
                // TODO: fetchData from API
                // const response = await fetch(`/api/admin/usuaris/${userId}`)
                // const data = await response.json()

                // Mock data
                const mockUser = {
                    email: 'crm.comercial@lapublica.cat',
                    name: 'Laura Sánchez',
                    role: 'CRM_COMERCIAL' as UserRole,
                    userType: 'ACCOUNT_MANAGER' as UserType,
                    cargo: 'Responsable Comercial',
                    communityId: '',
                    isActive: true,
                }

                setTimeout(() => {
                    setFormData(mockUser)
                    setLoading(false)
                }, 500)

            } catch (err) {
                setError('Error carregant dades usuari')
                setLoading(false)
            }
        }
        loadUser()
    }, [userId])

    const selectedRoleInfo = ROLES_INFO[formData.role]

    // Actualitzar userType quan canvia el rol
    const handleRoleChange = (newRole: UserRole) => {
        const roleInfo = ROLES_INFO[newRole]
        setFormData(prev => ({
            ...prev,
            role: newRole,
            userType: roleInfo.userType,
            communityId: roleInfo.needsCommunity ? prev.communityId : '',
        }))
    }

    const validateForm = (): string | null => {
        if (!formData.email) return 'L\'email és obligatori'
        if (!formData.email.includes('@')) return 'L\'email no és vàlid'
        if (!formData.name) return 'El nom és obligatori'
        if (selectedRoleInfo.needsCommunity && !formData.communityId) {
            return 'La comunitat és obligatòria per a empleats públics'
        }
        return null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        const validationError = validateForm()
        if (validationError) {
            setError(validationError)
            return
        }

        setSaving(true)

        try {
            // TODO: Substituir per API real (PUT)
            const response = await fetch(`/api/admin/usuaris/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    name: formData.name,
                    role: formData.role,
                    userType: formData.userType,
                    cargo: formData.cargo || null,
                    communityId: formData.communityId || null,
                    isActive: formData.isActive,
                }),
            })

            // Simulate success for mock
            if (true /* replace with !response.ok check when real API */) {
                // 
            }

            setSuccess(true)
            setTimeout(() => {
                router.push(`/admin/usuaris/${userId}`)
            }, 1500)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconegut')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="p-12 text-center">
                <p className="text-slate-500">Carregant dades...</p>
            </div>
        )
    }

    if (success) {
        return (
            <div className="p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-green-800 mb-2">
                            Usuari actualitzat correctament
                        </h2>
                        <p className="text-green-700">Refrescants dades...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href={`/admin/usuaris/${userId}`}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 text-slate-500" strokeWidth={1.5} />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                            <User className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-slate-900">Editar usuari</h1>
                            <p className="text-sm text-slate-500">Editant: {formData.name}</p>
                        </div>
                    </div>
                </div>

                {/* Formulari */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Error global */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" strokeWidth={1.5} />
                            <div>
                                <p className="font-medium text-red-800">Error</p>
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Secció: Tipus d'usuari */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
                            Tipus d'usuari
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {Object.entries(ROLES_INFO).map(([roleKey, roleInfo]) => (
                                <label
                                    key={roleKey}
                                    className={`
                    relative flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all
                    ${formData.role === roleKey
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-slate-200 hover:border-slate-300'
                                        }
                  `}
                                >
                                    <input
                                        type="radio"
                                        name="role"
                                        value={roleKey}
                                        checked={formData.role === roleKey}
                                        onChange={() => handleRoleChange(roleKey as UserRole)}
                                        className="mt-1"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-900">{roleInfo.label}</p>
                                        <p className="text-sm text-slate-500">{roleInfo.description}</p>
                                    </div>
                                </label>
                            ))}
                        </div>

                        {/* Info del rol seleccionat */}
                        <div className="mt-4 p-4 bg-slate-50 rounded-lg flex items-start gap-3">
                            <Info className="h-5 w-5 text-slate-400 mt-0.5" strokeWidth={1.5} />
                            <div className="text-sm text-slate-600">
                                <p><strong>Tipus assignat:</strong> {selectedRoleInfo.userType}</p>
                                {selectedRoleInfo.needsCommunity && (
                                    <p className="text-amber-600 mt-1">
                                        ⚠️ Aquest rol requereix assignar una comunitat
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Secció: Informació bàsica */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <User className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
                            Informació bàsica
                        </h2>

                        <div className="space-y-4">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Email *
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        placeholder="usuari@domini.cat"
                                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Nom */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Nom complet *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Nom i cognoms"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    required
                                />
                            </div>

                            {/* Càrrec */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Càrrec
                                </label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
                                    <input
                                        type="text"
                                        value={formData.cargo}
                                        onChange={(e) => setFormData(prev => ({ ...prev, cargo: e.target.value }))}
                                        placeholder="Ex: Responsable Comercial"
                                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Comunitat (només per empleats) */}
                            {selectedRoleInfo.needsCommunity && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Comunitat / Administració *
                                    </label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
                                        <select
                                            value={formData.communityId}
                                            onChange={(e) => setFormData(prev => ({ ...prev, communityId: e.target.value }))}
                                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                            required
                                        >
                                            <option value="">Selecciona comunitat...</option>
                                            {COMMUNITIES.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Secció: Opcions */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Opcions</h2>

                        <div className="space-y-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <div>
                                    <p className="font-medium text-slate-900">Usuari actiu</p>
                                    <p className="text-sm text-slate-500">L'usuari podrà accedir al sistema</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Botons */}
                    <div className="flex items-center justify-end gap-4">
                        <Link
                            href={`/admin/usuaris/${userId}`}
                            className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Cancel·lar
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Guardant...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" strokeWidth={1.5} />
                                    Guardar canvis
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
