// scripts/seed-test-users.ts
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔐 Creant/Actualitzant usuaris de prova...\n')

  const testUsers = [
    {
      email: 'super.admin@lapublica.cat',
      name: 'Manel (Super Admin)',
      password: 'superadmin123',
      role: 'SUPER_ADMIN',
      userType: 'ADMIN',
    },
    {
      email: 'admin@lapublica.cat',
      name: 'Administrador',
      password: 'admin123',
      role: 'ADMIN',
      userType: 'ADMIN',
    },
    {
      email: 'crm@gestio.com',
      name: 'Gestió d\'Empreses',
      password: 'crm123456',
      role: 'CRM_COMERCIAL',
      userType: 'ACCOUNT_MANAGER',
    },
    {
      email: 'joan.perez@empresadeprova.cat',
      name: 'Joan Pérez - Gestor Principal',
      password: 'owner123',
      role: 'COMPANY',
      userType: 'COMPANY_OWNER',
    },
    {
      email: 'anna.marti@empresadeprova.cat',
      name: 'Anna Martí - Miembro',
      password: 'member123',
      role: 'COMPANY',
      userType: 'COMPANY_MEMBER',
    },
    {
      email: 'laura.garcia@generalitat.cat',
      name: 'Laura García - Empleada',
      password: 'empleat123',
      role: 'USER',
      userType: 'EMPLOYEE',
    },
    {
      email: 'contingut@lapublica.cat',
      name: 'CRM Contingut',
      password: 'contingut123',
      role: 'CRM_CONTINGUT',
      userType: 'ACCOUNT_MANAGER',
    },
  ]

  for (const userData of testUsers) {
    console.log(`🔄 Procesando ${userData.email}...`)

    // Hashear password
    const hashedPassword = await bcrypt.hash(userData.password, 10)

    try {
      // Upsert (crear o actualizar)
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {
          name: userData.name,
          password: hashedPassword,
          role: userData.role as any,
          userType: userData.userType as any,
          isActive: true,
        },
        create: {
          email: userData.email,
          name: userData.name,
          password: hashedPassword,
          role: userData.role as any,
          userType: userData.userType as any,
          isActive: true,
          isEmailVerified: true, // Marcar como verificado
        },
      })

      console.log(`✅ ${user.name} (${user.email}) - ${user.role}`)
    } catch (error) {
      console.error(`❌ Error creando ${userData.email}:`, error)
    }
  }

  console.log('\n🎉 Usuaris de prova creats/actualitzats!')
  console.log('\nCredencials per login ràpid:')
  console.log('─'.repeat(60))
  testUsers.forEach((u) => {
    console.log(`  ${u.email.padEnd(35)} / ${u.password}`)
  })

  // Verificar que los usuarios se crearon correctamente
  console.log('\n🔍 Verificant usuaris creats:')
  for (const userData of testUsers) {
    const user = await prisma.user.findUnique({
      where: { email: userData.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        userType: true,
        isActive: true,
        password: true
      }
    })

    if (user) {
      console.log(`✅ ${userData.email} - Role: ${user.role} - Active: ${user.isActive} - HasPassword: ${!!user.password}`)
    } else {
      console.log(`❌ ${userData.email} - NO ENCONTRADO`)
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })