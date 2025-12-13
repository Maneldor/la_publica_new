'use client'

import { Search, Settings } from 'lucide-react'
import { NotificationBell } from '@/components/notifications/NotificationBell'

interface AdminHeaderProps {
    title?: string
    description?: string
}

export function AdminHeader({ title = "Panel d'Administració", description }: AdminHeaderProps) {
    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
            {/* Esquerra: Títol */}
            <div>
                <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
                {description && (
                    <p className="text-sm text-slate-500">{description}</p>
                )}
            </div>

            {/* Dreta: Accions */}
            <div className="flex items-center gap-4">
                {/* Cerca global */}
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <Search className="h-5 w-5" strokeWidth={1.5} />
                </button>

                {/* Notificacions */}
                {/* Notificacions */}
                <NotificationBell />

                {/* Configuració */}
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <Settings className="h-5 w-5" strokeWidth={1.5} />
                </button>

                {/* Separador */}
                <div className="h-8 w-px bg-slate-200" />

                {/* Avatar admin */}
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-slate-900">Super Admin</p>
                        <p className="text-xs text-slate-500">Administrador</p>
                    </div>
                    <div className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center text-white font-medium">
                        SA
                    </div>
                </div>
            </div>
        </header>
    )
}
