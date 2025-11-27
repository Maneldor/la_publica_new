/**
 * Sistema RBAC (Role-Based Access Control)
 * Helpers y decoradores para proteger endpoints API y funciones
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  UserInfo,
  UserRole,
  Permission,
  hasPermission,
  canAccessAdmin,
  canAccessCommunity,
  CommunityContext
} from './permissions';
import { getCurrentUser as getSessionUser } from './auth-helpers';

// Tipos para manejo de errores de autorización
export class AuthorizationError extends Error {
  constructor(
    message: string,
    public code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'INVALID_TOKEN' = 'FORBIDDEN'
  ) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Obtiene el usuario actual desde headers o request
 */
export async function getCurrentUser(): Promise<UserInfo | null> {
  try {
    return await getSessionUser();
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Verifica si el usuario actual tiene un permiso específico
 * @param permission Permiso a verificar
 * @param context Contexto opcional de comunidad
 * @throws AuthenticationError si no hay usuario
 * @throws AuthorizationError si no tiene permiso
 * @returns UserInfo del usuario autenticado
 */
export async function checkPermission(
  permission: Permission,
  context?: CommunityContext
): Promise<UserInfo> {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthenticationError('Usuario no autenticado');
  }

  if (!hasPermission(user, permission, context)) {
    throw new AuthorizationError(
      `Usuario ${user.email} no tiene permiso: ${permission}`,
      'FORBIDDEN'
    );
  }

  return user;
}

/**
 * Verifica si el usuario actual puede acceder al panel de administración
 * @throws AuthenticationError si no hay usuario
 * @throws AuthorizationError si no puede acceder al admin
 * @returns UserInfo del usuario autenticado
 */
export async function checkAdminAccess(): Promise<UserInfo> {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthenticationError('Usuario no autenticado');
  }

  if (!canAccessAdmin(user)) {
    throw new AuthorizationError(
      `Usuario ${user.email} no puede acceder al panel de administración`,
      'FORBIDDEN'
    );
  }

  return user;
}

/**
 * Verifica si el usuario actual puede acceder a una comunidad específica
 * @param communityId ID de la comunidad
 * @throws AuthenticationError si no hay usuario
 * @throws AuthorizationError si no puede acceder a la comunidad
 * @returns UserInfo del usuario autenticado
 */
export async function checkCommunityAccess(communityId: string): Promise<UserInfo> {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthenticationError('Usuario no autenticado');
  }

  if (!canAccessCommunity(user, communityId)) {
    throw new AuthorizationError(
      `Usuario ${user.email} no puede acceder a la comunidad ${communityId}`,
      'FORBIDDEN'
    );
  }

  return user;
}

/**
 * Wrapper para handlers de API que requieren autenticación
 */
export function withAuth<T extends any[]>(
  handler: (user: UserInfo, ...args: T) => Promise<NextResponse> | NextResponse
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      return await handler(user, ...args);
    } catch (error) {
      console.error('Auth wrapper error:', error);

      if (error instanceof AuthenticationError) {
        return NextResponse.json(
          { error: error.message },
          { status: 401 }
        );
      }

      if (error instanceof AuthorizationError) {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Wrapper para handlers de API que requieren permisos específicos
 */
export function withPermissions<T extends any[]>(
  permissions: Permission | Permission[],
  context?: CommunityContext
) {
  return function (
    handler: (user: UserInfo, ...args: T) => Promise<NextResponse> | NextResponse
  ) {
    return async (...args: T): Promise<NextResponse> => {
      try {
        const permissionsArray = Array.isArray(permissions) ? permissions : [permissions];

        // Verificar cada permiso
        for (const permission of permissionsArray) {
          await checkPermission(permission, context);
        }

        const user = await getCurrentUser();
        return await handler(user!, ...args);
      } catch (error) {
        console.error('Permission wrapper error:', error);

        if (error instanceof AuthenticationError) {
          return NextResponse.json(
            { error: error.message },
            { status: 401 }
          );
        }

        if (error instanceof AuthorizationError) {
          return NextResponse.json(
            { error: error.message },
            { status: 403 }
          );
        }

        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
    };
  };
}

/**
 * Wrapper para handlers que requieren acceso de administrador
 */
export function withAdminAccess<T extends any[]>(
  handler: (user: UserInfo, ...args: T) => Promise<NextResponse> | NextResponse
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      const user = await checkAdminAccess();
      return await handler(user, ...args);
    } catch (error) {
      console.error('Admin access wrapper error:', error);

      if (error instanceof AuthenticationError) {
        return NextResponse.json(
          { error: error.message },
          { status: 401 }
        );
      }

      if (error instanceof AuthorizationError) {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Wrapper para handlers que requieren acceso a comunidad específica
 */
export function withCommunityAccess<T extends any[]>(
  getCommunityId: (...args: T) => string
) {
  return function (
    handler: (user: UserInfo, ...args: T) => Promise<NextResponse> | NextResponse
  ) {
    return async (...args: T): Promise<NextResponse> => {
      try {
        const communityId = getCommunityId(...args);
        const user = await checkCommunityAccess(communityId);
        return await handler(user, ...args);
      } catch (error) {
        console.error('Community access wrapper error:', error);

        if (error instanceof AuthenticationError) {
          return NextResponse.json(
            { error: error.message },
            { status: 401 }
          );
        }

        if (error instanceof AuthorizationError) {
          return NextResponse.json(
            { error: error.message },
            { status: 403 }
          );
        }

        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
    };
  };
}

/**
 * Decorador para métodos que requieren permisos específicos
 * Uso: @requirePermission(Permission.CREATE_POSTS)
 */
export function requirePermission(
  permission: Permission | Permission[],
  context?: CommunityContext
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        const permissionsArray = Array.isArray(permission) ? permission : [permission];

        // Verificar cada permiso
        for (const perm of permissionsArray) {
          await checkPermission(perm, context);
        }

        return await originalMethod.apply(this, args);
      } catch (error) {
        if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
          throw error;
        }
        throw new Error(`Permission check failed: ${error}`);
      }
    };

    return descriptor;
  };
}

/**
 * Decorador para métodos que requieren acceso de administrador
 * Uso: @requireAdminAccess
 */
export function requireAdminAccess(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    try {
      await checkAdminAccess();
      return await originalMethod.apply(this, args);
    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
        throw error;
      }
      throw new Error(`Admin access check failed: ${error}`);
    }
  };

  return descriptor;
}

/**
 * Helper para filtrar datos basado en el rol del usuario
 * Community Managers solo ven datos de su comunidad
 */
export function filterDataByUserAccess<T extends { communityId?: string }>(
  data: T[],
  user: UserInfo
): T[] {
  // Super Admin y Admin ven todo
  if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) {
    return data;
  }

  // Community Manager solo ve datos de su comunidad
  if (user.role === UserRole.COMMUNITY_MANAGER && user.communityId) {
    return data.filter(item => item.communityId === user.communityId);
  }

  // Moderator ve datos de su comunidad
  if (user.role === UserRole.MODERATOR && user.communityId) {
    return data.filter(item => item.communityId === user.communityId);
  }

  // Otros roles no ven nada por defecto
  return [];
}

/**
 * Helper para verificar si un usuario puede modificar un recurso específico
 */
export function canModifyResource(
  user: UserInfo,
  resource: { communityId?: string; authorId?: string }
): boolean {
  // Super Admin puede modificar todo
  if (user.role === UserRole.SUPER_ADMIN) {
    return true;
  }

  // Admin puede modificar dentro de cualquier comunidad
  if (user.role === UserRole.ADMIN) {
    return true;
  }

  // Community Manager puede modificar solo en su comunidad
  if (user.role === UserRole.COMMUNITY_MANAGER) {
    return user.communityId === resource.communityId;
  }

  // Moderator puede modificar solo en su comunidad (y solo ciertas acciones)
  if (user.role === UserRole.MODERATOR) {
    return user.communityId === resource.communityId;
  }

  // Usuario puede modificar solo su propio contenido
  if (user.role === UserRole.USER) {
    return user.id === resource.authorId;
  }

  return false;
}

/**
 * Utility para log de acciones de seguridad
 */
export function logSecurityAction(
  user: UserInfo,
  action: string,
  resource?: string,
  success: boolean = true
) {
  const logData = {
    timestamp: new Date().toISOString(),
    userId: user.id,
    userEmail: user.email,
    userRole: user.role,
    action,
    resource,
    success,
    communityId: user.communityId
  };

  // En producción, esto debería ir a un sistema de logging
  if (process.env.NODE_ENV === 'development') {
    console.log('🔒 Security Action:', logData);
  }

  // TODO: Enviar a sistema de auditoría en producción
}

/**
 * Helper para crear respuestas estandarizadas de error de autorización
 */
export function createAuthErrorResponse(
  error: AuthenticationError | AuthorizationError
): NextResponse {
  const status = error instanceof AuthenticationError ? 401 : 403;

  return NextResponse.json(
    {
      error: error.message,
      code: error instanceof AuthorizationError ? error.code : 'UNAUTHORIZED',
      timestamp: new Date().toISOString()
    },
    { status }
  );
}