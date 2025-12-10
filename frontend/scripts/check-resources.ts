// check-resources.ts - Script para verificar los recursos en la base de datos
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Verificando recursos en la base de datos...\n')

  try {
    // Contar recursos totales
    const totalResources = await prisma.commercialResource.count()
    console.log(`📊 Total de recursos: ${totalResources}`)

    if (totalResources === 0) {
      console.log('❌ No hay recursos en la base de datos!')
      return
    }

    // Mostrar recursos
    const resources = await prisma.commercialResource.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        type: true,
        phase: true,
        category: true,
        isActive: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('\n📋 Recursos encontrados:')
    resources.forEach((resource, index) => {
      console.log(`${index + 1}. ${resource.title}`)
      console.log(`   - ID: ${resource.id}`)
      console.log(`   - Tipo: ${resource.type}`)
      console.log(`   - Fase: ${resource.phase}`)
      console.log(`   - Categoría: ${resource.category}`)
      console.log(`   - Activo: ${resource.isActive}`)
      console.log(`   - Creado: ${resource.createdAt.toISOString()}`)
      console.log('')
    })

    // Verificar por tipo
    console.log('📈 Recursos por tipo:')
    const byType = await prisma.commercialResource.groupBy({
      by: ['type'],
      _count: {
        _all: true
      }
    })

    byType.forEach(group => {
      console.log(`   - ${group.type}: ${group._count._all}`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('Error fatal:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })