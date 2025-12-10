// scripts/debug-assignment-logic.ts
import { prismaClient } from '../lib/prisma'

async function debugAssignmentLogic() {
  try {
    console.log('🔍 Verificant lògica d\'assignació de leads...')
    console.log('================================================')

    // 1. Consulta exacta que fa la funció getUnassignedLeads
    console.log('1️⃣ CONSULTA getUnassignedLeads():')
    const unassignedLeads = await prismaClient.companyLead.findMany({
      where: {
        assignedToId: null,
        status: {
          notIn: ['WON', 'LOST'],
        },
      },
      select: {
        id: true,
        companyName: true,
        contactName: true,
        status: true,
        priority: true,
        estimatedRevenue: true,
        companySize: true,
        sector: true,
        source: true,
        generationMethod: true,
        createdAt: true,
        assignedTo: {
          select: { id: true, name: true },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
    })

    console.log(`📊 TOTAL LEADS SENSE ASSIGNAR: ${unassignedLeads.length}`)

    // 2. Filtrar només els d'IA
    const aiUnassignedLeads = unassignedLeads.filter(lead =>
      lead.source === 'AI_PROSPECTING' || lead.generationMethod === 'AI_PROSPECTING'
    )

    console.log(`🤖 LEADS D'IA SENSE ASSIGNAR: ${aiUnassignedLeads.length}`)

    if (aiUnassignedLeads.length > 0) {
      console.log('\nDetall dels leads d\'IA sense assignar:')
      aiUnassignedLeads.forEach((lead, index) => {
        console.log(`  ${index + 1}. ${lead.companyName}`)
        console.log(`     Status: ${lead.status}`)
        console.log(`     Priority: ${lead.priority}`)
        console.log(`     Source: ${lead.source}`)
        console.log(`     Method: ${lead.generationMethod}`)
        console.log(`     Created: ${lead.createdAt.toLocaleString()}`)
        console.log(`     AssignedTo: ${lead.assignedTo?.name || 'NULL'}`)
        console.log('')
      })
    }

    // 3. Verificar si hi ha problemes amb el status
    console.log('2️⃣ VERIFICACIÓ D\'ESTATS:')
    const allStatuses = await prismaClient.companyLead.groupBy({
      by: ['status'],
      _count: true,
      where: {
        OR: [
          { source: 'AI_PROSPECTING' },
          { generationMethod: 'AI_PROSPECTING' }
        ]
      }
    })

    console.log('Estats dels leads d\'IA:')
    allStatuses.forEach(group => {
      console.log(`  ${group.status || 'NULL'}: ${group._count} leads`)
    })

    // 4. Verificar assignedToId
    console.log('\n3️⃣ VERIFICACIÓ D\'ASSIGNACIONS:')
    const assignmentStatus = await prismaClient.companyLead.groupBy({
      by: ['assignedToId'],
      _count: true,
      where: {
        OR: [
          { source: 'AI_PROSPECTING' },
          { generationMethod: 'AI_PROSPECTING' }
        ]
      }
    })

    assignmentStatus.forEach(group => {
      console.log(`  AssignedToId ${group.assignedToId || 'NULL'}: ${group._count} leads`)
    })

    // 5. Verificar si hi ha leads amb estimatedRevenue null que pugui afectar l'ordenació
    console.log('\n4️⃣ VERIFICACIÓ DE CAMPS NULS:')
    const nullFields = await prismaClient.companyLead.findMany({
      where: {
        OR: [
          { source: 'AI_PROSPECTING' },
          { generationMethod: 'AI_PROSPECTING' }
        ],
        assignedToId: null
      },
      select: {
        id: true,
        companyName: true,
        priority: true,
        estimatedRevenue: true,
        sector: true
      }
    })

    const nullPriority = nullFields.filter(lead => !lead.priority)
    const nullRevenue = nullFields.filter(lead => !lead.estimatedRevenue)
    const nullSector = nullFields.filter(lead => !lead.sector)

    console.log(`  Leads amb priority NULL: ${nullPriority.length}`)
    console.log(`  Leads amb estimatedRevenue NULL: ${nullRevenue.length}`)
    console.log(`  Leads amb sector NULL: ${nullSector.length}`)

    // 6. Simular la query completa de la pàgina d'assignacions
    console.log('\n5️⃣ SIMULACIÓ QUERY COMPLETA:')
    try {
      const pageQuery = await prismaClient.companyLead.findMany({
        where: {
          assignedToId: null,
          status: {
            notIn: ['WON', 'LOST'],
          },
        },
        select: {
          id: true,
          companyName: true,
          contactName: true,
          status: true,
          priority: true,
          estimatedRevenue: true,
          companySize: true,
          sector: true,
          createdAt: true,
          assignedTo: {
            select: { id: true, name: true },
          },
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' },
        ],
        take: 20  // Limitar per veure els primers
      })

      console.log(`  Query retorna ${pageQuery.length} leads`)
      console.log(`  Primers 5 leads:`)
      pageQuery.slice(0, 5).forEach((lead, index) => {
        console.log(`    ${index + 1}. ${lead.companyName} (${lead.priority}, ${lead.createdAt.toLocaleDateString()})`)
      })

    } catch (queryError) {
      console.error('❌ Error en la query de la pàgina:', queryError)
    }

  } catch (error) {
    console.error('❌ Error verificant lògica d\'assignació:', error)
  } finally {
    await prismaClient.$disconnect()
  }
}

debugAssignmentLogic()