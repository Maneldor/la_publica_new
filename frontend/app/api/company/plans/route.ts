import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prismaClient } from '@/lib/prisma';

/**
 * GET /api/company/plans
 *
 * Devuelve planes visibles para empresas con lógica:
 * - Muestra planes activos y visibles
 * - Incluye plan actual de la empresa aunque esté desactivado
 * - Devuelve información de suscripción actual
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Obtener usuario actual
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email },
      include: {
        ownedCompany: {
          include: {
            currentPlan: true,
            subscriptions: {
              where: {
                status: 'ACTIVE'
              },
              orderBy: {
                startDate: 'desc'
              },
              take: 1
            }
          }
        },
        memberCompany: {
          include: {
            currentPlan: true,
            subscriptions: {
              where: {
                status: 'ACTIVE'
              },
              orderBy: {
                startDate: 'desc'
              },
              take: 1
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Determinar la empresa (owned o member)
    const company = user.ownedCompany || user.memberCompany;

    if (!company) {
      return NextResponse.json(
        { error: 'Usuario no pertenece a ninguna empresa' },
        { status: 403 }
      );
    }

    // Obtener plan actual de la empresa
    const currentPlanId = company.currentPlanId;
    const currentSubscription = company.subscriptions[0] || null;

    // Obtener todos los planes activos y visibles
    const activePlans = await prismaClient.planConfig.findMany({
      where: {
        activo: true,
        visible: true
      },
      orderBy: { orden: 'asc' }
    });

    // Si la empresa tiene un plan actual que NO está en los activos,
    // añadirlo a la lista (puede estar desactivado)
    let allPlans = [...activePlans];

    if (currentPlanId) {
      const hasCurrentPlan = activePlans.some(p => p.id === currentPlanId);

      if (!hasCurrentPlan) {
        const currentPlan = await prismaClient.planConfig.findUnique({
          where: { id: currentPlanId }
        });

        if (currentPlan) {
          // Añadir el plan actual al principio para que sea visible
          allPlans = [currentPlan, ...activePlans];
        }
      }
    }

    // Construir respuesta
    return NextResponse.json({
      plans: allPlans,
      currentPlan: company.currentPlan || null,
      currentSubscription: currentSubscription,
      company: {
        id: company.id,
        name: company.name,
        currentPlanId: company.currentPlanId
      }
    });

  } catch (error) {
    console.error('Error en GET /api/company/plans:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}