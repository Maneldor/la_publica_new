import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testUpgradeValidation() {
  console.log('🧪 Verificando validaciones de upgrade API...\n');

  try {
    // 1. Buscar empresa de prueba
    const company = await prisma.company.findFirst({
      where: { name: 'Empresa Test Pioneres' },
      include: {
        currentPlan: true,
        subscriptions: {
          where: { status: 'ACTIVE' },
          take: 1
        }
      }
    });

    if (!company) {
      console.log('❌ No se encontró empresa de prueba');
      return;
    }

    console.log('✅ Empresa encontrada:', company.name);
    console.log('📋 Plan actual:', company.currentPlan?.name, '(', company.currentPlan?.tier, ')');
    console.log('💰 Precio actual:', company.subscriptions[0]?.precioMensual, '€/mes');

    // 2. Buscar plan para upgrade
    const newPlan = await prisma.planConfig.findFirst({
      where: {
        tier: 'STANDARD',
        isActive: true
      }
    });

    if (!newPlan) {
      console.log('❌ No se encontró plan STANDARD');
      return;
    }

    console.log('\n📈 Plan objetivo:', newPlan.name, '(', newPlan.tier, ')');
    console.log('💰 Precio nuevo:', newPlan.precioMensual, '€/mes');

    // 3. Validar orden de tiers
    const tierOrder = ['PIONERES', 'STANDARD', 'STRATEGIC', 'ENTERPRISE'];
    const currentIndex = tierOrder.indexOf(company.currentPlan?.tier || 'PIONERES');
    const newIndex = tierOrder.indexOf(newPlan.tier);

    console.log('\n🔍 Validación de upgrade:');
    console.log('  - Índice actual:', currentIndex, '(', company.currentPlan?.tier, ')');
    console.log('  - Índice nuevo:', newIndex, '(', newPlan.tier, ')');
    console.log('  - Es upgrade válido:', newIndex > currentIndex ? '✅ Sí' : '❌ No');

    // 4. Verificar si está en trial
    const subscription = company.subscriptions[0];
    const isInTrial = subscription?.precioMensual === 0;

    console.log('\n💳 Estado de pago:');
    console.log('  - En trial:', isInTrial ? '✅ Sí (gratis)' : '❌ No (pagando)');

    if (!isInTrial && subscription) {
      // Calcular prorrateo
      const now = new Date();
      const endDate = new Date(subscription.endDate!);
      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      console.log('  - Días restantes:', daysRemaining);
      console.log('  - Requiere prorrateo: ✅ Sí');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testUpgradeValidation()
  .finally(() => prisma.$disconnect());