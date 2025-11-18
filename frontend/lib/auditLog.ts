import { prismaClient } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export type AuditAction =
  | 'COMPANY_APPROVED'
  | 'COMPANY_REJECTED'
  | 'COMPANY_SUSPENDED'
  | 'COMPANY_REACTIVATED'
  | 'COMPANY_DELETED'
  | 'COMPANY_UPDATED'
  | 'OFFER_APPROVED'
  | 'OFFER_REJECTED'
  | 'OFFER_DELETED'
  | 'OFFER_FEATURED'
  | 'OFFER_UNFEATURED'
  | 'OFFER_UPDATED'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'USER_SUSPENDED'
  | 'USER_REACTIVATED'
  | 'USER_ROLE_CHANGED'
  | 'COUPON_CANCELLED'
  | 'COUPON_BULK_EXPORT'
  | 'SETTINGS_UPDATED'
  | 'PLAN_CONFIG_UPDATED'
  | 'BULK_ACTION'
  | 'LOGIN_ADMIN'
  | 'LOGOUT_ADMIN'
  | 'PERMISSION_CHANGED'
  | 'OTHER';

export type LogSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

interface CreateAuditLogParams {
  action: AuditAction;
  entity: string;
  entityId?: string;
  entityName?: string;
  description: string;
  changes?: any;
  metadata?: any;
  severity?: LogSeverity;
  success?: boolean;
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Crear un registro de auditoría
 * Usa automáticamente el usuario de la sesión actual
 */
export async function createAuditLog(params: CreateAuditLogParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      console.warn('⚠️ [Audit] Cannot create audit log - no session');
      return null;
    }

    const log = await prismaClient.auditLog.create({
      data: {
        userId: session.user.id,
        userName: session.user.name || 'Unknown',
        userEmail: session.user.email || 'unknown@example.com',
        userRole: session.user.role || 'UNKNOWN',

        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        entityName: params.entityName,
        description: params.description,

        changes: params.changes || null,
        metadata: params.metadata || null,

        severity: params.severity || 'INFO',
        success: params.success ?? true,
        errorMessage: params.errorMessage,

        ipAddress: params.ipAddress,
        userAgent: params.userAgent
      }
    });

    const emoji = params.severity === 'CRITICAL' ? '🚨'
                : params.severity === 'ERROR' ? '❌'
                : params.severity === 'WARNING' ? '⚠️'
                : '📝';

    console.log(`${emoji} [Audit] ${params.action}: ${params.description}`);

    return log;

  } catch (error) {
    console.error('❌ [Audit] Error creating audit log:', error);
    // No lanzar error - los logs de auditoría no deben romper el flujo
    return null;
  }
}

/**
 * Helper para obtener IP y User Agent del request
 */
export function getRequestInfo(request: Request) {
  const ipAddress = request.headers.get('x-forwarded-for')
                 || request.headers.get('x-real-ip')
                 || 'unknown';

  const userAgent = request.headers.get('user-agent') || 'unknown';

  return { ipAddress, userAgent };
}

/**
 * Formatear cambios para audit log (before/after)
 */
export function formatChanges(before: any, after: any) {
  return {
    before,
    after,
    timestamp: new Date().toISOString()
  };
}

/**
 * Crear un audit log para acciones exitosas comunes
 */
export async function logSuccess(
  action: AuditAction,
  entity: string,
  entityId: string,
  entityName: string,
  description: string,
  metadata?: any,
  request?: Request
) {
  const requestInfo = request ? getRequestInfo(request) : {};

  return await createAuditLog({
    action,
    entity,
    entityId,
    entityName,
    description,
    severity: 'INFO',
    success: true,
    metadata,
    ...requestInfo
  });
}

/**
 * Crear un audit log para errores
 */
export async function logError(
  action: AuditAction,
  entity: string,
  description: string,
  error: Error | string,
  metadata?: any,
  request?: Request
) {
  const requestInfo = request ? getRequestInfo(request) : {};

  return await createAuditLog({
    action,
    entity,
    description,
    severity: 'ERROR',
    success: false,
    errorMessage: typeof error === 'string' ? error : error.message,
    metadata,
    ...requestInfo
  });
}

/**
 * Crear audit log para acciones críticas de seguridad
 */
export async function logSecurityEvent(
  action: AuditAction,
  description: string,
  metadata?: any,
  request?: Request
) {
  const requestInfo = request ? getRequestInfo(request) : {};

  return await createAuditLog({
    action,
    entity: 'Security',
    description,
    severity: 'CRITICAL',
    success: true,
    metadata,
    ...requestInfo
  });
}