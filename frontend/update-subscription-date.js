const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateSubscriptionDate() {
  console.log('🔧 UPDATING: Subscription date to simulate 100 days of usage...\n');

  try {
    // Buscar empresa "Empresa de Prova SL"
    const company = await prisma.company.findFirst({
      where: { name: 'Empresa de Prova SL' },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' }
        }
      }
    });

    if (!company || !company.subscriptions || company.subscriptions.length === 0) {
      console.log('❌ No se encontró empresa o subscription activa');
      return;
    }

    const subscription = company.subscriptions[0];
    console.log(`📋 Current subscription ID: ${subscription.id}`);

    // Calcular fechas para simular 100 días de uso
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 100); // Hace 100 días

    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1); // +1 año desde el inicio

    console.log(`📅 New dates:`);
    console.log(`  Start Date: ${startDate.toISOString()}`);
    console.log(`  End Date: ${endDate.toISOString()}`);
    console.log(`  Days used: 100`);
    console.log(`  Days remaining: ${Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))}`);

    // Actualizar subscription
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        startDate: startDate,
        endDate: endDate,
        createdAt: startDate,
        updatedAt: now
      }
    });

    console.log('\n✅ Subscription actualizada exitosamente!');
    console.log('📊 Ahora puedes probar el prorrateo con 100 días de uso y ~265 días restantes');

    // Calcular nuevo prorrateo para verificar
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const paidPrice = 250; // Standard con 50% descuento
    const dailyRate = paidPrice / 365;
    const remainingCredit = dailyRate * daysRemaining;

    console.log('\n💰 NUEVO CÁLCULO DE PRORRATEO:');
    console.log(`  Precio pagado: ${paidPrice}€`);
    console.log(`  Días restantes: ${daysRemaining}`);
    console.log(`  Tarifa diaria: ${dailyRate.toFixed(2)}€`);
    console.log(`  Crédito restante: ${remainingCredit.toFixed(2)}€`);
    console.log(`  Upgrade a Strategic (500€): ${(500 - remainingCredit).toFixed(2)}€ a pagar`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateSubscriptionDate();