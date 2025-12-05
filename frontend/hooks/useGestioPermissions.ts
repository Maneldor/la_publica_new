// hooks/useGestioPermissions.ts

'use client'

import { useSession } from 'next-auth/react'
import { UserRole } from '@prisma/client'
import {
  hasPermission,
  hasMinimumRole,
  isInRoleGroup,
  getDataAccessLevel,
  isGestorRole,
  canAccessGestio,
  canSwitchView,
  getViewableRoles,
  getRoleLabel,
  getRoleBadgeColor,
  getRoleIcon,
  getGestorSegmentInfo,
  getDashboardType,
  ROLE_GROUPS,
  PERMISSIONS,
  PermissionKey,
} from '@/lib/gestio-empreses/permissions'

export function useGestioPermissions() {
  const { data: session, status } = useSession()

  const isLoading = status === 'loading'
  const isAuthenticated = status === 'authenticated'
  const user = session?.user
  const role = user?.role as UserRole | undefined
  const userId = user?.id
  const userName = user?.name

  // Helper per comprovar permisos
  const can = (permission: PermissionKey) => hasPermission(role, permission)

  // Helper per comprovar rol mínim
  const hasMinRole = (minRole: UserRole) => hasMinimumRole(role, minRole)

  // Helper per comprovar grup
  const isInGroup = (group: keyof typeof ROLE_GROUPS) => isInRoleGroup(role, group)

  // Nivell d'accés a dades
  const dataAccess = getDataAccessLevel(role)

  // Booleans de rol
  const isAdmin = isInGroup('ADMINS')
  const isSupervisor = isInGroup('SUPERVISORS')
  const isGestor = isGestorRole(role)
  const isCrmComercial = role === 'CRM_COMERCIAL'
  const isCrmContingut = role === 'CRM_CONTINGUT'

  // Permisos específics (shortcuts)
  const canViewAllLeads = can('LEADS_VIEW_ALL')
  const canViewOwnLeads = can('LEADS_VIEW_OWN') || canViewAllLeads
  const canCreateLeads = can('LEADS_CREATE')
  const canEditLeads = can('LEADS_EDIT')
  const canDeleteLeads = can('LEADS_DELETE')
  const canVerifyLeads = can('LEADS_VERIFY')
  const canAssignLeads = can('LEADS_ASSIGN')
  const canGenerateAILeads = can('LEADS_AI_GENERATE')
  const canExportLeads = can('LEADS_EXPORT')

  const canViewAllCompanies = can('COMPANIES_VIEW_ALL')
  const canViewOwnCompanies = can('COMPANIES_VIEW_OWN') || canViewAllCompanies
  const canCreateCompanies = can('COMPANIES_CREATE')
  const canEditCompanies = can('COMPANIES_EDIT')
  const canAssignCompanies = can('COMPANIES_ASSIGN')

  const canViewTeam = can('TEAM_VIEW')
  const canManageTeam = can('TEAM_MANAGE')

  const canAccessVerification = can('VERIFICATION_ACCESS')
  const canAccessAssignments = can('ASSIGNMENTS_ACCESS')

  const canViewAllStats = can('STATS_VIEW_ALL')
  const canViewTeamStats = can('STATS_VIEW_TEAM')
  const canViewOwnStats = can('STATS_VIEW_OWN')

  const canPublishContent = can('CONTENT_PUBLISH')
  const canModerateContent = can('CONTENT_MODERATE')

  const canViewBilling = can('BILLING_VIEW')
  const canManageBilling = can('BILLING_MANAGE')

  // Selector de vista
  const hasViewSelector = canSwitchView(role)
  const viewableRoles = getViewableRoles(role)

  // Informació visual
  const roleLabel = getRoleLabel(role)
  const roleBadgeColor = getRoleBadgeColor(role)
  // const roleIcon = getRoleIcon(role) // Temporalmente comentado por errores
  const gestorSegment = getGestorSegmentInfo(role)
  const dashboardType = getDashboardType(role)

  // Accés general
  const canAccessGestioPanel = canAccessGestio(role)

  return {
    // Sessió
    isLoading,
    isAuthenticated,
    user,
    role,
    userId,
    userName,

    // Helpers
    can,
    hasMinRole,
    isInGroup,

    // Nivell accés
    dataAccess,

    // Rols
    isAdmin,
    isSupervisor,
    isGestor,
    isCrmComercial,
    isCrmContingut,

    // Permisos Leads
    canViewAllLeads,
    canViewOwnLeads,
    canCreateLeads,
    canEditLeads,
    canDeleteLeads,
    canVerifyLeads,
    canAssignLeads,
    canGenerateAILeads,
    canExportLeads,

    // Permisos Empreses
    canViewAllCompanies,
    canViewOwnCompanies,
    canCreateCompanies,
    canEditCompanies,
    canAssignCompanies,

    // Permisos Equip
    canViewTeam,
    canManageTeam,
    canAccessVerification,
    canAccessAssignments,

    // Permisos Estadístiques
    canViewAllStats,
    canViewTeamStats,
    canViewOwnStats,

    // Permisos Contingut
    canPublishContent,
    canModerateContent,

    // Permisos Facturació
    canViewBilling,
    canManageBilling,

    // Selector de vista
    hasViewSelector,
    viewableRoles,

    // Visual
    roleLabel,
    roleBadgeColor,
    // roleIcon, // Temporalmente comentado por errores
    gestorSegment,
    dashboardType,

    // Accés
    canAccessGestioPanel,
  }
}

// Tipus exportat
export type GestioPermissions = ReturnType<typeof useGestioPermissions>