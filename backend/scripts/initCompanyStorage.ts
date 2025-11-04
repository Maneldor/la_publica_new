#!/usr/bin/env npx ts-node

// ============================================================================
// SCRIPT DE INICIALIZACIÓN DE ALMACENAMIENTO DE EMPRESAS
// ============================================================================

import { PrismaClient } from '@prisma/client';
import { PlanType, getPlanLimits } from '../src/config/planLimits';

const prisma = new PrismaClient();

async function initializeCompanyStorage() {
  console.log('🚀 Iniciando inicialización del sistema de límites de planes...\n');

  try {
    // 1. Obtener todas las empresas existentes
    console.log('📊 Obteniendo empresas existentes...');
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        planType: true,
        maxMembers: true,
        maxStorage: true,
        maxDocuments: true,
        maxOffers: true,
        createdAt: true
      }
    });

    console.log(`   Encontradas ${companies.length} empresas\n`);

    if (companies.length === 0) {
      console.log('ℹ️  No hay empresas para procesar. El script ha terminado.');
      return;
    }

    // 2. Actualizar límites de empresas según su plan
    console.log('🔧 Actualizando límites de planes de empresas...');
    let updatedCompanies = 0;

    for (const company of companies) {
      try {
        // Obtener los límites del plan actual (o BASIC por defecto)
        const planType = company.planType as PlanType || PlanType.BASIC;
        const planLimits = getPlanLimits(planType);

        // Actualizar la empresa con los límites correctos
        await prisma.company.update({
          where: { id: company.id },
          data: {
            planType: planType,
            maxMembers: planLimits.limits.maxMembers,
            maxStorage: planLimits.limits.maxStorage,
            maxDocuments: planLimits.limits.maxDocuments,
            maxOffers: planLimits.limits.maxOffers
          }
        });

        console.log(`   ✅ ${company.name} - Plan ${planType}`);
        updatedCompanies++;
      } catch (error) {
        console.error(`   ❌ Error actualizando ${company.name}:`, error);
      }
    }

    console.log(`   Actualizadas ${updatedCompanies}/${companies.length} empresas\n`);

    // 3. Crear registros de suscripción para empresas existentes
    console.log('📝 Creando suscripciones para empresas existentes...');
    let createdSubscriptions = 0;

    for (const company of companies) {
      try {
        // Verificar si ya tiene suscripción
        const existingSubscription = await prisma.subscription.findUnique({
          where: { companyId: company.id }
        });

        if (!existingSubscription) {
          const planType = company.planType as PlanType || PlanType.BASIC;
          const planLimits = getPlanLimits(planType);

          await prisma.subscription.create({
            data: {
              companyId: company.id,
              planType: planType,
              status: 'ACTIVE',
              billingCycle: 'MONTHLY',
              price: planLimits.price.monthly,
              currency: 'EUR',
              maxMembers: planLimits.limits.maxMembers,
              maxStorage: planLimits.limits.maxStorage,
              maxDocuments: planLimits.limits.maxDocuments,
              maxOffers: planLimits.limits.maxOffers,
              hasAdvancedReports: planLimits.features.advancedReports,
              hasPrioritySupport: planLimits.features.prioritySupport,
              hasApiAccess: planLimits.features.apiAccess,
              hasCustomBranding: planLimits.features.customBranding
            }
          });

          console.log(`   ✅ Suscripción creada para ${company.name}`);
          createdSubscriptions++;
        } else {
          console.log(`   ⏭️  ${company.name} ya tiene suscripción`);
        }
      } catch (error) {
        console.error(`   ❌ Error creando suscripción para ${company.name}:`, error);
      }
    }

    console.log(`   Creadas ${createdSubscriptions} nuevas suscripciones\n`);

    // 4. Crear registros de almacenamiento para empresas existentes
    console.log('💾 Inicializando registros de almacenamiento...');
    let createdStorageRecords = 0;

    for (const company of companies) {
      try {
        // Verificar si ya tiene registro de almacenamiento
        const existingStorage = await prisma.companyStorage.findUnique({
          where: { companyId: company.id }
        });

        if (!existingStorage) {
          const planType = company.planType as PlanType || PlanType.BASIC;
          const planLimits = getPlanLimits(planType);

          await prisma.companyStorage.create({
            data: {
              companyId: company.id,
              usedBytes: BigInt(0),
              maxBytes: planLimits.limits.maxStorage,
              documentsCount: 0,
              documentsBytes: BigInt(0),
              imagesBytes: BigInt(0),
              videosBytes: BigInt(0),
              otherBytes: BigInt(0)
            }
          });

          console.log(`   ✅ Almacenamiento inicializado para ${company.name}`);
          createdStorageRecords++;
        } else {
          console.log(`   ⏭️  ${company.name} ya tiene registro de almacenamiento`);
        }
      } catch (error) {
        console.error(`   ❌ Error creando almacenamiento para ${company.name}:`, error);
      }
    }

    console.log(`   Creados ${createdStorageRecords} nuevos registros de almacenamiento\n`);

    // 5. Crear log de cambio de plan inicial
    console.log('📋 Creando logs de cambios de plan...');
    let createdLogs = 0;

    for (const company of companies) {
      try {
        const planType = company.planType as PlanType || PlanType.BASIC;
        const planLimits = getPlanLimits(planType);

        // Verificar si ya tiene logs
        const existingLogs = await prisma.planChangeLog.findFirst({
          where: { companyId: company.id }
        });

        if (!existingLogs) {
          await prisma.planChangeLog.create({
            data: {
              companyId: company.id,
              fromPlan: 'NONE',
              toPlan: planType,
              reason: 'Inicialización del sistema de planes',
              changesApplied: {
                maxMembers: planLimits.limits.maxMembers,
                maxStorage: planLimits.limits.maxStorage.toString(),
                maxDocuments: planLimits.limits.maxDocuments,
                maxOffers: planLimits.limits.maxOffers,
                features: planLimits.features
              },
              requestedById: 'SYSTEM',
              effectiveDate: company.createdAt
            }
          });

          console.log(`   ✅ Log creado para ${company.name}`);
          createdLogs++;
        } else {
          console.log(`   ⏭️  ${company.name} ya tiene logs de cambios`);
        }
      } catch (error) {
        console.error(`   ❌ Error creando log para ${company.name}:`, error);
      }
    }

    console.log(`   Creados ${createdLogs} nuevos logs de cambios\n`);

    // 6. Resumen final
    console.log('📊 RESUMEN DE LA INICIALIZACIÓN:');
    console.log('=====================================');
    console.log(`   Total de empresas procesadas: ${companies.length}`);
    console.log(`   Empresas actualizadas: ${updatedCompanies}`);
    console.log(`   Suscripciones creadas: ${createdSubscriptions}`);
    console.log(`   Registros de almacenamiento creados: ${createdStorageRecords}`);
    console.log(`   Logs de cambios creados: ${createdLogs}\n`);

    // 7. Estadísticas por plan
    console.log('📈 DISTRIBUCIÓN POR PLANES:');
    console.log('============================');

    const planStats = await prisma.subscription.groupBy({
      by: ['planType'],
      _count: {
        planType: true
      }
    });

    for (const stat of planStats) {
      console.log(`   ${stat.planType}: ${stat._count.planType} empresas`);
    }

    console.log('\n✅ Inicialización completada exitosamente!');

  } catch (error) {
    console.error('\n❌ Error durante la inicialización:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Función para calcular el uso actual de almacenamiento (ejemplo)
async function calculateCurrentStorageUsage(companyId: string): Promise<{
  totalBytes: bigint;
  documentsBytes: bigint;
  imagesBytes: bigint;
  videosBytes: bigint;
  otherBytes: bigint;
  documentsCount: number;
}> {
  // En una implementación real, aquí calcularías el uso actual
  // por ahora devolvemos valores por defecto
  return {
    totalBytes: BigInt(0),
    documentsBytes: BigInt(0),
    imagesBytes: BigInt(0),
    videosBytes: BigInt(0),
    otherBytes: BigInt(0),
    documentsCount: 0
  };
}

// Función de utilidad para formatear bytes
function formatBytes(bytes: bigint): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = Number(bytes);
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  initializeCompanyStorage()
    .then(() => {
      console.log('\n🎉 Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error ejecutando el script:', error);
      process.exit(1);
    });
}

export { initializeCompanyStorage };