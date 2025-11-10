import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Cambiar plan de empresa con prorrateo
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { newPlan, billingCycle = 'MONTHLY' } = await request.json();

    if (!newPlan) {
      return NextResponse.json(
        { error: 'Nou pla obligatori' },
        { status: 400 }
      );
    }

    // Obtener la empresa actual del usuario
    const userWithCompany = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { company: true }
    });

    if (!userWithCompany?.company) {
      return NextResponse.json(
        { error: 'Empresa no trobada' },
        { status: 404 }
      );
    }

    const company = userWithCompany.company;

    // Verificar que el nuevo plan es diferente al actual
    if (company.planType === newPlan) {
      return NextResponse.json(
        { error: 'El pla seleccionat és el mateix que l\'actual' },
        { status: 400 }
      );
    }

    // Obtener configuración de los planes
    const [currentPlanData, newPlanData] = await Promise.all([
      prisma.planConfig.findUnique({ where: { planType: company.planType } }),
      prisma.planConfig.findUnique({ where: { planType: newPlan } })
    ]);

    if (!currentPlanData || !newPlanData) {
      return NextResponse.json(
        { error: 'Configuració de plans no trobada' },
        { status: 404 }
      );
    }

    const now = new Date();

    // Actualitzar el pla de l'empresa
    const updatedCompany = await prisma.company.update({
      where: { id: company.id },
      data: {
        planType: newPlan,
        billingCycle: billingCycle,
        planChangedAt: now,
        // Si és la primera vegada que es canvia el pla, establir la data d'inici de subscripció
        subscriptionStartDate: company.subscriptionStartDate || now,
        updatedAt: now
      }
    });

    // Parsear los límites del nuevo plan
    const newLimits = JSON.parse(newPlanData.limitesJSON);

    // Verificar límites y ajustar si es necesario
    const adjustments = [];
    let needsAdjustment = false;

    // Verificar miembros del equipo
    if (newLimits.maxMembers !== -1) {
      const currentMembersCount = await prisma.user.count({
        where: { companyId: company.id }
      });

      if (currentMembersCount > newLimits.maxMembers) {
        adjustments.push({
          type: 'MEMBERS_EXCEEDED',
          current: currentMembersCount,
          limit: newLimits.maxMembers,
          action: 'LIMIT_REACHED'
        });
        needsAdjustment = true;
      }
    }

    // Verificar ofertes actives
    if (newLimits.maxProjects !== -1) {
      const currentOffersCount = await prisma.companyProduct.count({
        where: { companyId: company.id, isActive: true }
      });

      if (currentOffersCount > newLimits.maxProjects) {
        adjustments.push({
          type: 'OFFERS_EXCEEDED',
          current: currentOffersCount,
          limit: newLimits.maxProjects,
          action: 'DISABLE_OLDEST'
        });
        needsAdjustment = true;

        // Desactivar ofertes més antigues si excedeix el límit
        const offersToDisable = await prisma.companyProduct.findMany({
          where: { companyId: company.id, isActive: true },
          orderBy: { createdAt: 'asc' },
          skip: newLimits.maxProjects
        });

        if (offersToDisable.length > 0) {
          await prisma.companyProduct.updateMany({
            where: {
              id: { in: offersToDisable.map(p => p.id) },
              companyId: company.id
            },
            data: { isActive: false }
          });
        }
      }
    }

    // Verificar agentes IA (simulado)
    if (newLimits.maxAIAgents !== -1) {
      // Aquí verificarías los agentes IA cuando los tengas implementados
      const currentAIAgents = 0; // Placeholder
      if (currentAIAgents > newLimits.maxAIAgents) {
        adjustments.push({
          type: 'AI_AGENTS_EXCEEDED',
          current: currentAIAgents,
          limit: newLimits.maxAIAgents,
          action: 'DISABLE_OLDEST'
        });
        needsAdjustment = true;
      }
    }

    // Registrar el cambio de plan en el historial
    await prisma.planChangeHistory.create({
      data: {
        companyId: company.id,
        fromPlan: company.planType,
        toPlan: newPlan,
        billingCycle: billingCycle,
        changeReason: 'USER_UPGRADE',
        effectiveDate: now,
        adjustmentsRequired: needsAdjustment,
        adjustmentsData: adjustments.length > 0 ? JSON.stringify(adjustments) : null,
        changedBy: userWithCompany.id
      }
    });

    // Calcular siguiente fecha de facturación
    const nextBillingDate = new Date(now);
    if (billingCycle === 'MONTHLY') {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    } else {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    }

    return NextResponse.json({
      success: true,
      message: 'Pla canviat amb èxit',
      company: {
        id: updatedCompany.id,
        name: updatedCompany.name,
        planType: updatedCompany.planType,
        billingCycle: updatedCompany.billingCycle,
        planChangedAt: updatedCompany.planChangedAt
      },
      planData: {
        name: newPlanData.nombre,
        limits: newLimits,
        features: JSON.parse(newPlanData.caracteristicas)
      },
      adjustments: adjustments,
      needsAdjustment: needsAdjustment,
      nextBillingDate: nextBillingDate.toISOString(),
      effectiveDate: now.toISOString()
    });

  } catch (error) {
    console.error('Error canviant pla:', error);
    return NextResponse.json(
      { error: 'Error al canviar pla' },
      { status: 500 }
    );
  }
}