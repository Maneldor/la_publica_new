import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Calcular prorrateo para cambio de plan
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { currentPlan, newPlan, billingCycle = 'MONTHLY' } = await request.json();

    // Validar planes
    if (!currentPlan || !newPlan) {
      return NextResponse.json(
        { error: 'Plans actuals i nous són obligatoris' },
        { status: 400 }
      );
    }

    // Obtenir informació de l'empresa per obtenir la data de subscripció
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

    // Obtener información de los planes desde la base de datos
    const [currentPlanData, newPlanData] = await Promise.all([
      prisma.planConfig.findUnique({ where: { planType: currentPlan } }),
      prisma.planConfig.findUnique({ where: { planType: newPlan } })
    ]);

    if (!currentPlanData || !newPlanData) {
      return NextResponse.json(
        { error: 'Plans no trobats' },
        { status: 404 }
      );
    }

    // Calcular días restantes en el período actual
    const now = new Date();
    const currentDate = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysRemaining = daysInMonth - currentDate;
    const daysUsed = currentDate;

    // Obtener precios según el ciclo de facturación
    const currentPrice = billingCycle === 'YEARLY'
      ? (currentPlanData.precioAnual || currentPlanData.precioMensual * 12) / 12
      : currentPlanData.precioMensual;

    const newPrice = billingCycle === 'YEARLY'
      ? (newPlanData.precioAnual || newPlanData.precioMensual * 12) / 12
      : newPlanData.precioMensual;

    // Calcular el crédito por los días no utilizados del plan actual
    const dailyCurrentPrice = currentPrice / daysInMonth;
    const creditAmount = dailyCurrentPrice * daysRemaining;

    // Calcular el costo del nuevo plan por los días restantes
    const dailyNewPrice = newPrice / daysInMonth;
    const chargeAmount = dailyNewPrice * daysRemaining;

    // Calcular el ajuste total
    const adjustmentAmount = chargeAmount - creditAmount;

    // Determinar tipo de cambio
    const changeType = newPrice > currentPrice ? 'UPGRADE' :
                       newPrice < currentPrice ? 'DOWNGRADE' : 'LATERAL';

    // Calcular fecha de próxima facturación
    const nextBillingDate = new Date(now);
    if (billingCycle === 'MONTHLY') {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    } else {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    }

    // Preparar comparación de características
    const currentLimits = JSON.parse(currentPlanData.limitesJSON);
    const newLimits = JSON.parse(newPlanData.limitesJSON);

    const featureChanges = {
      members: {
        current: currentLimits.maxMembers,
        new: newLimits.maxMembers,
        change: newLimits.maxMembers - currentLimits.maxMembers
      },
      storage: {
        current: currentLimits.maxStorage,
        new: newLimits.maxStorage,
        change: newLimits.maxStorage - currentLimits.maxStorage
      },
      aiAgents: {
        current: currentLimits.maxAIAgents,
        new: newLimits.maxAIAgents,
        change: newLimits.maxAIAgents - currentLimits.maxAIAgents
      },
      posts: {
        current: currentLimits.maxPosts,
        new: newLimits.maxPosts,
        change: newLimits.maxPosts - currentLimits.maxPosts
      },
      projects: {
        current: currentLimits.maxProjects,
        new: newLimits.maxProjects,
        change: newLimits.maxProjects - currentLimits.maxProjects
      }
    };

    // Calcular temps transcorregut des de la subscripció
    const subscriptionTime = company.subscriptionStartDate
      ? {
          startDate: company.subscriptionStartDate,
          daysActive: Math.floor((now.getTime() - company.subscriptionStartDate.getTime()) / (1000 * 60 * 60 * 24)),
          monthsActive: Math.floor((now.getTime() - company.subscriptionStartDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)), // Promig de dies per mes
          lastChanged: company.planChangedAt
        }
      : null;

    // Preparar respuesta con todos los detalles
    const prorationDetails = {
      currentPlan: {
        name: currentPlanData.nombre,
        price: currentPrice,
        features: currentLimits
      },
      newPlan: {
        name: newPlanData.nombre,
        price: newPrice,
        features: newLimits
      },
      billing: {
        cycle: billingCycle,
        daysInPeriod: daysInMonth,
        daysUsed,
        daysRemaining,
        percentageUsed: Math.round((daysUsed / daysInMonth) * 100),
        percentageRemaining: Math.round((daysRemaining / daysInMonth) * 100)
      },
      subscription: subscriptionTime,
      proration: {
        creditAmount: Math.abs(creditAmount),
        creditDescription: `Crèdit pels ${daysRemaining} dies no utilitzats del ${currentPlanData.nombre}`,
        chargeAmount: Math.abs(chargeAmount),
        chargeDescription: `Cost pels ${daysRemaining} dies del ${newPlanData.nombre}`,
        adjustmentAmount,
        adjustmentType: adjustmentAmount > 0 ? 'CHARGE' : adjustmentAmount < 0 ? 'CREDIT' : 'NONE',
        immediatePayment: adjustmentAmount > 0 ? adjustmentAmount : 0,
        accountCredit: adjustmentAmount < 0 ? Math.abs(adjustmentAmount) : 0
      },
      changeType,
      featureChanges,
      effectiveDate: now.toISOString(),
      nextBillingDate: nextBillingDate.toISOString(),
      nextBillingAmount: newPrice,
      warnings: getWarnings(changeType, featureChanges),
      summary: getSummaryMessage(changeType, adjustmentAmount, daysRemaining, currentPlanData.nombre, newPlanData.nombre)
    };

    return NextResponse.json(prorationDetails);

  } catch (error) {
    console.error('Error calculant prorrateig:', error);
    return NextResponse.json(
      { error: 'Error al calcular prorrateig' },
      { status: 500 }
    );
  }
}

// Función auxiliar para obtener advertencias
function getWarnings(changeType: string, featureChanges: any): string[] {
  const warnings = [];

  if (changeType === 'DOWNGRADE') {
    warnings.push('Aquest és un downgrade. Algunes funcionalitats es reduiran.');

    // Verificar reducciones específicas
    Object.entries(featureChanges).forEach(([key, value]: [string, any]) => {
      if (value.change < 0) {
        const featureName = getFeatureName(key);
        if (value.new === 0) {
          warnings.push(`⚠️ Perdràs accés a ${featureName}`);
        } else {
          warnings.push(`⚠️ ${featureName} es reduirà de ${value.current} a ${value.new}`);
        }
      }
    });
  }

  return warnings;
}

// Función auxiliar para obtener nombres de características
function getFeatureName(key: string): string {
  const names: Record<string, string> = {
    members: 'Membres d\'equip',
    storage: 'Emmagatzematge',
    aiAgents: 'Agents IA',
    posts: 'Posts mensuals',
    projects: 'Projectes'
  };
  return names[key] || key;
}

// Función auxiliar para generar mensaje de resumen
function getSummaryMessage(
  changeType: string,
  adjustmentAmount: number,
  daysRemaining: number,
  currentPlanName: string,
  newPlanName: string
): string {
  if (changeType === 'UPGRADE') {
    if (adjustmentAmount > 0) {
      return `Actualitzant de ${currentPlanName} a ${newPlanName}. Pagaràs ${adjustmentAmount.toFixed(2)}€ pels ${daysRemaining} dies restants.`;
    } else {
      return `Actualitzant de ${currentPlanName} a ${newPlanName}. No hi ha càrrecs addicionals aquest mes.`;
    }
  } else if (changeType === 'DOWNGRADE') {
    if (adjustmentAmount < 0) {
      return `Canviant de ${currentPlanName} a ${newPlanName}. Rebràs un crèdit de ${Math.abs(adjustmentAmount).toFixed(2)}€.`;
    } else {
      return `Canviant de ${currentPlanName} a ${newPlanName}. El canvi s'aplicarà al proper període de facturació.`;
    }
  } else {
    return `Canviant de ${currentPlanName} a ${newPlanName}. Sense canvis en el cost.`;
  }
}