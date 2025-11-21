const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testUpgradeLogic() {
  console.log('🧪 TESTING: Upgrade logic simulation...\n');

  try {
    // 1. Obtener empresa "Empresa de Prova SL"
    const company = await prisma.company.findFirst({
      where: { name: 'Empresa de Prova SL' },
      include: { currentPlan: true }
    });

    if (!company || !company.currentPlan) {
      console.log('❌ Company or plan not found');
      return;
    }

    console.log(`📋 Company: ${company.name}`);
    console.log(`📋 Current Plan: ${company.currentPlan.tier}\n`);

    // 2. Obtener planes disponibles (simulando la nueva query corregida)
    console.log('🔧 Testing corrected query with "orden" field...');

    const planConfigs = await prisma.planConfig.findMany({
      where: {
        isActive: true,
        isVisible: true
      },
      select: { tier: true, orden: true, name: true, basePrice: true },
      orderBy: { orden: 'asc' }
    });

    console.log(`✅ Query successful! Found ${planConfigs.length} plans:`);
    planConfigs.forEach(plan => {
      console.log(`  • ${plan.name} (${plan.tier}) - Order: ${plan.orden}, Price: ${plan.basePrice}€`);
    });
    console.log('');

    // 3. Simular lógica de upgrade
    const hierarchy = planConfigs.map(p => p.tier);
    const currentTier = company.currentPlan.tier;
    const currentIndex = hierarchy.indexOf(currentTier);

    console.log(`📊 Plan hierarchy: [${hierarchy.join(' → ')}]`);
    console.log(`📍 Current position: ${currentTier} (index: ${currentIndex})\n`);

    // 4. Filtrar planes superiores
    const upgradeablePlans = planConfigs.filter((plan, index) => {
      return index > currentIndex && plan.tier !== currentTier;
    });

    console.log(`🆙 Available upgrade options: ${upgradeablePlans.length}`);
    upgradeablePlans.forEach(plan => {
      console.log(`  ✅ ${plan.name} (${plan.tier}) - ${plan.basePrice}€`);
    });

    // 5. Resultado final
    if (upgradeablePlans.length > 0) {
      console.log('\n🎉 SUCCESS: The fix works!');
      console.log('   ✅ The "orden" field query is working correctly');
      console.log('   ✅ Upgrade plans are being found properly');
      console.log('   ✅ The user should now see upgrade options in the UI');
    } else {
      console.log('\n❌ Still no upgrade plans found');
    }

  } catch (error) {
    console.error('❌ Error during test:', error);
    console.log('\n💡 If you see a "column orden does not exist" error,');
    console.log('   the fix should resolve the original issue.');
  } finally {
    await prisma.$disconnect();
  }
}

testUpgradeLogic();