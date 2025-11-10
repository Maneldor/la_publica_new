// backend/prisma/seed-plans.ts

import { PrismaClient } from '@prisma/client';
import { PLAN_LIMITS, PlanType } from '../src/config/planLimits';

const prisma = new PrismaClient();

async function seedPlans() {
  console.log('🌱 Seeding plans...');

  // Configuración de planes desde planLimits.ts
  const planesConfig = [
    {
      planType: PlanType.BASIC,
      nombre: 'Pla Bàsic',
      nombreCorto: 'Bàsic',
      descripcion: 'Ideal per a empreses petites que comencen',
      precioMensual: 29,
      precioAnual: 290,
      color: '#6B7280',
      icono: '📦',
      orden: 1,
      limitesJSON: JSON.stringify({
        maxMembers: PLAN_LIMITS[PlanType.BASIC].limits.maxMembers,
        maxStorage: PLAN_LIMITS[PlanType.BASIC].limits.maxStorage.toString(),
        maxDocuments: PLAN_LIMITS[PlanType.BASIC].limits.maxDocuments,
        maxOffers: PLAN_LIMITS[PlanType.BASIC].limits.maxOffers,
      }),
      caracteristicas: JSON.stringify([
        'Perfil bàsic de l\'empresa',
        '1 membre',
        '1 GB d\'emmagatzematge',
        '10 documents',
        '3 ofertes actives',
        'Informes bàsics',
      ]),
    },
    {
      planType: PlanType.STANDARD,
      nombre: 'Pla Estàndard',
      nombreCorto: 'Estàndard',
      descripcion: 'Per a empreses en creixement',
      precioMensual: 79,
      precioAnual: 790,
      color: '#3B82F6',
      icono: '⚡',
      orden: 2,
      limitesJSON: JSON.stringify({
        maxMembers: PLAN_LIMITS[PlanType.STANDARD].limits.maxMembers,
        maxStorage: PLAN_LIMITS[PlanType.STANDARD].limits.maxStorage.toString(),
        maxDocuments: PLAN_LIMITS[PlanType.STANDARD].limits.maxDocuments,
        maxOffers: PLAN_LIMITS[PlanType.STANDARD].limits.maxOffers,
      }),
      caracteristicas: JSON.stringify([
        'Tot el del Pla Bàsic',
        'Fins a 5 membres',
        '5 GB d\'emmagatzematge',
        '50 documents',
        '10 ofertes actives',
        'Informes avançats',
        'Suport prioritari',
      ]),
    },
    {
      planType: PlanType.PREMIUM,
      nombre: 'Pla Premium',
      nombreCorto: 'Premium',
      descripcion: 'Per a empreses consolidades',
      precioMensual: 149,
      precioAnual: 1490,
      color: '#8B5CF6',
      icono: '👑',
      orden: 3,
      destacado: true,
      limitesJSON: JSON.stringify({
        maxMembers: PLAN_LIMITS[PlanType.PREMIUM].limits.maxMembers,
        maxStorage: PLAN_LIMITS[PlanType.PREMIUM].limits.maxStorage.toString(),
        maxDocuments: PLAN_LIMITS[PlanType.PREMIUM].limits.maxDocuments,
        maxOffers: PLAN_LIMITS[PlanType.PREMIUM].limits.maxOffers,
      }),
      caracteristicas: JSON.stringify([
        'Tot el del Pla Estàndard',
        'Fins a 20 membres',
        '20 GB d\'emmagatzematge',
        '200 documents',
        '50 ofertes actives',
        'Accés a l\'API',
        'Branding personalitzat',
        'Permisos avançats',
        'Exportació de dades',
      ]),
    },
    {
      planType: PlanType.EMPRESARIAL,
      nombre: 'Pla Empresarial',
      nombreCorto: 'Empresarial',
      descripcion: 'Solució personalitzada per a grans empreses',
      precioMensual: 299,
      precioAnual: 2990,
      color: '#059669',
      icono: '🏢',
      orden: 4,
      limitesJSON: JSON.stringify({
        maxMembers: PLAN_LIMITS[PlanType.EMPRESARIAL].limits.maxMembers,
        maxStorage: PLAN_LIMITS[PlanType.EMPRESARIAL].limits.maxStorage.toString(),
        maxDocuments: PLAN_LIMITS[PlanType.EMPRESARIAL].limits.maxDocuments,
        maxOffers: PLAN_LIMITS[PlanType.EMPRESARIAL].limits.maxOffers,
      }),
      caracteristicas: JSON.stringify([
        'Tot el del Pla Premium',
        'Membres il·limitats',
        '100 GB d\'emmagatzematge',
        'Documents il·limitats',
        'Ofertes il·limitades',
        'SSO (Single Sign-On)',
        'Integracions personalitzades',
        'Registres d\'auditoria',
        'Gestor de compte dedicat',
      ]),
    },
  ];

  // Crear o actualizar planes
  for (const planConfig of planesConfig) {
    const plan = await prisma.planConfig.upsert({
      where: { planType: planConfig.planType },
      update: planConfig,
      create: {
        ...planConfig,
        activo: true,
        visible: true,
        esSistema: true, // Editables pero no eliminables
      },
    });

    console.log(`✅ Plan creado: ${plan.nombre} (${plan.planType})`);
  }

  console.log('🎉 Seed de planes completado!');
}

seedPlans()
  .catch((e) => {
    console.error('❌ Error en seed de planes:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });