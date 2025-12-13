import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// =====================
// TIPUS
// =====================

export type AllowedRole =
    | 'SUPER_ADMIN'
    | 'ADMIN'
    | 'ADMIN_GESTIO'
    | 'ADMIN_ADMINISTRACIONS'
    | 'CRM_COMERCIAL'
    | 'CRM_CONTINGUT'
    | 'CRM_ADMINISTRACIONS'
    | 'GESTOR_ESTANDARD'
    | 'GESTOR_ESTRATEGIC'
    | 'GESTOR_ENTERPRISE'
    | 'MODERATOR'
    | 'COMPANY'
    | 'ADMINISTRATION'
    | 'USER'

export interface AuthResult {
    success: boolean
    user?: {
        id: string
        email: string
        name: string
        role: string
    }
    error?: NextResponse
}

export interface ValidationRule {
    field: string
    type: 'string' | 'number' | 'boolean' | 'array' | 'email'
    required?: boolean
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    pattern?: RegExp
    customValidator?: (value: any) => boolean
    customMessage?: string
}

// =====================
// AUTENTICACIÓ I AUTORITZACIÓ
// =====================

/**
 * Verifica autenticació i autorització
 * @param req - NextRequest (opcional, per logging)
 * @param allowedRoles - Rols permesos (buit = només autenticat)
 */
export async function checkAuth(
    req?: NextRequest,
    allowedRoles: AllowedRole[] = []
): Promise<AuthResult> {
    try {
        const session = await getServerSession(authOptions)

        // Verificar autenticació
        if (!session || !session.user) {
            return {
                success: false,
                error: NextResponse.json(
                    { error: 'No autenticat', code: 'UNAUTHORIZED' },
                    { status: 401 }
                ),
            }
        }

        // Verificar autorització si s'especifiquen rols
        if (allowedRoles.length > 0 && !allowedRoles.includes(session.user.role as AllowedRole)) {
            // Log intent no autoritzat
            await logSecurityEvent({
                type: 'UNAUTHORIZED_ACCESS',
                userId: session.user.id,
                userRole: session.user.role,
                requiredRoles: allowedRoles,
                path: req?.nextUrl.pathname,
                method: req?.method,
            })

            return {
                success: false,
                error: NextResponse.json(
                    { error: 'No autoritzat per aquesta acció', code: 'FORBIDDEN' },
                    { status: 403 }
                ),
            }
        }

        return {
            success: true,
            user: {
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.name || '',
                role: session.user.role,
            },
        }
    } catch (error) {
        console.error('Error verificant autenticació:', error)
        return {
            success: false,
            error: NextResponse.json(
                { error: 'Error d\'autenticació', code: 'AUTH_ERROR' },
                { status: 500 }
            ),
        }
    }
}

// =====================
// VALIDACIÓ I SANITITZACIÓ
// =====================

/**
 * Sanititza un string per prevenir XSS i injeccions
 */
export function sanitizeString(input: string): string {
    if (typeof input !== 'string') return ''

    return input
        .trim()
        .replace(/[<>]/g, '') // Eliminar < i >
        .replace(/javascript:/gi, '') // Eliminar javascript:
        .replace(/on\w+=/gi, '') // Eliminar event handlers
        .replace(/data:/gi, '') // Eliminar data: URIs
        .slice(0, 10000) // Límit màxim de caràcters
}

/**
 * Sanititza un objecte recursivament
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized: Record<string, any> = {}

    for (const [key, value] of Object.entries(obj)) {
        // Sanititzar també les claus
        const cleanKey = sanitizeString(key)

        if (typeof value === 'string') {
            sanitized[cleanKey] = sanitizeString(value)
        } else if (Array.isArray(value)) {
            sanitized[cleanKey] = value.map(item =>
                typeof item === 'string' ? sanitizeString(item) :
                    typeof item === 'object' && item !== null ? sanitizeObject(item) : item
            )
        } else if (value && typeof value === 'object') {
            sanitized[cleanKey] = sanitizeObject(value)
        } else {
            sanitized[cleanKey] = value
        }
    }

    return sanitized as T
}

/**
 * Valida dades segons regles definides
 */
export function validateData(
    data: Record<string, any>,
    rules: ValidationRule[]
): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    for (const rule of rules) {
        const value = data[rule.field]

        // Requerit
        if (rule.required && (value === undefined || value === null || value === '')) {
            errors.push(`El camp '${rule.field}' és obligatori`)
            continue
        }

        // Si no és requerit i no té valor, saltar
        if (value === undefined || value === null || value === '') continue

        // Tipus
        switch (rule.type) {
            case 'string':
                if (typeof value !== 'string') {
                    errors.push(`El camp '${rule.field}' ha de ser text`)
                } else {
                    if (rule.minLength && value.length < rule.minLength) {
                        errors.push(`El camp '${rule.field}' ha de tenir mínim ${rule.minLength} caràcters`)
                    }
                    if (rule.maxLength && value.length > rule.maxLength) {
                        errors.push(`El camp '${rule.field}' ha de tenir màxim ${rule.maxLength} caràcters`)
                    }
                    if (rule.pattern && !rule.pattern.test(value)) {
                        errors.push(rule.customMessage || `El camp '${rule.field}' té un format invàlid`)
                    }
                }
                break

            case 'number':
                const numValue = typeof value === 'number' ? value : parseFloat(value)
                if (isNaN(numValue)) {
                    errors.push(`El camp '${rule.field}' ha de ser un número`)
                } else {
                    if (rule.min !== undefined && numValue < rule.min) {
                        errors.push(`El camp '${rule.field}' ha de ser mínim ${rule.min}`)
                    }
                    if (rule.max !== undefined && numValue > rule.max) {
                        errors.push(`El camp '${rule.field}' ha de ser màxim ${rule.max}`)
                    }
                }
                break

            case 'boolean':
                if (typeof value !== 'boolean') {
                    errors.push(`El camp '${rule.field}' ha de ser booleà`)
                }
                break

            case 'array':
                if (!Array.isArray(value)) {
                    errors.push(`El camp '${rule.field}' ha de ser una llista`)
                } else {
                    if (rule.minLength && value.length < rule.minLength) {
                        errors.push(`El camp '${rule.field}' ha de tenir mínim ${rule.minLength} elements`)
                    }
                    if (rule.maxLength && value.length > rule.maxLength) {
                        errors.push(`El camp '${rule.field}' ha de tenir màxim ${rule.maxLength} elements`)
                    }
                }
                break

            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                if (typeof value !== 'string' || !emailRegex.test(value)) {
                    errors.push(`El camp '${rule.field}' ha de ser un email vàlid`)
                }
                break
        }

        // Validador personalitzat
        if (rule.customValidator && !rule.customValidator(value)) {
            errors.push(rule.customMessage || `El camp '${rule.field}' no és vàlid`)
        }
    }

    return { valid: errors.length === 0, errors }
}

/**
 * Genera un slug segur des d'un text
 */
export function generateSecureSlug(text: string): string {
    if (typeof text !== 'string') return ''

    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Eliminar accents
        .replace(/[^a-z0-9\s-]/g, '') // Només alfanumèrics, espais i guions
        .replace(/\s+/g, '-') // Espais a guions
        .replace(/-+/g, '-') // Múltiples guions a un
        .replace(/(^-|-$)/g, '') // Eliminar guions inici/final
        .slice(0, 100) // Màxim 100 caràcters
}

/**
 * Valida que un ID tingui format CUID vàlid
 */
export function isValidCuid(id: string): boolean {
    if (typeof id !== 'string') return false
    // CUID format: c + 24 alfanumèrics
    return /^c[a-z0-9]{24,}$/i.test(id)
}

// =====================
// RATE LIMITING
// =====================

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

/**
 * Rate limiting per IP/usuari
 */
export function checkRateLimit(
    identifier: string,
    limit: number = 100,
    windowMs: number = 60000
): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now()
    const record = rateLimitMap.get(identifier)

    if (!record || now > record.resetTime) {
        rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
        return { allowed: true, remaining: limit - 1, resetIn: windowMs }
    }

    if (record.count >= limit) {
        return { allowed: false, remaining: 0, resetIn: record.resetTime - now }
    }

    record.count++
    return { allowed: true, remaining: limit - record.count, resetIn: record.resetTime - now }
}

// Neteja periòdica del rate limit map
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now()
        for (const [key, value] of rateLimitMap.entries()) {
            if (now > value.resetTime) {
                rateLimitMap.delete(key)
            }
        }
    }, 60000)
}

// =====================
// LOGGING
// =====================

interface SecurityEvent {
    type: 'UNAUTHORIZED_ACCESS' | 'VALIDATION_ERROR' | 'RATE_LIMIT' | 'SUSPICIOUS_ACTIVITY' | 'API_ERROR'
    userId?: string
    userRole?: string
    requiredRoles?: string[]
    path?: string
    method?: string
    details?: string
    ip?: string
}

/**
 * Registra events de seguretat
 */
export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
        const logEntry = {
            timestamp: new Date().toISOString(),
            ...event,
        }

        // En producció, enviar a servei de logging
        if (process.env.NODE_ENV === 'production') {
            console.warn('[SECURITY]', JSON.stringify(logEntry))
        } else {
            console.warn('[SECURITY]', logEntry)
        }
    } catch (error) {
        console.error('Error logging security event:', error)
    }
}

// =====================
// HELPERS
// =====================

/**
 * Obté IP del request
 */
export function getClientIP(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for')
    const realIp = req.headers.get('x-real-ip')
    const ip = forwarded ? forwarded.split(',')[0].trim() : realIp || 'unknown'
    return ip
}

/**
 * Resposta d'error estandarditzada
 */
export function errorResponse(
    message: string,
    status: number = 400,
    code?: string,
    details?: string[]
): NextResponse {
    return NextResponse.json(
        {
            error: message,
            code: code || 'ERROR',
            details: details || undefined,
            timestamp: new Date().toISOString(),
        },
        { status }
    )
}

/**
 * Resposta d'èxit estandarditzada
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse {
    return NextResponse.json(data, { status })
}

/**
 * Wrapper complet per APIs segures
 */
export async function withApiSecurity<T>(
    req: NextRequest,
    options: {
        allowedRoles?: AllowedRole[]
        rateLimit?: { limit: number; windowMs: number }
        validateBody?: ValidationRule[]
    },
    handler: (user: AuthResult['user'], body?: any) => Promise<NextResponse>
): Promise<NextResponse> {
    try {
        // 1. Rate limiting
        if (options.rateLimit) {
            const ip = getClientIP(req)
            const rateCheck = checkRateLimit(ip, options.rateLimit.limit, options.rateLimit.windowMs)

            if (!rateCheck.allowed) {
                await logSecurityEvent({
                    type: 'RATE_LIMIT',
                    ip,
                    path: req.nextUrl.pathname,
                    method: req.method,
                })

                return errorResponse(
                    'Massa peticions. Torna-ho a intentar més tard.',
                    429,
                    'RATE_LIMIT'
                )
            }
        }

        // 2. Autenticació i autorització
        const auth = await checkAuth(req, options.allowedRoles)
        if (!auth.success) {
            return auth.error!
        }

        // 3. Validació del body si cal
        let body: any = undefined
        if (options.validateBody && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
            try {
                body = await req.json()
                body = sanitizeObject(body)

                const validation = validateData(body, options.validateBody)
                if (!validation.valid) {
                    return errorResponse(
                        'Dades invàlides',
                        400,
                        'VALIDATION_ERROR',
                        validation.errors
                    )
                }
            } catch (e) {
                return errorResponse('Format JSON invàlid', 400, 'INVALID_JSON')
            }
        }

        // 4. Executar handler
        return await handler(auth.user, body)

    } catch (error) {
        console.error('API Error:', error)
        await logSecurityEvent({
            type: 'API_ERROR',
            path: req.nextUrl.pathname,
            method: req.method,
            details: error instanceof Error ? error.message : 'Unknown error',
        })

        return errorResponse('Error intern del servidor', 500, 'INTERNAL_ERROR')
    }
}
