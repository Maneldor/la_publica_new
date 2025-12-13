import { prismaClient as prisma } from '@/lib/prisma'
import { AuditLevel } from '@prisma/client'
import { NextRequest } from 'next/server'

// Mapeig de rols antics als nous si cal, encara que Prisma ja ho gestiona
// Assegurem que AuditLevel està disponible

// Tipus per les accions d'auditoria
export type AuditAction =
    // Auth
    | 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED' | 'PASSWORD_CHANGE' | 'PASSWORD_RESET'
    // CRUD
    | 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'LIST'
    // Accions específiques
    | 'APPROVE' | 'REJECT' | 'ACTIVATE' | 'DEACTIVATE' | 'SUSPEND'
    | 'EXPORT' | 'IMPORT' | 'SEND' | 'PUBLISH' | 'ARCHIVE'
    // Sistema
    | 'BACKUP' | 'RESTORE' | 'CONFIG_CHANGE' | 'MAINTENANCE_START' | 'MAINTENANCE_END'
    // Errors
    | 'ERROR' | 'SECURITY_ALERT'

export type AuditCategory =
    | 'AUTH' | 'USER' | 'ROLE' | 'PERMISSION'
    | 'COMPANY' | 'OFFER' | 'LEAD' | 'CAMPAIGN'
    | 'CONTENT' | 'CATEGORY' | 'SUBSCRIPTION' | 'BILLING'
    | 'SYSTEM' | 'SECURITY' | 'API'

export interface AuditLogInput {
    // Obligatoris
    action: AuditAction
    category: AuditCategory

    // Usuari (opcional si és acció de sistema)
    userId?: string
    userEmail?: string
    userRole?: string

    // Entitat afectada
    entity?: string
    entityId?: string
    entityName?: string

    // Detalls
    description?: string
    changes?: {
        before?: Record<string, any>
        after?: Record<string, any>
    }
    metadata?: Record<string, any>

    // Context de la petició
    ipAddress?: string
    userAgent?: string
    requestPath?: string
    requestMethod?: string

    // Resultat
    level?: AuditLevel
    success?: boolean
    errorMessage?: string
}

/**
 * Registra un log d'auditoria
 */
export async function logAudit(input: AuditLogInput): Promise<void> {
    try {
        await prisma.auditLog.create({
            data: {
                action: input.action,
                category: input.category,
                userId: input.userId || null,
                userEmail: input.userEmail || null,
                userRole: input.userRole || null,
                entity: input.entity || null,
                entityId: input.entityId || null,
                entityName: input.entityName || null,
                description: input.description || generateDescription(input),
                changes: input.changes || null,
                metadata: input.metadata || null,
                ipAddress: input.ipAddress || null,
                userAgent: input.userAgent || null,
                requestPath: input.requestPath || null,
                requestMethod: input.requestMethod || null,
                level: input.level || 'INFO',
                success: input.success ?? true,
                errorMessage: input.errorMessage || null,
            },
        })
    } catch (error) {
        // No fallar si el log falla, només registrar a consola
        console.error('[AUDIT ERROR] Failed to log:', error)
        console.error('[AUDIT DATA]', input)
    }
}

/**
 * Genera una descripció automàtica basada en l'acció
 */
function generateDescription(input: AuditLogInput): string {
    const entity = input.entity || input.category
    const name = input.entityName ? ` "${input.entityName}"` : ''

    switch (input.action) {
        case 'LOGIN':
            return `Inici de sessió`
        case 'LOGOUT':
            return `Tancament de sessió`
        case 'LOGIN_FAILED':
            return `Intent de login fallit`
        case 'CREATE':
            return `Creat ${entity}${name}`
        case 'UPDATE':
            return `Actualitzat ${entity}${name}`
        case 'DELETE':
            return `Eliminat ${entity}${name}`
        case 'VIEW':
            return `Visualitzat ${entity}${name}`
        case 'APPROVE':
            return `Aprovat ${entity}${name}`
        case 'REJECT':
            return `Rebutjat ${entity}${name}`
        case 'ACTIVATE':
            return `Activat ${entity}${name}`
        case 'DEACTIVATE':
            return `Desactivat ${entity}${name}`
        case 'SEND':
            return `Enviat ${entity}${name}`
        case 'PUBLISH':
            return `Publicat ${entity}${name}`
        case 'EXPORT':
            return `Exportat ${entity}`
        case 'CONFIG_CHANGE':
            return `Configuració modificada: ${input.entityName || 'sistema'}`
        default:
            return `${input.action} ${entity}${name}`
    }
}

/**
 * Helper per logar accions d'autenticació
 */
export async function logAuth(
    action: 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED' | 'PASSWORD_CHANGE' | 'PASSWORD_RESET',
    userId: string | null,
    email: string,
    options: {
        success?: boolean
        ipAddress?: string
        userAgent?: string
        errorMessage?: string
    } = {}
): Promise<void> {
    await logAudit({
        action,
        category: 'AUTH',
        userId: userId || undefined,
        userEmail: email,
        level: action === 'LOGIN_FAILED' ? 'WARNING' : 'INFO',
        success: options.success ?? (action !== 'LOGIN_FAILED'),
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        errorMessage: options.errorMessage,
    })
}

/**
 * Helper per logar operacions CRUD
 */
export async function logCRUD(
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW',
    category: AuditCategory,
    entity: string,
    entityId: string,
    user: { id: string; email: string; role?: string },
    options: {
        entityName?: string
        changes?: { before?: any; after?: any }
        ipAddress?: string
        requestPath?: string
    } = {}
): Promise<void> {
    await logAudit({
        action,
        category,
        entity,
        entityId,
        entityName: options.entityName,
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        changes: options.changes,
        ipAddress: options.ipAddress,
        requestPath: options.requestPath,
        level: action === 'DELETE' ? 'WARNING' : 'INFO',
    })
}

/**
 * Helper per logar errors
 */
export async function logError(
    category: AuditCategory,
    errorMessage: string,
    options: {
        userId?: string
        userEmail?: string
        entity?: string
        entityId?: string
        metadata?: Record<string, any>
        ipAddress?: string
        requestPath?: string
        level?: 'ERROR' | 'CRITICAL'
    } = {}
): Promise<void> {
    await logAudit({
        action: 'ERROR',
        category,
        level: options.level || 'ERROR',
        success: false,
        errorMessage,
        userId: options.userId,
        userEmail: options.userEmail,
        entity: options.entity,
        entityId: options.entityId,
        metadata: options.metadata,
        ipAddress: options.ipAddress,
        requestPath: options.requestPath,
    })
}

/**
 * Helper per logar canvis de sistema
 */
export async function logSystem(
    action: 'BACKUP' | 'RESTORE' | 'CONFIG_CHANGE' | 'MAINTENANCE_START' | 'MAINTENANCE_END',
    description: string,
    options: {
        userId?: string
        userEmail?: string
        metadata?: Record<string, any>
    } = {}
): Promise<void> {
    await logAudit({
        action,
        category: 'SYSTEM',
        description,
        userId: options.userId,
        userEmail: options.userEmail,
        metadata: options.metadata,
        level: action === 'RESTORE' ? 'WARNING' : 'INFO',
    })
}
