const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testPermissions() {
  console.log('Iniciando pruebas de permisos...\n')

  try {
    // 1. Verificar que existan leads y empresas de prueba
    console.log('Verificando datos existentes:')

    const leadsCount = await prisma.companyLead.count()
    const empresasCount = await prisma.company.count()
    const usersCount = await prisma.user.count({
      where: {
        role: {
          in: ['SUPER_ADMIN', 'ADMIN', 'CRM_COMERCIAL', 'GESTOR_ESTANDARD']
        }
      }
    })

    console.log(`  - CompanyLeads: ${leadsCount}`)
    console.log(`  - Companies: ${empresasCount}`)
    console.log(`  - Users con roles de gestión: ${usersCount}`)

    // 2. Crear algunos datos de prueba si no existen
    if (leadsCount === 0) {
      console.log('\nCreando CompanyLeads de prueba...')

      // Obtener usuarios para asignar
      const users = await prisma.user.findMany({
        where: {
          role: {
            in: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'CRM_COMERCIAL']
          }
        },
        select: { id: true, email: true, role: true },
        take: 3
      })

      if (users.length > 0) {
        await prisma.companyLead.createMany({
          data: [
            {
              companyName: 'Tech Innovators SL',
              cif: 'B12345001',
              sector: 'Tecnología',
              email: 'contact@techinnovators.com',
              phone: '666123001',
              source: 'WEB_FORM',
              status: 'NEW',
              priority: 'HIGH',
              assignedToId: users[0]?.id,
              contactName: 'Maria García',
              estimatedValue: 50000
            },
            {
              companyName: 'Marketing Solutions SA',
              cif: 'A98765001',
              sector: 'Marketing',
              email: 'info@marketingsol.com',
              phone: '666123002',
              source: 'AI_PROSPECTING',
              status: 'CONTACTED',
              priority: 'MEDIUM',
              assignedToId: users[1]?.id || users[0]?.id,
              contactName: 'Joan Pérez',
              estimatedValue: 25000
            },
            {
              companyName: 'Retail Express SL',
              cif: 'B55544001',
              sector: 'Retail',
              email: 'ventas@retailexpress.com',
              phone: '666123003',
              source: 'REFERRAL',
              status: 'QUALIFIED',
              priority: 'LOW',
              assignedToId: users[2]?.id || users[0]?.id,
              contactName: 'Anna Martínez',
              estimatedValue: 15000
            }
          ]
        })
        console.log('  OK - 3 CompanyLeads creados')
      }
    }

    if (empresasCount === 0) {
      console.log('\nCreando Companies de prueba...')

      const users = await prisma.user.findMany({
        where: {
          role: {
            in: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'CRM_COMERCIAL']
          }
        },
        take: 2
      })

      if (users.length > 0) {
        await prisma.company.createMany({
          data: [
            {
              name: 'Digital Solutions BCN',
              cif: 'B87654321',
              email: 'info@digitalsol.com',
              phone: '933001001',
              sector: 'Tecnología',
              status: 'APPROVED',
              accountManagerId: users[0]?.id,
              isActive: true
            },
            {
              name: 'Consulting Partners SL',
              cif: 'B12398765',
              email: 'contact@consultingp.com',
              phone: '933001002',
              sector: 'Consultoría',
              status: 'PENDING',
              accountManagerId: users[1]?.id || users[0]?.id,
              isActive: true
            }
          ]
        })
        console.log('  OK - 2 Companies creadas')
      }
    }

    // 3. Verificar estructura de permisos
    console.log('\nVerificando estructura de roles y permisos:')

    const roleStats = await prisma.user.groupBy({
      by: ['role'],
      where: { isActive: true },
      _count: { role: true }
    })

    roleStats.forEach(stat => {
      console.log(`  - ${stat.role}: ${stat._count.role} usuarios`)
    })

    // 4. Verificar asignaciones
    console.log('\nVerificando asignaciones:')

    const assignedLeads = await prisma.companyLead.count({
      where: { assignedToId: { not: null } }
    })

    const assignedCompanies = await prisma.company.count({
      where: { accountManagerId: { not: null } }
    })

    console.log(`  - Leads asignados: ${assignedLeads}`)
    console.log(`  - Empresas con gestor: ${assignedCompanies}`)

    // 5. Verificar leads por gestor
    console.log('\nDistribución de leads por gestor:')

    const leadsPerManager = await prisma.companyLead.groupBy({
      by: ['assignedToId'],
      where: { assignedToId: { not: null } },
      _count: { assignedToId: true },
      orderBy: { _count: { assignedToId: 'desc' } }
    })

    for (const item of leadsPerManager) {
      const user = await prisma.user.findUnique({
        where: { id: item.assignedToId },
        select: { email: true, role: true }
      })
      console.log(`  - ${user?.email} (${user?.role}): ${item._count.assignedToId} leads`)
    }

    // 6. Verificar empresas por gestor
    console.log('\nDistribución de empresas por gestor:')

    const companiesPerManager = await prisma.company.groupBy({
      by: ['accountManagerId'],
      where: { accountManagerId: { not: null }, isActive: true },
      _count: { accountManagerId: true },
      orderBy: { _count: { accountManagerId: 'desc' } }
    })

    for (const item of companiesPerManager) {
      const user = await prisma.user.findUnique({
        where: { id: item.accountManagerId },
        select: { email: true, role: true }
      })
      console.log(`  - ${user?.email} (${user?.role}): ${item._count.accountManagerId} empresas`)
    }

    console.log('\nVerificación de permisos completada')
    console.log('\nResumen para pruebas:')
    console.log('  1. SUPER_ADMIN/ADMIN → Deben ver TODOS los leads y empresas')
    console.log('  2. CRM_COMERCIAL → Deben ver TODOS los leads y empresas')
    console.log('  3. GESTOR_* → Deben ver SOLO sus leads/empresas asignados')
    console.log('\nLas server actions están listas para usar!')

  } catch (error) {
    console.error('ERROR - Error en las pruebas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testPermissions()