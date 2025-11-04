const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔧 Iniciando creación de usuario Gestor Comercial...');

    const hashedPassword = await bcrypt.hash('gestor123', 10);

    const user = await prisma.user.upsert({
      where: { email: 'gestor@lapublica.es' },
      update: {
        password: hashedPassword,
        primaryRole: 'GESTOR_EMPRESAS',
        isActive: true,
        isEmailVerified: true,
      },
      create: {
        email: 'gestor@lapublica.es',
        password: hashedPassword,
        primaryRole: 'GESTOR_EMPRESAS',
        isActive: true,
        isEmailVerified: true,
      },
    });

    console.log('✅ Usuario Gestor Comercial creado/actualizado exitosamente');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: gestor@lapublica.es');
    console.log('🔑 Password: gestor123');
    console.log('👤 Rol: GESTOR_EMPRESAS');
    console.log('🆔 ID:', user.id);
    console.log('📅 Creado:', user.createdAt);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('🚀 Ahora puedes usar estas credenciales para login:');
    console.log('   Email: gestor@lapublica.es');
    console.log('   Password: gestor123');
    console.log('');
  } catch (error) {
    console.error('❌ Error creando usuario:', error);
    console.log('');
    console.log('💡 Posibles soluciones:');
    console.log('   1. Verificar que la base de datos esté ejecutándose');
    console.log('   2. Ejecutar: npm run db:migrate');
    console.log('   3. Verificar campos requeridos en el schema User');
    console.log('');
  } finally {
    await prisma.$disconnect();
  }
}

main();