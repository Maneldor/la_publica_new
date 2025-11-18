const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Buscando usuarios SUPER_ADMIN...\n');

  // Buscar usuarios SUPER_ADMIN existentes
  const superAdmins = await prisma.user.findMany({
    where: { role: 'SUPER_ADMIN' },
    select: { id: true, email: true, name: true, role: true }
  });

  if (superAdmins.length > 0) {
    console.log('✅ SUPER_ADMIN encontrados:\n');
    superAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. Email: ${admin.email}`);
      console.log(`   Nombre: ${admin.name}`);
      console.log(`   ID: ${admin.id}\n`);
    });

    // Establecer contraseña fácil para el primer SUPER_ADMIN
    const firstAdmin = superAdmins[0];
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: firstAdmin.id },
      data: { password: hashedPassword }
    });

    console.log('🔐 ACCESO RÁPIDO CONFIGURADO:\n');
    console.log('═══════════════════════════════════════');
    console.log(`Email:     ${firstAdmin.email}`);
    console.log(`Password:  ${newPassword}`);
    console.log('Rol:       SUPER_ADMIN');
    console.log('═══════════════════════════════════════\n');
    console.log('🌐 Links de acceso:');
    console.log('Login:     http://localhost:3000/auth/signin');
    console.log('Dashboard: http://localhost:3000/dashboard');
    console.log('Admin:     http://localhost:3000/admin\n');

  } else {
    // No hay SUPER_ADMIN, crear uno
    console.log('❌ No se encontraron usuarios SUPER_ADMIN');
    console.log('🔨 Creando SUPER_ADMIN de emergencia...\n');

    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const newAdmin = await prisma.user.create({
      data: {
        email: 'admin@lapublica.cat',
        name: 'Super Administrador',
        role: 'SUPER_ADMIN',
        password: hashedPassword,
        isActive: true,
        emailVerified: new Date()
      }
    });

    console.log('✅ SUPER_ADMIN CREADO:\n');
    console.log('═══════════════════════════════════════');
    console.log(`Email:     ${newAdmin.email}`);
    console.log(`Password:  ${adminPassword}`);
    console.log('Rol:       SUPER_ADMIN');
    console.log('═══════════════════════════════════════\n');
    console.log('🌐 Links de acceso:');
    console.log('Login:     http://localhost:3000/auth/signin');
    console.log('Dashboard: http://localhost:3000/dashboard');
    console.log('Admin:     http://localhost:3000/admin\n');
  }

  await prisma.$disconnect();
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });