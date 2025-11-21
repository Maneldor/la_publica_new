const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugUpgradeIssue() {
  console.log('🔍 DEBUG: Investigando problema de upgrade...\n');

  try {
    // 1. Verificar planes en BD
    console.log('1️⃣ VERIFICANDO PLANES EN BASE DE DATOS:');
    console.log('════════════════════════════════════════════════');

    const allPlans = await prisma.planConfig.findMany({
      select: {
        id: true,
        name: true,
        tier: true,
        isActive: true,
        isVisible: true,
        basePrice: true,
        orden: true,
        activo: true,
        visible: true
      },
      orderBy: { orden: 'asc' }
    });

    allPlans.forEach(plan => {
      console.log(`• ${plan.name} (${plan.tier})`);
      console.log(`  isActive: ${plan.isActive} | isVisible: ${plan.isVisible}`);
      console.log(`  activo: ${plan.activo} | visible: ${plan.visible}`);
      console.log(`  Precio: ${plan.basePrice}€ | Orden: ${plan.orden}`);
      console.log('');
    });

    // 2. Verificar empresa actual
    console.log('2️⃣ VERIFICANDO EMPRESA ACTUAL:');
    console.log('════════════════════════════════════════════════');

    const company = await prisma.company.findFirst({
      where: { name: 'Empresa de Prova SL' },
      select: {
        id: true,
        name: true,
        currentPlanId: true
      }
    });

    if (company) {
      console.log(`Empresa: ${company.name}`);
      console.log(`Plan ID: ${company.currentPlanId}`);

      if (company.currentPlanId) {
        const currentPlan = await prisma.planConfig.findFirst({
          where: { id: company.currentPlanId },
          select: { name: true, tier: true }
        });
        console.log(`Plan actual: ${currentPlan?.name} (${currentPlan?.tier})`);
      }
    }

    // 3. Simular lógica de filtrado
    console.log('\n3️⃣ SIMULANDO LÓGICA DE FILTRADO:');
    console.log('════════════════════════════════════════════════');

    const currentTier = 'STANDARD'; // Plan Estàndard
    const planHierarchy = ['PIONERES', 'STANDARD', 'STRATEGIC', 'ENTERPRISE'];
    const currentIndex = planHierarchy.indexOf(currentTier);

    console.log(`Tier actual: ${currentTier} (índice: ${currentIndex})`);

    const upgradeOptions = allPlans.filter(plan => {
      const planIndex = planHierarchy.indexOf(plan.tier);
      const isUpgrade = planIndex > currentIndex;
      const isVisible = plan.isVisible && plan.visible;
      const isActive = plan.isActive && plan.activo;

      console.log(`${plan.name} (${plan.tier}):`);
      console.log(`  planIndex: ${planIndex} > currentIndex: ${currentIndex} = ${isUpgrade}`);
      console.log(`  isVisible: ${isVisible} | isActive: ${isActive}`);
      console.log(`  Resultado: ${isUpgrade && isVisible && isActive ? '✅ UPGRADE' : '❌ NO'}`);
      console.log('');

      return isUpgrade && isVisible && isActive;
    });

    console.log(`Planes de upgrade encontrados: ${upgradeOptions.length}`);
    upgradeOptions.forEach(plan => {
      console.log(`  ✅ ${plan.name} (${plan.tier}) - ${plan.basePrice}€`);
    });

    // 4. Verificar API response structure
    console.log('\n4️⃣ VERIFICANDO ESTRUCTURA PARA API:');
    console.log('════════════════════════════════════════════════');

    const apiPlans = allPlans.filter(plan =>
      plan.isActive === true &&
      plan.isVisible === true
    );

    console.log(`Planes que pasarían filtro API: ${apiPlans.length}`);
    apiPlans.forEach(plan => {
      console.log(`  • ${plan.name} - isActive: ${plan.isActive}, isVisible: ${plan.isVisible}`);
    });

    // 5. Verificar inconsistencias entre campos
    console.log('\n5️⃣ VERIFICANDO INCONSISTENCIAS:');
    console.log('════════════════════════════════════════════════');

    allPlans.forEach(plan => {
      const inconsistent =
        (plan.isActive !== plan.activo) ||
        (plan.isVisible !== plan.visible);

      if (inconsistent) {
        console.log(`❌ INCONSISTENCIA en ${plan.name}:`);
        console.log(`  isActive: ${plan.isActive} vs activo: ${plan.activo}`);
        console.log(`  isVisible: ${plan.isVisible} vs visible: ${plan.visible}`);
      } else {
        console.log(`✅ ${plan.name} - campos consistentes`);
      }
    });

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🎯 DIAGNÓSTICO COMPLETADO');
    console.log('═══════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugUpgradeIssue();