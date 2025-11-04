const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de datos de mensajería...\n');

  // 1️⃣ CREAR 3 GESTORES DE EMPRESA
  console.log('👥 Creando Gestores de Empresa...');

  const gestores = [];
  const gestoresData = [
    { email: 'gestor1@lapublica.es', firstName: 'Marc', lastName: 'García', password: 'gestor123' },
    { email: 'gestor2@lapublica.es', firstName: 'Laura', lastName: 'Martínez', password: 'gestor123' },
    { email: 'gestor3@lapublica.es', firstName: 'Joan', lastName: 'Sánchez', password: 'gestor123' },
  ];

  for (const data of gestoresData) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const gestor = await prisma.user.upsert({
      where: { email: data.email },
      update: {
        password: hashedPassword,
        primaryRole: 'GESTOR_EMPRESAS',
        isActive: true,
        isEmailVerified: true,
      },
      create: {
        email: data.email,
        password: hashedPassword,
        primaryRole: 'GESTOR_EMPRESAS',
        isActive: true,
        isEmailVerified: true,
        employee: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            jobTitle: 'Gestor Comercial',
            department: 'Ventas',
            community: 'Catalunya',
            administrationType: 'AUTONOMICA',
          }
        }
      },
      include: { employee: true }
    });

    gestores.push(gestor);
    console.log(`  ✅ ${gestor.email} - ${data.firstName} ${data.lastName}`);
  }

  // 2️⃣ CREAR 10 EMPRESAS FICTICIAS
  console.log('\n🏢 Creando Empresas...');

  const empresas = [];
  const empresasData = [
    { name: 'Tech Solutions BCN', cif: 'B12345678', sector: 'Tecnología' },
    { name: 'Consultora Estratègica', cif: 'B23456789', sector: 'Consultoría' },
    { name: 'Innovació Digital SL', cif: 'B34567890', sector: 'Marketing' },
    { name: 'Serveis Professionals', cif: 'B45678901', sector: 'Servicios' },
    { name: 'Logística Catalunya', cif: 'B56789012', sector: 'Logística' },
    { name: 'Formació Empresarial', cif: 'B67890123', sector: 'Educación' },
    { name: 'Assessoria Fiscal SCP', cif: 'B78901234', sector: 'Asesoría' },
    { name: 'Arquitectura Moderna', cif: 'B89012345', sector: 'Arquitectura' },
    { name: 'Enginyeria Avançada', cif: 'B90123456', sector: 'Ingeniería' },
    { name: 'Comunicació 360', cif: 'B01234567', sector: 'Comunicación' },
  ];

  for (let i = 0; i < empresasData.length; i++) {
    const data = empresasData[i];
    const hashedPassword = await bcrypt.hash('empresa123', 10);

    // Asignar gestor de forma rotativa
    const assignedGestor = gestores[i % gestores.length];

    const userEmail = `empresa${i + 1}@lapublica.es`;

    const empresa = await prisma.user.upsert({
      where: { email: userEmail },
      update: {
        password: hashedPassword,
        primaryRole: 'EMPRESA',
        isActive: true,
        isEmailVerified: true,
      },
      create: {
        email: userEmail,
        password: hashedPassword,
        primaryRole: 'EMPRESA',
        isActive: true,
        isEmailVerified: true,
        company: {
          create: {
            name: data.name,
            cif: data.cif,
            sector: data.sector,
            address: `Carrer Exemple ${i + 1}, Barcelona`,
            phone: `93${Math.floor(1000000 + Math.random() * 9000000)}`,
            website: `https://${data.name.toLowerCase().replace(/\s/g, '')}.com`,
            employeeCount: Math.floor(10 + Math.random() * 90),
            foundedYear: 2000 + Math.floor(Math.random() * 24),
            accountManagerId: assignedGestor.id,  // ✅ Asignar gestor
            email: userEmail,
          }
        }
      },
      include: { company: true }
    });

    empresas.push(empresa);
    console.log(`  ✅ ${empresa.company.name} → Gestor: ${assignedGestor.employee.firstName} ${assignedGestor.employee.lastName}`);
  }

  // 3️⃣ CREAR CONVERSACIONES DE EJEMPLO
  console.log('\n💬 Creando Conversaciones...');

  // Conversación: Gestor 1 ↔ Empresa 1
  const conv1 = await prisma.conversation.create({
    data: {
      type: 'INDIVIDUAL',
      isGroup: false,
      createdById: gestores[0].id,
      lastMessageAt: new Date(),
      participants: {
        create: [
          { userId: gestores[0].id, role: 'ADMIN' },
          { userId: empresas[0].id, role: 'MEMBER' },
        ]
      },
      messages: {
        create: [
          {
            senderId: gestores[0].id,
            content: 'Hola! Soc el teu gestor comercial. Com et puc ajudar?',
            type: 'TEXT',
            status: 'READ',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // Hace 2 horas
          },
          {
            senderId: empresas[0].id,
            content: 'Hola! Necessito informació sobre els serveis disponibles.',
            type: 'TEXT',
            status: 'READ',
            createdAt: new Date(Date.now() - 1000 * 60 * 30), // Hace 30 min
          },
          {
            senderId: gestores[0].id,
            content: 'Perfecte! Et puc enviar la documentació completa. Tens alguna necessitat específica?',
            type: 'TEXT',
            status: 'SENT',
            createdAt: new Date(Date.now() - 1000 * 60 * 5), // Hace 5 min
          },
        ]
      }
    }
  });
  console.log('  ✅ Conversación: Gestor 1 ↔ Empresa 1 (3 mensajes)');

  // Conversación: Gestor 1 ↔ Gestor 2
  const conv2 = await prisma.conversation.create({
    data: {
      type: 'INDIVIDUAL',
      isGroup: false,
      createdById: gestores[0].id,
      lastMessageAt: new Date(),
      participants: {
        create: [
          { userId: gestores[0].id, role: 'ADMIN' },
          { userId: gestores[1].id, role: 'MEMBER' },
        ]
      },
      messages: {
        create: [
          {
            senderId: gestores[0].id,
            content: 'Hola Laura, necessito el teu suport amb un client.',
            type: 'TEXT',
            status: 'READ',
            createdAt: new Date(Date.now() - 1000 * 60 * 45),
          },
          {
            senderId: gestores[1].id,
            content: 'Clar! Explica\'m, en què et puc ajudar?',
            type: 'TEXT',
            status: 'READ',
            createdAt: new Date(Date.now() - 1000 * 60 * 20),
          },
        ]
      }
    }
  });
  console.log('  ✅ Conversación: Gestor 1 ↔ Gestor 2 (2 mensajes)');

  // Conversación: Gestor 2 ↔ Empresa 4
  const conv3 = await prisma.conversation.create({
    data: {
      type: 'INDIVIDUAL',
      isGroup: false,
      createdById: gestores[1].id,
      lastMessageAt: new Date(),
      participants: {
        create: [
          { userId: gestores[1].id, role: 'ADMIN' },
          { userId: empresas[3].id, role: 'MEMBER' },
        ]
      },
      messages: {
        create: [
          {
            senderId: gestores[1].id,
            content: 'Bon dia! Volia fer-te un seguiment del servei.',
            type: 'TEXT',
            status: 'DELIVERED',
            createdAt: new Date(Date.now() - 1000 * 60 * 10),
          },
        ]
      }
    }
  });
  console.log('  ✅ Conversación: Gestor 2 ↔ Empresa 4 (1 mensaje)');

  // 4️⃣ ACTUALIZAR CONTADORES DE MENSAJES NO LEÍDOS
  console.log('\n🔢 Actualizando contadores...');

  // Marcar algunos mensajes como no leídos para testing
  await prisma.conversationParticipant.updateMany({
    where: {
      conversationId: conv1.id,
      userId: empresas[0].id
    },
    data: {
      unreadCount: 1,
      lastReadAt: new Date(Date.now() - 1000 * 60 * 10)
    }
  });

  await prisma.conversationParticipant.updateMany({
    where: {
      conversationId: conv3.id,
      userId: empresas[3].id
    },
    data: {
      unreadCount: 1,
      lastReadAt: new Date(Date.now() - 1000 * 60 * 15)
    }
  });

  // 5️⃣ RESUMEN
  console.log('\n✅ SEED COMPLETADO\n');
  console.log('═══════════════════════════════════════════');
  console.log('📊 DATOS CREADOS:');
  console.log('═══════════════════════════════════════════');
  console.log(`👥 Gestores: ${gestores.length}`);
  console.log(`🏢 Empresas: ${empresas.length}`);
  console.log(`💬 Conversaciones: 3`);
  console.log(`📨 Mensajes totales: 6`);
  console.log('═══════════════════════════════════════════\n');

  console.log('🔑 CREDENCIALES DE ACCESO:\n');
  console.log('📌 GESTORES:');
  gestores.forEach((g, i) => {
    console.log(`   ${i + 1}. ${g.email} / gestor123`);
  });
  console.log('\n📌 EMPRESAS:');
  console.log('   empresa1@lapublica.es / empresa123');
  console.log('   empresa2@lapublica.es / empresa123');
  console.log('   ... (hasta empresa10@lapublica.es)');
  console.log('\n📌 ASIGNACIONES:');
  console.log('   • Marc García → Empresas 1, 4, 7, 10');
  console.log('   • Laura Martínez → Empresas 2, 5, 8');
  console.log('   • Joan Sánchez → Empresas 3, 6, 9');
  console.log('\n═══════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });