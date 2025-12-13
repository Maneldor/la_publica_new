import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CATEGORIES = [
    { name: 'Restauració', slug: 'restauracio', description: 'Restaurants, bars i cafeteries', icon: 'Utensils', color: 'orange' },
    { name: 'Viatges', slug: 'viatges', description: 'Agències, hotels i turisme', icon: 'Plane', color: 'blue' },
    { name: 'Automoció', slug: 'automocio', description: 'Vehicles i accessoris', icon: 'Car', color: 'slate' },
    { name: 'Moda', slug: 'moda', description: 'Roba, calçat i complements', icon: 'ShoppingBag', color: 'pink' },
    { name: 'Llar', slug: 'llar', description: 'Mobiliari, decoració i serveis per la llar', icon: 'Home', color: 'amber' },
    { name: 'Salut i Benestar', slug: 'salut-benestar', description: 'Gimnasos, spas i clíniques', icon: 'Dumbbell', color: 'green' },
    { name: 'Cultura i Oci', slug: 'cultura-oci', description: 'Espectacles, museus i entreteniment', icon: 'Palette', color: 'purple' },
    { name: 'Tecnologia', slug: 'tecnologia', description: 'Electrònica i informàtica', icon: 'Wifi', color: 'cyan' },
    { name: 'Educació', slug: 'educacio', description: 'Formació, cursos i acadèmies', icon: 'GraduationCap', color: 'indigo' },
    { name: 'Serveis Professionals', slug: 'serveis-professionals', description: 'Assessories, gestories i consultories', icon: 'Briefcase', color: 'slate' },
    { name: 'Bellesa', slug: 'bellesa', description: 'Perruqueries, estètica i cosmètica', icon: 'Heart', color: 'pink' },
    { name: 'Esports', slug: 'esports', description: 'Botigues, clubs i activitats esportives', icon: 'Dumbbell', color: 'emerald' },
    { name: 'Alimentació', slug: 'alimentacio', description: 'Supermercats i botigues especialitzades', icon: 'Utensils', color: 'lime' },
    { name: 'Finances i Assegurances', slug: 'finances-assegurances', description: 'Bancs, asseguradores i inversions', icon: 'Briefcase', color: 'teal' },
    { name: 'Altres', slug: 'altres', description: 'Altres categories', icon: 'Tag', color: 'slate' },
]

async function main() {
    console.log('🌱 Creant categories per Empreses i Ofertes...')

    // Obtenir scope
    const scope = await prisma.categoryScope.findUnique({
        where: { name: 'empreses-ofertes' },
    })

    if (!scope) {
        console.error('❌ Scope "empreses-ofertes" no trobat!')
        console.log('Executa primer: npx tsx src/prisma/seeds/system-components.ts')
        return
    }

    console.log(`📦 Scope trobat: ${scope.label} (${scope.id})`)

    let created = 0
    let skipped = 0

    for (let i = 0; i < CATEGORIES.length; i++) {
        const cat = CATEGORIES[i]

        // Comprovar si existeix
        const existing = await prisma.category.findFirst({
            where: { scopeId: scope.id, slug: cat.slug },
        })

        if (existing) {
            console.log(`  ⏭️ ${cat.name} ja existeix`)
            skipped++
            continue
        }

        await prisma.category.create({
            data: {
                scopeId: scope.id,
                name: cat.name,
                slug: cat.slug,
                description: cat.description,
                icon: cat.icon,
                color: cat.color,
                order: i,
                isActive: true,
                isFeatured: i < 5, // Les 5 primeres destacades
            },
        })
        console.log(`  ✓ ${cat.name}`)
        created++
    }

    console.log(`\n✅ Completat! Creades: ${created}, Saltades: ${skipped}`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
