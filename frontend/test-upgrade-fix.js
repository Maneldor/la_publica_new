const { PrismaClient } = require('@prisma/client');
const { getAvailablePlansForUpgrade } = require('./lib/plans/planService.ts');

const prisma = new PrismaClient();

async function testUpgradeFix() {
  console.log('🧪 TESTING: Upgrade fix verification...\n');

  try {
    // 1. Obtener empresa "Empresa de Prova SL"
    const company = await prisma.company.findFirst({
      where: { name: 'Empresa de Prova SL' },
      include: { currentPlan: true }
    });

    if (!company) {
      console.log('❌ Company not found');
      return;
    }

    console.log(`📋 Company: ${company.name}`);
    console.log(`📋 Current Plan Tier: ${company.currentPlan?.tier || 'NO_PLAN'}\n`);

    // 2. Obtener todos los planes disponibles
    const allPlans = await prisma.planConfig.findMany({
      where: {
        isActive: true,
        isVisible: true
      },
      orderBy: { orden: 'asc' }
    });

    console.log(`📊 Available plans: ${allPlans.length}`);
    allPlans.forEach(plan => {
      console.log(`  • ${plan.name} (${plan.tier}) - ${plan.basePrice}€`);
    });
    console.log('');

    // 3. Probar la función getAvailablePlansForUpgrade corregida
    console.log('🔧 Testing getAvailablePlansForUpgrade with current tier:', company.currentPlan?.tier);

    const upgradeablePlans = await getAvailablePlansForUpgrade(
      company.currentPlan?.tier,
      allPlans
    );

    console.log(`✅ Upgradeable plans found: ${upgradeablePlans.length}`);
    upgradeablePlans.forEach(plan => {
      console.log(`  🆙 ${plan.name} (${plan.tier}) - ${plan.basePrice}€`);
    });

    // 4. Resultado final
    if (upgradeablePlans.length > 0) {
      console.log('\n🎉 SUCCESS: Upgrade functionality is now working!');
      console.log('   The user should now see Strategic and Enterprise plans as upgrade options.');
    } else {
      console.log('\n❌ STILL FAILING: No upgrade plans found');
    }

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUpgradeFix();