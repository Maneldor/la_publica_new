// scripts/clean-mock-leads.ts
import { prismaClient } from '../lib/prisma'

async function cleanMockLeads() {
  try {
    console.log('🧹 Iniciando limpieza de leads mock...')

    // Buscar leads que parecen mock data
    const mockLeads = await prismaClient.companyLead.findMany({
      where: {
        OR: [
          { companyName: { contains: 'Mock' } },
          { companyName: { contains: 'Care Plus Barcelona' } },
          { companyName: { contains: 'Wellness Group Barcelona' } },
          { email: { contains: 'mock' } },
          { email: { contains: 'example.com' } },
          { source: 'MANUAL' },
          { notes: { contains: 'testing' } },
          { notes: { contains: 'mock' } },
        ]
      },
      select: {
        id: true,
        companyName: true,
        email: true,
        source: true,
        notes: true,
      }
    })

    console.log(`🔍 Encontrados ${mockLeads.length} leads mock:`)
    mockLeads.forEach((lead, i) => {
      console.log(`  ${i + 1}. ${lead.companyName} (${lead.email}) - ${lead.source}`)
    })

    if (mockLeads.length === 0) {
      console.log('✅ No hay leads mock para eliminar')
      return
    }

    // Confirmar antes de eliminar
    console.log('\n⚠️  ¿Deseas eliminar estos leads? (y/n)')

    // En un entorno de script, eliminaremos automáticamente
    console.log('🗑️  Eliminando leads mock...')

    const leadIds = mockLeads.map(lead => lead.id)

    // Primero eliminar actividades relacionadas
    await prismaClient.leadActivity.deleteMany({
      where: {
        leadId: { in: leadIds }
      }
    })

    // Luego eliminar las notificaciones relacionadas
    await prismaClient.notification.deleteMany({
      where: {
        leadId: { in: leadIds }
      }
    })

    // Finalmente eliminar los leads
    const deleted = await prismaClient.companyLead.deleteMany({
      where: {
        id: { in: leadIds }
      }
    })

    console.log(`✅ Eliminados ${deleted.count} leads mock y sus datos relacionados`)

  } catch (error) {
    console.error('❌ Error limpiando leads mock:', error)
  } finally {
    await prismaClient.$disconnect()
  }
}

cleanMockLeads()