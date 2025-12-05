// components/gestio-empreses/layout/GestioHeader.tsx

'use client'

import { Bell, Menu, RefreshCw, Search } from 'lucide-react'
import { useGestioPermissions } from '@/hooks/useGestioPermissions'
import { ViewSelector } from './ViewSelector'
import { UserRole } from '@prisma/client'

interface GestioHeaderProps {
  title?: string
  subtitle?: string
  onRefresh?: () => void
  onViewChange?: (userId: string | null, role: UserRole | null) => void
  onToggleSidebar?: () => void
}

export function GestioHeader({
  title = 'Dashboard de Gestió',
  subtitle,
  onRefresh,
  onViewChange,
  onToggleSidebar,
}: GestioHeaderProps) {
  const { userName, roleLabel, roleBadgeColor, hasViewSelector } = useGestioPermissions()

  return (
    <header className="h-[73px] bg-white border-b border-slate-200 px-6 flex items-center">
      <div className="w-full flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Title */}
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-slate-500">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* View Selector (només Admin/CRM Comercial) - Temporalment desactivat */}
          {/* {hasViewSelector && (
            <ViewSelector onViewChange={onViewChange} />
          )} */}

          {/* Search */}
          <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            <Search className="h-5 w-5" strokeWidth={1.5} />
          </button>

          {/* Refresh */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <RefreshCw className="h-5 w-5" strokeWidth={1.5} />
            </button>
          )}

          {/* Notifications */}
          <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            <Bell className="h-5 w-5" strokeWidth={1.5} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User */}
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">{userName || 'Usuari'}</p>
              <p className={`text-xs px-2 py-0.5 rounded-full inline-block ${roleBadgeColor}`}>
                {roleLabel}
              </p>
            </div>
            <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-slate-600">
                {userName?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}