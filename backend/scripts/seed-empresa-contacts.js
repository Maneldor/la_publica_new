const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de personas de contacto para empresas...\n');

  // 1️⃣ OBTENER EMPRESAS EXISTENTES
  console.log('🏢 Obteniendo empresas existentes...');
  const empresas = await prisma.user.findMany({
    where: { primaryRole: 'EMPRESA' },
    include: { company: true }
  });

  if (empresas.length === 0) {
    console.log('❌ No se encontraron empresas. Ejecuta primero seed-messaging-data.js');
    return;
  }

  console.log(`  ✅ Encontradas ${empresas.length} empresas`);

  // 2️⃣ CREAR PERSONAS DE CONTACTO PARA CADA EMPRESA
  console.log('\n👥 Creando personas de contacto...');

  const contactPersonsData = [
    // Personas para Tech Solutions BCN (empresa1)
    [
      { firstName: 'Anna', lastName: 'López', email: 'anna.lopez@techsolutions.com', position: 'Directora General' },
      { firstName: 'Carles', lastName: 'Roca', email: 'carles.roca@techsolutions.com', position: 'CTO' }
    ],
    // Personas para Consultora Estratègica (empresa2)
    [
      { firstName: 'Maria', lastName: 'Puig', email: 'maria.puig@consultora.com', position: 'Socia Directora' },
      { firstName: 'Josep', lastName: 'Vila', email: 'josep.vila@consultora.com', position: 'Consultor Senior' }
    ],
    // Personas para Innovació Digital SL (empresa3)
    [
      { firstName: 'Laura', lastName: 'Mir', email: 'laura.mir@innovacio.com', position: 'CEO' }
    ],
    // Personas para Serveis Professionals (empresa4)
    [
      { firstName: 'David', lastName: 'Serra', email: 'david.serra@serveis.com', position: 'Director' },
      { firstName: 'Núria', lastName: 'Cabrera', email: 'nuria.cabrera@serveis.com', position: 'Responsable Comercial' },
      { firstName: 'Pau', lastName: 'Ferrer', email: 'pau.ferrer@serveis.com', position: 'Coordinador' }
    ]
  ];

  const createdContacts = [];

  for (let i = 0; i < Math.min(empresas.length, contactPersonsData.length); i++) {
    const empresa = empresas[i];
    const contacts = contactPersonsData[i];

    console.log(`\n  👤 ${empresa.company?.name || 'Empresa sin nombre'}:`);

    for (const contactData of contacts) {
      const hashedPassword = await bcrypt.hash('contacto123', 10);

      const contactUser = await prisma.user.upsert({
        where: { email: contactData.email },
        update: {
          password: hashedPassword,
          primaryRole: 'EMPRESA',
          isActive: true,
          isEmailVerified: true,
        },
        create: {
          email: contactData.email,
          password: hashedPassword,
          primaryRole: 'EMPRESA',
          isActive: true,
          isEmailVerified: true,
        }
      });

      // Crear el contacto asociado a la empresa usando los campos existentes
      if (empresa.company?.id) {
        const contact = await prisma.contact.upsert({
          where: {
            id: `contact_${contactData.email}_${empresa.company.id}`
          },
          update: {
            name: `${contactData.firstName} ${contactData.lastName}`,
            position: contactData.position,
            email: contactData.email,
            isPrimary: false
          },
          create: {
            id: `contact_${contactData.email}_${empresa.company.id}`,
            name: `${contactData.firstName} ${contactData.lastName}`,
            email: contactData.email,
            position: contactData.position,
            isPrimary: false,
            companyId: empresa.company.id
          }
        });

        createdContacts.push({ user: contactUser, contact, empresa });
        console.log(`    ✅ ${contactData.firstName} ${contactData.lastName} - ${contactData.position}`);
      } else {
        console.log(`    ❌ Empresa sin ID válido, saltando contacto`);
      }
    }
  }

  // 3️⃣ OBTENER GESTORES EXISTENTES
  console.log('\n👥 Obteniendo gestores...');
  const gestores = await prisma.user.findMany({
    where: { primaryRole: 'GESTOR_EMPRESAS' },
    include: { employee: true }
  });

  console.log(`  ✅ Encontrados ${gestores.length} gestores`);

  // 4️⃣ CREAR CONVERSACIONES ADICIONALES PARA EMPRESAS
  console.log('\n💬 Creando conversaciones para sistema de empresas...');

  // Conversación: Persona de contacto 1 (Anna López) ↔ Su gestor asignado
  const techSolutionsGestor = gestores.find(g =>
    empresas[0].company?.accountManagerId === g.id
  );

  if (techSolutionsGestor && createdContacts[0]) {
    const conv1 = await prisma.conversation.create({
      data: {
        type: 'INDIVIDUAL',
        isGroup: false,
        createdById: techSolutionsGestor.id,
        lastMessageAt: new Date(),
        participants: {
          create: [
            { userId: techSolutionsGestor.id, role: 'ADMIN' },
            { userId: createdContacts[0].user.id, role: 'MEMBER' },
          ]
        },
        messages: {
          create: [
            {
              senderId: techSolutionsGestor.id,
              content: 'Hola Anna! Soc el vostre gestor comercial assignat. Com va tot?',
              type: 'TEXT',
              status: 'READ',
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // Hace 3 horas
            },
            {
              senderId: createdContacts[0].user.id,
              content: 'Hola! Tot perfecte. Tenim algunes preguntes sobre els nous serveis.',
              type: 'TEXT',
              status: 'READ',
              createdAt: new Date(Date.now() - 1000 * 60 * 120), // Hace 2 horas
            },
            {
              senderId: techSolutionsGestor.id,
              content: 'Perfecte! Us puc programar una reunió per aquesta setmana per revisar-ho?',
              type: 'TEXT',
              status: 'DELIVERED',
              createdAt: new Date(Date.now() - 1000 * 60 * 15), // Hace 15 min
            },
          ]
        }
      }
    });
    console.log('  ✅ Conversación: Anna López ↔ Gestor comercial (3 mensajes)');
  }

  // Conversación interna: Anna López ↔ Carles Roca (mismo equipo)
  if (createdContacts[0] && createdContacts[1]) {
    const conv2 = await prisma.conversation.create({
      data: {
        type: 'INDIVIDUAL',
        isGroup: false,
        createdById: createdContacts[0].user.id,
        lastMessageAt: new Date(),
        participants: {
          create: [
            { userId: createdContacts[0].user.id, role: 'ADMIN' },
            { userId: createdContacts[1].user.id, role: 'MEMBER' },
          ]
        },
        messages: {
          create: [
            {
              senderId: createdContacts[0].user.id,
              content: 'Carles, hem de revisar la proposta del gestor abans de la reunió.',
              type: 'TEXT',
              status: 'READ',
              createdAt: new Date(Date.now() - 1000 * 60 * 60), // Hace 1 hora
            },
            {
              senderId: createdContacts[1].user.id,
              content: 'D\'acord Anna. He revisat els documents i sembla tot correcte.',
              type: 'TEXT',
              status: 'READ',
              createdAt: new Date(Date.now() - 1000 * 60 * 30), // Hace 30 min
            },
          ]
        }
      }
    });
    console.log('  ✅ Conversación interna: Anna López ↔ Carles Roca (2 mensajes)');
  }

  // Conversación: Maria Puig ↔ Su gestor
  const consultoraGestor = gestores.find(g =>
    empresas[1].company?.accountManagerId === g.id
  );

  if (consultoraGestor && createdContacts[2]) {
    const conv3 = await prisma.conversation.create({
      data: {
        type: 'INDIVIDUAL',
        isGroup: false,
        createdById: createdContacts[2].user.id,
        lastMessageAt: new Date(),
        participants: {
          create: [
            { userId: consultoraGestor.id, role: 'MEMBER' },
            { userId: createdContacts[2].user.id, role: 'ADMIN' },
          ]
        },
        messages: {
          create: [
            {
              senderId: createdContacts[2].user.id,
              content: 'Bon dia! Necessitem informació sobre les noves funcionalitats.',
              type: 'TEXT',
              status: 'SENT',
              createdAt: new Date(Date.now() - 1000 * 60 * 10), // Hace 10 min
            },
          ]
        }
      }
    });
    console.log('  ✅ Conversación: Maria Puig ↔ Gestor comercial (1 mensaje)');
  }

  // 5️⃣ CONFIGURAR CONTADORES DE NO LEÍDOS
  console.log('\n🔢 Configurando contadores de mensajes no leídos...');

  // Marcar algunos mensajes como no leídos para las personas de contacto
  if (createdContacts[0]) {
    await prisma.conversationParticipant.updateMany({
      where: {
        userId: createdContacts[0].user.id
      },
      data: {
        unreadCount: 1,
        lastReadAt: new Date(Date.now() - 1000 * 60 * 20)
      }
    });
  }

  if (createdContacts[2]) {
    await prisma.conversationParticipant.updateMany({
      where: {
        userId: createdContacts[2].user.id
      },
      data: {
        unreadCount: 1,
        lastReadAt: new Date(Date.now() - 1000 * 60 * 15)
      }
    });
  }

  // 6️⃣ RESUMEN FINAL
  console.log('\n✅ SEED DE PERSONAS DE CONTACTO COMPLETADO\n');
  console.log('═══════════════════════════════════════════');
  console.log('📊 DATOS CREADOS:');
  console.log('═══════════════════════════════════════════');
  console.log(`👥 Personas de contacto: ${createdContacts.length}`);
  console.log(`💬 Conversaciones adicionales: 3`);
  console.log(`📨 Mensajes adicionales: 6`);
  console.log('═══════════════════════════════════════════\n');

  console.log('🔑 CREDENCIALES DE PERSONAS DE CONTACTO:\n');
  console.log('📌 TECH SOLUTIONS BCN:');
  console.log('   anna.lopez@techsolutions.com / contacto123');
  console.log('   carles.roca@techsolutions.com / contacto123');
  console.log('\n📌 CONSULTORA ESTRATÈGICA:');
  console.log('   maria.puig@consultora.com / contacto123');
  console.log('   josep.vila@consultora.com / contacto123');
  console.log('\n📌 INNOVACIÓ DIGITAL SL:');
  console.log('   laura.mir@innovacio.com / contacto123');
  console.log('\n📌 SERVEIS PROFESSIONALS:');
  console.log('   david.serra@serveis.com / contacto123');
  console.log('   nuria.cabrera@serveis.com / contacto123');
  console.log('   pau.ferrer@serveis.com / contacto123');
  console.log('\n📋 TIPOS DE CONVERSACIONES DISPONIBLES:');
  console.log('   ✓ Gestores ↔ Personas de contacto');
  console.log('   ✓ Personas de contacto ↔ Entre sí (mismo equipo)');
  console.log('   ✓ Diferentes estados de mensajes');
  console.log('   ✓ Contadores de no leídos configurados');
  console.log('\n═══════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed de personas de contacto:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });