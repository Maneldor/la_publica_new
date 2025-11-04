const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando usuario empresa1@lapublica.es...\n');

  try {
    const user = await prisma.user.findUnique({
      where: { email: 'empresa1@lapublica.es' },
      include: {
        company: true
      }
    });

    if (!user) {
      console.log('❌ Usuario NO encontrado');
      return;
    }

    console.log('✅ Usuario encontrado:');
    console.log('📧 Email:', user.email);
    console.log('🔑 ID:', user.id);
    console.log('👤 Role:', user.primaryRole);
    console.log('✅ Active:', user.isActive);
    console.log('📧 Email Verified:', user.isEmailVerified);
    console.log('🏢 Company:', user.company ? user.company.name : 'No asignada');

    // Verificar password
    const testPassword = 'empresa123';
    const isPasswordValid = await bcrypt.compare(testPassword, user.password);
    console.log('🔐 Password válida:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('\n🔧 Actualizando password...');
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });
      console.log('✅ Password actualizada correctamente');
    }

    // Verificar que esté activo
    if (!user.isActive || !user.isEmailVerified) {
      console.log('\n🔧 Activando usuario...');
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isActive: true,
          isEmailVerified: true
        }
      });
      console.log('✅ Usuario activado correctamente');
    }

    console.log('\n✅ USUARIO LISTO PARA USAR:');
    console.log('📧 Email: empresa1@lapublica.es');
    console.log('🔑 Password: empresa123');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();