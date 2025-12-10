// fix-user-role.js - Asignar rol de admin al usuario
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixUserRole() {
  console.log('🔧 Corrigiendo roles de usuario...')

  try {
    // Buscar todos los usuarios y mostrar sus roles
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    })

    console.log('👥 Usuarios actuales:')
    users.forEach((user, i) => {
      console.log(`${i+1}. ${user.name || user.email} - ${user.role} ${user.isActive ? '(Activo)' : '(Inactivo)'}`)
    })

    // Si hay algún usuario, lo convertimos en SUPER_ADMIN
    if (users.length > 0) {
      const userToUpdate = users[0] // Primer usuario

      console.log(`\n🔄 Actualizando ${userToUpdate.name || userToUpdate.email} a SUPER_ADMIN...`)

      await prisma.user.update({
        where: { id: userToUpdate.id },
        data: {
          role: 'SUPER_ADMIN',
          isActive: true
        }
      })

      console.log('✅ Usuario actualizado correctamente!')
      console.log(`📧 Email: ${userToUpdate.email}`)
      console.log('🔑 Rol: SUPER_ADMIN')
      console.log('👤 Estado: Activo')

      console.log('\n🚀 Ahora puedes hacer login y deberías ver todas las empresas.')
    } else {
      console.log('❌ No hay usuarios en la base de datos.')
      console.log('💡 Necesitas crear un usuario primero.')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixUserRole()