import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCompanyPlan, canUpgradeToPlan, upgradePlan } from '@/lib/plans/planService';
import { prismaClient } from '@/lib/prisma';

type PlanTier = 'PIONERES' | 'STANDARD' | 'STRATEGIC' | 'ENTERPRISE';

/**
 * POST /api/empresa/plan/upgrade
 * Solicitar upgrade de plan
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.companyId) {
      return NextResponse.json(
        { success: false, error: 'No autoritzat' },
        { status: 401 }
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

    console.log(`🚀 [Upgrade] Company ${session.user.companyId} requesting upgrade to ${targetTier}`);

    // Verificar si puede hacer upgrade
    const upgradeCheck = await canUpgradeToPlan(session.user.companyId, targetTier);
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

    const upgradeResult = await upgradePlan(session.user.companyId, targetTier);

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

    if (!session?.user?.companyId) {
      return NextResponse.json(
        { success: false, error: 'No autoritzat' },
        { status: 401 }
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

    const { config: currentConfig } = await getCompanyPlan(session.user.companyId);
    const targetConfig = await prismaClient.planConfig.findFirst({
      where: { tier: targetTier }
    });

    if (!targetConfig) {
      return NextResponse.json(
        { success: false, error: 'Configuració del pla destí no trobada' },
        { status: 400 }
      );
    }

    // Verificar si puede hacer upgrade
    const upgradeCheck = await canUpgradeToPlan(session.user.companyId, targetTier);

    // Calcular diferencia de precio
    const priceDiff = targetConfig.basePrice - currentConfig.basePrice;

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
          price: currentConfig.basePrice,
        },
        targetPlan: {
          tier: targetConfig.tier,
          name: targetConfig.name,
          price: targetConfig.basePrice,
        },
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