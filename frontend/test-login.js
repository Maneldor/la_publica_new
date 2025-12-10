const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testUserLogin() {
  try {
    console.log('🔍 Buscando usuario g-estandar@lapublica.cat...');

    const user = await prisma.user.findUnique({
      where: { email: 'g-estandar@lapublica.cat' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        password: true,
        userType: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    console.log('✅ Usuario encontrado:');
    console.log('  - ID:', user.id);
    console.log('  - Name:', user.name);
    console.log('  - Email:', user.email);
    console.log('  - Role:', user.role);
    console.log('  - IsActive:', user.isActive);
    console.log('  - UserType:', user.userType);
    console.log('  - HasPassword:', !!user.password);

    if (!user.password) {
      console.log('❌ Usuario sin contraseña');
      return;
    }

    console.log('🔍 Probando contraseña "gestor123"...');
    const isValidPassword = await bcrypt.compare('gestor123', user.password);

    console.log('✅ Password válido:', isValidPassword);

    if (isValidPassword) {
      console.log('✅ ¡Usuario válido para login!');
    } else {
      console.log('❌ Password incorrecto');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserLogin();