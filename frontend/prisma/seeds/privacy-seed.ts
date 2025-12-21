import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Categories de treballs sensibles inicials
const sensitiveCategories = [
  {
    name: 'Policia Local',
    slug: 'policia-local',
    description: 'Agents i personal de policies locals i guàrdies urbanes',
    icon: 'Shield',
    color: 'blue',
    departmentPatterns: ['Policia Local', 'Guàrdia Urbana', 'Seguretat Ciutadana'],
    positionPatterns: ['Agent', 'Caporal', 'Sergent', 'Sotsinspector', 'Inspector', 'Intendent', 'Comissari'],
    forceHidePosition: true,
    forceHideDepartment: false,
    forceHideBio: true,
    forceHideLocation: true,
    forceHidePhone: true,
    forceHideEmail: true,
    forceHideGroups: true,
    isActive: true,
  },
  {
    name: "Mossos d'Esquadra",
    slug: 'mossos-esquadra',
    description: "Cos de Mossos d'Esquadra de Catalunya",
    icon: 'Shield',
    color: 'red',
    departmentPatterns: ['Mossos', 'PG-ME', 'Policia de la Generalitat'],
    positionPatterns: ['Agent', 'Caporal', 'Sergent', 'Sotsinspector', 'Inspector', 'Intendent', 'Comissari'],
    forceHidePosition: true,
    forceHideDepartment: false,
    forceHideBio: true,
    forceHideLocation: true,
    forceHidePhone: true,
    forceHideEmail: true,
    forceHideGroups: true,
    isActive: true,
  },
  {
    name: 'Centres Penitenciaris',
    slug: 'centres-penitenciaris',
    description: "Personal de centres penitenciaris i serveis d'execució penal",
    icon: 'Lock',
    color: 'gray',
    departmentPatterns: ['Penitenciari', 'Serveis Penitenciaris', 'Centre Penitenciari', 'Presó'],
    positionPatterns: ['Funcionari de presons', "Tècnic d'execució penal", 'Director', 'Subdirector'],
    forceHidePosition: true,
    forceHideDepartment: true,
    forceHideBio: true,
    forceHideLocation: true,
    forceHidePhone: true,
    forceHideEmail: true,
    forceHideGroups: true,
    isActive: true,
  },
  {
    name: 'Protecció de Menors',
    slug: 'proteccio-menors',
    description: 'Personal de serveis de protecció de menors i família',
    icon: 'Baby',
    color: 'purple',
    departmentPatterns: ['Infància', 'Menors', 'DGAIA', 'Protecció', 'Família'],
    positionPatterns: ['Educador social', 'Treballador social', 'Psicòleg'],
    forceHidePosition: true,
    forceHideDepartment: false,
    forceHideBio: true,
    forceHideLocation: true,
    forceHidePhone: true,
    forceHideEmail: true,
    forceHideGroups: false,
    isActive: true,
  },
  {
    name: 'Inspecció i Control',
    slug: 'inspeccio-control',
    description: "Personal d'inspecció de treball, hisenda i altres organismes de control",
    icon: 'Search',
    color: 'amber',
    departmentPatterns: ['Inspecció', 'Hisenda', 'Tributs', 'AEAT', 'Agència Tributària'],
    positionPatterns: ['Inspector', 'Subinspector', 'Agent tributari'],
    forceHidePosition: true,
    forceHideDepartment: false,
    forceHideBio: false,
    forceHideLocation: true,
    forceHidePhone: true,
    forceHideEmail: true,
    forceHideGroups: false,
    isActive: true,
  },
  {
    name: 'Violència de Gènere',
    slug: 'violencia-genere',
    description: "Personal de serveis d'atenció a víctimes de violència de gènere",
    icon: 'Heart',
    color: 'pink',
    departmentPatterns: ['Violència de gènere', 'Dona', 'Igualtat', 'SIAD'],
    positionPatterns: ['Psicòleg', 'Treballador social', 'Educador'],
    forceHidePosition: true,
    forceHideDepartment: false,
    forceHideBio: true,
    forceHideLocation: true,
    forceHidePhone: true,
    forceHideEmail: true,
    forceHideGroups: true,
    isActive: true,
  },
]

export async function seedPrivacyCategories() {
  console.log('🔒 Creant categories de privacitat sensibles...')

  for (const category of sensitiveCategories) {
    await prisma.sensitiveJobCategory.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        icon: category.icon,
        color: category.color,
        departmentPatterns: category.departmentPatterns,
        positionPatterns: category.positionPatterns,
        forceHidePosition: category.forceHidePosition,
        forceHideDepartment: category.forceHideDepartment,
        forceHideBio: category.forceHideBio,
        forceHideLocation: category.forceHideLocation,
        forceHidePhone: category.forceHidePhone,
        forceHideEmail: category.forceHideEmail,
        forceHideGroups: category.forceHideGroups,
        isActive: category.isActive,
      },
      create: category,
    })
    console.log(`  ✅ ${category.name}`)
  }

  console.log(`\n  📊 ${sensitiveCategories.length} categories creades/actualitzades`)
}

export async function seedPrivacyConfig() {
  console.log('\n⚙️ Creant configuració global de privacitat...')

  await prisma.privacyConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      defaultShowRealName: true,
      defaultShowPosition: true,
      defaultShowDepartment: true,
      defaultShowBio: true,
      defaultShowLocation: true,
      defaultShowPhone: false,
      defaultShowEmail: false,
      defaultShowSocialLinks: true,
      defaultShowJoinedDate: true,
      defaultShowLastActive: true,
      defaultShowConnections: true,
      defaultShowGroups: true,
      allowUsersToChangePrivacy: true,
      requireEmailVerification: false,
    },
  })

  console.log('  ✅ Configuració global creada')
}

export async function seedPrivacy() {
  await seedPrivacyCategories()
  await seedPrivacyConfig()
  console.log('\n✅ Sistema de privacitat configurat!')
}

// Permet executar directament
if (require.main === module) {
  seedPrivacy()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
