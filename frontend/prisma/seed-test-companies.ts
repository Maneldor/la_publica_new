// prisma/seed-test-companies.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creando empresas de prueba...');

  // Obtener planes
  const planPioneres = await prisma.planConfig.findFirst({ where: { tier: 'PIONERES' } });
  const planStandard = await prisma.planConfig.findFirst({ where: { tier: 'STANDARD' } });
  const planStrategic = await prisma.planConfig.findFirst({ where: { tier: 'STRATEGIC' } });
  const planEnterprise = await prisma.planConfig.findFirst({ where: { tier: 'ENTERPRISE' } });

  if (!planPioneres || !planStandard || !planStrategic || !planEnterprise) {
    throw new Error('Faltan planes en la BD. Ejecuta: npx prisma db seed');
  }

  const password = await bcrypt.hash('Password123!', 10);

  // Empresa 1: PIONERES (Trial)
  const user1 = await prisma.user.upsert({
    where: { email: 'pionera@test.cat' },
    update: {},
    create: {
      email: 'pionera@test.cat',
      password,
      name: 'Maria Garcia',
      role: 'COMPANY',
      userType: 'COMPANY_OWNER',
      isActive: true
    }
  });

  const company1 = await prisma.company.upsert({
    where: { cif: 'B11111111' },
    update: {},
    create: {
      name: 'Empresa Pionera Test',
      email: 'pionera@test.cat',
      phone: '+34 600 111 111',
      cif: 'B11111111',
      address: 'Carrer Test 1, Barcelona',
      currentPlanId: planPioneres.id,
      status: 'PUBLISHED'
    }
  });

  await prisma.user.update({
    where: { id: user1.id },
    data: { ownedCompanyId: company1.id }
  });

  const now = new Date();
  const sixMonthsLater = new Date();
  sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

  // Eliminar subscripción existente si existe
  await prisma.subscription.deleteMany({
    where: { companyId: company1.id }
  });

  await prisma.subscription.create({
    data: {
      companyId: company1.id,
      planId: planPioneres.id,
      status: 'ACTIVE',
      startDate: now,
      endDate: sixMonthsLater,
      precioMensual: 0,
      precioAnual: 0,
      isAutoRenew: true,
      limites: {
        maxTeamMembers: 10,
        maxActiveOffers: 50,
        maxFeaturedOffers: 10,
        maxStorage: 20
      }
    }
  });

  console.log('✅ Empresa PIONERES creada:', company1.name);

  // Empresa 2: STANDARD
  const user2 = await prisma.user.upsert({
    where: { email: 'estandard@test.cat' },
    update: {},
    create: {
      email: 'estandard@test.cat',
      password,
      name: 'Joan Martinez',
      role: 'COMPANY',
      userType: 'COMPANY_OWNER',
      isActive: true
    }
  });

  const company2 = await prisma.company.upsert({
    where: { cif: 'B22222222' },
    update: {},
    create: {
      name: 'Empresa Estàndard Test',
      email: 'estandard@test.cat',
      phone: '+34 600 222 222',
      cif: 'B22222222',
      address: 'Carrer Test 2, Barcelona',
      currentPlanId: planStandard.id,
      status: 'PUBLISHED'
    }
  });

  await prisma.user.update({
    where: { id: user2.id },
    data: { ownedCompanyId: company2.id }
  });

  const oneYearLater = new Date();
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
  const firstYearPrice = planStandard.basePrice * (1 - planStandard.firstYearDiscount);

  // Eliminar subscripción existente si existe
  await prisma.subscription.deleteMany({
    where: { companyId: company2.id }
  });

  await prisma.subscription.create({
    data: {
      companyId: company2.id,
      planId: planStandard.id,
      status: 'ACTIVE',
      startDate: now,
      endDate: oneYearLater,
      precioMensual: planStandard.precioMensual,
      precioAnual: firstYearPrice,
      isAutoRenew: true,
      limites: {
        maxTeamMembers: 15,
        maxActiveOffers: 100,
        maxFeaturedOffers: 20,
        maxStorage: 50
      }
    }
  });

  console.log('✅ Empresa STANDARD creada:', company2.name);

  // Empresa 3: STRATEGIC
  const user3 = await prisma.user.upsert({
    where: { email: 'estrategic@test.cat' },
    update: {},
    create: {
      email: 'estrategic@test.cat',
      password,
      name: 'Anna Lopez',
      role: 'COMPANY',
      userType: 'COMPANY_OWNER',
      isActive: true
    }
  });

  const company3 = await prisma.company.upsert({
    where: { cif: 'B33333333' },
    update: {},
    create: {
      name: 'Empresa Estratègica Test',
      email: 'estrategic@test.cat',
      phone: '+34 600 333 333',
      cif: 'B33333333',
      address: 'Carrer Test 3, Barcelona',
      currentPlanId: planStrategic.id,
      status: 'PUBLISHED'
    }
  });

  await prisma.user.update({
    where: { id: user3.id },
    data: { ownedCompanyId: company3.id }
  });

  const firstYearPriceStrategic = planStrategic.basePrice * (1 - planStrategic.firstYearDiscount);

  // Eliminar subscripción existente si existe
  await prisma.subscription.deleteMany({
    where: { companyId: company3.id }
  });

  await prisma.subscription.create({
    data: {
      companyId: company3.id,
      planId: planStrategic.id,
      status: 'ACTIVE',
      startDate: now,
      endDate: oneYearLater,
      precioMensual: planStrategic.precioMensual,
      precioAnual: firstYearPriceStrategic,
      isAutoRenew: true,
      limites: {
        maxTeamMembers: 25,
        maxActiveOffers: 200,
        maxFeaturedOffers: 50,
        maxStorage: 100
      }
    }
  });

  console.log('✅ Empresa STRATEGIC creada:', company3.name);

  // Empresa 4: ENTERPRISE
  const user4 = await prisma.user.upsert({
    where: { email: 'enterprise@test.cat' },
    update: {},
    create: {
      email: 'enterprise@test.cat',
      password,
      name: 'Pere Sanchez',
      role: 'COMPANY',
      userType: 'COMPANY_OWNER',
      isActive: true
    }
  });

  const company4 = await prisma.company.upsert({
    where: { cif: 'B44444444' },
    update: {},
    create: {
      name: 'Empresa Enterprise Test',
      email: 'enterprise@test.cat',
      phone: '+34 600 444 444',
      cif: 'B44444444',
      address: 'Carrer Test 4, Barcelona',
      currentPlanId: planEnterprise.id,
      status: 'PUBLISHED'
    }
  });

  await prisma.user.update({
    where: { id: user4.id },
    data: { ownedCompanyId: company4.id }
  });

  const firstYearPriceEnterprise = planEnterprise.basePrice * (1 - planEnterprise.firstYearDiscount);

  // Eliminar subscripción existente si existe
  await prisma.subscription.deleteMany({
    where: { companyId: company4.id }
  });

  await prisma.subscription.create({
    data: {
      companyId: company4.id,
      planId: planEnterprise.id,
      status: 'ACTIVE',
      startDate: now,
      endDate: oneYearLater,
      precioMensual: planEnterprise.precioMensual,
      precioAnual: firstYearPriceEnterprise,
      isAutoRenew: true,
      limites: {
        maxTeamMembers: -1,
        maxActiveOffers: -1,
        maxFeaturedOffers: -1,
        maxStorage: -1
      }
    }
  });

  console.log('✅ Empresa ENTERPRISE creada:', company4.name);

  console.log('\n🎉 ¡4 empresas de prueba creadas exitosamente!');
  console.log('\n📧 CREDENCIALES:');
  console.log('   pionera@test.cat / Password123!');
  console.log('   estandard@test.cat / Password123!');
  console.log('   estrategic@test.cat / Password123!');
  console.log('   enterprise@test.cat / Password123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });