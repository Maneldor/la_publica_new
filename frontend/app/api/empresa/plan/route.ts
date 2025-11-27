import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCompanyPlan, getPlanUsageStats } from '@/lib/plans/planService';
import { prismaClient } from '@/lib/prisma';

/**
 * GET /api/empresa/plan
 * Obtener información del plan actual de la empresa
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'No autoritzat o no ets una empresa' },
        { status: 401 }
      );
    }

    const sessionUser = await prismaClient.user.findUnique({
      where: { id: session.user.id },
      select: {
        ownedCompanyId: true,
        memberCompanyId: true,
        email: true,
      },
    });

    const companyId = sessionUser?.ownedCompanyId || sessionUser?.memberCompanyId;

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'No pertanys a cap empresa' },
        { status: 403 }
      );
    }

    console.log('📊 [Plan API] Getting plan for company:', companyId);

    // Obtener plan y estadísticas de uso
    const planInfo = await getCompanyPlan(companyId);
    const usageStats = await getPlanUsageStats(companyId);

    // IMPORTANTE: Verificar que config existe
    if (!planInfo.config) {
      console.error('❌ [Plan API] Config is undefined!');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error de configuració del pla',
          message: 'No s\'ha pogut carregar la configuració del pla'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      plan: {
        tier: planInfo.config.tier,
        name: planInfo.config.name,
        price: planInfo.config.basePrice,
        limits: {
          maxOffers: planInfo.config.maxActiveOffers, // Usar el mismo campo que activeOffers
          maxActiveOffers: planInfo.config.maxActiveOffers,
          maxCouponsPerMonth: 'unlimited', // Los cupones no están implementados
          maxTeamMembers: planInfo.config.maxTeamMembers,
        },
        features: planInfo.config.features,
      },
      usage: usageStats,
      planDetails: planInfo.plan, // Detalles del registro en BD
    });

  } catch (error) {
    console.error('❌ [Plan API] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtenir informació del pla',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}