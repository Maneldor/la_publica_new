const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testProrationScenarios() {
  console.log('📊 TESTING: Different proration scenarios across companies...\n');

  try {
    // Obtener todas las empresas con subscripciones activas
    const companies = await prisma.company.findMany({
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    console.log(`Found ${companies.length} companies with active subscriptions\n`);

    for (const company of companies) {
      if (!company.subscriptions || company.subscriptions.length === 0) {
        console.log(`❌ ${company.name}: No active subscription`);
        continue;
      }

      const subscription = company.subscriptions[0];
      const plan = subscription.plan;

      console.log(`🏢 ${company.name.toUpperCase()}`);
      console.log(`   Current Plan: ${plan.name} (${subscription.tier})`);
      console.log(`   Base Price: ${plan.basePrice}€`);
      console.log(`   Discount: ${plan.firstYearDiscount || 0}%`);

      // Calcular precio pagado
      const paidPrice = plan.basePrice * (1 - (plan.firstYearDiscount || 0) / 100);
      console.log(`   Paid Price: ${paidPrice}€`);

      // Calcular días
      const now = new Date();
      const startDate = new Date(subscription.startDate || subscription.createdAt);
      const endDate = new Date(subscription.endDate);

      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysUsed = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

      console.log(`   Days Used: ${daysUsed} / ${totalDays}`);
      console.log(`   Days Remaining: ${daysRemaining}`);

      // Calcular prorrateo
      const dailyRate = paidPrice / 365;
      const remainingCredit = dailyRate * daysRemaining;

      console.log(`   Daily Rate: ${dailyRate.toFixed(2)}€/day`);
      console.log(`   Remaining Credit: ${remainingCredit.toFixed(2)}€`);

      // Simular upgrade a diferentes planes
      const upgradeTargets = [
        { tier: 'STRATEGIC', basePrice: 1000, discount: 50 },
        { tier: 'ENTERPRISE', basePrice: 2000, discount: 50 }
      ];

      for (const target of upgradeTargets) {
        if (target.tier === subscription.tier) continue;

        const targetPaidPrice = target.basePrice * (1 - target.discount / 100);
        const amountToPay = Math.max(0, targetPaidPrice - remainingCredit);

        console.log(`   → Upgrade to ${target.tier}: ${amountToPay.toFixed(2)}€ to pay`);
        console.log(`     (${target.basePrice}€ → ${targetPaidPrice}€ with discount - ${remainingCredit.toFixed(2)}€ credit)`);
      }

      console.log('');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProrationScenarios();