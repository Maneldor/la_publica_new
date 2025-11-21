const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugUpgradeDetailed() {
  console.log('🔍 DEBUG DETAILED: Investigando problema completo...\n');

  try {
    // 1. Verificar empresa y su plan actual
    const company = await prisma.company.findFirst({
      where: { name: 'Empresa de Prova SL' },
      include: {
        currentPlan: true,
        subscription: {
          where: { status: 'ACTIVE' },
          include: { planConfig: true }
        }
      }
    });

    console.log('1️⃣ EMPRESA Y PLAN:');
    console.log('════════════════════════════════');
    if (company) {
      console.log(`Empresa: ${company.name}`);
      console.log(`Company ID: ${company.id}`);
      console.log(`CurrentPlanId: ${company.currentPlanId}`);
      console.log(`CurrentPlan existe: ${!!company.currentPlan}`);
      if (company.currentPlan) {
        console.log(`CurrentPlan tier: ${company.currentPlan.tier}`);
        console.log(`CurrentPlan name: ${company.currentPlan.name}`);
      }
      console.log(`Subscriptions activas: ${company.subscription?.length || 0}`);
      if (company.subscription && company.subscription.length > 0) {
        company.subscription.forEach((sub, i) => {
          console.log(`  Subscription ${i}: ${sub.tier} - ${sub.status}`);
          console.log(`  PlanConfig: ${sub.planConfig?.name || 'NO_CONFIG'}`);
        });
      }
    } else {
      console.log('❌ Empresa no encontrada');
    }

    console.log('');

    // 2. Simular API /api/empresa/plan
    console.log('2️⃣ SIMULANDO API /api/empresa/plan:');
    console.log('════════════════════════════════');

    if (company?.currentPlan) {
      const apiResponse = {
        success: true,
        plan: {
          tier: company.currentPlan.tier,
          name: company.currentPlan.name,
          price: company.currentPlan.basePrice || 0
        }
      };
      console.log('API Response:', JSON.stringify(apiResponse, null, 2));
    } else {
      console.log('❌ No current plan - API would fail');
    }

    console.log('');

    // 3. Simular API /api/plans
    console.log('3️⃣ SIMULANDO API /api/plans:');
    console.log('════════════════════════════════');

    const allPlans = await prisma.planConfig.findMany({
      where: {
        isActive: true,
        isVisible: true
      },
      orderBy: { orden: 'asc' }
    });

    const apiPlansResponse = {
      success: true,
      data: allPlans.map(plan => ({
        id: plan.id,
        slug: plan.slug,
        tier: plan.tier,
        name: plan.name,
        basePrice: plan.basePrice,
        firstYearDiscount: plan.firstYearDiscount,
        maxActiveOffers: plan.maxActiveOffers,
        maxTeamMembers: plan.maxTeamMembers,
        maxFeaturedOffers: plan.maxFeaturedOffers,
        maxStorage: plan.maxStorage,
        features: plan.features || {},
        isActive: plan.isActive,
        isVisible: plan.isVisible
      }))
    };

    console.log(`Plans API Response: ${apiPlansResponse.data.length} plans`);
    apiPlansResponse.data.forEach(plan => {
      console.log(`  • ${plan.name} (${plan.tier}) - Active: ${plan.isActive}, Visible: ${plan.isVisible}`);
    });

    console.log('');

    // 4. Simular lógica del frontend
    console.log('4️⃣ SIMULANDO LÓGICA FRONTEND:');
    console.log('════════════════════════════════');

    if (company?.currentPlan) {
      const currentTier = company.currentPlan.tier;
      const planHierarchy = ['PIONERES', 'STANDARD', 'STRATEGIC', 'ENTERPRISE'];
      const currentIndex = planHierarchy.indexOf(currentTier);

      console.log(`Current tier: ${currentTier}`);
      console.log(`Current index: ${currentIndex}`);
      console.log(`Hierarchy: ${planHierarchy.join(' → ')}`);

      // Simular el filtrado que hace el frontend
      const upgradeOptions = apiPlansResponse.data.filter(plan => {
        const planIndex = planHierarchy.indexOf(plan.tier);
        const isUpgrade = planIndex > currentIndex;
        const isVisible = plan.isVisible;
        const isActive = plan.isActive;

        console.log(`${plan.name}:`);
        console.log(`  planIndex (${planIndex}) > currentIndex (${currentIndex}) = ${isUpgrade}`);
        console.log(`  isVisible: ${isVisible}, isActive: ${isActive}`);
        console.log(`  Resultado: ${isUpgrade && isVisible && isActive ? '✅ INCLUIR' : '❌ EXCLUIR'}`);

        return isUpgrade && isVisible && isActive;
      });

      console.log(`\nPlanes de upgrade encontrados: ${upgradeOptions.length}`);
      upgradeOptions.forEach(plan => {
        console.log(`  ✅ ${plan.name} (${plan.tier}) - ${plan.basePrice}€`);
      });

      // 5. Verificar si el problema es en la función getDynamicPlanHierarchy
      console.log('\n5️⃣ VERIFICANDO getDynamicPlanHierarchy:');
      console.log('════════════════════════════════');

      try {
        const dynamicPlans = await prisma.planConfig.findMany({
          where: {
            isActive: true,
            isVisible: true
          },
          select: { tier: true, orden: true },
          orderBy: { orden: 'asc' }
        });

        const dynamicHierarchy = dynamicPlans.map(p => p.tier);
        console.log(`Dynamic hierarchy: ${dynamicHierarchy.join(' → ')}`);
        console.log(`Matches static hierarchy: ${JSON.stringify(dynamicHierarchy) === JSON.stringify(planHierarchy)}`);

      } catch (err) {
        console.log(`❌ Error en getDynamicPlanHierarchy: ${err.message}`);
      }

    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugUpgradeDetailed();