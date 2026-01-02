/**
 * Script per actualitzar els slugs de les empreses existents
 *
 * Execució:
 *   npx ts-node --transpile-only scripts/update-company-slugs.ts
 *
 * O afegir a package.json:
 *   "update-slugs": "ts-node --transpile-only scripts/update-company-slugs.ts"
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Genera un slug a partir d'un nom
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100)
}

/**
 * Comprova si un string sembla un ID aleatori
 */
function isRandomId(slug: string | null | undefined): boolean {
  if (!slug) return true
  const hasMeaningfulWords = slug.split('-').some(word => word.length > 2 && word.length < 20)
  return slug.length > 24 && !hasMeaningfulWords
}

async function updateCompanySlugs() {
  console.log('🔄 Actualitzant slugs de les empreses...\n')

  const companies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      slug: true
    }
  })

  console.log(`📊 Total empreses: ${companies.length}\n`)

  let updated = 0
  let skipped = 0
  let errors = 0

  for (const company of companies) {
    try {
      // Comprovar si el slug sembla un ID aleatori o no existeix
      if (isRandomId(company.slug)) {
        const baseSlug = generateSlug(company.name)

        // Comprovar duplicats
        let finalSlug = baseSlug
        let counter = 1

        while (await prisma.company.findFirst({
          where: {
            slug: finalSlug,
            id: { not: company.id }
          }
        })) {
          finalSlug = `${baseSlug}-${counter}`
          counter++
        }

        await prisma.company.update({
          where: { id: company.id },
          data: { slug: finalSlug }
        })

        console.log(`✅ ${company.name}`)
        console.log(`   Antic: ${company.slug || '(buit)'}`)
        console.log(`   Nou:   ${finalSlug}\n`)
        updated++
      } else {
        console.log(`⏭️  ${company.name} - slug correcte: ${company.slug}`)
        skipped++
      }
    } catch (error) {
      console.error(`❌ Error amb ${company.name}:`, error)
      errors++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('📈 RESUM:')
  console.log(`   Actualitzats: ${updated}`)
  console.log(`   Omesos (ja correctes): ${skipped}`)
  console.log(`   Errors: ${errors}`)
  console.log('='.repeat(50))

  await prisma.$disconnect()
}

updateCompanySlugs()
  .catch((error) => {
    console.error('Error executant script:', error)
    process.exit(1)
  })
