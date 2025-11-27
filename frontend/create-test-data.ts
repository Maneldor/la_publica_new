// @ts-nocheck

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para crear datos de prueba realistas
 * Simula escenarios de límites para testing del sistema de planes
 *
 * Ejecutar: npx tsx create-test-data.ts
 */

interface CompanyTestData {
  id: string;
  name: string;
  email: string;
  planTier: string;
  targetScenario: 'trial_ending' | 'limits_warning' | 'limits_error' | 'normal';
  targetPercentage?: number;
}

async function createTestData() {
  console.log('🏗️  Iniciando creación de datos de prueba...\n');

  try {
    // 1. Obtener empresas y sus planes actuales
    const companies = await prisma.company.findMany({
      include: {
        subscription: {
          include: {
            plan: true
          }
        }
      },
      where: {
        email: {
          in: [
            'pionera@test.cat',
            'estandard@test.cat',
            'estrategic@test.cat',
            'enterprise@test.cat'
          ]
        }
      }
    });

    console.log(`📊 Encontradas ${companies.length} empresas de prueba\n`);

    for (const company of companies) {
      if (!company.subscription?.plan) {
        console.log(`❌ Empresa ${company.name} no tiene plan asignado, saltando...`);
        continue;
      }

      const plan = company.subscription.plan;
      console.log(`🏢 Procesando: ${company.name} (${plan.tier})`);
      console.log(`   📧 Email: ${company.email}`);

      // 2. Configurar escenario según empresa
      let targetScenario: CompanyTestData['targetScenario'] = 'normal';
      let targetPercentage = 50;

      switch (plan.tier) {
        case 'PIONERES':
          targetScenario = 'trial_ending';
          // Ajustar trial a 15 días (ya hecho en SQL)
          console.log(`   ⏰ Escenario: Trial ending (15 días)`);
          break;

        case 'ESTÀNDARD':
          targetScenario = 'limits_warning';
          targetPercentage = 85; // 85% del límite para warning
          console.log(`   ⚠️  Escenario: Límites warning (${targetPercentage}%)`);
          break;

        case 'ESTRATÈGIC':
          targetScenario = 'limits_warning';
          targetPercentage = 90; // 90% del límite para warning alto
          console.log(`   ⚠️  Escenario: Límites warning alto (${targetPercentage}%)`);
          break;

        case 'ENTERPRISE':
          targetScenario = 'normal';
          console.log(`   ✅ Escenario: Normal (sin límites)`);
          break;
      }

      // 3. Crear ofertas para alcanzar porcentaje target
      if (targetScenario === 'limits_warning' && plan.limiteOfertas > 0) {
        await createOfertasForCompany(company.id, company.name, plan.limiteOfertas, targetPercentage);
      }

      // 4. Crear extras para empresa ESTRATÈGIC
      if (plan.tier === 'ESTRATÈGIC' && plan.limiteExtras > 0) {
        await createExtrasForCompany(company.id, company.name, plan.limiteExtras, 90);
      }

      console.log('');
    }

    // 5. Verificar resultados finales
    await verifyFinalResults();

    console.log('\n✅ Datos de prueba creados exitosamente');

  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error);
    throw error;
  }
}

async function createOfertasForCompany(
  companyId: string,
  companyName: string,
  limite: number,
  targetPercentage: number
) {
  console.log(`   📝 Creando ofertas para ${companyName}...`);

  // Contar ofertas actuales
  const currentOfertas = await prisma.oferta.count({
    where: { companyId }
  });

  // Calcular target
  const targetCount = Math.floor((limite * targetPercentage) / 100);
  const ofertasToCreate = Math.max(0, targetCount - currentOfertas);

  console.log(`      📊 Actual: ${currentOfertas}, Target: ${targetCount} (${targetPercentage}%)`);

  if (ofertasToCreate > 0) {
    console.log(`      ➕ Creando ${ofertasToCreate} ofertas...`);

    const ofertasData = [];
    for (let i = 1; i <= ofertasToCreate; i++) {
      ofertasData.push({
        title: `Oferta de prueba ${currentOfertas + i}`,
        description: `Esta es una oferta de prueba para testing de límites del sistema de planes. Creada automáticamente para alcanzar el ${targetPercentage}% del límite de ${limite} ofertas.`,
        companyId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Crear en lotes para mejor performance
    await prisma.oferta.createMany({
      data: ofertasData
    });

    const newTotal = currentOfertas + ofertasToCreate;
    const newPercentage = ((newTotal / limite) * 100).toFixed(1);
    console.log(`      ✅ Creadas ${ofertasToCreate} ofertas. Total: ${newTotal}/${limite} (${newPercentage}%)`);
  } else {
    console.log(`      ✅ Ya hay suficientes ofertas: ${currentOfertas}/${limite}`);
  }
}

async function createExtrasForCompany(
  companyId: string,
  companyName: string,
  limite: number,
  targetPercentage: number
) {
  console.log(`   🎯 Creando extras para ${companyName}...`);

  // Contar extras actuales
  const currentExtras = await prisma.extra.count({
    where: { companyId }
  });

  // Calcular target
  const targetCount = Math.floor((limite * targetPercentage) / 100);
  const extrasToCreate = Math.max(0, targetCount - currentExtras);

  console.log(`      📊 Actual: ${currentExtras}, Target: ${targetCount} (${targetPercentage}%)`);

  if (extrasToCreate > 0) {
    console.log(`      ➕ Creando ${extrasToCreate} extras...`);

    const extrasData = [];
    const extraTypes = [
      { name: 'Transport inclòs', price: 15.99 },
      { name: 'Assegurança premium', price: 25.50 },
      { name: 'Servei de neteja', price: 12.00 },
      { name: 'Esmorzar continental', price: 8.75 },
      { name: 'WiFi d\'alta velocitat', price: 5.99 },
      { name: 'Aparcar inclòs', price: 18.00 },
      { name: 'Servei de consergeria', price: 22.50 },
      { name: 'Accés al gimnàs', price: 14.25 }
    ];

    for (let i = 1; i <= extrasToCreate; i++) {
      const extraType = extraTypes[(currentExtras + i - 1) % extraTypes.length];
      extrasData.push({
        name: `${extraType.name} ${currentExtras + i}`,
        description: `Extra de prueba para testing de límites. Permite verificar el funcionamiento del sistema de alertas cuando se aproxima al ${targetPercentage}% del límite de ${limite} extras.`,
        price: extraType.price,
        companyId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Crear en lotes
    await prisma.extra.createMany({
      data: extrasData
    });

    const newTotal = currentExtras + extrasToCreate;
    const newPercentage = ((newTotal / limite) * 100).toFixed(1);
    console.log(`      ✅ Creados ${extrasToCreate} extras. Total: ${newTotal}/${limite} (${newPercentage}%)`);
  } else {
    console.log(`      ✅ Ya hay suficientes extras: ${currentExtras}/${limite}`);
  }
}

async function verifyFinalResults() {
  console.log('📊 VERIFICANDO RESULTADOS FINALES');
  console.log('═══════════════════════════════════');

  const companies = await prisma.company.findMany({
    include: {
      subscription: {
        include: {
          plan: true
        }
      }
    },
    where: {
      email: {
        in: [
          'pionera@test.cat',
          'estandard@test.cat',
          'estrategic@test.cat',
          'enterprise@test.cat'
        ]
      }
    }
  });

  for (const company of companies) {
    if (!company.subscription?.plan) continue;

    const plan = company.subscription.plan;

    // Contar recursos
    const ofertas = await prisma.oferta.count({ where: { companyId: company.id } });
    const extras = await prisma.extra.count({ where: { companyId: company.id } });
    const empleados = await prisma.employee.count({ where: { companyId: company.id } });
    const usuarios = await prisma.user.count({ where: { companyId: company.id } });

    // Calcular porcentajes
    const ofertasPerc = plan.limiteOfertas > 0 ? ((ofertas / plan.limiteOfertas) * 100).toFixed(1) : '0';
    const extrasPerc = plan.limiteExtras > 0 ? ((extras / plan.limiteExtras) * 100).toFixed(1) : '0';
    const empleadosPerc = plan.limiteEmpleados > 0 ? ((empleados / plan.limiteEmpleados) * 100).toFixed(1) : '0';
    const usuariosPerc = plan.limiteUsuaris > 0 ? ((usuarios / plan.limiteUsuaris) * 100).toFixed(1) : '0';

    console.log(`\n🏢 ${company.name} (${plan.tier})`);
    console.log(`   📧 ${company.email}`);
    console.log(`   📈 Ofertas: ${ofertas}/${plan.limiteOfertas} (${ofertasPerc}%)`);
    console.log(`   🎯 Extras: ${extras}/${plan.limiteExtras} (${extrasPerc}%)`);
    console.log(`   👥 Empleados: ${empleados}/${plan.limiteEmpleados} (${empleadosPerc}%)`);
    console.log(`   👤 Usuarios: ${usuarios}/${plan.limiteUsuaris} (${usuariosPerc}%)`);

    // Predecir notificaciones
    let expectedNotifications = [];

    // Trial ending
    if (plan.tier === 'PIONERES') {
      const trialEnd = company.subscription.trialEndsAt;
      if (trialEnd) {
        const daysLeft = Math.ceil((trialEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 30) {
          expectedNotifications.push(`⚠️  Trial ending (${daysLeft} días)`);
        }
      }
    }

    // Límites warnings/errors
    if (parseFloat(ofertasPerc) >= 100) {
      expectedNotifications.push('🚨 ERROR: Límite ofertas excedido');
    } else if (parseFloat(ofertasPerc) >= 80) {
      expectedNotifications.push('⚠️  WARNING: Límite ofertas al ' + ofertasPerc + '%');
    }

    if (parseFloat(extrasPerc) >= 100) {
      expectedNotifications.push('🚨 ERROR: Límite extras excedido');
    } else if (parseFloat(extrasPerc) >= 80) {
      expectedNotifications.push('⚠️  WARNING: Límite extras al ' + extrasPerc + '%');
    }

    if (expectedNotifications.length > 0) {
      console.log(`   🔔 Notificaciones esperadas:`);
      expectedNotifications.forEach(notif => console.log(`      ${notif}`));
    } else {
      console.log(`   ✅ Sin notificaciones esperadas`);
    }
  }
}

async function generateTestingSummary() {
  console.log('\n\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║              📋 RESUMEN TESTING DATA                     ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  console.log('\n🎯 ESCENARIOS CREADOS:');
  console.log('┌─────────────┬──────────────────┬────────────────────────────┐');
  console.log('│ Empresa     │ Plan             │ Escenario                  │');
  console.log('├─────────────┼──────────────────┼────────────────────────────┤');
  console.log('│ PIONERES    │ PIONERES (Trial) │ Trial ending (15 días)     │');
  console.log('│ ESTÀNDARD   │ ESTÀNDARD        │ Ofertas ~85% (warning)     │');
  console.log('│ ESTRATÈGIC  │ ESTRATÈGIC       │ Extras ~90% (warning alto) │');
  console.log('│ ENTERPRISE  │ ENTERPRISE       │ Sin límites (normal)       │');
  console.log('└─────────────┴──────────────────┴────────────────────────────┘');

  console.log('\n📋 PRÓXIMOS PASOS DEL TESTING:');
  console.log('1. Ejecutar: npx tsx create-test-data.ts');
  console.log('2. Reiniciar servidor: npm run dev');
  console.log('3. Testing manual con TESTING-CHECKLIST.md');
  console.log('4. Login con cada empresa y verificar:');
  console.log('   • Badge notificaciones tiene contador > 0');
  console.log('   • Widget sidebar muestra barras amarillas/rojas');
  console.log('   • Panel notificaciones contiene alertas esperadas');
  console.log('   • Flujos de upgrade funcionan correctamente');

  console.log('\n🔑 CREDENCIALES DE PRUEBA:');
  console.log('   pionera@test.cat / Password123!');
  console.log('   estandard@test.cat / Password123!');
  console.log('   estrategic@test.cat / Password123!');
  console.log('   enterprise@test.cat / Password123!');

  console.log('\n📊 URLs DE TESTING:');
  console.log('   🏠 Dashboard: http://localhost:3000/empresa/pla');
  console.log('   📋 Comparador: http://localhost:3000/empresa/plans');
  console.log('   🔔 APIs: Usar test-apis.sh para testing');
}

// Ejecutar script
createTestData()
  .then(() => {
    return generateTestingSummary();
  })
  .then(() => {
    console.log('\n🎉 Proceso completado exitosamente');
    return prisma.$disconnect();
  })
  .catch((error) => {
    console.error('\n❌ Error en el proceso:', error);
    return prisma.$disconnect().then(() => {
      process.exit(1);
    });
  });