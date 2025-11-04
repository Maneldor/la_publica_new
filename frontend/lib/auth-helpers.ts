/**
 * Helpers de autenticación integrados con sistema de permisos
 * Complementa la configuración de NextAuth con funciones utilitarias
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserInfo, UserRole, hasPermission, Permission, canAccessAdmin } from '@/lib/permissions';

/**
 * Obtiene el usuario actual desde la sesión de NextAuth
 * Convierte los datos de session a UserInfo compatible con sistema de permisos
 */
export async function getCurrentUser(): Promise<UserInfo | null> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return null;
    }

    return {
      id: session.user.id,
      role: session.user.role,
      email: session.user.email,
      communityId: session.user.communityId,
      isActive: session.user.isActive ?? true
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Requiere autenticación - lanza error si no hay usuario
 * @throws Error si no hay usuario autenticado
 * @returns UserInfo del usuario autenticado
 */
export async function requireAuth(): Promise<UserInfo> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Authentication required');
  }

  if (!user.isActive) {
    throw new Error('User account is inactive');
  }

  return user;
}

/**
 * Requiere acceso de administrador
 * @throws Error si no hay usuario o no puede acceder al admin
 * @returns UserInfo del usuario autenticado con acceso admin
 */
export async function requireAdminAuth(): Promise<UserInfo> {
  const user = await requireAuth();

  if (!canAccessAdmin(user)) {
    throw new Error('Admin access required');
  }

  return user;
}

/**
 * Requiere un permiso específico
 * @param permission Permiso requerido
 * @throws Error si no hay usuario o no tiene el permiso
 * @returns UserInfo del usuario autenticado con el permiso
 */
export async function requirePermission(permission: Permission): Promise<UserInfo> {
  const user = await requireAuth();

  if (!hasPermission(user, permission)) {
    throw new Error(`Permission required: ${permission}`);
  }

  return user;
}

/**
 * Requiere rol específico
 * @param roles Rol o roles requeridos
 * @throws Error si no hay usuario o no tiene el rol
 * @returns UserInfo del usuario autenticado con el rol
 */
export async function requireRole(roles: UserRole | UserRole[]): Promise<UserInfo> {
  const user = await requireAuth();
  const roleArray = Array.isArray(roles) ? roles : [roles];

  if (!roleArray.includes(user.role)) {
    throw new Error(`Role required: ${roleArray.join(' or ')}`);
  }

  return user;
}

/**
 * Requiere acceso a una comunidad específica
 * @param communityId ID de la comunidad
 * @throws Error si no hay usuario o no puede acceder a la comunidad
 * @returns UserInfo del usuario autenticado con acceso a la comunidad
 */
export async function requireCommunityAccess(communityId: string): Promise<UserInfo> {
  const user = await requireAuth();

  // Super Admin y Admin pueden acceder a cualquier comunidad
  if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) {
    return user;
  }

  // Community Manager y Moderator solo pueden acceder a su comunidad
  if (user.communityId !== communityId) {
    throw new Error(`Access denied to community: ${communityId}`);
  }

  return user;
}

/**
 * Verifica si el usuario actual tiene un permiso específico (no lanza error)
 * @param permission Permiso a verificar
 * @returns boolean
 */
export async function checkPermission(permission: Permission): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return user ? hasPermission(user, permission) : false;
  } catch {
    return false;
  }
}

/**
 * Verifica si el usuario actual puede acceder al admin (no lanza error)
 * @returns boolean
 */
export async function checkAdminAccess(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return user ? canAccessAdmin(user) : false;
  } catch {
    return false;
  }
}

/**
 * Verifica si el usuario actual tiene un rol específico (no lanza error)
 * @param roles Rol o roles a verificar
 * @returns boolean
 */
export async function checkRole(roles: UserRole | UserRole[]): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  } catch {
    return false;
  }
}

/**
 * Obtiene información extendida del usuario para el frontend
 * Incluye permisos y rutas accesibles
 */
export async function getUserInfo() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return {
    user,
    permissions: {
      canAccessAdmin: canAccessAdmin(user),
      // Agregar más verificaciones específicas aquí si es necesario
    },
    meta: {
      isAuthenticated: true,
      role: user.role,
      communityId: user.communityId
    }
  };
}

/**
 * Hook para uso en Server Components
 * Maneja errores de autenticación automáticamente
 */
export async function getAuthenticatedUser() {
  try {
    return await requireAuth();
  } catch (error) {
    // En Server Components, podemos redirigir o mostrar error
    console.error('Authentication failed:', error);
    return null;
  }
}

/**
 * Utility para logging de acciones autenticadas
 */
export async function logAuthenticatedAction(
  action: string,
  resource?: string,
  metadata?: Record<string, any>
) {
  const user = await getCurrentUser();

  if (!user) {
    console.warn('Attempted action without authentication:', action);
    return;
  }

  const logData = {
    timestamp: new Date().toISOString(),
    userId: user.id,
    userEmail: user.email,
    userRole: user.role,
    action,
    resource,
    communityId: user.communityId,
    metadata
  };

  // En desarrollo, log a consola
  if (process.env.NODE_ENV === 'development') {
    console.log('🔐 Authenticated Action:', logData);
  }

  // TODO: En producción, enviar a sistema de logging/auditoría
}

/**
 * Wrapper para funciones que requieren autenticación
 * Uso en Server Actions y API Routes
 */
export function withAuth<T extends any[], R>(
  fn: (user: UserInfo, ...args: T) => Promise<R> | R
) {
  return async (...args: T): Promise<R> => {
    const user = await requireAuth();
    return await fn(user, ...args);
  };
}

/**
 * Wrapper para funciones que requieren permisos específicos
 */
export function withPermission<T extends any[], R>(
  permission: Permission,
  fn: (user: UserInfo, ...args: T) => Promise<R> | R
) {
  return async (...args: T): Promise<R> => {
    const user = await requirePermission(permission);
    return await fn(user, ...args);
  };
}

/**
 * Wrapper para funciones que requieren acceso de admin
 */
export function withAdminAuth<T extends any[], R>(
  fn: (user: UserInfo, ...args: T) => Promise<R> | R
) {
  return async (...args: T): Promise<R> => {
    const user = await requireAdminAuth();
    return await fn(user, ...args);
  };
}

/**
 * Tipos de error específicos para autenticación
 */
export class AuthenticationRequiredError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationRequiredError';
  }
}

export class InsufficientPermissionsError extends Error {
  constructor(permission: string) {
    super(`Insufficient permissions: ${permission}`);
    this.name = 'InsufficientPermissionsError';
  }
}

export class AccessDeniedError extends Error {
  constructor(resource: string) {
    super(`Access denied to resource: ${resource}`);
    this.name = 'AccessDeniedError';
  }
}

/**
 * Constantes útiles para verificaciones comunes
 */
export const AUTH_CONSTANTS = {
  ADMIN_ROLES: [UserRole.SUPER_ADMIN, UserRole.ADMIN] as const,
  COMMUNITY_ROLES: [UserRole.COMMUNITY_MANAGER, UserRole.MODERATOR] as const,
  ALL_ADMIN_ROLES: [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.COMMUNITY_MANAGER,
    UserRole.MODERATOR
  ] as const
} as const;