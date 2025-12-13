'use client'

import { useState } from 'react'
import { GestioSidebar } from '@/components/gestio-empreses/layout/GestioSidebar'
import { GestioHeader } from '@/components/gestio-empreses/layout/GestioHeader'
import { useGestioPermissions } from '@/hooks/useGestioPermissions'
import { UserRole } from '@prisma/client'

interface GestioShellProps {
    children: React.ReactNode
}

export function GestioShell({ children }: GestioShellProps) {
    const { isLoading, canAccessGestioPanel } = useGestioPermissions()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [viewingAs, setViewingAs] = useState<{ userId: string | null; role: UserRole | null }>({
        userId: null,
        role: null
    })

    const handleViewChange = (userId: string | null, role: UserRole | null) => {
        setViewingAs({ userId, role })
        // TODO: Passar aquest estat als components fills per filtrar dades
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-slate-500">Carregant...</div>
            </div>
        )
    }

    if (!canAccessGestioPanel) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold text-slate-900 mb-2">Accés denegat</h1>
                    <p className="text-slate-500">No tens permisos per accedir a aquesta secció.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <div className={`
        fixed inset-y-0 left-0 z-50 lg:relative lg:z-0
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        transition-transform duration-200 ease-in-out
      `}>
                <GestioSidebar />
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-screen">
                <GestioHeader
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    onViewChange={handleViewChange}
                />

                <main className="flex-1 p-6">
                    {/* Banner de "Veient com a" */}
                    {viewingAs.userId && (
                        <div className="mb-4 bg-orange-100 border border-orange-200 rounded-lg px-4 py-2 flex items-center justify-between">
                            <p className="text-sm text-orange-700">
                                Estàs veient el dashboard com a un altre usuari
                            </p>
                            <button
                                onClick={() => handleViewChange(null, null)}
                                className="text-sm text-orange-600 hover:text-orange-800 font-medium"
                            >
                                Tornar a la meva vista
                            </button>
                        </div>
                    )}

                    {children}
                </main>
            </div>
        </div>
    )
}
