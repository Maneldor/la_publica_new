const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando usuarios con rol EMPRESA...\n');

  try {
    const empresaUsers = await prisma.user.findMany({
      where: { primaryRole: 'EMPRESA' },
      select: {
        id: true,
        email: true,
        primaryRole: true,
        isActive: true,
        company: {
          select: {
            id: true,
            name: true,
            isActive: true
          }
        }
      }
    });

    console.log(`📊 Total usuarios EMPRESA encontrados: ${empresaUsers.length}\n`);

    if (empresaUsers.length === 0) {
      console.log('❌ No se encontraron usuarios con rol EMPRESA');
      console.log('💡 Ejecuta seed-messaging-data.js y seed-empresa-contacts.js para crearlos');
      return;
    }

    empresaUsers.forEach((user, index) => {
      console.log(`${index + 1}. 👤 ${user.email}`);
      console.log(`   🔑 ID: ${user.id}`);
      console.log(`   👤 Role: ${user.primaryRole}`);
      console.log(`   ✅ Active: ${user.isActive}`);
      console.log(`   🏢 Company: ${user.company ? user.company.name : 'No asignada'}`);
      console.log(`   🏢 Company Active: ${user.company ? user.company.isActive : 'N/A'}`);
      console.log('');
    });

    console.log('🔑 Credenciales para testing:');
    empresaUsers.forEach(user => {
      console.log(`   📧 ${user.email} / empresa123`);
    });

  } catch (error) {
    console.error('❌ Error consultando usuarios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();