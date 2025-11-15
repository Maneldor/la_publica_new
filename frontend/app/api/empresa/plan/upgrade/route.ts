import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth';
import { prismaClient } from '../../../../../lib/prisma';

/**
 * POST /api/empresa/plan/upgrade
 * Solicitar cambio/upgrade de plan
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { newPlanId } = body;

    if (!newPlanId) {
      return NextResponse.json(
        { error: 'newPlanId es requerido' },
        { status: 400 }
      );
    }

    // Buscar usuario y empresa
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email },
      include: {
        ownedCompany: {
          include: {
            currentPlan: true,
            subscriptions: {
              where: { status: 'ACTIVE' },
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      }
    });

    if (!user?.ownedCompany) {
      return NextResponse.json(
        { error: 'Empresa no encontrada' },
        { status: 404 }
      );
    }

    const company = user.ownedCompany;
    const currentSubscription = company.subscriptions[0];

    // Verificar que el nuevo plan existe
    const newPlan = await prismaClient.planConfig.findUnique({
      where: { id: newPlanId }
    });

    if (!newPlan || !newPlan.isActive) {
      return NextResponse.json(
        { error: 'Plan no encontrado o no disponible' },
        { status: 404 }
      );
    }

    // Validar que no es el mismo plan
    if (company.currentPlanId === newPlanId) {
      return NextResponse.json(
        { error: 'Ya tienes este plan activo' },
        { status: 400 }
      );
    }

    // Validar dirección del cambio (solo upgrades por ahora)
    const tierOrder = ['PIONERES', 'STANDARD', 'STRATEGIC', 'ENTERPRISE'];
    const currentTierIndex = tierOrder.indexOf(company.currentPlan?.tier || 'PIONERES');
    const newTierIndex = tierOrder.indexOf(newPlan.tier);

    if (newTierIndex < currentTierIndex) {
      return NextResponse.json(
        { error: 'No puedes hacer downgrade. Contacta con soporte.' },
        { status: 400 }
      );
    }

    // Calcular prorrateo si está en período de pago
    let proration = null;
    let immediateCharge = 0;

    if (currentSubscription && currentSubscription.precioMensual > 0) {
      // Si está pagando (no en trial)
      const now = new Date();
      const endDate = currentSubscription.endDate ? new Date(currentSubscription.endDate) : new Date();
      const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

      if (daysRemaining > 0) {
        // Calcular crédito del plan actual
        const currentDailyRate = (currentSubscription.precioAnual || 0) / 365;
        const creditAmount = currentDailyRate * daysRemaining;

        // Calcular coste del nuevo plan
        const newYearlyPrice = newPlan.basePrice * (1 - (newPlan.firstYearDiscount || 0));
        const newDailyRate = newYearlyPrice / 365;
        const newCost = newDailyRate * daysRemaining;

        immediateCharge = Math.max(0, newCost - creditAmount);

        proration = {
          daysRemaining,
          currentDailyRate,
          creditAmount,
          newDailyRate,
          newCost,
          immediateCharge
        };
      }
    }

    // Crear cambio en transacción
    const result = await prismaClient.$transaction(async (tx) => {
      // Desactivar subscription actual
      if (currentSubscription) {
        await tx.subscription.update({
          where: { id: currentSubscription.id },
          data: {
            status: 'CANCELLED'
          }
        });
      }

      // Crear nueva subscription
      const now = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 365); // 1 año

      const newSubscription = await tx.subscription.create({
        data: {
          companyId: company.id,
          planId: newPlan.id,
          status: 'ACTIVE',
          precioMensual: newPlan.precioMensual,
          precioAnual: newPlan.basePrice * (1 - (newPlan.firstYearDiscount || 0)),
          limites: {
            maxMembers: newPlan.maxTeamMembers,
            maxStorage: newPlan.maxStorage,
            maxActiveOffers: newPlan.maxActiveOffers,
            maxFeaturedOffers: newPlan.maxFeaturedOffers
          },
          startDate: now,
          endDate: endDate,
          isAutoRenew: true
        }
      });

      // Actualizar plan de la empresa
      await tx.company.update({
        where: { id: company.id },
        data: {
          currentPlanId: newPlan.id
        }
      });

      // TODO: Crear invoice si hay cargo inmediato
      // if (immediateCharge > 0) {
      //   await tx.invoice.create({ ... });
      // }

      return {
        oldPlan: company.currentPlan,
        newPlan,
        newSubscription,
        proration
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Plan actualizado correctamente',
      data: {
        oldPlan: {
          id: result.oldPlan?.id,
          name: result.oldPlan?.name,
          tier: result.oldPlan?.tier
        },
        newPlan: {
          id: result.newPlan.id,
          name: result.newPlan.name,
          tier: result.newPlan.tier,
          price: result.newPlan.basePrice
        },
        subscription: {
          id: result.newSubscription.id,
          startDate: result.newSubscription.startDate,
          endDate: result.newSubscription.endDate,
          precioAnual: result.newSubscription.precioAnual
        },
        proration: result.proration,
        immediateCharge
      }
    });

  } catch (error) {
    console.error('Error en upgrade de plan:', error);
    return NextResponse.json(
      {
        error: 'Error al cambiar plan',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}