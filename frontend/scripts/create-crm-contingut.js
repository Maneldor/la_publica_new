const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createCrmContingutUser() {
  try {
    // Hash del password
    const hashedPassword = await bcrypt.hash('contingut123', 12)

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: 'contingut@lapublica.cat' }
    })

    if (existingUser) {
      console.log('✅ Usuario CRM_CONTINGUT ya existe')
      return
    }

    // Crear el usuario
    const user = await prisma.user.create({
      data: {
        email: 'contingut@lapublica.cat',
        name: 'CRM Contingut',
        role: 'CRM_CONTINGUT',
        password: hashedPassword,
        userType: 'ADMIN',
        isActive: true,
        isEmailVerified: true
      }
    })

    console.log('✅ Usuario CRM_CONTINGUT creado exitosamente:')
    console.log('📧 Email:', user.email)
    console.log('👤 Nombre:', user.name)
    console.log('🎯 Rol:', user.role)
    console.log('🔑 ID:', user.id)

  } catch (error) {
    console.error('❌ Error creando usuario:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createCrmContingutUser()