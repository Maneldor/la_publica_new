// Script para verificar el usuario actual y su rol
import { prismaClient } from '../lib/prisma'

async function checkCurrentUser() {
  try {
    console.log('🔍 Verificando usuarios en el sistema...\n')

    // Buscar usuarios activos
    const users = await prismaClient.user.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        _count: {
          select: {
            assignedLeads: {
              where: {
                status: {
                  notIn: ['WON', 'LOST']
                }
              }
            }
          }
        }
      },
      orderBy: {
        role: 'asc'
      }
    })

    // Agrupar por roles
    const roleGroups: Record<string, any[]> = {}

    users.forEach(user => {
      if (!roleGroups[user.role]) {
        roleGroups[user.role] = []
      }
      roleGroups[user.role].push(user)
    })

    console.log('📊 Usuarios por rol:\n')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    // Roles que PUEDEN asignar leads
    const canAssignRoles = ['CRM_COMERCIAL', 'ADMIN', 'ADMIN_GESTIO', 'SUPER_ADMIN']

    console.log('✅ PUEDEN ASIGNAR LEADS (verán checkboxes y botón ⋮):')
    console.log('─────────────────────────────────────────────────')
    canAssignRoles.forEach(role => {
      if (roleGroups[role]) {
        roleGroups[role].forEach(user => {
          console.log(`   🔹 ${user.name || user.email}`)
          console.log(`      Email: ${user.email}`)
          console.log(`      Rol: ${role}`)
          console.log(`      Leads activos: ${user._count.assignedLeads}`)
          console.log('')
        })
      }
    })

    console.log('\n❌ NO PUEDEN ASIGNAR LEADS (no verán controles):')
    console.log('─────────────────────────────────────────────────')
    const gestorRoles = ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE']
    gestorRoles.forEach(role => {
      if (roleGroups[role]) {
        roleGroups[role].forEach(user => {
          console.log(`   🔸 ${user.name || user.email}`)
          console.log(`      Email: ${user.email}`)
          console.log(`      Rol: ${role}`)
          console.log(`      Leads asignados: ${user._count.assignedLeads}`)
          console.log('')
        })
      }
    })

    // Buscar usuario CRM para pruebas
    const crmUser = await prismaClient.user.findFirst({
      where: {
        role: 'CRM_COMERCIAL',
        isActive: true
      }
    })

    if (crmUser) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('💡 PARA PROBAR LA ASIGNACIÓN:')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(`\n   Inicia sesión con: ${crmUser.email}`)
      console.log(`   Rol: ${crmUser.role}`)
      console.log('\n   Este usuario SÍ verá:')
      console.log('   ✅ Checkboxes para seleccionar leads')
      console.log('   ✅ Botón de tres puntos (⋮) con menú de asignación')
      console.log('   ✅ Botón "Assignar X leads" al seleccionar múltiples')
    }

    // Buscar un gestor para comparación
    const gestorUser = await prismaClient.user.findFirst({
      where: {
        role: {
          in: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE']
        },
        isActive: true
      }
    })

    if (gestorUser) {
      console.log('\n   Si inicias sesión con: ' + gestorUser.email)
      console.log(`   Rol: ${gestorUser.role}`)
      console.log('\n   Este usuario NO verá:')
      console.log('   ❌ No verá checkboxes')
      console.log('   ❌ No verá el botón de tres puntos (⋮)')
      console.log('   ❌ Solo podrá hacer clic para ver detalles')
    }

    // Verificar si hay un usuario ADMIN
    const adminUser = await prismaClient.user.findFirst({
      where: {
        role: {
          in: ['ADMIN', 'ADMIN_GESTIO', 'SUPER_ADMIN']
        },
        isActive: true
      }
    })

    if (adminUser) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🔑 USUARIO ADMIN DISPONIBLE:')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(`   Email: ${adminUser.email}`)
      console.log(`   Rol: ${adminUser.role}`)
      console.log('   Este usuario tiene TODOS los permisos de asignación')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prismaClient.$disconnect()
  }
}

// Ejecutar verificación
checkCurrentUser()