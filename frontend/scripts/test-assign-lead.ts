// Script para simular asignación de lead
import { prismaClient } from '../lib/prisma'

async function testAssignLead() {
  try {
    console.log('🔍 Buscando leads sin asignar...')

    // Buscar un lead sin asignar
    const unassignedLead = await prismaClient.companyLead.findFirst({
      where: {
        assignedToId: null,
        status: 'NEW'
      },
      select: {
        id: true,
        companyName: true,
        status: true,
        assignedToId: true
      }
    })

    if (!unassignedLead) {
      console.log('❌ No se encontraron leads sin asignar')

      // Crear un lead de prueba
      console.log('📝 Creando lead de prueba...')
      const newLead = await prismaClient.companyLead.create({
        data: {
          companyName: 'Empresa Test Asignación SL',
          contactName: 'Juan Pérez',
          email: 'test@asignacion.com',
          phone: '+34 666 777 888',
          status: 'NEW',
          priority: 'HIGH',
          estimatedRevenue: 50000,
          sector: 'TECHNOLOGY',
          city: 'Barcelona',
          description: 'Lead de prueba para asignación',
          source: 'WEB'
        }
      })
      console.log('✅ Lead creado:', newLead.companyName, '- ID:', newLead.id)
    } else {
      console.log('✅ Lead encontrado:', unassignedLead.companyName, '- ID:', unassignedLead.id)
    }

    // Buscar un gestor disponible
    console.log('\n🔍 Buscando gestores disponibles...')
    const gestor = await prismaClient.user.findFirst({
      where: {
        role: {
          in: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE']
        },
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
      }
    })

    if (!gestor) {
      console.log('❌ No se encontraron gestores disponibles')
      return
    }

    console.log('✅ Gestor encontrado:', gestor.name || gestor.email)
    console.log('   - Rol:', gestor.role)
    console.log('   - Leads activos:', gestor._count.assignedLeads)

    // Realizar la asignación
    const leadToAssign = unassignedLead || await prismaClient.companyLead.findFirst({
      where: { assignedToId: null, status: 'NEW' }
    })

    if (!leadToAssign) {
      console.log('❌ No hay leads para asignar')
      return
    }

    console.log('\n🚀 Asignando lead al gestor...')
    const assignedLead = await prismaClient.companyLead.update({
      where: { id: leadToAssign.id },
      data: {
        assignedToId: gestor.id,
        updatedAt: new Date()
      },
      include: {
        assignedTo: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    console.log('✅ Lead asignado exitosamente!')
    console.log('   - Lead:', assignedLead.companyName)
    console.log('   - Asignado a:', assignedLead.assignedTo?.name || assignedLead.assignedTo?.email)
    console.log('   - Rol del gestor:', assignedLead.assignedTo?.role)

    // Crear registro de actividad
    await prismaClient.leadActivity.create({
      data: {
        leadId: assignedLead.id,
        type: 'ASSIGNMENT',
        description: `Lead asignado a ${assignedLead.assignedTo?.name || assignedLead.assignedTo?.email} (prueba de simulación)`,
        userId: gestor.id
      }
    })
    console.log('📝 Actividad de asignación registrada')

    // Verificar la asignación
    console.log('\n🔍 Verificando asignación...')
    const verifyLead = await prismaClient.companyLead.findUnique({
      where: { id: assignedLead.id },
      include: {
        assignedTo: {
          select: {
            name: true,
            email: true,
            _count: {
              select: {
                assignedLeads: {
                  where: {
                    status: { notIn: ['WON', 'LOST'] }
                  }
                }
              }
            }
          }
        }
      }
    })

    if (verifyLead?.assignedToId) {
      console.log('✅ Asignación verificada correctamente')
      console.log('   - El gestor ahora tiene', verifyLead.assignedTo?._count.assignedLeads, 'leads activos')
    }

    // Mostrar resumen de leads por gestor
    console.log('\n📊 Resumen de distribución de leads:')
    const gestorsWithLeads = await prismaClient.user.findMany({
      where: {
        role: { in: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE'] },
        isActive: true
      },
      select: {
        name: true,
        email: true,
        role: true,
        _count: {
          select: {
            assignedLeads: {
              where: {
                status: { notIn: ['WON', 'LOST'] }
              }
            }
          }
        }
      }
    })

    gestorsWithLeads.forEach(g => {
      console.log(`   - ${g.name || g.email} (${g.role}): ${g._count.assignedLeads} leads`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prismaClient.$disconnect()
  }
}

// Ejecutar el test
testAssignLead()