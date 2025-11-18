const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = 'laura.garcia@generalitat.cat';
  const newPassword = 'password123';

  console.log('🔐 Cambiando password...');

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const user = await prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  });

  console.log('\n✅ PASSWORD CAMBIADO CORRECTAMENTE\n');
  console.log('═══════════════════════════════════');
  console.log('Email:    ', email);
  console.log('Password: ', newPassword);
  console.log('═══════════════════════════════════\n');
  console.log('Ahora puedes iniciar sesión en:');
  console.log('http://localhost:3000/auth/signin\n');

  await prisma.$disconnect();
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });