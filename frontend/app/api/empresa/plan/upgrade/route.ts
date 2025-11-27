import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCompanyPlan, canUpgradeToPlan, upgradePlan } from '@/lib/plans/planService';
import { prismaClient } from '@/lib/prisma';

type PlanTier = 'PIONERES' | 'STANDARD' | 'STRATEGIC' | 'ENTERPRISE';

const resolveCompanyId = async (userId: string) => {
  const userRecord = await prismaClient.user.findUnique({
    where: { id: userId },
    select: {
      ownedCompanyId: true,
      memberCompanyId: true,
    },
  });

  return userRecord?.ownedCompanyId || userRecord?.memberCompanyId || null;
};

/**
 * POST /api/empresa/plan/upgrade
 * Solicitar upgrade de plan
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'No autoritzat' },
        { status: 401 }
      );
    }

    const companyId = await resolveCompanyId(session.user.id);

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'No pertanys a cap empresa' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { newPlan: targetTier } = body;

    if (!targetTier) {
      return NextResponse.json(
        { success: false, error: 'Plan destí no especificat' },
        { status: 400 }
      );
    }

    // Verificar que el plan objetivo existe
    const validTiers = ['PIONERES', 'STANDARD', 'STRATEGIC', 'ENTERPRISE'];
    if (!validTiers.includes(targetTier)) {
      return NextResponse.json(
        { success: false, error: 'Plan destí no vàlid' },
        { status: 400 }
      );
    }

    console.log(`🚀 [Upgrade] Company ${companyId} requesting upgrade to ${targetTier}`);

    // Verificar si puede hacer upgrade
    const upgradeCheck = await canUpgradeToPlan(companyId, targetTier);
    if (!upgradeCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: upgradeCheck.reason || 'Upgrade no permès'
        },
        { status: 400 }
      );
    }

    // TODO: Aquí iría la integración con Stripe para procesar el pago
    // Por ahora, realizamos el upgrade directamente

    const upgradeResult = await upgradePlan(companyId, targetTier);

    if (!upgradeResult.success) {
      return NextResponse.json(
        { success: false, error: upgradeResult.message },
        { status: 400 }
      );
    }

    console.log(`✅ [Upgrade] Successfully upgraded to ${targetTier}`);

    return NextResponse.json({
      success: true,
      message: upgradeResult.message,
      plan: upgradeResult.newPlan,
    });

  } catch (error) {
    console.error('❌ [Upgrade] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualitzar pla' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/empresa/plan/upgrade?targetTier=STANDARD
 * Calcular preview de upgrade (precio, features, etc.)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'No autoritzat' },
        { status: 401 }
      );
    }

    const companyId = await resolveCompanyId(session.user.id);

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'No pertanys a cap empresa' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const targetTier = searchParams.get('targetTier') as PlanTier;

    // Verificar que el plan objetivo existe
    const validTiers = ['PIONERES', 'STANDARD', 'STRATEGIC', 'ENTERPRISE'];
    if (!targetTier || !validTiers.includes(targetTier)) {
      return NextResponse.json(
        { success: false, error: 'Plan destí no vàlid' },
        { status: 400 }
      );
    }

    const { config: currentConfig } = await getCompanyPlan(companyId);
    const targetConfig = await prismaClient.planConfig.findFirst({
      where: { tier: targetTier }
    });

    // Obtener subscription activa para calcular prorrateo
    const company = await prismaClient.company.findUnique({
      where: { id: companyId },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    const currentSubscription = company?.subscriptions[0];

    if (!targetConfig) {
      return NextResponse.json(
        { success: false, error: 'Configuració del pla destí no trobada' },
        { status: 400 }
      );
    }

    // Verificar si puede hacer upgrade
    const upgradeCheck = await canUpgradeToPlan(companyId, targetTier);

    // Calcular precios reales pagados (con descuentos)
    const currentPaidPrice = currentConfig.basePrice * (1 - (currentConfig.firstYearDiscount || 0) / 100);
    const targetDiscountedPrice = targetConfig.basePrice * (1 - (targetConfig.firstYearDiscount || 0) / 100);

    // Calcular prorrateo si hay subscription activa
    let prorationDetails = null;
    if (currentSubscription?.endDate) {
      const now = new Date();
      const endDate = new Date(currentSubscription.endDate);
      const diffTime = endDate.getTime() - now.getTime();
      const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

      const dailyPaidRate = currentPaidPrice / 365;
      const remainingCredit = dailyPaidRate * daysRemaining;
      const amountToPay = Math.max(0, targetDiscountedPrice - remainingCredit);

      prorationDetails = {
        daysRemaining,
        currentPaidPrice,
        targetDiscountedPrice,
        dailyRate: Math.round(dailyPaidRate * 100) / 100,
        remainingCredit: Math.round(remainingCredit * 100) / 100,
        amountToPay: Math.round(amountToPay * 100) / 100
      };
    }

    const priceDiff = prorationDetails?.amountToPay || (targetDiscountedPrice - currentPaidPrice);

    // Calcular mejoras
    const improvements = {
      offers: {
        current: currentConfig.maxActiveOffers || 0,
        new: targetConfig.maxActiveOffers || 0,
      },
      activeOffers: {
        current: currentConfig.maxActiveOffers,
        new: targetConfig.maxActiveOffers,
      },
      coupons: {
        current: 0, // No hay maxCouponsPerMonth en BD actual
        new: 0,
      },
      team: {
        current: currentConfig.maxTeamMembers,
        new: targetConfig.maxTeamMembers,
      },
      newFeatures: Object.keys(targetConfig.features || {}).filter(
        key => targetConfig.features?.[key as keyof typeof targetConfig.features] &&
              !currentConfig.features?.[key as keyof typeof currentConfig.features]
      ),
    };

    return NextResponse.json({
      success: true,
      preview: {
        canUpgrade: upgradeCheck.allowed,
        upgradeReason: upgradeCheck.reason,
        currentPlan: {
          tier: currentConfig.tier,
          name: currentConfig.name,
          basePrice: currentConfig.basePrice,
          paidPrice: currentPaidPrice,
          discount: currentConfig.firstYearDiscount || 0,
        },
        targetPlan: {
          tier: targetConfig.tier,
          name: targetConfig.name,
          basePrice: targetConfig.basePrice,
          discountedPrice: targetDiscountedPrice,
          discount: targetConfig.firstYearDiscount || 0,
        },
        proration: prorationDetails,
        priceDiff,
        improvements,
      },
    });

  } catch (error) {
    console.error('❌ [Upgrade Preview] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al calcular preview' },
      { status: 500 }
    );
  }
}