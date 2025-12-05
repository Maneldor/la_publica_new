// components/gestio-empreses/layout/ViewSelector.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { Check, ChevronDown, Eye, Users, Crown, Settings, BarChart3, FileText, Briefcase, Target, Award } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGestioPermissions } from '@/hooks/useGestioPermissions'
import { getRoleLabel, getRoleBadgeColor } from '@/lib/gestio-empreses/permissions'
import { UserRole } from '@prisma/client'

interface ViewUser {
  id: string
  name: string
  email: string
  role: UserRole
}

interface ViewSelectorProps {
  onViewChange?: (userId: string | null, role: UserRole | null) => void
}

// Helper function to get icon component
function getRoleIcon(userRole: UserRole | null) {
  switch (userRole) {
    case 'SUPER_ADMIN': return Crown
    case 'ADMIN': return Settings
    case 'CRM_COMERCIAL': return BarChart3
    case 'CRM_CONTINGUT': return FileText
    case 'GESTOR_ESTANDARD': return Briefcase
    case 'GESTOR_ESTRATEGIC': return Target
    case 'GESTOR_ENTERPRISE': return Award
    default: return Users
  }
}

export function ViewSelector({ onViewChange }: ViewSelectorProps) {
  const { role, roleLabel, hasViewSelector, viewableRoles, userId, userName } = useGestioPermissions()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedView, setSelectedView] = useState<{ userId: string | null; role: UserRole | null }>({
    userId: null,
    role: null
  })
  const [viewableUsers, setViewableUsers] = useState<ViewUser[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Carregar usuaris que podem veure
  useEffect(() => {
    if (hasViewSelector && viewableRoles.length > 0) {
      loadViewableUsers()
    }
  }, [hasViewSelector, viewableRoles])

  const loadViewableUsers = async () => {
    setIsLoading(true)
    try {
      // TODO: Implementar API per obtenir usuaris segons rols
      // Per ara, dades de prova
      const mockUsers: ViewUser[] = [
        { id: '1', name: 'Gestor Estàndard', email: 'g-estandar@lapublica.cat', role: 'GESTOR_ESTANDARD' as UserRole },
        { id: '2', name: 'Gestor Estratègic', email: 'g-strategic@lapublica.cat', role: 'GESTOR_ESTRATEGIC' as UserRole },
        { id: '3', name: 'Gestor Enterprise', email: 'g-enterprise@lapublica.cat', role: 'GESTOR_ENTERPRISE' as UserRole },
      ]
      setViewableUsers(mockUsers)
    } catch (error) {
      console.error('Error loading viewable users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectView = (viewUserId: string | null, viewRole: UserRole | null) => {
    setSelectedView({ userId: viewUserId, role: viewRole })
    setIsOpen(false)
    onViewChange?.(viewUserId, viewRole)
  }

  const handleResetView = () => {
    handleSelectView(null, null)
  }

  // Si no té selector, no mostrem res
  if (!hasViewSelector) return null

  const currentViewLabel = selectedView.userId
    ? viewableUsers.find(u => u.id === selectedView.userId)?.name || 'Seleccionat'
    : 'La meva vista'

  const currentViewIcon = getRoleIcon(selectedView.role || role)
  const myViewIcon = getRoleIcon(role)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
      >
        <Eye className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
        <span className="text-sm font-medium text-slate-700">
          Vista: {currentViewLabel}
        </span>
        <div className="flex items-center justify-center w-4 h-4">
          {React.createElement(currentViewIcon, { className: "h-4 w-4" })}
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 text-slate-400 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            {/* La meva vista */}
            <button
              onClick={handleResetView}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                !selectedView.userId
                  ? "bg-blue-50 text-blue-700"
                  : "hover:bg-slate-50"
              )}
            >
              <div className="flex items-center justify-center w-5 h-5">
                {React.createElement(myViewIcon, { className: "h-4 w-4" })}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">La meva vista</p>
                <p className="text-xs text-slate-500">{roleLabel}</p>
              </div>
              {!selectedView.userId && <Check className="h-4 w-4 text-blue-600" />}
            </button>

            {/* Separador */}
            {viewableUsers.length > 0 && (
              <div className="my-2 border-t border-slate-100" />
            )}

            {/* Llista d'usuaris */}
            {isLoading ? (
              <div className="px-3 py-2 text-sm text-slate-500">Carregant...</div>
            ) : (
              <div className="space-y-1">
                <div className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase">
                  Veure com a...
                </div>
                {viewableUsers.map(user => {
                  const userIcon = getRoleIcon(user.role)
                  return (
                    <button
                      key={user.id}
                      onClick={() => handleSelectView(user.id, user.role)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                        selectedView.userId === user.id
                          ? "bg-blue-50 text-blue-700"
                          : "hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center justify-center w-5 h-5">
                        {React.createElement(userIcon, { className: "h-4 w-4" })}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        getRoleBadgeColor(user.role)
                      )}>
                        {getRoleLabel(user.role).split(' ').pop()}
                      </span>
                      {selectedView.userId === user.id && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Indicador de vista activa */}
      {selectedView.userId && (
        <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
          Veient com a
        </div>
      )}
    </div>
  )
}