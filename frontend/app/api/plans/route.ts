import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

/**
 * GET /api/plans
 * Obtenir tots els plans actius (PÚBLIC - sense autenticació)
 * Usat tant per Admin com per Empresa
 */
export async function GET(request: NextRequest) {
  let prismaClient;

  try {
    prismaClient = new PrismaClient();
    
    const planes = await prismaClient.planConfig.findMany({
      where: {
        isActive: true,
        isVisible: true
      },
      select: {
        id: true,
        slug: true,
        tier: true,
        name: true,
        nameEs: true,
        nameEn: true,
        description: true,
        basePrice: true,
        firstYearDiscount: true,
        maxActiveOffers: true,
        maxTeamMembers: true,
        maxFeaturedOffers: true,
        maxStorage: true,
        features: true,
        badge: true,
        badgeColor: true,
        isPioneer: true,
        color: true,
        icono: true,
        destacado: true,
        orden: true,
        hasFreeTrial: true,
        trialDurationDays: true,
        displayNote: true,
        funcionalidades: true,
        priceIncludesVAT: true,
        isActive: true,
        isVisible: true,
      },
      orderBy: { orden: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: planes
    });

  } catch (error) {
    console.error('❌ [Plans API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtenir plans' },
      { status: 500 }
    );
  } finally {
    if (prismaClient) {
      await prismaClient.$disconnect();
    }
  }
}