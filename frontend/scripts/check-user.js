const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    console.log('🔍 Verificando usuario: contacte@lapublica.es');

    const user = await prisma.user.findUnique({
      where: { email: 'contacte@lapublica.es' },
      include: {
        ownedCompany: true,
        memberCompany: true
      }
    });

    if (!user) {
      console.log('❌ Usuario NO encontrado');

      // Crear el usuario si no existe
      console.log('📝 Creando usuario...');

      const hashedPassword = await bcrypt.hash('crm123', 10);

      const newUser = await prisma.user.create({
        data: {
          email: 'contacte@lapublica.es',
          name: 'Admin La Pública',
          password: hashedPassword,
          userType: 'ADMIN',
          role: 'ADMIN',
          isActive: true
        }
      });

      console.log('✅ Usuario creado:', newUser);
      return;
    }

    console.log('✅ Usuario encontrado:');
    console.log('  - ID:', user.id);
    console.log('  - Email:', user.email);
    console.log('  - Name:', user.name);
    console.log('  - Role:', user.role);
    console.log('  - UserType:', user.userType);
    console.log('  - isActive:', user.isActive);
    console.log('  - Tiene password:', !!user.password);

    // Verificar la contraseña
    if (user.password) {
      const isValid = await bcrypt.compare('crm123', user.password);
      console.log('  - Password válida para "crm123":', isValid);

      if (!isValid) {
        console.log('🔧 Actualizando contraseña...');
        const hashedPassword = await bcrypt.hash('crm123', 10);

        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword }
        });

        console.log('✅ Contraseña actualizada');
      }
    } else {
      console.log('🔧 Añadiendo contraseña...');
      const hashedPassword = await bcrypt.hash('crm123', 10);

      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });

      console.log('✅ Contraseña añadida');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();