/**
 * Middleware de Autenticación y Autorización
 * Next.js 14 - Protege rutas /admin/* con permisos granulares
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import {
  UserInfo,
  UserRole,
  canAccessAdmin,
  hasPermission,
  ADMIN_ROUTE_PERMISSIONS,
  Permission
} from '@/lib/permissions';

// Secret para JWT (en producción debe venir de variables de entorno)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-here-change-in-production'
);

/**
 * Verifica y decodifica el JWT token
 */
async function verifyToken(token: string): Promise<UserInfo | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    return {
      id: payload.sub as string,
      role: payload.role as UserRole,
      communityId: payload.communityId as string | undefined,
      email: payload.email as string,
      isActive: payload.isActive as boolean ?? true
    };
  } catch (error) {
    console.error('Error verificando token:', error);
    return null;
  }
}

/**
 * Obtiene el usuario desde el token en cookies o headers
 */
async function getUserFromRequest(request: NextRequest): Promise<UserInfo | null> {
  // Intentar obtener token desde cookie
  let token = request.cookies.get('token')?.value;

  // Si no hay cookie, intentar desde header Authorization
  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return null;
  }

  return await verifyToken(token);
}

/**
 * Verifica si el usuario puede acceder a la ruta específica
 */
function canAccessRoute(user: UserInfo, pathname: string): boolean {
  // Verificar acceso general al admin
  if (!canAccessAdmin(user)) {
    return false;
  }

  // Obtener permisos requeridos para la ruta
  const requiredPermissions = ADMIN_ROUTE_PERMISSIONS[pathname];

  // Si no hay permisos específicos definidos, permitir acceso general al admin
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  // Verificar que el usuario tenga al menos uno de los permisos requeridos
  return requiredPermissions.some(permission =>
    hasPermission(user, permission)
  );
}

/**
 * Crea respuesta de redirección a login
 */
function redirectToLogin(request: NextRequest, reason?: string) {
  const url = request.nextUrl.clone();
  url.pathname = '/login';

  // Agregar el pathname actual como parámetro para redirección después del login
  url.searchParams.set('redirectTo', request.nextUrl.pathname);

  if (reason) {
    url.searchParams.set('error', reason);
  }

  return NextResponse.redirect(url);
}

/**
 * Crea respuesta de acceso denegado
 */
function accessDenied(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/access-denied';
  url.searchParams.set('attempted', request.nextUrl.pathname);

  return NextResponse.redirect(url);
}

/**
 * Middleware principal
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Solo aplicar middleware a rutas /admin/*
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Obtener usuario actual
  const user = await getUserFromRequest(request);

  // Si no hay usuario, redirigir a login
  if (!user) {
    return redirectToLogin(request, 'authentication_required');
  }

  // Verificar si el usuario puede acceder a la ruta
  if (!canAccessRoute(user, pathname)) {
    console.warn(`Access denied for user ${user.email} to ${pathname}`);
    return accessDenied(request);
  }

  // Para Community Managers, verificar contexto de comunidad si es necesario
  if (user.role === UserRole.COMMUNITY_MANAGER) {
    // Obtener communityId desde query params o headers si es necesario
    const requestedCommunityId = request.nextUrl.searchParams.get('communityId');

    if (requestedCommunityId && user.communityId !== requestedCommunityId) {
      console.warn(`Community access denied for user ${user.email} to community ${requestedCommunityId}`);
      return accessDenied(request);
    }
  }

  // Agregar información del usuario a los headers para uso en las páginas
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', user.id);
  requestHeaders.set('x-user-role', user.role);
  requestHeaders.set('x-user-email', user.email);

  if (user.communityId) {
    requestHeaders.set('x-user-community-id', user.communityId);
  }

  // Log de acceso exitoso (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ Access granted: ${user.email} (${user.role}) → ${pathname}`);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

/**
 * Configuración del matcher para aplicar el middleware
 */
export const config = {
  matcher: [
    /*
     * Aplicar middleware a:
     * - /admin y todas sus sub-rutas
     * - Excluir archivos estáticos (_next/static, _next/image, favicon.ico)
     * - Excluir API routes que manejan su propia autenticación
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

// Tipos auxiliares para Next.js
export interface AuthenticatedRequest extends NextRequest {
  user: UserInfo;
}

/**
 * Helper para obtener usuario desde headers en páginas/APIs
 */
export function getUserFromHeaders(headers: Headers): UserInfo | null {
  const userId = headers.get('x-user-id');
  const userRole = headers.get('x-user-role') as UserRole;
  const userEmail = headers.get('x-user-email');
  const userCommunityId = headers.get('x-user-community-id');

  if (!userId || !userRole || !userEmail) {
    return null;
  }

  return {
    id: userId,
    role: userRole,
    email: userEmail,
    communityId: userCommunityId || undefined,
    isActive: true, // Asumimos que si pasó el middleware, está activo
  };
}