import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function migrateOfferCategories() {
    console.log('🔄 Migrant categories d\'ofertes al nou sistema...')

    // 1. Obtenir el scope "Empreses i Ofertes"
    let scope = await prisma.categoryScope.findUnique({
        where: { name: 'empreses-ofertes' },
    })

    if (!scope) {
        console.log('  ⚠️ Scope "empreses-ofertes" no trobat. Executant seed primer...')

        // Importar i executar seed si no existeix
        const { seedSystemComponents } = await import('./system-components')
        await seedSystemComponents()

        scope = await prisma.categoryScope.findUnique({
            where: { name: 'empreses-ofertes' },
        })
    }

    if (!scope) {
        throw new Error('No s\'ha pogut crear el scope')
    }

    // 2. Obtenir categories existents d'OfferCategory
    const oldCategories = await prisma.offerCategory.findMany({
        orderBy: { order: 'asc' },
    })

    console.log(`  📦 Trobades ${oldCategories.length} categories a migrar`)

    // 3. Migrar cada categoria
    for (const oldCat of oldCategories) {
        // Comprovar si ja existeix (per evitar duplicats)
        const existing = await prisma.category.findFirst({
            where: {
                scopeId: scope.id,
                slug: oldCat.slug,
            },
        })

        if (existing) {
            console.log(`  ⏭️ Categoria "${oldCat.name}" ja migrada`)
            continue
        }

        // Crear nova categoria
        await prisma.category.create({
            data: {
                scopeId: scope.id,
                name: oldCat.name,
                slug: oldCat.slug,
                description: oldCat.description,
                icon: oldCat.icon,
                color: oldCat.color || 'slate',
                order: oldCat.order,
                isActive: oldCat.isActive,
                isFeatured: false,
            },
        })

        console.log(`  ✓ Migrada: ${oldCat.name}`)
    }

    console.log('✅ Migració completada!')
    console.log('')
    console.log('📋 PASSOS SEGÜENTS:')
    console.log('  1. Actualitza les relacions Offer → Category (nou model)')
    console.log('  2. Actualitza les queries al frontend')
    console.log('  3. Un cop verificat, pots eliminar el model OfferCategory')
}

// Executar si s'executa directament
if (require.main === module) {
    migrateOfferCategories()
        .then(() => prisma.$disconnect())
        .catch((e) => {
            console.error(e)
            prisma.$disconnect()
            process.exit(1)
        })
}
