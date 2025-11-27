/**
 * Tipos extendidos para NextAuth con sistema de permisos granulares
 */

import { UserRole } from '@/lib/permissions';

declare module 'next-auth' {
  /**
   * Session extendida con role y communityId
   */
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: UserRole;
      communityId?: string;
      isActive: boolean;
      companyId?: string | null;
      apiToken?: string;  // Token JWT duradero para el API
      backendToken?: string;  // Token legacy del backend
      backendRefreshToken?: string;
    }
    accessToken?: string;
    provider?: string;
  }

  /**
   * User extendido con campos del sistema de permisos
   */
  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: UserRole;
    communityId?: string;
    isActive: boolean;
    companyId?: string | null;
    apiToken?: string;  // Token JWT duradero para el API
    backendToken?: string;  // Token legacy del backend
    backendRefreshToken?: string;
  }
}

declare module 'next-auth/jwt' {
  /**
   * JWT token extendido con role y communityId
   */
  interface JWT {
    sub: string;
    email: string;
    name?: string | null;
    picture?: string | null;
    role: UserRole;
    communityId?: string;
    isActive: boolean;
    companyId?: string | null;
    apiToken?: string;  // Token JWT duradero para el API
    backendToken?: string;  // Token legacy del backend
    backendRefreshToken?: string;
    accessToken?: string;
    provider?: string;
    iat?: number;
    exp?: number;
    jti?: string;
  }
}

/**
 * Tipos adicionales para el sistema de autenticación
 */
export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: UserRole;
  communityId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignInResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}