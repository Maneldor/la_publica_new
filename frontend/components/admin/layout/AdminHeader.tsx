'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Settings, Bell, MessageSquare, User, Building2, Tag, ScrollText, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface AdminHeaderProps {
    title?: string
    description?: string
}

interface SearchResult {
    id: string
    type: 'user' | 'company' | 'offer' | 'log'
    title: string
    subtitle?: string
    url: string
}

interface NotificationItem {
    id: string
    title: string
    message: string
    createdAt: string
    isRead: boolean
    type: string
}

export function AdminHeader({ title = "Panel d'Administració", description }: AdminHeaderProps) {
    const router = useRouter()
    const { data: session } = useSession()
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<SearchResult[]>([])
    const [showSearchDropdown, setShowSearchDropdown] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const [notifications, setNotifications] = useState<NotificationItem[]>([])
    const [loading, setLoading] = useState(false)
    
    const searchRef = useRef<HTMLDivElement>(null)
    const notificationRef = useRef<HTMLDivElement>(null)

    // Fetch unread notifications count
    useEffect(() => {
        async function fetchUnreadCount() {
            try {
                const res = await fetch('/api/admin/notifications?unread=true&limit=1')
                if (res.ok) {
                    const data = await res.json()
                    if (data.success) {
                        setUnreadCount(data.totalUnread || 0)
                    }
                }
            } catch (error) {
                console.error('Error fetching unread count:', error)
            }
        }
        fetchUnreadCount()
    }, [])

    // Search functionality
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (searchQuery.trim() && searchQuery.length >= 2) {
                setLoading(true)
                try {
                    const res = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`)
                    if (res.ok) {
                        const data = await res.json()
                        if (data.success) {
                            setSearchResults(data.results || [])
                            setShowSearchDropdown(true)
                        }
                    }
                } catch (error) {
                    console.error('Error searching:', error)
                } finally {
                    setLoading(false)
                }
            } else {
                setSearchResults([])
                setShowSearchDropdown(false)
            }
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [searchQuery])

    // Fetch notifications when dropdown opens
    useEffect(() => {
        if (showNotifications && notifications.length === 0) {
            fetchNotifications()
        }
    }, [showNotifications])

    async function fetchNotifications() {
        try {
            const res = await fetch('/api/admin/notifications?limit=5')
            if (res.ok) {
                const data = await res.json()
                if (data.success) {
                    setNotifications(data.notifications || [])
                }
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
        }
    }

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearchDropdown(false)
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    function getResultIcon(type: string) {
        switch (type) {
            case 'user': return User
            case 'company': return Building2
            case 'offer': return Tag
            case 'log': return ScrollText
            default: return User
        }
    }

    function formatTimeAgo(timestamp: string): string {
        const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
        if (seconds < 60) return 'Ara mateix'
        if (seconds < 3600) return `Fa ${Math.floor(seconds / 60)} min`
        if (seconds < 86400) return `Fa ${Math.floor(seconds / 3600)}h`
        return `Fa ${Math.floor(seconds / 86400)} dies`
    }

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
            {/* Zona izquierda: Buscador expandido */}
            <div ref={searchRef} className="flex-1 max-w-xl relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar usuaris, empreses, ofertes..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {loading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400"></div>
                        </div>
                    )}
                </div>

                {/* Search Dropdown */}
                {showSearchDropdown && searchResults.length > 0 && (
                    <div className="absolute top-full mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                        {searchResults.map((result) => {
                            const Icon = getResultIcon(result.type)
                            return (
                                <Link
                                    key={result.id}
                                    href={result.url}
                                    className="block px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                                    onClick={() => {
                                        setShowSearchDropdown(false)
                                        setSearchQuery('')
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-900">{result.title}</p>
                                            {result.subtitle && (
                                                <p className="text-xs text-slate-500">{result.subtitle}</p>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Zona derecha: Iconos + Perfil */}
            <div className="flex items-center gap-2">
                {/* Notificacions */}
                <div ref={notificationRef} className="relative">
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <Bell className="h-5 w-5" strokeWidth={1.5} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                        <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                            <div className="p-4 border-b border-slate-100">
                                <h3 className="font-medium text-slate-900">Notificacions</h3>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-4 text-center text-slate-500 text-sm">
                                        No hi ha notificacions
                                    </div>
                                ) : (
                                    notifications.map((notification) => (
                                        <div key={notification.id} className={`p-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 ${!notification.isRead ? 'bg-blue-50' : ''}`}>
                                            <p className="text-sm font-medium text-slate-900">{notification.title}</p>
                                            <p className="text-xs text-slate-600 mt-1">{notification.message}</p>
                                            <p className="text-xs text-slate-400 mt-1">{formatTimeAgo(notification.createdAt)}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-3 border-t border-slate-100">
                                <Link 
                                    href="/admin/notificacions"
                                    className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    onClick={() => setShowNotifications(false)}
                                >
                                    Veure totes
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Missatges */}
                <button 
                    onClick={() => router.push('/admin/missatges')}
                    className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <MessageSquare className="h-5 w-5" strokeWidth={1.5} />
                </button>

                {/* Configuració */}
                <button 
                    onClick={() => router.push('/admin/configuracio')}
                    className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <Settings className="h-5 w-5" strokeWidth={1.5} />
                </button>

                {/* Separador */}
                <div className="w-px h-8 bg-slate-200 mx-2" />

                {/* Perfil pegado al extremo */}
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-sm font-medium text-slate-900">{session?.user?.name || 'Super Admin'}</p>
                        <p className="text-xs text-slate-500">Administrador</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                        {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'SA'}
                    </div>
                </div>
            </div>
        </header>
    )
}
