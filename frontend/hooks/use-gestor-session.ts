// hooks/use-gestor-session.ts
// FITXER NOU - Hook per obtenir sessió del gestor amb dades reals

'use client'

import { useSession } from 'next-auth/react'
import { useMemo } from 'react'
import { GestorRole } from '@/types/gestio-empreses'

/**
 * Rols que tenen accés al dashboard de Gestió d'Empreses
 */
const ALLOWED_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'CRM_COMERCIAL',
  'CRM_CONTINGUT',
  'GESTOR_ESTANDARD',
  'GESTOR_ESTRATEGIC',
  'GESTOR_ENTERPRISE',
  // Legacy
  'ACCOUNT_MANAGER',
]

/**
 * Hook per obtenir la sessió de l'usuari gestor
 * Connecta amb NextAuth real - NO és mock
 */
export function useGestorSession() {
  const { data: session, status } = useSession()

  const isLoading = status === 'loading'
  const isAuthenticated = status === 'authenticated'

  // Determinar el rol de gestor
  const gestorRole = useMemo((): GestorRole | null => {
    // Agafem el rol de l'usuari (no userType)
    const role = (session?.user as any)?.role
    if (!role) return null

    // Mapejar rols actuals als tipus de gestor
    if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'CRM_COMERCIAL' || role === 'CRM_CONTINGUT') {
      return 'GESTOR_CRM'
    }
    if (role === 'GESTOR_ESTANDARD') return 'GESTOR_ESTANDARD'
    if (role === 'GESTOR_ESTRATEGIC') return 'GESTOR_ESTRATEGIC'
    if (role === 'GESTOR_ENTERPRISE') return 'GESTOR_ENTERPRISE'

    // Legacy
    if (role === 'ACCOUNT_MANAGER') return 'GESTOR_CRM'

    return null
  }, [(session?.user as any)?.role])

  // Verificar si té accés al dashboard
  const hasAccess = useMemo(() => {
    const role = (session?.user as any)?.role
    if (!role) return false
    return ALLOWED_ROLES.includes(role)
  }, [(session?.user as any)?.role])

  // Helpers de rol
  const isGestorCRM = gestorRole === 'GESTOR_CRM'
  const isGestorEstandard = gestorRole === 'GESTOR_ESTANDARD'
  const isGestorEstrategic = gestorRole === 'GESTOR_ESTRATEGIC'
  const isGestorEnterprise = gestorRole === 'GESTOR_ENTERPRISE'
  const isSupervisor = isGestorCRM // CRM és supervisor

  // Permisos basats en rol
  const permissions = useMemo(() => ({
    canAccessCRMPages: isGestorCRM,
    canVerifyLeads: isGestorCRM,
    canReassignLeads: isGestorCRM,
    canViewAllLeads: isGestorCRM,
    canViewTeam: isGestorCRM,
    canGenerateAILeads: true, // Tots els gestors
    canCreateLeads: true,
    canEditLeads: true,
    canDeleteLeads: isGestorCRM,
    canExportData: true,
  }), [isGestorCRM])

  return {
    // Sessió
    session,
    user: session?.user ?? null,
    isLoading,
    isAuthenticated,
    hasAccess,

    // Rol de gestor
    gestorRole,

    // Helpers de rol
    isGestorCRM,
    isGestorEstandard,
    isGestorEstrategic,
    isGestorEnterprise,
    isSupervisor,

    // Permisos
    permissions,
    ...permissions,
  }
}

/**
 * Helper per verificar accés a una ruta
 */
export function canAccessRoute(role: string | undefined, route: string): boolean {
  if (!role) return false

  // Rutes CRM només per supervisors
  if (route.includes('/crm/')) {
    return ['SUPER_ADMIN', 'ADMIN', 'CRM_COMERCIAL', 'CRM_CONTINGUT'].includes(role)
  }

  // Resta de rutes per tots els gestors
  return ALLOWED_ROLES.includes(role)
}