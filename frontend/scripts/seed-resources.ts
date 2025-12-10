// scripts/seed-resources.ts - Script para poblar la base de datos con recursos iniciales

import { PrismaClient } from '@prisma/client'
import { SEED_RESOURCES } from '../lib/gestio-empreses/data/resources-seed'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de recursos comerciales...')

  try {
    // Limpiar recursos existentes (opcional)
    console.log('🗑️  Limpiando recursos existentes...')
    await prisma.commercialResource.deleteMany({})

    // Crear recursos desde el seed
    console.log('📝 Creando recursos comerciales...')

    for (const resourceData of SEED_RESOURCES) {
      // Crear un usuario sistema temporal si no existe
      let systemUser = await prisma.user.findFirst({
        where: { email: 'sistema@lapublica.com' }
      })

      if (!systemUser) {
        systemUser = await prisma.user.create({
          data: {
            email: 'sistema@lapublica.com',
            name: 'Sistema La Pública',
            role: 'CRM_CONTINGUT',
            isActive: true,
          }
        })
      }

      const resource = await prisma.commercialResource.create({
        data: {
          slug: resourceData.slug,
          title: resourceData.title,
          description: resourceData.description,
          type: resourceData.type as any,
          phase: resourceData.phase as any,
          category: resourceData.category as any,
          content: resourceData.content as any,
          tags: resourceData.tags,
          isActive: resourceData.isActive,
          createdById: systemUser.id
        }
      })

      console.log(`✅ Creado: ${resource.title} (${resource.type})`)
    }

    const totalResources = await prisma.commercialResource.count()
    console.log(`\n🎉 Seed completado! ${totalResources} recursos creados.`)

  } catch (error) {
    console.error('❌ Error durante el seed:', error)
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