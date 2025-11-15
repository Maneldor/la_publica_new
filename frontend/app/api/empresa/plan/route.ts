import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { prismaClient } from '../../../../lib/prisma';

/**
 * GET /api/empresa/plan
 * Obtener plan actual y subscription de la empresa
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Buscar usuario y su empresa
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email },
      include: {
        ownedCompany: {
          include: {
            currentPlan: {
              select: {
                id: true,
                tier: true,
                name: true,
                description: true,
                basePrice: true,
                precioMensual: true,
                precioAnual: true,
                firstYearDiscount: true,
                maxActiveOffers: true,
                maxTeamMembers: true,
                maxFeaturedOffers: true,
                maxStorage: true,
                funcionalidades: true,
                isActive: true,
                badge: true,
                badgeColor: true
              }
            },
            subscriptions: {
              where: {
                status: 'ACTIVE'
              },
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

    // Calcular uso actual vs límites
    const usage = await calculateUsage(company.id);

    // Parsear features del plan
    let planFeatures = {};
    try {
      planFeatures = typeof company.currentPlan?.features === 'string'
        ? JSON.parse(company.currentPlan.features)
        : company.currentPlan?.features || {};
    } catch (e) {
      console.error('Error parsing plan features:', e);
    }

    // Calcular días restantes de trial
    let daysRemaining = null;
    let isInTrial = false;

    if (currentSubscription?.endDate) {
      const now = new Date();
      const endDate = new Date(currentSubscription.endDate);
      daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      isInTrial = daysRemaining > 0 && currentSubscription.precioMensual === 0;
    }

    return NextResponse.json({
      success: true,
      data: {
        company: {
          id: company.id,
          name: company.name,
          status: company.status
        },
        plan: {
          id: company.currentPlan?.id,
          name: company.currentPlan?.name,
          tier: company.currentPlan?.tier,
          slug: company.currentPlan?.slug,
          basePrice: company.currentPlan?.basePrice,
          precioMensual: company.currentPlan?.precioMensual,
          precioAnual: company.currentPlan?.precioAnual,
          firstYearDiscount: company.currentPlan?.firstYearDiscount,
          badge: company.currentPlan?.badge,
          badgeColor: company.currentPlan?.badgeColor,
          isPioneer: company.currentPlan?.isPioneer,
          funcionalidades: company.currentPlan?.funcionalidades,
          features: planFeatures,
          limits: {
            maxActiveOffers: company.currentPlan?.maxActiveOffers,
            maxTeamMembers: company.currentPlan?.maxTeamMembers,
            maxFeaturedOffers: company.currentPlan?.maxFeaturedOffers,
            maxStorage: company.currentPlan?.maxStorage
          }
        },
        subscription: currentSubscription ? {
          id: currentSubscription.id,
          status: currentSubscription.status,
          startDate: currentSubscription.startDate,
          endDate: currentSubscription.endDate,
          precioMensual: currentSubscription.precioMensual,
          precioAnual: currentSubscription.precioAnual,
          isAutoRenew: currentSubscription.isAutoRenew,
          isInTrial,
          daysRemaining,
          trialEndsAt: isInTrial ? currentSubscription.endDate : null
        } : null,
        usage,
        canUpgrade: !company.currentPlan?.tier || company.currentPlan.tier !== 'ENTERPRISE'
      }
    });

  } catch (error) {
    console.error('Error obteniendo plan:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener información del plan',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

/**
 * Calcular uso actual de la empresa
 */
async function calculateUsage(companyId: string) {
  // TODO: Implementar según tus modelos
  // Por ahora retornamos valores de ejemplo

  const [
    activeOffers,
    teamMembers,
    featuredOffers,
    // storage
  ] = await Promise.all([
    // prismaClient.offer.count({ where: { companyId, isActive: true } }),
    0, // TODO: Implementar cuando tengas modelo de ofertas
    prismaClient.user.count({
      where: {
        OR: [
          { ownedCompanyId: companyId },
          { memberCompanyId: companyId }
        ]
      }
    }),
    // prismaClient.offer.count({ where: { companyId, isFeatured: true } }),
    0, // TODO: Implementar
    // Calcular storage usado
  ]);

  return {
    activeOffers,
    teamMembers,
    featuredOffers,
    storage: 0 // TODO: Implementar cálculo de storage
  };
}