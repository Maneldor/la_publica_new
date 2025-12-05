const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        userType: true,
        isActive: true,
        isEmailVerified: true
      }
    })

    console.log('📋 Usuarios en la base de datos:')
    console.log('═'.repeat(60))

    users.forEach(user => {
      console.log(`📧 Email: ${user.email}`)
      console.log(`👤 Nombre: ${user.name || 'Sin nombre'}`)
      console.log(`🎯 Rol: ${user.role}`)
      console.log(`📋 Tipo: ${user.userType}`)
      console.log(`✅ Activo: ${user.isActive}`)
      console.log(`📩 Email verificado: ${user.isEmailVerified}`)
      console.log('─'.repeat(60))
    })

    console.log(`\n📊 Total de usuarios: ${users.length}`)

  } catch (error) {
    console.error('❌ Error listando usuarios:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listUsers()