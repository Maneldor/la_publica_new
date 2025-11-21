const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSubscriptionStructure() {
  console.log('🔍 CHECKING: Subscription structure for prorated upgrade...\n');

  try {
    // Buscar empresa de test
    const company = await prisma.company.findFirst({
      where: { name: 'Empresa de Prova SL' },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
          include: { plan: true }
        }
      }
    });

    if (!company) {
      console.log('❌ Company not found');
      return;
    }

    console.log(`✅ Company: ${company.name}`);
    console.log(`Subscriptions found: ${company.subscriptions?.length || 0}\n`);

    if (company.subscriptions && company.subscriptions.length > 0) {
      company.subscriptions.forEach((sub, i) => {
        console.log(`📋 SUBSCRIPTION ${i + 1}:`);
        console.log(`  ID: ${sub.id}`);
        console.log(`  Tier: ${sub.tier}`);
        console.log(`  Status: ${sub.status}`);
        console.log(`  Start Date: ${sub.startDate || sub.createdAt}`);
        console.log(`  End Date: ${sub.endDate || 'NO_END_DATE'}`);
        console.log(`  Created: ${sub.createdAt}`);
        console.log(`  Updated: ${sub.updatedAt}`);
        console.log(`  Plan Config: ${sub.plan?.name || 'NO_CONFIG'}`);
        console.log(`  Plan Base Price: ${sub.plan?.basePrice || 0}€`);
        console.log(`  Plan Discount: ${sub.plan?.firstYearDiscount || 0}%`);

        // Calcular precio realmente pagado
        const basePrice = sub.plan?.basePrice || 0;
        const discount = sub.plan?.firstYearDiscount || 0;
        const realPricePaid = basePrice * (1 - discount / 100);
        console.log(`  Real Price Paid: ${realPricePaid}€`);
        console.log('');

        // Calcular días restantes si hay fecha de fin
        if (sub.endDate) {
          const now = new Date();
          const endDate = new Date(sub.endDate);
          const diffTime = endDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          console.log(`  🗓️ PRORATION CALCULATION:`);
          console.log(`    Days remaining: ${diffDays}`);
          console.log(`    Plan base price: ${sub.plan?.basePrice || 0}€`);
          console.log(`    Real price paid: ${realPricePaid}€`);

          if (diffDays > 0 && sub.plan?.basePrice) {
            const dailyPricePaid = realPricePaid / 365;
            const remainingValuePaid = dailyPricePaid * diffDays;
            console.log(`    Daily rate (paid): ${dailyPricePaid.toFixed(2)}€`);
            console.log(`    Remaining value (based on paid): ${remainingValuePaid.toFixed(2)}€`);

            // Ejemplo de upgrade a Strategic (1000€)
            const strategicPrice = 1000;
            const strategicDiscountedPrice = strategicPrice * (1 - 0.5); // 50% descuento primer año
            const amountToPay = strategicDiscountedPrice - remainingValuePaid;
            console.log(`    ---`);
            console.log(`    Example upgrade to Strategic:`);
            console.log(`    Strategic price: ${strategicPrice}€ → With discount: ${strategicDiscountedPrice}€`);
            console.log(`    Amount to pay: ${amountToPay.toFixed(2)}€`);
          }
        } else {
          console.log(`  ⚠️ NO END DATE - Cannot calculate proration`);
        }
        console.log('');
      });
    } else {
      console.log('❌ No active subscriptions found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSubscriptionStructure();