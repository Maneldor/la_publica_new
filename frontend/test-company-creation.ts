import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCompanyCreation() {
  console.log('🧪 Probando creación de empresa con plan PIONERES...\n');

  try {
    // Simular lógica de creación como en el API
    const result = await prisma.$transaction(async (tx) => {
      // 1. Buscar plan PIONERES
      const defaultPlan = await tx.planConfig.findFirst({
        where: {
          OR: [
            { slug: 'empreses-pioneres' },
            { isDefault: true },
            { tier: 'PIONERES' }
          ],
          isActive: true
        }
      });

      if (!defaultPlan) {
        throw new Error('Plan Pioneres no encontrado');
      }

      console.log('📋 Plan encontrado:', defaultPlan.name);
      console.log('🆔 Plan ID:', defaultPlan.id);
      console.log('⏰ Trial días:', defaultPlan.trialDurationDays);
      console.log('💰 Precio base:', defaultPlan.basePrice);

      // 2. Crear usuario de prueba
      const hashedPassword = require('bcryptjs').hash('Password123!', 10);

      const testEmail = `test-empresa-${Date.now()}@lapublica.cat`;

      const newUser = await tx.user.create({
        data: {
          email: testEmail,
          password: await hashedPassword,
          name: 'Test Owner',
          userType: 'COMPANY_OWNER',
          role: 'COMPANY',
          isActive: true,
        }
      });

      console.log('\n👤 Usuario creado:', newUser.email);

      // 3. Crear empresa con plan
      const newCompany = await tx.company.create({
        data: {
          name: 'Empresa Test Pioneres',
          cif: `TEST-${Date.now()}`,
          email: testEmail,
          phone: '+34 600 000 000',
          address: 'Carrer Test, 123, Barcelona',
          status: 'PENDING',
          isActive: true,
          currentPlanId: defaultPlan.id, // Asignar plan PIONERES
          owner: {
            connect: { id: newUser.id }
          }
        }
      });

      console.log('🏢 Empresa creada:', newCompany.name);
      console.log('📋 Plan asignado ID:', newCompany.currentPlanId);

      // 4. Crear subscription con trial
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + (defaultPlan.trialDurationDays || 180));

      const subscription = await tx.subscription.create({
        data: {
          companyId: newCompany.id,
          planId: defaultPlan.id,
          status: 'ACTIVE', // Activa durante trial
          precioMensual: 0, // Gratis durante trial
          precioAnual: defaultPlan.basePrice,
          startDate: new Date(),
          endDate: trialEndDate,
          isAutoRenew: false,
          limites: {
            maxMembers: defaultPlan.maxTeamMembers,
            maxStorage: defaultPlan.maxStorage,
            maxActiveOffers: defaultPlan.maxActiveOffers,
            maxFeaturedOffers: defaultPlan.maxFeaturedOffers
          }
        }
      });

      console.log('📅 Subscription creada:', subscription.status);
      console.log('⏰ Trial hasta:', trialEndDate.toISOString().split('T')[0]);

      // 5. Actualizar usuario con relación
      await tx.user.update({
        where: { id: newUser.id },
        data: { ownedCompanyId: newCompany.id }
      });

      return { user: newUser, company: newCompany, subscription, plan: defaultPlan };
    });

    console.log('\n✅ Creación exitosa!');
    return result;

  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  }
}

// Ejecutar test
testCompanyCreation()
  .then(() => console.log('\n🎉 Test completado'))
  .catch((e) => console.error('\n💥 Test falló:', e))
  .finally(async () => {
    await prisma.$disconnect();
  });