'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { signOut } from 'next-auth/react'
import {
    LayoutDashboard,
    Users,
    Building2,
    Tag,
    Settings,
    BarChart3,
    Shield,
    ShieldCheck,
    Bell,
    FileText,
    CreditCard,
    Megaphone,
    Bot,
    Database,
    ChevronDown,
    ChevronRight,
    LogOut,
    MessageSquare,
    BookOpen,
    Hash,
    Link as LinkIcon,
    GraduationCap,
    Newspaper,
    ScrollText,
    Activity,
    Wrench,
    AlertTriangle,
    UsersRound,
    Layers,
    Boxes
} from 'lucide-react'

// Using native React state for collapsible sections since @radix-ui/react-collapsible is not available
function CollapsibleSection({
    title,
    items,
    defaultOpen = false,
    pathname
}: {
    title: string
    items: any[]
    defaultOpen?: boolean
    pathname: string
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className="mb-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-bold text-slate-700 uppercase tracking-wider hover:bg-slate-50 rounded-lg transition-colors"
            >
                {title}
                {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                )}
            </button>

            {isOpen && (
                <div className="mt-1 space-y-1 ml-1">
                    {items.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/admin' && pathname.startsWith(item.href))

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-slate-100 text-slate-900"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <item.icon className="h-5 w-5" strokeWidth={1.5} />
                                {item.label}
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

const ADMIN_SIDEBAR_SECTIONS = [
    {
        title: 'GENERAL',
        defaultOpen: true,
        items: [
            { label: 'Taulell', href: '/admin', icon: LayoutDashboard },
        ]
    },
    {
        title: 'GESTIÓ USUARIS',
        defaultOpen: false,
        items: [
            { label: 'Usuaris', href: '/admin/usuaris', icon: Users },
            { label: 'Rols i Permisos', href: '/admin/rols', icon: Shield },
            { label: 'Privacitat', href: '/admin/usuaris/privacitat', icon: ShieldCheck },
            { label: 'Grups', href: '/admin/grups', icon: UsersRound },
        ]
    },
    {
        title: 'GESTIÓ CONTINGUT',
        defaultOpen: false,
        items: [
            { label: 'Categories', href: '/admin/categories', icon: FileText },
        ]
    },
    {
        title: 'SISTEMA',
        defaultOpen: false,
        items: [
            { label: 'Alertes', href: '/admin/alertes', icon: AlertTriangle },
            { label: 'Salut del Sistema', href: '/admin/sistema/salut', icon: Activity },
            { label: 'Manteniment', href: '/admin/sistema/manteniment', icon: Wrench },
            { label: 'Estadístiques', href: '/admin/estadistiques', icon: BarChart3 },
            { label: 'Logs', href: '/admin/logs', icon: ScrollText },
            { label: 'Avisos', href: '/admin/avisos', icon: Bell },
            { label: 'Notificacions', href: '/admin/notificacions', icon: Bell },
            { label: 'Design System', href: '/admin/componentes', icon: Layers },
            { label: 'Configuració', href: '/admin/configuracio', icon: Settings },
        ]
    },
]

export function AdminSidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col fixed top-0 bottom-0 z-30 overflow-y-auto">
            {/* Logo */}
            <div className="h-16 flex items-center justify-center px-6 border-b border-slate-200">
                <Link href="/admin">
                    {/* Using fallback logo logic as per other files since lapublica-logo.svg might not exist */}
                    <img src="/images/cropped-logo_la-Pública-ok-2.png" alt="La Pública" className="h-14" />
                </Link>
            </div>

            {/* Navegació */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {ADMIN_SIDEBAR_SECTIONS.map((section) => (
                    <CollapsibleSection
                        key={section.title}
                        title={section.title}
                        items={section.items}
                        defaultOpen={section.defaultOpen}
                        pathname={pathname}
                    />
                ))}
            </nav>

            {/* Footer sidebar */}
            <div className="p-4 border-t border-slate-200">
                <button 
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <LogOut className="h-5 w-5" strokeWidth={1.5} />
                    Tancar sessió
                </button>
            </div>
        </aside>
    )
}
