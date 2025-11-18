const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔨 Creando usuario Super Admin visible...\n');

  // Verificar si ya existe super.admin@lapublica.cat
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'super.admin@lapublica.cat' }
  });

  if (existingAdmin) {
    console.log('⚠️  Usuario Super Admin ya existe. Actualizando...');

    const hashedPassword = await bcrypt.hash('superadmin123', 10);

    await prisma.user.update({
      where: { email: 'super.admin@lapublica.cat' },
      data: {
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        name: 'Super Administrador',
        isActive: true
      }
    });

    console.log('✅ Usuario Super Admin actualizado\n');
  } else {
    console.log('🆕 Creando nuevo usuario Super Admin...');

    const hashedPassword = await bcrypt.hash('superadmin123', 10);

    await prisma.user.create({
      data: {
        email: 'super.admin@lapublica.cat',
        name: 'Super Administrador',
        role: 'SUPER_ADMIN',
        password: hashedPassword,
        isActive: true
      }
    });

    console.log('✅ Usuario Super Admin creado\n');
  }

  console.log('═══════════════════════════════════════');
  console.log('👑 NUEVO SUPER ADMIN DISPONIBLE');
  console.log('═══════════════════════════════════════');
  console.log('Email:     super.admin@lapublica.cat');
  console.log('Password:  superadmin123');
  console.log('Nombre:    Super Administrador');
  console.log('Rol:       SUPER_ADMIN');
  console.log('═══════════════════════════════════════\n');

  console.log('🌐 Acceso:');
  console.log('Login:     http://localhost:3000/auth/signin');
  console.log('Admin:     http://localhost:3000/admin\n');

  console.log('📋 Ahora tendrás en la página de login:');
  console.log('• Super Administrador (super.admin@lapublica.cat)');
  console.log('• Laura García (laura.garcia@generalitat.cat)');
  console.log('• Otros usuarios...\n');

  await prisma.$disconnect();
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });