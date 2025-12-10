// scripts/check-ai-leads.ts
import { prismaClient } from '../lib/prisma'

async function checkAILeads() {
  try {
    console.log('🔍 Verificant leads d\'IA a la base de dades...')
    console.log('================================================')

    // 1. Comprobar todos los leads de IA
    const allAILeads = await prismaClient.companyLead.findMany({
      where: {
        OR: [
          { source: 'AI_PROSPECTING' },
          { generationMethod: 'AI_PROSPECTING' },
          { tags: { has: 'IA' } },
          { tags: { has: 'DeepSeek' } }
        ]
      },
      select: {
        id: true,
        companyName: true,
        source: true,
        generationMethod: true,
        status: true,
        assignedToId: true,
        createdAt: true,
        tags: true
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`📊 TOTAL LEADS D'IA: ${allAILeads.length}`)

    if (allAILeads.length === 0) {
      console.log('❌ No s\'han trobat leads d\'IA a la base de dades')
      return
    }

    // 2. Agrupar per estat
    const byStatus = allAILeads.reduce((acc, lead) => {
      const status = lead.status || 'UNKNOWN'
      if (!acc[status]) acc[status] = []
      acc[status].push(lead)
      return acc
    }, {} as Record<string, typeof allAILeads>)

    console.log('\n📈 LEADS PER ESTAT:')
    Object.entries(byStatus).forEach(([status, leads]) => {
      console.log(`  ${status}: ${leads.length} leads`)
    })

    // 3. Comprobar leads sense assignar
    const unassignedAILeads = allAILeads.filter(lead =>
      !lead.assignedToId &&
      lead.status !== 'WON' &&
      lead.status !== 'LOST'
    )

    console.log(`\n⚠️ LEADS D'IA SENSE ASSIGNAR: ${unassignedAILeads.length}`)

    if (unassignedAILeads.length > 0) {
      console.log('\nDetall dels leads sense assignar:')
      unassignedAILeads.forEach((lead, index) => {
        console.log(`  ${index + 1}. ${lead.companyName} - ${lead.status} (${lead.createdAt.toLocaleString()})`)
        console.log(`     Source: ${lead.source}, Method: ${lead.generationMethod}`)
        console.log(`     Tags: ${lead.tags?.join(', ') || 'sense tags'}`)
      })
    }

    // 4. Verificar leads assignats
    const assignedAILeads = allAILeads.filter(lead => lead.assignedToId)
    console.log(`\n✅ LEADS D'IA ASSIGNATS: ${assignedAILeads.length}`)

    // 5. Comprobar per data de creació
    const today = new Date()
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    const recentLeads = allAILeads.filter(lead => lead.createdAt > lastWeek)
    const monthLeads = allAILeads.filter(lead => lead.createdAt > lastMonth)

    console.log(`\n📅 CREACIÓ DE LEADS:`)
    console.log(`  Última setmana: ${recentLeads.length}`)
    console.log(`  Últim mes: ${monthLeads.length}`)
    console.log(`  Més antics: ${allAILeads.length - monthLeads.length}`)

    // 6. Verificar problemes potencials
    console.log('\n🔧 DIAGNÒSTIC:')

    const problemLeads = unassignedAILeads.filter(lead => {
      const daysSinceCreation = (today.getTime() - lead.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      return daysSinceCreation > 1 // Més d'1 dia sense assignar
    })

    if (problemLeads.length > 0) {
      console.log(`❌ PROBLEMA: ${problemLeads.length} leads d'IA porten més d'1 dia sense assignar`)
      problemLeads.forEach(lead => {
        const daysSince = Math.floor((today.getTime() - lead.createdAt.getTime()) / (1000 * 60 * 60 * 24))
        console.log(`  - ${lead.companyName}: ${daysSince} dies sense assignar`)
      })
    } else {
      console.log('✅ Tots els leads recents estan processats correctament')
    }

    // 7. Verificar si apareixen a la pàgina d'assignacions
    const availableForAssignment = await prismaClient.companyLead.findMany({
      where: {
        assignedToId: null,
        status: { notIn: ['WON', 'LOST'] },
        OR: [
          { source: 'AI_PROSPECTING' },
          { generationMethod: 'AI_PROSPECTING' }
        ]
      },
      select: {
        id: true,
        companyName: true,
        status: true
      }
    })

    console.log(`\n📋 LEADS D'IA DISPONIBLES PER ASSIGNAR: ${availableForAssignment.length}`)

    if (availableForAssignment.length > 0) {
      console.log('Aquests leads haurien d\'aparèixer a /gestio/crm/assignacions:')
      availableForAssignment.forEach((lead, index) => {
        console.log(`  ${index + 1}. ${lead.companyName} (${lead.status})`)
      })
    }

  } catch (error) {
    console.error('❌ Error verificant leads d\'IA:', error)
  } finally {
    await prismaClient.$disconnect()
  }
}

checkAILeads()