'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft,
    Shield,
    Save,
    AlertCircle,
    CheckCircle,
    Users,
    Building2,
    FileText,
    Settings,
    Tag,
    UserCog,
    Megaphone,
    Landmark,
    MessageSquare,
    Check
} from 'lucide-react'

// Mapatge d'icones disponibles
const AVAILABLE_ICONS = [
    { name: 'Shield', icon: Shield, label: 'Escut' },
    { name: 'Users', icon: Users, label: 'Usuaris' },
    { name: 'Building2', icon: Building2, label: 'Edifici' },
    { name: 'Landmark', icon: Landmark, label: 'Administració' },
    { name: 'FileText', icon: FileText, label: 'Document' },
    { name: 'Tag', icon: Tag, label: 'Etiqueta' },
    { name: 'UserCog', icon: UserCog, label: 'Configuració Usuari' },
    { name: 'Megaphone', icon: Megaphone, label: 'Megàfon' },
    { name: 'MessageSquare', icon: MessageSquare, label: 'Missatge' },
    { name: 'Settings', icon: Settings, label: 'Configuració' },
]

// Colors disponibles
const AVAILABLE_COLORS = [
    { name: 'slate', label: 'Gris', bg: 'bg-slate-100', text: 'text-slate-700', ring: 'ring-slate-500' },
    { name: 'red', label: 'Vermell', bg: 'bg-red-100', text: 'text-red-700', ring: 'ring-red-500' },
    { name: 'orange', label: 'Taronja', bg: 'bg-orange-100', text: 'text-orange-700', ring: 'ring-orange-500' },
    { name: 'amber', label: 'Ambre', bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-500' },
    { name: 'green', label: 'Verd', bg: 'bg-green-100', text: 'text-green-700', ring: 'ring-green-500' },
    { name: 'emerald', label: 'Maragda', bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-500' },
    { name: 'teal', label: 'Blau-verd', bg: 'bg-teal-100', text: 'text-teal-700', ring: 'ring-teal-500' },
    { name: 'cyan', label: 'Cian', bg: 'bg-cyan-100', text: 'text-cyan-700', ring: 'ring-cyan-500' },
    { name: 'blue', label: 'Blau', bg: 'bg-blue-100', text: 'text-blue-700', ring: 'ring-blue-500' },
    { name: 'indigo', label: 'Indi', bg: 'bg-indigo-100', text: 'text-indigo-700', ring: 'ring-indigo-500' },
    { name: 'purple', label: 'Porpra', bg: 'bg-purple-100', text: 'text-purple-700', ring: 'ring-purple-500' },
]

// Dashboards disponibles
const AVAILABLE_DASHBOARDS = [
    { value: '/admin/', label: 'Admin (/admin/)' },
    { value: '/gestio/', label: 'Gestió CRM (/gestio/)' },
    { value: '/empresa/', label: 'Empresa (/empresa/)' },
    { value: '/administracio/', label: 'Administració (/administracio/)' },
    { value: '/', label: 'Portal públic (/)' },
    { value: '', label: 'Cap (sense dashboard)' },
]

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

interface FormData {
    name: string
    label: string
    description: string
    color: string
    icon: string
    dashboard: string
    permissionIds: string[]
}

export default function CrearRolPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [loadingPermissions, setLoadingPermissions] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [permissionCategories, setPermissionCategories] = useState<PermissionCategory[]>([])
    const [expandedCategories, setExpandedCategories] = useState<string[]>([])

    const [formData, setFormData] = useState<FormData>({
        name: '',
        label: '',
        description: '',
        color: 'blue',
        icon: 'Users',
        dashboard: '/gestio/',
        permissionIds: [],
    })

    // Carregar permisos
    useEffect(() => {
        const loadPermissions = async () => {
            try {
                const response = await fetch('/api/admin/permissions')
                if (response.ok) {
                    const data = await response.json()
                    setPermissionCategories(data)
                    // Expandir totes les categories per defecte
                    setExpandedCategories(data.map((c: PermissionCategory) => c.id))
                }
            } catch (error) {
                console.error('Error carregant permisos:', error)
            } finally {
                setLoadingPermissions(false)
            }
        }
        loadPermissions()
    }, [])

    // Generar nom automàticament des del label
    const handleLabelChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            label: value,
            name: value.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, ''),
        }))
    }

    // Toggle permís individual
    const togglePermission = (permissionId: string) => {
        setFormData(prev => ({
            ...prev,
            permissionIds: prev.permissionIds.includes(permissionId)
                ? prev.permissionIds.filter(id => id !== permissionId)
                : [...prev.permissionIds, permissionId],
        }))
    }

    // Toggle tots els permisos d'una categoria
    const toggleCategory = (category: PermissionCategory) => {
        const categoryPermissionIds = category.permissions.map(p => p.id)
        const allSelected = categoryPermissionIds.every(id => formData.permissionIds.includes(id))

        setFormData(prev => ({
            ...prev,
            permissionIds: allSelected
                ? prev.permissionIds.filter(id => !categoryPermissionIds.includes(id))
                : [...new Set([...prev.permissionIds, ...categoryPermissionIds])],
        }))
    }

    // Toggle expandir categoria
    const toggleExpandCategory = (categoryId: string) => {
        setExpandedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        )
    }

    // Seleccionar tots els permisos
    const selectAllPermissions = () => {
        const allPermissionIds = permissionCategories.flatMap(c => c.permissions.map(p => p.id))
        setFormData(prev => ({ ...prev, permissionIds: allPermissionIds }))
    }

    // Deseleccionar tots
    const deselectAllPermissions = () => {
        setFormData(prev => ({ ...prev, permissionIds: [] }))
    }

    // Validar formulari
    const validateForm = (): string | null => {
        if (!formData.label.trim()) return 'El nom visible és obligatori'
        if (!formData.name.trim()) return 'L\'identificador és obligatori'
        if (formData.name.length < 3) return 'L\'identificador ha de tenir mínim 3 caràcters'
        return null
    }

    // Enviar formulari
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        const validationError = validateForm()
        if (validationError) {
            setError(validationError)
            return
        }

        setLoading(true)

        try {
            const response = await fetch('/api/admin/roles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Error creant rol')
            }

            setSuccess(true)
            setTimeout(() => {
                router.push('/admin/rols')
            }, 1500)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconegut')
        } finally {
            setLoading(false)
        }
    }

    // Obtenir icona seleccionada
    const SelectedIcon = AVAILABLE_ICONS.find(i => i.name === formData.icon)?.icon || Users
    const selectedColor = AVAILABLE_COLORS.find(c => c.name === formData.color) || AVAILABLE_COLORS[0]

    if (success) {
        return (
            <div className="p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-green-800 mb-2">
                            Rol creat correctament!
                        </h2>
                        <p className="text-green-700">
                            El rol "{formData.label}" s'ha creat amb {formData.permissionIds.length} permisos.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/rols"
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 text-slate-500" strokeWidth={1.5} />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                            <Shield className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-slate-900">Crear nou rol</h1>
                            <p className="text-sm text-slate-500">Defineix un nou rol amb permisos personalitzats</p>
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

                    {/* Informació bàsica */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Informació bàsica</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Nom visible */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Nom visible *
                                </label>
                                <input
                                    type="text"
                                    value={formData.label}
                                    onChange={(e) => handleLabelChange(e.target.value)}
                                    placeholder="Ex: Gestor Gestió"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    required
                                />
                            </div>

                            {/* Identificador */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Identificador (automàtic)
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        name: e.target.value.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '')
                                    }))}
                                    placeholder="GESTOR_GESTIO"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
                                    required
                                />
                            </div>

                            {/* Descripció */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Descripció
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Descriu les responsabilitats d'aquest rol..."
                                    rows={2}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                />
                            </div>

                            {/* Dashboard */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Dashboard d'accés
                                </label>
                                <select
                                    value={formData.dashboard}
                                    onChange={(e) => setFormData(prev => ({ ...prev, dashboard: e.target.value }))}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                >
                                    {AVAILABLE_DASHBOARDS.map(d => (
                                        <option key={d.value} value={d.value}>{d.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Aparença */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Aparença</h2>

                        {/* Preview */}
                        <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-500 mb-2">Vista prèvia:</p>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${selectedColor.bg}`}>
                                    <SelectedIcon className={`h-5 w-5 ${selectedColor.text}`} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${selectedColor.bg} ${selectedColor.text}`}>
                                        {formData.label || 'Nom del rol'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Selecció de color */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Color</label>
                            <div className="flex flex-wrap gap-2">
                                {AVAILABLE_COLORS.map(color => (
                                    <button
                                        key={color.name}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, color: color.name }))}
                                        className={`w-8 h-8 rounded-full ${color.bg} ${formData.color === color.name ? `ring-2 ${color.ring} ring-offset-2` : ''
                                            } transition-all`}
                                        title={color.label}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Selecció d'icona */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Icona</label>
                            <div className="flex flex-wrap gap-2">
                                {AVAILABLE_ICONS.map(({ name, icon: Icon, label }) => (
                                    <button
                                        key={name}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, icon: name }))}
                                        className={`p-2 rounded-lg border transition-all ${formData.icon === name
                                                ? 'border-blue-500 bg-blue-50 text-blue-600'
                                                : 'border-slate-200 hover:border-slate-300 text-slate-500'
                                            }`}
                                        title={label}
                                    >
                                        <Icon className="h-5 w-5" strokeWidth={1.5} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Permisos */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Permisos</h2>
                                <p className="text-sm text-slate-500">
                                    {formData.permissionIds.length} permisos seleccionats
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={selectAllPermissions}
                                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    Seleccionar tots
                                </button>
                                <button
                                    type="button"
                                    onClick={deselectAllPermissions}
                                    className="px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Treure tots
                                </button>
                            </div>
                        </div>

                        {loadingPermissions ? (
                            <div className="text-center py-8 text-slate-500">
                                Carregant permisos...
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {permissionCategories.map(category => {
                                    const categoryPermissionIds = category.permissions.map(p => p.id)
                                    const selectedCount = categoryPermissionIds.filter(id =>
                                        formData.permissionIds.includes(id)
                                    ).length
                                    const allSelected = selectedCount === category.permissions.length
                                    const someSelected = selectedCount > 0 && !allSelected
                                    const isExpanded = expandedCategories.includes(category.id)

                                    return (
                                        <div key={category.id} className="border border-slate-200 rounded-lg overflow-hidden">
                                            {/* Header categoria */}
                                            <div className="flex items-center bg-slate-50 p-3">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleCategory(category)}
                                                    className={`w-5 h-5 rounded border mr-3 flex items-center justify-center transition-colors ${allSelected
                                                            ? 'bg-blue-600 border-blue-600 text-white'
                                                            : someSelected
                                                                ? 'bg-blue-100 border-blue-300'
                                                                : 'border-slate-300 hover:border-slate-400'
                                                        }`}
                                                >
                                                    {allSelected && <Check className="h-3 w-3" strokeWidth={3} />}
                                                    {someSelected && <div className="w-2 h-2 bg-blue-600 rounded-sm" />}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => toggleExpandCategory(category.id)}
                                                    className="flex-1 flex items-center justify-between text-left"
                                                >
                                                    <span className="font-medium text-slate-700">{category.label}</span>
                                                    <span className="text-sm text-slate-500">
                                                        {selectedCount}/{category.permissions.length}
                                                    </span>
                                                </button>
                                            </div>

                                            {/* Permisos de la categoria */}
                                            {isExpanded && (
                                                <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {category.permissions.map(permission => {
                                                        const isSelected = formData.permissionIds.includes(permission.id)

                                                        return (
                                                            <label
                                                                key={permission.id}
                                                                className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'
                                                                    }`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => togglePermission(permission.id)}
                                                                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                                />
                                                                <div>
                                                                    <p className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                                                                        {permission.label}
                                                                    </p>
                                                                    {permission.description && (
                                                                        <p className="text-xs text-slate-500">{permission.description}</p>
                                                                    )}
                                                                </div>
                                                            </label>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Botons */}
                    <div className="flex items-center justify-end gap-4">
                        <Link
                            href="/admin/rols"
                            className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Cancel·lar
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Creant...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" strokeWidth={1.5} />
                                    Crear rol
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
