const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🏢 Creando usuario empresa de prueba...\n');

  try {
    // 1. Verificar si ya existe el usuario
    const existingUser = await prisma.user.findUnique({
      where: { email: 'empresa.test@lapublica.cat' }
    });

    if (existingUser) {
      console.log('⚠️ El usuario ya existe. Actualizando...');

      // Actualizar el usuario existente
      const hashedPassword = await bcrypt.hash('Test1234!', 10);

      const updatedUser = await prisma.user.update({
        where: { email: 'empresa.test@lapublica.cat' },
        data: {
          password: hashedPassword,
          primaryRole: 'EMPRESA',
          isActive: true,
          isEmailVerified: true
        }
      });

      console.log('✅ Usuario actualizado:', {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.primaryRole
      });

      // Verificar si tiene empresa asignada
      const company = await prisma.company.findUnique({
        where: { userId: updatedUser.id }
      });

      if (!company) {
        // Crear directamente una nueva empresa para este usuario
        const availableCompany = null;

        if (availableCompany) {
          // Asignar la empresa disponible al usuario
          const assignedCompany = await prisma.company.update({
            where: { id: availableCompany.id },
            data: { userId: updatedUser.id }
          });
          console.log('✅ Empresa asignada:', assignedCompany.name);
        } else {
          // Crear una nueva empresa con campos mínimos
          const newCompany = await prisma.company.create({
            data: {
              name: 'Test Company SL',
              cif: `B${Date.now().toString().slice(-8)}`,
              address: 'Carrer Test 123, Barcelona 08001',
              phone: '933000000',
              email: 'info@testcompany.cat',
              website: 'https://testcompany.cat',
              sector: 'Tecnologia',
              size: 'MEDIUM',
              description: 'Empresa de prueba para desarrollo',
              isActive: true,
              userId: updatedUser.id
            }
          });
          console.log('✅ Nueva empresa creada:', newCompany.name);
        }
      } else {
        console.log('✅ Empresa ya asignada:', company.name);
      }

    } else {
      // Crear nuevo usuario
      const hashedPassword = await bcrypt.hash('Test1234!', 10);

      const newUser = await prisma.user.create({
        data: {
          email: 'empresa.test@lapublica.cat',
          password: hashedPassword,
          primaryRole: 'EMPRESA',
          isActive: true,
          isEmailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      console.log('✅ Nuevo usuario creado:', {
        id: newUser.id,
        email: newUser.email,
        role: newUser.primaryRole
      });

      // Crear directamente una nueva empresa para este usuario
      const availableCompany = null;

      if (availableCompany) {
        // Asignar la empresa disponible al usuario
        const assignedCompany = await prisma.company.update({
          where: { id: availableCompany.id },
          data: { userId: newUser.id }
        });
        console.log('✅ Empresa asignada:', assignedCompany.name);
      } else {
        // Crear una nueva empresa con campos mínimos
        const newCompany = await prisma.company.create({
          data: {
            name: 'Test Company SL',
            cif: `B${Date.now().toString().slice(-8)}`,
            address: 'Carrer Test 123, Barcelona 08001',
            phone: '933000000',
            email: 'info@testcompany.cat',
            website: 'https://testcompany.cat',
            sector: 'Tecnologia',
            size: 'MEDIUM',
            description: 'Empresa de prueba para desarrollo',
            isActive: true,
            userId: newUser.id
          }
        });
        console.log('✅ Nueva empresa creada:', newCompany.name);
      }
    }

    console.log('\n✅ USUARIO EMPRESA LISTO PARA USAR:');
    console.log('📧 Email: empresa.test@lapublica.cat');
    console.log('🔑 Password: Test1234!');
    console.log('👤 Role: EMPRESA');
    console.log('\n💡 Usa estas credenciales para hacer login en el sistema');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();