const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando usuarios en la base de datos...\n');

  // 1. Verificar usuarios gestores
  console.log('👥 GESTORES:');
  const gestores = await prisma.user.findMany({
    where: {
      primaryRole: 'GESTOR_EMPRESAS'
    },
    select: {
      id: true,
      email: true,
      primaryRole: true,
      isActive: true,
      isEmailVerified: true,
      password: true,
      employee: {
        select: {
          firstName: true,
          lastName: true
        }
      }
    }
  });

  gestores.forEach((user, i) => {
    console.log(`  ${i + 1}. ${user.email}`);
    console.log(`     Rol: ${user.primaryRole}`);
    console.log(`     Activo: ${user.isActive}`);
    console.log(`     Email verificado: ${user.isEmailVerified}`);
    console.log(`     Tiene password: ${user.password ? 'SÍ' : 'NO'}`);
    console.log(`     Password hash: ${user.password ? user.password.substring(0, 20) + '...' : 'N/A'}`);
    if (user.employee) {
      console.log(`     Nombre: ${user.employee.firstName} ${user.employee.lastName}`);
    }
    console.log('');
  });

  // 2. Verificar que el password es correcto
  const gestor1 = gestores.find(g => g.email === 'gestor1@lapublica.es');
  if (gestor1) {
    console.log('🔑 VERIFICACIÓN DE PASSWORD gestor1@lapublica.es:');
    try {
      const isValid = await bcrypt.compare('gestor123', gestor1.password);
      console.log(`   Password 'gestor123' es válido: ${isValid ? '✅ SÍ' : '❌ NO'}`);

      // Probar algunos passwords incorrectos para verificar que bcrypt funciona
      const isWrong = await bcrypt.compare('wrong123', gestor1.password);
      console.log(`   Password 'wrong123' es válido: ${isWrong ? '❌ SÍ (ERROR!)' : '✅ NO (correcto)'}`);
    } catch (error) {
      console.log(`   ❌ Error verificando password: ${error.message}`);
    }
    console.log('');
  }

  // 3. Verificar usuarios existentes anteriores
  console.log('👤 OTROS USUARIOS:');
  const otherUsers = await prisma.user.findMany({
    where: {
      OR: [
        { email: 'admin@lapublica.com' },
        { email: 'superadmin@lapublica.com' },
        { email: 'gestor@lapublica.es' }
      ]
    },
    select: {
      email: true,
      primaryRole: true,
      isActive: true,
      password: true
    }
  });

  if (otherUsers.length > 0) {
    otherUsers.forEach(user => {
      console.log(`   ${user.email} - ${user.primaryRole} - Activo: ${user.isActive} - Password: ${user.password ? 'SÍ' : 'NO'}`);
    });
  } else {
    console.log('   No se encontraron usuarios admin/superadmin/gestor anteriores');
  }
  console.log('');

  // 4. Contar total de usuarios
  const totalUsers = await prisma.user.count();
  const totalEmpresas = await prisma.user.count({
    where: { primaryRole: 'EMPRESA' }
  });

  console.log('📊 RESUMEN:');
  console.log(`   Total usuarios: ${totalUsers}`);
  console.log(`   Gestores: ${gestores.length}`);
  console.log(`   Empresas: ${totalEmpresas}`);
  console.log('');

  // 5. Verificar conversaciones
  const conversations = await prisma.conversation.count();
  const messages = await prisma.message.count();

  console.log('💬 MENSAJERÍA:');
  console.log(`   Conversaciones: ${conversations}`);
  console.log(`   Mensajes: ${messages}`);
  console.log('');

  console.log('🎯 PARA DEBUGGEAR LOGIN:');
  console.log('   1. Abre http://localhost:5555 (Prisma Studio)');
  console.log('   2. Ve a la tabla "User" y verifica gestor1@lapublica.es');
  console.log('   3. Intenta login y mira logs del backend');
  console.log('   4. Verifica que NextAuth usa bcrypt.compare()');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });