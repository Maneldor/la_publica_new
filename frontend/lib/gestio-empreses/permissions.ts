// lib/gestio-empreses/permissions.ts

import { UserRole } from '@prisma/client'
import React from 'react'
import {
  User,
  Crown,
  Settings,
  BarChart3,
  FileText,
  Briefcase,
  Target,
  Award,
  Shield,
  Building2
} from 'lucide-react'

// ============================================
// JERARQUIA DE ROLS
// ============================================

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 90,
  ADMIN_GESTIO: 85,
  CRM_COMERCIAL: 70,
  CRM_CONTINGUT: 70,
  GESTOR_ENTERPRISE: 50,
  GESTOR_ESTRATEGIC: 50,
  GESTOR_ESTANDARD: 50,
  MODERATOR: 40,
  COMPANY: 20,
  USER: 10,
}

// ============================================
// GRUPS DE ROLS
// ============================================

export const ROLE_GROUPS = {
  // Administradors amb accés total
  ADMINS: ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO'] as UserRole[],

  // Supervisors CRM
  SUPERVISORS: ['CRM_COMERCIAL', 'CRM_CONTINGUT'] as UserRole[],

  // Gestors comercials (tots els nivells)
  GESTORS: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE'] as UserRole[],

  // Equip comercial complet (supervisor + gestors)
  CRM_TEAM: ['CRM_COMERCIAL', 'GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE'] as UserRole[],

  // Equip de contingut
  CONTENT_TEAM: ['CRM_CONTINGUT', 'MODERATOR'] as UserRole[],

  // Tots els que poden accedir a /gestio/
  ALL_GESTIO: ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO', 'CRM_COMERCIAL', 'CRM_CONTINGUT', 'GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE'] as UserRole[],

  // Poden veure totes les dades comercials
  CAN_VIEW_ALL_COMMERCIAL: ['SUPER_ADMIN', 'ADMIN', 'CRM_COMERCIAL'] as UserRole[],

  // Poden verificar leads
  CAN_VERIFY: ['SUPER_ADMIN', 'ADMIN', 'CRM_COMERCIAL'] as UserRole[],

  // Poden assignar leads/empreses
  CAN_ASSIGN: ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO', 'CRM_COMERCIAL'] as UserRole[],

  // Poden gestionar equip
  CAN_MANAGE_TEAM: ['SUPER_ADMIN', 'ADMIN', 'CRM_COMERCIAL'] as UserRole[],
}

// ============================================
// PERMISOS ESPECÍFICS CRM
// ============================================

export const PERMISSIONS = {
  // LEADS
  LEADS_VIEW_ALL: ['SUPER_ADMIN', 'ADMIN', 'CRM_COMERCIAL'] as UserRole[],
  LEADS_VIEW_OWN: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE'] as UserRole[],
  LEADS_CREATE: ['SUPER_ADMIN', 'ADMIN', 'CRM_COMERCIAL', 'GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE'] as UserRole[],
  LEADS_EDIT: ['SUPER_ADMIN', 'ADMIN', 'CRM_COMERCIAL', 'GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE'] as UserRole[],
  LEADS_DELETE: ['SUPER_ADMIN', 'ADMIN', 'CRM_COMERCIAL'] as UserRole[],
  LEADS_VERIFY: ['SUPER_ADMIN', 'ADMIN', 'CRM_COMERCIAL'] as UserRole[],
  LEADS_ASSIGN: ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO', 'CRM_COMERCIAL'] as UserRole[],
  LEADS_AI_GENERATE: ['SUPER_ADMIN', 'ADMIN', 'CRM_COMERCIAL', 'GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE'] as UserRole[],
  LEADS_EXPORT: ['SUPER_ADMIN', 'ADMIN', 'CRM_COMERCIAL'] as UserRole[],

  // EMPRESES
  COMPANIES_VIEW_ALL: ['SUPER_ADMIN', 'ADMIN', 'CRM_COMERCIAL'] as UserRole[],
  COMPANIES_VIEW_OWN: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE'] as UserRole[],
  COMPANIES_CREATE: ['SUPER_ADMIN', 'ADMIN', 'CRM_COMERCIAL'] as UserRole[],
  COMPANIES_EDIT: ['SUPER_ADMIN', 'ADMIN', 'CRM_COMERCIAL', 'GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE'] as UserRole[],
  COMPANIES_DELETE: ['SUPER_ADMIN', 'ADMIN'] as UserRole[],
  COMPANIES_ASSIGN: ['SUPER_ADMIN', 'ADMIN', 'CRM_COMERCIAL'] as UserRole[],

  // OFERTES
  OFFERS_VIEW_ALL: ['SUPER_ADMIN', 'ADMIN', 'CRM_COMERCIAL'] as UserRole[],
  OFFERS_VIEW_OWN: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE'] as UserRole[],
  OFFERS_CREATE: ['SUPER_ADMIN', 'ADMIN', 'CRM_COMERCIAL', 'GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE'] as UserRole[],
  OFFERS_EDIT: ['SUPER_ADMIN', 'ADMIN', 'CRM_COMERCIAL', 'GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE'] as UserRole[],
  OFFERS_DELETE: ['SUPER_ADMIN', 'ADMIN', 'CRM_COMERCIAL'] as UserRole[],
  OFFERS_PUBLISH: ['SUPER_ADMIN', 'ADMIN', 'CRM_COMERCIAL'] as UserRole[],

  // EQUIP
  TEAM_VIEW: ['SUPER_ADMIN', 'ADMIN', 'CRM_COMERCIAL'] as UserRole[],
  TEAM_MANAGE: ['SUPER_ADMIN', 'ADMIN', 'CRM_COMERCIAL'] as UserRole[],

  // VERIFICACIÓ
  VERIFICATION_ACCESS: ['SUPER_ADMIN', 'ADMIN', 'CRM_COMERCIAL'] as UserRole[],

  // ASSIGNACIONS
  ASSIGNMENTS_ACCESS: ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO', 'CRM_COMERCIAL'] as UserRole[],

  // ESTADÍSTIQUES
  STATS_VIEW_ALL: ['SUPER_ADMIN', 'ADMIN'] as UserRole[],
  STATS_VIEW_TEAM: ['CRM_COMERCIAL'] as UserRole[],
  STATS_VIEW_OWN: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE', 'CRM_CONTINGUT'] as UserRole[],

  // CONTINGUT (per CRM_CONTINGUT)
  CONTENT_VIEW_ALL: ['SUPER_ADMIN', 'ADMIN', 'CRM_CONTINGUT'] as UserRole[],
  CONTENT_CREATE: ['SUPER_ADMIN', 'ADMIN', 'CRM_CONTINGUT'] as UserRole[],
  CONTENT_EDIT: ['SUPER_ADMIN', 'ADMIN', 'CRM_CONTINGUT'] as UserRole[],
  CONTENT_DELETE: ['SUPER_ADMIN', 'ADMIN', 'CRM_CONTINGUT'] as UserRole[],
  CONTENT_PUBLISH: ['SUPER_ADMIN', 'ADMIN', 'CRM_CONTINGUT'] as UserRole[],
  CONTENT_MODERATE: ['SUPER_ADMIN', 'ADMIN', 'CRM_CONTINGUT', 'MODERATOR'] as UserRole[],

  // TASQUES / AGENDA (filtre propi)
  TASKS_VIEW_ALL: ['SUPER_ADMIN', 'ADMIN'] as UserRole[],
  TASKS_VIEW_TEAM: ['CRM_COMERCIAL', 'CRM_CONTINGUT'] as UserRole[],
  TASKS_VIEW_OWN: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE'] as UserRole[],

  // MISSATGERIA
  MESSAGES_VIEW_ALL: ['SUPER_ADMIN', 'ADMIN'] as UserRole[],
  MESSAGES_VIEW_TEAM: ['CRM_COMERCIAL', 'CRM_CONTINGUT'] as UserRole[],
  MESSAGES_VIEW_OWN: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE'] as UserRole[],

  // SUBSCRIPCIONS / FACTURACIÓ
  BILLING_VIEW: ['SUPER_ADMIN', 'ADMIN', 'CRM_COMERCIAL'] as UserRole[],
  BILLING_MANAGE: ['SUPER_ADMIN', 'ADMIN'] as UserRole[],

  // CONFIGURACIÓ
  SETTINGS_VIEW: ['SUPER_ADMIN', 'ADMIN'] as UserRole[],
  SETTINGS_EDIT: ['SUPER_ADMIN'] as UserRole[],
}

// Tipus per als permisos
export type PermissionKey = keyof typeof PERMISSIONS

// ============================================
// FUNCIONS D'UTILITAT
// ============================================

/**
 * Comprova si un rol té un permís específic
 */
export function hasPermission(role: UserRole | undefined | null, permission: PermissionKey): boolean {
  if (!role) return false
  const allowedRoles = PERMISSIONS[permission]
  return allowedRoles.includes(role)
}

/**
 * Comprova si un rol té un nivell mínim de jerarquia
 */
export function hasMinimumRole(role: UserRole | undefined | null, minRole: UserRole): boolean {
  if (!role) return false
  return (ROLE_HIERARCHY[role] || 0) >= (ROLE_HIERARCHY[minRole] || 0)
}

/**
 * Comprova si un rol pertany a un grup
 */
export function isInRoleGroup(role: UserRole | undefined | null, group: keyof typeof ROLE_GROUPS): boolean {
  if (!role) return false
  return ROLE_GROUPS[group].includes(role)
}

/**
 * Retorna el nivell d'accés a les dades
 */
export function getDataAccessLevel(role: UserRole | undefined | null): 'all' | 'team' | 'own' | 'none' {
  if (!role) return 'none'

  if (isInRoleGroup(role, 'ADMINS')) return 'all'
  if (role === 'CRM_COMERCIAL') return 'team'
  if (role === 'CRM_CONTINGUT') return 'own'
  if (isInRoleGroup(role, 'GESTORS')) return 'own'

  return 'none'
}

/**
 * Comprova si és un rol de gestor comercial
 */
export function isGestorRole(role: UserRole | undefined | null): boolean {
  if (!role) return false
  return ROLE_GROUPS.GESTORS.includes(role)
}

/**
 * Comprova si és un rol amb accés a gestió
 */
export function canAccessGestio(role: UserRole | undefined | null): boolean {
  if (!role) return false
  return ROLE_GROUPS.ALL_GESTIO.includes(role)
}

/**
 * Comprova si pot veure el selector de vista (Admin/CRM Comercial)
 */
export function canSwitchView(role: UserRole | undefined | null): boolean {
  if (!role) return false
  return ['SUPER_ADMIN', 'ADMIN', 'CRM_COMERCIAL'].includes(role)
}

/**
 * Retorna els rols que pot "veure com" segons el seu rol
 */
export function getViewableRoles(role: UserRole | undefined | null): UserRole[] {
  if (!role) return []

  switch (role) {
    case 'SUPER_ADMIN':
    case 'ADMIN':
      // Pot veure com a qualsevol rol de gestió
      return ['CRM_COMERCIAL', 'CRM_CONTINGUT', 'GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE']
    case 'CRM_COMERCIAL':
      // Pot veure com a qualsevol gestor
      return ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE']
    default:
      return []
  }
}

// ============================================
// ETIQUETES I VISUALITZACIÓ
// ============================================

/**
 * Retorna l'etiqueta en català del rol
 */
export function getRoleLabel(role: UserRole | undefined | null): string {
  if (!role) return 'Desconegut'

  const labels: Record<UserRole, string> = {
    SUPER_ADMIN: 'Super Administrador',
    ADMIN: 'Administrador',
    ADMIN_GESTIO: 'Admin Gestió',
    CRM_COMERCIAL: 'CRM Comercial',
    CRM_CONTINGUT: 'CRM Contingut',
    GESTOR_ESTANDARD: 'Gestor Estàndard',
    GESTOR_ESTRATEGIC: 'Gestor Estratègic',
    GESTOR_ENTERPRISE: 'Gestor Enterprise',
    MODERATOR: 'Moderador',
    COMPANY: 'Empresa',
    USER: 'Usuari',
  }

  return labels[role] || role
}

/**
 * Retorna el color del badge segons el rol
 */
export function getRoleBadgeColor(role: UserRole | undefined | null): string {
  if (!role) return 'bg-gray-100 text-gray-700'

  const colors: Record<UserRole, string> = {
    SUPER_ADMIN: 'bg-red-100 text-red-700',
    ADMIN: 'bg-orange-100 text-orange-700',
    ADMIN_GESTIO: 'bg-pink-100 text-pink-700',
    CRM_COMERCIAL: 'bg-blue-100 text-blue-700',
    CRM_CONTINGUT: 'bg-purple-100 text-purple-700',
    GESTOR_ESTANDARD: 'bg-slate-100 text-slate-700',
    GESTOR_ESTRATEGIC: 'bg-cyan-100 text-cyan-700',
    GESTOR_ENTERPRISE: 'bg-indigo-100 text-indigo-700',
    MODERATOR: 'bg-yellow-100 text-yellow-700',
    COMPANY: 'bg-green-100 text-green-700',
    USER: 'bg-gray-100 text-gray-700',
  }

  return colors[role] || 'bg-gray-100 text-gray-700'
}

/**
 * Retorna el componente de icono del rol
 */
export function getRoleIcon(role: UserRole | undefined | null): React.ComponentType<any> {
  if (!role) return User

  const icons: Record<UserRole, React.ComponentType<any>> = {
    SUPER_ADMIN: Crown,
    ADMIN: Settings,
    ADMIN_GESTIO: Shield,
    CRM_COMERCIAL: BarChart3,
    CRM_CONTINGUT: FileText,
    GESTOR_ESTANDARD: Briefcase,
    GESTOR_ESTRATEGIC: Target,
    GESTOR_ENTERPRISE: Award,
    MODERATOR: Shield,
    COMPANY: Building2,
    USER: User,
  }

  return icons[role] || User
}

/**
 * Informació del segment de gestor
 */
export function getGestorSegmentInfo(role: UserRole | undefined | null): {
  label: string
  color: string
  bgColor: string
  targets: { leads: number; companies: number }
  avgValue: string
} | null {
  if (!role || !isGestorRole(role)) return null

  const segments = {
    GESTOR_ESTANDARD: {
      label: 'Estàndard',
      color: 'text-slate-600',
      bgColor: 'bg-slate-100',
      targets: { leads: 25, companies: 50 },
      avgValue: '< 10K€'
    },
    GESTOR_ESTRATEGIC: {
      label: 'Estratègic',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
      targets: { leads: 12, companies: 25 },
      avgValue: '10K-50K€'
    },
    GESTOR_ENTERPRISE: {
      label: 'Enterprise',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      targets: { leads: 5, companies: 10 },
      avgValue: '> 50K€'
    },
  }

  return segments[role as keyof typeof segments] || null
}

// ============================================
// TIPUS DE DASHBOARD
// ============================================

export type DashboardType = 'admin' | 'crm_comercial' | 'crm_contingut' | 'gestor'

/**
 * Retorna el tipus de dashboard segons el rol
 */
export function getDashboardType(role: UserRole | undefined | null): DashboardType {
  if (!role) return 'gestor'

  if (['SUPER_ADMIN', 'ADMIN'].includes(role)) return 'admin'
  if (role === 'ADMIN_GESTIO') return 'crm_comercial'
  if (role === 'CRM_COMERCIAL') return 'crm_comercial'
  if (role === 'CRM_CONTINGUT') return 'crm_contingut'

  return 'gestor'
}