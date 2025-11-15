// lib/plan-limits/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkCompanyLimit, canAddMore, LimitType } from './check-limits';
import { prismaClient } from '@/lib/prisma';

/**
 * Configuración del middleware de límites
 */
export interface LimitMiddlewareConfig {
  limitType: LimitType;
  quantity?: number; // Cuántos elementos se van a añadir (default: 1)
  errorMessage?: string;
}

/**
 * Middleware para validar límites antes de ejecutar una acción
 *
 * Uso en una API route:
 *
 * export async function POST(request: NextRequest) {
 *   const limitCheck = await checkLimitMiddleware(request, {
 *     limitType: 'activeOffers',
 *     quantity: 1
 *   });
 *
 *   if (!limitCheck.allowed) {
 *     return limitCheck.response;
 *   }
 *
 *   // Continuar con la lógica...
 * }
 */
export async function checkLimitMiddleware(
  request: NextRequest,
  config: LimitMiddlewareConfig
): Promise<{
  allowed: boolean;
  response?: NextResponse;
  companyId?: string;
}> {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return {
        allowed: false,
        response: NextResponse.json(
          { error: 'No autorizado' },
          { status: 401 }
        )
      };
    }

    // Obtener empresa del usuario
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email },
      include: {
        ownedCompany: {
          include: {
            currentPlan: true
          }
        }
      }
    });

    if (!user?.ownedCompany) {
      return {
        allowed: false,
        response: NextResponse.json(
          { error: 'Empresa no encontrada' },
          { status: 404 }
        )
      };
    }

    const companyId = user.ownedCompany.id;

    // Verificar límite
    const quantity = config.quantity ?? 1;
    const limitCheck = await canAddMore(companyId, config.limitType, quantity);

    if (!limitCheck.allowed) {
      const errorMessage = config.errorMessage || limitCheck.message || 'Has alcanzado el límite de tu plan';

      return {
        allowed: false,
        companyId,
        response: NextResponse.json(
          {
            error: errorMessage,
            limitInfo: {
              limitType: config.limitType,
              current: limitCheck.current,
              limit: limitCheck.limit,
              remaining: limitCheck.remaining,
              upgradeSuggestion: 'Actualiza tu plan para aumentar este límite'
            }
          },
          { status: 403 }
        )
      };
    }

    return {
      allowed: true,
      companyId
    };

  } catch (error) {
    console.error('Error en limit middleware:', error);
    return {
      allowed: false,
      response: NextResponse.json(
        { error: 'Error al verificar límites del plan' },
        { status: 500 }
      )
    };
  }
}

/**
 * Helper para obtener el companyId del usuario autenticado
 */
export async function getAuthenticatedCompanyId(
  request: NextRequest
): Promise<{ companyId: string | null; response?: NextResponse }> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return {
        companyId: null,
        response: NextResponse.json(
          { error: 'No autorizado' },
          { status: 401 }
        )
      };
    }

    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email },
      select: {
        ownedCompanyId: true
      }
    });

    if (!user?.ownedCompanyId) {
      return {
        companyId: null,
        response: NextResponse.json(
          { error: 'Empresa no encontrada' },
          { status: 404 }
        )
      };
    }

    return { companyId: user.ownedCompanyId };

  } catch (error) {
    console.error('Error obteniendo companyId:', error);
    return {
      companyId: null,
      response: NextResponse.json(
        { error: 'Error de autenticación' },
        { status: 500 }
      )
    };
  }
}

/**
 * Verificar múltiples límites a la vez
 */
export async function checkMultipleLimitsMiddleware(
  request: NextRequest,
  configs: LimitMiddlewareConfig[]
): Promise<{
  allowed: boolean;
  response?: NextResponse;
  companyId?: string;
  failedLimit?: LimitType;
}> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return {
        allowed: false,
        response: NextResponse.json(
          { error: 'No autorizado' },
          { status: 401 }
        )
      };
    }

    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email },
      include: {
        ownedCompany: {
          include: {
            currentPlan: true
          }
        }
      }
    });

    if (!user?.ownedCompany) {
      return {
        allowed: false,
        response: NextResponse.json(
          { error: 'Empresa no encontrada' },
          { status: 404 }
        )
      };
    }

    const companyId = user.ownedCompany.id;

    // Verificar todos los límites
    for (const config of configs) {
      const quantity = config.quantity ?? 1;
      const limitCheck = await canAddMore(companyId, config.limitType, quantity);

      if (!limitCheck.allowed) {
        const errorMessage = config.errorMessage || limitCheck.message || 'Has alcanzado el límite de tu plan';

        return {
          allowed: false,
          companyId,
          failedLimit: config.limitType,
          response: NextResponse.json(
            {
              error: errorMessage,
              limitInfo: {
                limitType: config.limitType,
                current: limitCheck.current,
                limit: limitCheck.limit,
                remaining: limitCheck.remaining
              }
            },
            { status: 403 }
          )
        };
      }
    }

    return {
      allowed: true,
      companyId
    };

  } catch (error) {
    console.error('Error en multiple limits middleware:', error);
    return {
      allowed: false,
      response: NextResponse.json(
        { error: 'Error al verificar límites del plan' },
        { status: 500 }
      )
    };
  }
}