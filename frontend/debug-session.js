// debug-session.js - Verificar autenticación y datos
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugSession() {
  console.log('🔍 Verificando estado actual...')

  try {
    // 1. Verificar empresas con account managers
    console.log('\n📊 EMPRESAS CON ACCOUNT MANAGERS:')
    const empresasConGestor = await prisma.company.count({
      where: {
        accountManagerId: { not: null }
      }
    })
    console.log(`Empresas con gestor asignado: ${empresasConGestor}`)

    // 2. Verificar empresas sin account managers
    const empresasSinGestor = await prisma.company.count({
      where: {
        accountManagerId: null
      }
    })
    console.log(`Empresas sin gestor: ${empresasSinGestor}`)

    // 3. Mostrar distribución por roles
    console.log('\n👥 USUARIOS POR ROL:')
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true
      },
      where: {
        isActive: true
      }
    })

    usersByRole.forEach(group => {
      console.log(`${group.role}: ${group._count.id} usuarios`)
    })

    // 4. Ver qué usuario está logueado actualmente
    console.log('\n🔐 USUARIOS CON ROLES DE GESTIÓN ACTIVOS:')
    const adminUsers = await prisma.user.findMany({
      where: {
        role: {
          in: ['SUPER_ADMIN', 'ADMIN', 'CRM_COMERCIAL']
        },
        isActive: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    adminUsers.forEach(user => {
      console.log(`📧 ${user.email} (${user.name}) - ${user.role}`)
    })

    // 5. Query simulando lo que hace el server action
    console.log('\n🎯 SIMULANDO SERVER ACTION (SIN FILTROS DE ROL):')

    const empreses = await prisma.company.findMany({
      include: {
        currentPlan: {
          select: {
            id: true,
            tier: true,
            nombreCorto: true
          }
        },
        accountManager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      take: 3,
      orderBy: { updatedAt: 'desc' }
    })

    console.log(`Encontradas: ${empreses.length} empresas`)
    empreses.forEach((empresa, i) => {
      console.log(`${i+1}. ${empresa.name} (${empresa.status})`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugSession()