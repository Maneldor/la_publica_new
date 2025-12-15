'use client'

import { useState, useEffect } from 'react'
import {
    Bell,
    Send,
    Clock,
    CheckCircle,
    AlertCircle,
    RefreshCw,
    Search,
    Eye,
    Plus,
    X,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Users,
    User,
    Shield
} from 'lucide-react'

// Tipos reales de Prisma
type NotificationType = 
    | 'COMPANY_PENDING'
    | 'COMPANY_APPROVED' 
    | 'COMPANY_REJECTED'
    | 'PROFILE_CHANGE'
    | 'GENERAL'
    | 'SYSTEM'
    | 'COUPON_GENERATED'
    | 'COUPON_USED'
    | 'OFFER_EXPIRING'
    | 'NEW_FAVORITE'
    | 'WEEKLY_SUMMARY'
    | 'LEAD_VERIFIED'
    | 'COMPANY_ASSIGNED'
    | 'COMPANY_COMPLETED'
    | 'COMPANY_PUBLISHED'

interface Notification {
    id: string
    createdAt: string
    type: NotificationType
    recipient: string
    recipientEmail: string
    title: string
    message: string
    status: 'sent' | 'read'
    readAt?: string
    priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
    sender?: {
        name: string
        email: string
    }
}

interface NotificationStats {
    total: number
    pending: number
    read: number
    errors: number
}

interface CreateNotificationData {
    type: NotificationType
    title: string
    message: string
    recipients: 'ALL' | 'BY_ROLE' | 'SPECIFIC_USER'
    role?: string
    userId?: string
}

interface PaginationInfo {
    page: number
    limit: number
    total: number
    totalPages: number
}


// Componente StatCard
function StatCard({ 
    title, 
    value, 
    icon: Icon, 
    color 
}: { 
    title: string
    value: number
    icon: any
    color: string 
}) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center">
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="h-6 w-6 text-white" strokeWidth={1.5} />
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">{title}</p>
                    <p className="text-2xl font-bold text-slate-900">{value.toLocaleString()}</p>
                </div>
            </div>
        </div>
    )
}

// Componente Badge
function Badge({ 
    type, 
    variant 
}: { 
    type: string
    variant: 'type' | 'status' 
}) {
    const getTypeStyles = (t: string) => {
        switch (t) {
            case 'SYSTEM': return 'bg-blue-100 text-blue-700 border-blue-200'
            case 'COMPANY_PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
            case 'COMPANY_APPROVED': return 'bg-green-100 text-green-700 border-green-200'
            case 'COMPANY_REJECTED': return 'bg-red-100 text-red-700 border-red-200'
            case 'GENERAL': return 'bg-gray-100 text-gray-700 border-gray-200'
            case 'PROFILE_CHANGE': return 'bg-purple-100 text-purple-700 border-purple-200'
            case 'COUPON_GENERATED': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
            case 'COUPON_USED': return 'bg-teal-100 text-teal-700 border-teal-200'
            case 'OFFER_EXPIRING': return 'bg-orange-100 text-orange-700 border-orange-200'
            case 'NEW_FAVORITE': return 'bg-pink-100 text-pink-700 border-pink-200'
            default: return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    const getStatusStyles = (s: string) => {
        switch (s) {
            case 'sent': return 'bg-blue-100 text-blue-700 border-blue-200'
            case 'read': return 'bg-green-100 text-green-700 border-green-200'
            default: return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    const statusLabels: Record<string, string> = {
        'sent': 'Enviada',
        'read': 'Llegida'
    }
    
    const typeLabels: Record<string, string> = {
        'SYSTEM': 'Sistema',
        'COMPANY_PENDING': 'Empresa Pendent',
        'COMPANY_APPROVED': 'Empresa Aprovada',
        'COMPANY_REJECTED': 'Empresa Rebutjada',
        'GENERAL': 'General',
        'PROFILE_CHANGE': 'Canvi Perfil',
        'COUPON_GENERATED': 'Cupó Generat',
        'COUPON_USED': 'Cupó Utilitzat',
        'OFFER_EXPIRING': 'Oferta Expirant',
        'NEW_FAVORITE': 'Nou Favorit'
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
            variant === 'type' ? getTypeStyles(type) : getStatusStyles(type)
        }`}>
            {variant === 'status' ? statusLabels[type] || type : typeLabels[type] || type}
        </span>
    )
}

// Componente Modal
function CreateNotificationModal({ 
    isOpen, 
    onClose, 
    onSubmit 
}: { 
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: CreateNotificationData) => void 
}) {
    const [formData, setFormData] = useState<CreateNotificationData>({
        type: 'GENERAL',
        title: '',
        message: '',
        recipients: 'ALL'
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
        onClose()
        setFormData({
            type: 'GENERAL',
            title: '',
            message: '',
            recipients: 'ALL'
        })
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Nova Notificació</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
                    >
                        <X className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Tipus */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Tipus
                        </label>
                        <select 
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                        >
                            <option value="GENERAL" className="text-slate-900">GENERAL - Informació general</option>
                            <option value="SYSTEM" className="text-slate-900">SYSTEM - Notificació del sistema</option>
                            <option value="COMPANY_PENDING" className="text-slate-900">COMPANY_PENDING - Empresa pendent</option>
                            <option value="COMPANY_APPROVED" className="text-slate-900">COMPANY_APPROVED - Empresa aprovada</option>
                            <option value="COMPANY_REJECTED" className="text-slate-900">COMPANY_REJECTED - Empresa rebutjada</option>
                            <option value="PROFILE_CHANGE" className="text-slate-900">PROFILE_CHANGE - Canvi de perfil</option>
                            <option value="COUPON_GENERATED" className="text-slate-900">COUPON_GENERATED - Cupó generat</option>
                            <option value="OFFER_EXPIRING" className="text-slate-900">OFFER_EXPIRING - Oferta expirant</option>
                        </select>
                    </div>

                    {/* Títol */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Títol
                        </label>
                        <input 
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Títol de la notificació"
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400"
                            required
                        />
                    </div>

                    {/* Missatge */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Missatge
                        </label>
                        <textarea 
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            placeholder="Contingut de la notificació"
                            rows={4}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400"
                            required
                        />
                    </div>

                    {/* Destinataris */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">
                            Destinataris
                        </label>
                        <div className="space-y-3">
                            <label className="flex items-center">
                                <input 
                                    type="radio"
                                    name="recipients"
                                    value="ALL"
                                    checked={formData.recipients === 'ALL'}
                                    onChange={(e) => setFormData({ ...formData, recipients: 'ALL' })}
                                    className="mr-2"
                                />
                                <Users className="h-4 w-4 mr-2 text-slate-500" strokeWidth={1.5} />
                                <span className="text-slate-900">Tots els usuaris</span>
                            </label>
                            
                            <label className="flex items-center">
                                <input 
                                    type="radio"
                                    name="recipients"
                                    value="BY_ROLE"
                                    checked={formData.recipients === 'BY_ROLE'}
                                    onChange={(e) => setFormData({ ...formData, recipients: 'BY_ROLE' })}
                                    className="mr-2"
                                />
                                <Shield className="h-4 w-4 mr-2 text-slate-500" strokeWidth={1.5} />
                                <span className="text-slate-900">Per rol</span>
                            </label>
                            
                            <label className="flex items-center">
                                <input 
                                    type="radio"
                                    name="recipients"
                                    value="SPECIFIC_USER"
                                    checked={formData.recipients === 'SPECIFIC_USER'}
                                    onChange={(e) => setFormData({ ...formData, recipients: 'SPECIFIC_USER' })}
                                    className="mr-2"
                                />
                                <User className="h-4 w-4 mr-2 text-slate-500" strokeWidth={1.5} />
                                <span className="text-slate-900">Usuari específic</span>
                            </label>
                        </div>

                        {/* Selector de rol */}
                        {formData.recipients === 'BY_ROLE' && (
                            <select 
                                value={formData.role || ''}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full mt-3 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                            >
                                <option value="" className="text-slate-500">Selecciona un rol</option>
                                <option value="ADMIN" className="text-slate-900">Administradors</option>
                                <option value="MODERATOR" className="text-slate-900">Moderadors</option>
                                <option value="COMPANY" className="text-slate-900">Empreses</option>
                                <option value="USER" className="text-slate-900">Usuaris</option>
                            </select>
                        )}

                        {/* Cerca usuari específic */}
                        {formData.recipients === 'SPECIFIC_USER' && (
                            <input 
                                type="text"
                                value={formData.userId || ''}
                                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                                placeholder="Email o nom de l'usuari"
                                className="w-full mt-3 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400"
                            />
                        )}
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
                        >
                            Cancel·lar
                        </button>
                        <button 
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Enviar notificació
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function NotificacionsPage() {
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [stats, setStats] = useState<NotificationStats>({ total: 0, pending: 0, read: 0, errors: 0 })
    const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 10, total: 0, totalPages: 0 })
    const [showModal, setShowModal] = useState(false)
    
    // Filtros
    const [searchTerm, setSearchTerm] = useState('')
    const [typeFilter, setTypeFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    
    useEffect(() => {
        fetchNotifications()
    }, [pagination.page, searchTerm, typeFilter, statusFilter])

    const fetchNotifications = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                ...(searchTerm && { search: searchTerm }),
                ...(typeFilter && { type: typeFilter }),
                ...(statusFilter && { status: statusFilter })
            })
            
            const response = await fetch(`/api/admin/notifications?${params}`)
            if (response.ok) {
                const data = await response.json()
                setNotifications(data.notifications || [])
                setStats(data.stats || { total: 0, pending: 0, read: 0, errors: 0 })
                setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 })
            } else {
                console.error('Error response from notifications API:', response.status)
                setNotifications([])
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
            setNotifications([])
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await fetchNotifications()
        setRefreshing(false)
    }

    const handleCreateNotification = async (data: CreateNotificationData) => {
        try {
            const response = await fetch('/api/admin/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            
            if (response.ok) {
                await fetchNotifications() // Recargar lista
            } else {
                console.log('Mock: Notification would be created', data)
            }
        } catch (error) {
            console.error('Error creating notification:', error)
        }
    }

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('ca-ES', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8 mx-4">
            {/* Header */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                        <div className="flex items-center mb-2">
                            <Bell className="h-6 w-6 mr-3 text-slate-600" strokeWidth={1.5} />
                            <h1 className="text-2xl font-bold text-slate-900">Notificacions del Sistema</h1>
                        </div>
                        <p className="text-slate-600">
                            Gestiona les notificacions enviades als usuaris
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-4 lg:mt-0">
                        <button 
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} strokeWidth={1.5} />
                            Actualitzar
                        </button>
                        
                        <button 
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="h-4 w-4" strokeWidth={1.5} />
                            Nova Notificació
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                <StatCard
                    title="Total enviades"
                    value={stats.total}
                    icon={Send}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Pendents"
                    value={stats.pending}
                    icon={Clock}
                    color="bg-yellow-500"
                />
                <StatCard
                    title="Llegides"
                    value={stats.read}
                    icon={CheckCircle}
                    color="bg-green-500"
                />
                <StatCard
                    title="Errors"
                    value={stats.errors}
                    icon={AlertCircle}
                    color="bg-red-500"
                />
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Buscador */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
                        <input
                            type="text"
                            placeholder="Cercar notificacions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                        />
                    </div>
                    
                    {/* Filtro Tipus */}
                    <select 
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Tots els tipus</option>
                        <option value="SYSTEM">SYSTEM</option>
                        <option value="ALERT">ALERT</option>
                        <option value="INFO">INFO</option>
                        <option value="SUCCESS">SUCCESS</option>
                    </select>
                    
                    {/* Filtro Estat */}
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Tots els estats</option>
                        <option value="SENT">Enviada</option>
                        <option value="READ">Llegida</option>
                    </select>
                </div>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {notifications.length === 0 ? (
                    <div className="text-center py-12">
                        <Bell className="h-12 w-12 text-slate-400 mx-auto mb-4" strokeWidth={1.5} />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No hi ha notificacions</h3>
                        <p className="text-slate-600 mb-6">Comença enviant la teva primera notificació</p>
                        <button 
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="h-4 w-4" strokeWidth={1.5} />
                            Crear primera notificació
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="text-left py-3 px-6 font-medium text-slate-700">Data/Hora</th>
                                        <th className="text-left py-3 px-6 font-medium text-slate-700">Tipus</th>
                                        <th className="text-left py-3 px-6 font-medium text-slate-700">Destinatari</th>
                                        <th className="text-left py-3 px-6 font-medium text-slate-700">Títol</th>
                                        <th className="text-left py-3 px-6 font-medium text-slate-700">Estat</th>
                                        <th className="text-left py-3 px-6 font-medium text-slate-700">Accions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {notifications.map((notification) => (
                                        <tr key={notification.id} className="hover:bg-slate-50">
                                            <td className="py-4 px-6">
                                                <div className="text-sm text-slate-900">
                                                    {formatDateTime(notification.createdAt)}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <Badge type={notification.type} variant="type" />
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="text-sm font-medium text-slate-900">
                                                    {notification.recipient}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {notification.recipientEmail}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="text-sm text-slate-900 max-w-xs truncate">
                                                    {notification.title}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <Badge type={notification.status} variant="status" />
                                                {notification.status === 'ERROR' && notification.errorMessage && (
                                                    <div className="text-xs text-red-600 mt-1">
                                                        {notification.errorMessage}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                                                    <Eye className="h-4 w-4" strokeWidth={1.5} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
                                <div className="text-sm text-slate-500">
                                    Mostrant {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} resultats
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setPagination(prev => ({ ...prev, page: Math.max(prev.page - 1, 1) }))}
                                        disabled={pagination.page === 1}
                                        className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                                    >
                                        <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
                                    </button>
                                    
                                    <span className="px-3 py-1 text-sm text-slate-700">
                                        {pagination.page} de {pagination.totalPages}
                                    </span>
                                    
                                    <button 
                                        onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.page + 1, prev.totalPages) }))}
                                        disabled={pagination.page === pagination.totalPages}
                                        className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                                    >
                                        <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal Nova Notificació */}
            <CreateNotificationModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleCreateNotification}
            />
        </div>
    )
}