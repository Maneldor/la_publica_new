// app/api/empresa/limits/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkMultipleLimits } from '@/lib/plan-limits';
import { prismaClient } from '@/lib/prisma';

/**
 * GET /api/empresa/limits
 * Obtener límites y uso actual de la empresa
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

    // Obtener todos los límites
    const limits = await checkMultipleLimits(company.id, [
      'activeOffers',
      'teamMembers',
      'featuredOffers',
      'storage'
    ]);

    // Calcular porcentajes de uso
    const calculatePercentage = (current: number, limit: number): number => {
      if (limit === -1) return 0; // Ilimitado
      if (limit === 0) return 100;
      return Math.min(100, Math.round((current / limit) * 100));
    };

    // Determinar estado de cada límite
    const getLimitStatus = (percentage: number) => {
      if (percentage >= 100) return 'exceeded';
      if (percentage >= 80) return 'warning';
      if (percentage >= 50) return 'ok';
      return 'good';
    };

    return NextResponse.json({
      success: true,
      data: {
        company: {
          id: company.id,
          name: company.name
        },
        plan: {
          id: company.currentPlan?.id,
          name: company.currentPlan?.name,
          tier: company.currentPlan?.tier
        },
        limits: {
          activeOffers: {
            ...limits.activeOffers,
            percentage: calculatePercentage(limits.activeOffers.current, limits.activeOffers.limit),
            status: getLimitStatus(calculatePercentage(limits.activeOffers.current, limits.activeOffers.limit)),
            label: 'Ofertas activas'
          },
          teamMembers: {
            ...limits.teamMembers,
            percentage: calculatePercentage(limits.teamMembers.current, limits.teamMembers.limit),
            status: getLimitStatus(calculatePercentage(limits.teamMembers.current, limits.teamMembers.limit)),
            label: 'Miembros del equipo'
          },
          featuredOffers: {
            ...limits.featuredOffers,
            percentage: calculatePercentage(limits.featuredOffers.current, limits.featuredOffers.limit),
            status: getLimitStatus(calculatePercentage(limits.featuredOffers.current, limits.featuredOffers.limit)),
            label: 'Ofertas destacadas'
          },
          storage: {
            ...limits.storage,
            percentage: calculatePercentage(limits.storage.current, limits.storage.limit),
            status: getLimitStatus(calculatePercentage(limits.storage.current, limits.storage.limit)),
            label: 'Almacenamiento (GB)'
          }
        },
        summary: {
          totalLimits: 4,
          exceeded: Object.values(limits).filter(l => l.limit !== -1 && l.current >= l.limit).length,
          warning: Object.values(limits).filter(l => {
            if (l.limit === -1) return false;
            const percentage = (l.current / l.limit) * 100;
            return percentage >= 80 && percentage < 100;
          }).length,
          canUpgrade: company.currentPlan?.tier !== 'ENTERPRISE'
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo límites:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener límites',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}