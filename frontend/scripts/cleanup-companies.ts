import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupCompanies() {
  console.log('🔄 Netejant empreses...')

  try {
    // Obtenir empreses actuals
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            teamMembers: true,
            offers: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`\n📊 EMPRESES ACTUALS: ${companies.length}`)
    console.log('=====================================')

    companies.forEach((company, index) => {
      console.log(`${index + 1}. ${company.name || 'Sense nom'}`)
      console.log(`   📧 Email: ${company.email || 'Sense email'}`)
      console.log(`   📊 Status: ${company.status}`)
      console.log(`   👥 Membres: ${company._count.teamMembers}`)
      console.log(`   📋 Ofertes: ${company._count.offers}`)
      console.log(`   📅 Creada: ${company.createdAt.toLocaleDateString('ca-ES')}`)
      console.log('   ---')
    })

    // Empreses amb activitat (offers o membres)
    const companiesWithActivity = companies.filter(c =>
      c._count.offers > 0 || c._count.teamMembers > 0
    )

    // Empreses buides
    const emptyCompanies = companies.filter(c =>
      c._count.offers === 0 && c._count.teamMembers === 0
    )

    console.log(`\n📈 EMPRESES AMB ACTIVITAT: ${companiesWithActivity.length}`)
    companiesWithActivity.forEach(company => {
      console.log(`   ✅ ${company.name} - ${company._count.offers} ofertes, ${company._count.teamMembers} membres`)
    })

    console.log(`\n🗑️ EMPRESES BUIDES (CANDIDATES A ELIMINACIÓ): ${emptyCompanies.length}`)
    emptyCompanies.forEach(company => {
      console.log(`   ❌ ${company.name || company.email} - Sense activitat`)
    })

    console.log('\n💡 RECOMANACIÓ:')
    console.log('=====================================')
    console.log(`• Mantenir: ${companiesWithActivity.length} empreses amb activitat`)
    console.log(`• Eliminar: ${emptyCompanies.length} empreses buides`)

    console.log('\n⚠️ AQUESTA ÉS NOMÉS UNA REVISIÓ')
    console.log('Per eliminar empreses buides, descomenta el codi al script.')

    // DESCOMENTAR AQUESTES LÍNIES PER ELIMINAR EMPRESES BUIDES:
    // if (emptyCompanies.length > 0) {
    //   const emptyIds = emptyCompanies.map(c => c.id)
    //   const deleted = await prisma.company.deleteMany({
    //     where: { id: { in: emptyIds } }
    //   })
    //   console.log(`🗑️ Eliminades ${deleted.count} empreses buides`)
    // }

    console.log('\n✅ Revisió d\'empreses completada!')
  } catch (error) {
    console.error('❌ Error durant la revisió:', error)
  }
}

cleanupCompanies()
  .catch(console.error)
  .finally(() => prisma.$disconnect())