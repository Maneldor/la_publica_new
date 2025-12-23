/**
 * Script para crear la categoria sensible "Policia" genèrica
 *
 * Executa: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/scripts/seed-policia-category.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚔 Creant categoria sensible "Policia"...\n')

  // Verificar si ja existeix
  const existing = await prisma.sensitiveJobCategory.findFirst({
    where: {
      OR: [
        { slug: 'policia' },
        { name: 'Policia' }
      ]
    }
  })

  if (existing) {
    console.log('⚠️  La categoria "Policia" ja existeix!')
    console.log('   ID:', existing.id)
    console.log('   Slug:', existing.slug)
    console.log('\n   Si vols actualitzar-la, elimina-la primer o edita-la des de l\'admin.')
    return
  }

  // Crear la categoria
  const category = await prisma.sensitiveJobCategory.create({
    data: {
      name: 'Policia',
      slug: 'policia',
      description: 'Categoria per a professionals de tots els cossos policials: Policia Local, Mossos d\'Esquadra, Policia Nacional, Guàrdia Civil i Guàrdia Urbana',
      icon: 'Shield',
      color: 'blue',

      // Patrons de detecció - Posició/Càrrec
      positionPatterns: [
        'Agent',
        'Policia',
        'Caporal',
        'Sergent',
        'Sotsinspector',
        'Subinspector',
        'Inspector',
        'Intendent',
        'Comissari',
        'Cabo',
        'Brigada',
        'Sargento',
        'Teniente',
        'Capitán',
        'Comandante',
        'Coronel',
        'Guàrdia',
        'Vigilant',
        'Mosso',
        'Escorta'
      ],

      // Patrons de detecció - Departament
      departmentPatterns: [
        'Policia Local',
        'Policia Municipal',
        'Guàrdia Urbana',
        'Mossos d\'Esquadra',
        'Policia Nacional',
        'Guàrdia Civil',
        'Policía Nacional',
        'Guardia Civil',
        'Seguretat Ciutadana',
        'Seguridad Ciudadana',
        'Cos de Policia',
        'Cuerpo de Policía',
        'Ordre Públic',
        'Orden Público',
        'Patrulla',
        'Trànsit',
        'Tráfico',
        'Investigació Criminal',
        'ARRO',
        'TEDAX',
        'BRIMO',
        'GEI',
        'UIP',
        'GRS'
      ],

      // Restriccions forçades
      forceHidePosition: true,      // ✅ Protegir rang i unitat
      forceHideDepartment: true,    // ✅ Protegir destinació
      forceHideBio: false,          // ❌ Poden posar info personal
      forceHideLocation: true,      // ✅ Protegir on treballen
      forceHidePhone: true,         // ✅ Protecció contacte
      forceHideEmail: true,         // ✅ Protecció contacte
      forceHideGroups: false,       // ❌ Poden mostrar pertinença

      isActive: true,
    }
  })

  console.log('✅ Categoria creada correctament!\n')
  console.log('📋 Detalls:')
  console.log('   ID:', category.id)
  console.log('   Nom:', category.name)
  console.log('   Slug:', category.slug)
  console.log('   Descripció:', category.description)
  console.log('\n🔒 Restriccions forçades:')
  console.log('   • Amagar posició:', category.forceHidePosition ? '✅ Sí' : '❌ No')
  console.log('   • Amagar departament:', category.forceHideDepartment ? '✅ Sí' : '❌ No')
  console.log('   • Amagar bio:', category.forceHideBio ? '✅ Sí' : '❌ No')
  console.log('   • Amagar ubicació:', category.forceHideLocation ? '✅ Sí' : '❌ No')
  console.log('   • Amagar telèfon:', category.forceHidePhone ? '✅ Sí' : '❌ No')
  console.log('   • Amagar email:', category.forceHideEmail ? '✅ Sí' : '❌ No')
  console.log('   • Amagar grups:', category.forceHideGroups ? '✅ Sí' : '❌ No')
  console.log('\n🔍 Patrons de detecció:')
  console.log('   Posicions:', category.positionPatterns.length, 'patrons')
  console.log('   Departaments:', category.departmentPatterns.length, 'patrons')

  console.log('\n🎉 Fet! Ara pots veure la categoria a /admin/usuaris/privacitat')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
