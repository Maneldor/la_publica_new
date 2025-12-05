import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Usuaris que volem mantenir/crear
const USERS_TO_KEEP = [
  {
    email: 'super.admin@lapublica.cat',
    name: 'Manel',
    role: 'SUPER_ADMIN',
    password: 'superadmin123',
    userType: 'ADMIN'
  },
  {
    email: 'admin@lapublica.cat',
    name: 'Administrador',
    role: 'ADMIN',
    password: 'admin123',
    userType: 'ADMIN'
  },
  {
    email: 'crm@gestio.com',
    name: 'Gestió d\'Empreses',
    role: 'CRM_COMERCIAL',
    password: 'crm123456',
    userType: 'ACCOUNT_MANAGER'
  },
  {
    email: 'g-estandar@lapublica.cat',
    name: 'Gestor Estàndard',
    role: 'GESTOR_ESTANDARD',
    password: 'gestor123',
    userType: 'ACCOUNT_MANAGER',
    cargo: 'Gestor Plan Estándar'
  },
  {
    email: 'g-strategic@lapublica.cat',
    name: 'Gestor Estratègic',
    role: 'GESTOR_ESTRATEGIC',
    password: 'gestor123',
    userType: 'ACCOUNT_MANAGER',
    cargo: 'Gestor Plan Estratégico'
  },
  {
    email: 'g-enterprise@lapublica.cat',
    name: 'Gestor Enterprise',
    role: 'GESTOR_ENTERPRISE',
    password: 'gestor123',
    userType: 'ACCOUNT_MANAGER',
    cargo: 'Gestor Plan Enterprise'
  },
  {
    email: 'joan.perez@empresadeprova.cat',
    name: 'Joan Pérez',
    role: 'COMPANY',
    password: 'owner123',
    userType: 'COMPANY_OWNER'
  },
  {
    email: 'laura.garcia@generalitat.cat',
    name: 'Laura García',
    role: 'USER',
    password: 'empleat123',
    userType: 'EMPLOYEE'
  }
]

// Emails dels usuaris a mantenir
const EMAILS_TO_KEEP = USERS_TO_KEEP.map(u => u.email)

async function setupUsers() {
  console.log('🔄 Configurant usuaris...')

  try {
    // 1. Mostrar usuaris actuals abans d'eliminar
    const currentUsers = await prisma.user.findMany({
      select: { email: true, name: true, role: true }
    })
    console.log(`📊 Usuaris actuals: ${currentUsers.length}`)

    // 2. No eliminar usuaris per evitar problemes de claus foranes
    console.log(`⚠️ Saltant eliminació d'usuaris per evitar conflictes de claus foranes`)

    // 3. Actualitzar o crear cada usuari
    for (const userData of USERS_TO_KEEP) {
      const hashedPassword = await bcrypt.hash(userData.password, 10)

      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {
          name: userData.name,
          role: userData.role as any,
          password: hashedPassword,
          userType: userData.userType as any,
          cargo: userData.cargo || null,
          isActive: true,
          isEmailVerified: true
        },
        create: {
          email: userData.email,
          name: userData.name,
          role: userData.role as any,
          password: hashedPassword,
          userType: userData.userType as any,
          cargo: userData.cargo || null,
          isActive: true,
          isEmailVerified: true
        }
      })
      console.log(`✅ ${userData.role}: ${userData.email} (${userData.name})`)
    }

    // 4. Mostrar resum final
    const finalUsers = await prisma.user.findMany({
      select: { email: true, name: true, role: true }
    })
    console.log(`\n📋 RESUM FINAL: ${finalUsers.length} usuaris configurats`)
    finalUsers.forEach(user => {
      console.log(`   • ${user.role}: ${user.email} (${user.name})`)
    })

    console.log('\n✅ Configuració d\'usuaris completada!')
  } catch (error) {
    console.error('❌ Error durant la configuració:', error)
  }
}

setupUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect())