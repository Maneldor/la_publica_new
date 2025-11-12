import { PrismaClient, UserType, CompanyRole, SubscriptionStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // ============================================
  // 1. PLANES DEL SISTEMA (ya existen, verificar)
  // ============================================
  console.log('📦 Verificando planes del sistema...');

  const planBasic = await prisma.planConfig.upsert({
    where: { planType: 'BASIC' },
    update: {},
    create: {
      planType: 'BASIC',
      nombre: 'Pla Bàsic',
      nombreCorto: 'Bàsic',
      descripcion: 'Ideal per a empreses petites que comencen',
      precioMensual: 29,
      precioAnual: 290,
      limitesJSON: JSON.stringify({
        maxUsuarios: 1,
        maxStorage: 5,
        maxDocumentos: 10,
        maxOfertas: 3
      }),
      caracteristicas: JSON.stringify([
        'Perfil bàsic de l\'empresa',
        '1 membre',
        '1 GB d\'emmagatzematge',
        '10 documents',
        '3 ofertes actives'
      ]),
      color: '#8B7355',
      icono: '📦',
      orden: 1,
      destacado: false,
      activo: true,
      visible: true,
      esSistema: true
    }
  });

  const planStandard = await prisma.planConfig.upsert({
    where: { planType: 'STANDARD' },
    update: {},
    create: {
      planType: 'STANDARD',
      nombre: 'Pla Estàndard',
      nombreCorto: 'Estàndard',
      descripcion: 'Per a empreses en creixement',
      precioMensual: 79,
      precioAnual: 790,
      limitesJSON: JSON.stringify({
        maxUsuarios: 5,
        maxStorage: 20,
        maxDocumentos: 50,
        maxOfertas: 10
      }),
      caracteristicas: JSON.stringify([
        'Tot el del Pla Bàsic',
        'Fins a 5 membres',
        '5 GB d\'emmagatzematge',
        '50 documents',
        '10 ofertes actives'
      ]),
      color: '#3B82F6',
      icono: '⚡',
      orden: 2,
      destacado: true,
      activo: true,
      visible: true,
      esSistema: true
    }
  });

  const planPremium = await prisma.planConfig.upsert({
    where: { planType: 'PREMIUM' },
    update: {},
    create: {
      planType: 'PREMIUM',
      nombre: 'Pla Premium',
      nombreCorto: 'Premium',
      descripcion: 'Per a empreses consolidades',
      precioMensual: 149,
      precioAnual: 1490,
      limitesJSON: JSON.stringify({
        maxUsuarios: 20,
        maxStorage: 50,
        maxDocumentos: 200,
        maxOfertas: 50
      }),
      caracteristicas: JSON.stringify([
        'Tot el del Pla Estàndard',
        'Fins a 20 membres',
        '20 GB d\'emmagatzematge',
        '200 documents',
        '50 ofertes actives'
      ]),
      color: '#F59E0B',
      icono: '👑',
      orden: 3,
      destacado: false,
      activo: true,
      visible: true,
      esSistema: true
    }
  });

  const planEmpresarial = await prisma.planConfig.upsert({
    where: { planType: 'EMPRESARIAL' },
    update: {},
    create: {
      planType: 'EMPRESARIAL',
      nombre: 'Pla Empresarial',
      nombreCorto: 'Empresarial',
      descripcion: 'Solució personalitzada per a grans empreses',
      precioMensual: 299,
      precioAnual: 2990,
      limitesJSON: JSON.stringify({
        maxUsuarios: 100,
        maxStorage: 200,
        maxDocumentos: 1000,
        maxOfertas: 200
      }),
      caracteristicas: JSON.stringify([
        'Tot el del Pla Premium',
        'Membres il·limitats',
        '100 GB d\'emmagatzematge',
        'Documents il·limitats',
        'Ofertes il·limitades'
      ]),
      color: '#8B5CF6',
      icono: '🏢',
      orden: 4,
      destacado: false,
      activo: true,
      visible: true,
      esSistema: true
    }
  });

  console.log('✅ Plans verificats/creats');

  // ============================================
  // 2. GESTOR LA PÚBLICA (Account Manager)
  // ============================================
  console.log('👤 Creant Gestor La Pública...');

  const hashedPasswordManager = await bcrypt.hash('gestora123', 10);

  const accountManager = await prisma.user.create({
    data: {
      email: 'maria.garcia@lapublica.cat',
      password: hashedPasswordManager,
      name: 'Maria García',
      userType: UserType.ACCOUNT_MANAGER,
      isActive: true
    }
  });

  console.log('✅ Gestor La Pública creat:', accountManager.email);

  // ============================================
  // 3. EMPRESA DE EJEMPLO
  // ============================================
  console.log('🏢 Creant empresa de prova...');

  const company = await prisma.company.create({
    data: {
      name: 'Empresa de Prova SL',
      cif: 'B12345678',
      email: 'info@empresadeprova.cat',
      phone: '+34 933 123 456',
      address: 'Carrer de la Innovació, 123, Barcelona',
      description: 'Empresa tecnològica especialitzada en solucions digitals per al sector públic',
      website: 'https://empresadeprova.cat',
      isActive: true,
      currentPlanId: planStandard.id,
      accountManagerId: accountManager.id
    }
  });

  console.log('✅ Empresa creada:', company.name);

  // ============================================
  // 4. GESTOR PRINCIPAL DE LA EMPRESA (Owner)
  // ============================================
  console.log('👤 Creant gestor principal...');

  const hashedPasswordOwner = await bcrypt.hash('owner123', 10);

  const companyOwner = await prisma.user.create({
    data: {
      email: 'joan.perez@empresadeprova.cat',
      password: hashedPasswordOwner,
      name: 'Joan Pérez',
      userType: UserType.COMPANY_OWNER,
      ownedCompanyId: company.id,
      companyRole: CompanyRole.OWNER,
      cargo: 'Director de RRHH',
      isActive: true
    }
  });

  console.log('✅ Gestor principal creat:', companyOwner.email);

  // ============================================
  // 5. MIEMBROS DEL EQUIPO
  // ============================================
  console.log('👥 Creant membres de l\'equip...');

  const hashedPasswordMember = await bcrypt.hash('member123', 10);

  const member1 = await prisma.user.create({
    data: {
      email: 'anna.marti@empresadeprova.cat',
      password: hashedPasswordMember,
      name: 'Anna Martí',
      userType: UserType.COMPANY_MEMBER,
      memberCompanyId: company.id,
      companyRole: CompanyRole.MEMBER,
      cargo: 'Responsable de Comunicació',
      isActive: true
    }
  });

  const member2 = await prisma.user.create({
    data: {
      email: 'pere.soler@empresadeprova.cat',
      password: hashedPasswordMember,
      name: 'Pere Soler',
      userType: UserType.COMPANY_MEMBER,
      memberCompanyId: company.id,
      companyRole: CompanyRole.MEMBER,
      cargo: 'Analista de Marketing',
      isActive: true
    }
  });

  console.log('✅ Membres creats:', member1.email, member2.email);

  // ============================================
  // 6. SUSCRIPCIÓN ACTIVA
  // ============================================
  console.log('📋 Creant subscripció activa...');

  const subscription = await prisma.subscription.create({
    data: {
      companyId: company.id,
      planId: planStandard.id,
      status: SubscriptionStatus.ACTIVE,
      precioMensual: planStandard.precioMensual,
      precioAnual: planStandard.precioAnual,
      limites: JSON.parse(planStandard.limitesJSON),
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // +1 año
      isAutoRenew: true
    }
  });

  console.log('✅ Subscripció creada:', subscription.id);

  // ============================================
  // 7. EMPLEADO PÚBLICO DE EJEMPLO
  // ============================================
  console.log('👔 Creant empleat públic...');

  const hashedPasswordEmployee = await bcrypt.hash('empleat123', 10);

  const employee = await prisma.user.create({
    data: {
      email: 'laura.garcia@generalitat.cat',
      password: hashedPasswordEmployee,
      name: 'Laura García',
      userType: UserType.EMPLOYEE,
      cargo: 'Tècnica d\'Administració',
      isActive: true
    }
  });

  console.log('✅ Empleat públic creat:', employee.email);

  // ============================================
  // 8. ADMIN DE LA PLATAFORMA
  // ============================================
  console.log('⚙️ Creant admin de la plataforma...');

  const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@lapublica.cat',
      password: hashedPasswordAdmin,
      name: 'Admin La Pública',
      userType: UserType.ADMIN,
      isActive: true
    }
  });

  console.log('✅ Admin creat:', admin.email);

  // ============================================
  // RESUMEN
  // ============================================
  console.log('\n🎉 Seed completat amb èxit!\n');
  console.log('📊 Resum:');
  console.log('  ✅ 4 Plans del sistema');
  console.log('  ✅ 1 Empresa: Empresa de Prova SL');
  console.log('  ✅ 1 Gestor Principal:', companyOwner.email, '(password: owner123)');
  console.log('  ✅ 2 Membres:', member1.email, member2.email, '(password: member123)');
  console.log('  ✅ 1 Gestor La Pública:', accountManager.email, '(password: gestora123)');
  console.log('  ✅ 1 Subscripció activa (Pla Estàndard)');
  console.log('  ✅ 1 Empleat públic:', employee.email, '(password: empleat123)');
  console.log('  ✅ 1 Admin:', admin.email, '(password: admin123)');
  console.log('\n🔑 Credencials de prova:');
  console.log('  👤 Gestor Principal: joan.perez@empresadeprova.cat / owner123');
  console.log('  👥 Membre: anna.marti@empresadeprova.cat / member123');
  console.log('  🤝 Gestor La Pública: maria.garcia@lapublica.cat / gestora123');
  console.log('  👔 Empleat públic: laura.garcia@generalitat.cat / empleat123');
  console.log('  ⚙️  Admin: admin@lapublica.cat / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error durant el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });