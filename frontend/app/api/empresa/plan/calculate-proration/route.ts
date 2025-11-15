import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth';
import { prismaClient } from '../../../../../lib/prisma';

/**
 * POST /api/empresa/plan/calculate-proration
 * Calcular prorrateo para preview antes de upgrade
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

    // Validar dirección del cambio
    const tierOrder = ['PIONERES', 'STANDARD', 'STRATEGIC', 'ENTERPRISE'];
    const currentTierIndex = tierOrder.indexOf(company.currentPlan?.tier || 'PIONERES');
    const newTierIndex = tierOrder.indexOf(newPlan.tier);

    const isUpgrade = newTierIndex > currentTierIndex;
    const isDowngrade = newTierIndex < currentTierIndex;

    // Calcular información del plan actual
    const currentPlanInfo = {
      id: company.currentPlan?.id,
      name: company.currentPlan?.name,
      tier: company.currentPlan?.tier,
      price: company.currentPlan?.basePrice || 0,
      precioAnual: currentSubscription?.precioAnual || 0,
      precioMensual: currentSubscription?.precioMensual || 0
    };

    // Calcular información del nuevo plan
    const newPlanFirstYearPrice = newPlan.basePrice * (1 - (newPlan.firstYearDiscount || 0));
    const newPlanInfo = {
      id: newPlan.id,
      name: newPlan.name,
      tier: newPlan.tier,
      basePrice: newPlan.basePrice,
      firstYearPrice: newPlanFirstYearPrice,
      firstYearDiscount: newPlan.firstYearDiscount,
      precioMensual: newPlan.precioMensual,
      precioAnual: newPlanFirstYearPrice
    };

    // Calcular prorrateo
    let proration = null;
    let immediateCharge = 0;
    let isInTrial = false;
    let daysRemaining = 0;

    if (currentSubscription) {
      const now = new Date();
      const endDate = currentSubscription.endDate ? new Date(currentSubscription.endDate) : new Date();
      daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

      // Detectar si está en trial
      isInTrial = currentSubscription.precioMensual === 0 && daysRemaining > 0;

      if (isInTrial) {
        // Si está en trial, solo paga el nuevo plan (sin prorrateo)
        immediateCharge = newPlanFirstYearPrice;

        proration = {
          type: 'trial',
          daysRemaining,
          message: 'Estás en período de prueba. Al cambiar de plan, pagarás el precio completo del nuevo plan.',
          currentCredit: 0,
          newCost: newPlanFirstYearPrice,
          immediateCharge: newPlanFirstYearPrice
        };
      } else if (daysRemaining > 0 && currentSubscription.precioAnual > 0) {
        // Si está pagando, calcular prorrateo
        const currentDailyRate = (currentSubscription.precioAnual || 0) / 365;
        const creditAmount = currentDailyRate * daysRemaining;

        const newDailyRate = newPlanFirstYearPrice / 365;
        const newCost = newDailyRate * daysRemaining;

        immediateCharge = Math.max(0, newCost - creditAmount);

        proration = {
          type: 'proration',
          daysRemaining,
          currentDailyRate: Number(currentDailyRate.toFixed(2)),
          creditAmount: Number(creditAmount.toFixed(2)),
          newDailyRate: Number(newDailyRate.toFixed(2)),
          newCost: Number(newCost.toFixed(2)),
          immediateCharge: Number(immediateCharge.toFixed(2)),
          message: `Recibirás un crédito de ${creditAmount.toFixed(2)}€ de tu plan actual y pagarás ${immediateCharge.toFixed(2)}€ por el resto del período.`
        };
      } else {
        // Subscription expirada o sin precio
        immediateCharge = newPlanFirstYearPrice;

        proration = {
          type: 'new',
          message: 'Tu suscripción actual ha expirado. Pagarás el precio completo del nuevo plan.',
          immediateCharge: newPlanFirstYearPrice
        };
      }
    } else {
      // Sin subscription actual
      immediateCharge = newPlanFirstYearPrice;

      proration = {
        type: 'new',
        message: 'Pagarás el precio completo del nuevo plan.',
        immediateCharge: newPlanFirstYearPrice
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        currentPlan: currentPlanInfo,
        newPlan: newPlanInfo,
        changeType: isUpgrade ? 'upgrade' : (isDowngrade ? 'downgrade' : 'same'),
        isUpgrade,
        isDowngrade,
        isInTrial,
        daysRemaining,
        proration,
        immediateCharge: Number(immediateCharge.toFixed(2)),
        allowDowngrade: false, // Por ahora no permitimos downgrades
        canProceed: isUpgrade || (!isDowngrade && company.currentPlanId !== newPlanId)
      }
    });

  } catch (error) {
    console.error('Error calculando prorrateo:', error);
    return NextResponse.json(
      {
        error: 'Error al calcular prorrateo',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}