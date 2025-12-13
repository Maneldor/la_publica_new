import { PrismaClient } from '@prisma/client'
import { seedRolesAndPermissions } from './seeds/roles-permissions'
import { seedSystemComponents } from '../src/prisma/seeds/system-components'
import { migrateOfferCategories } from '../src/prisma/seeds/migrate-categories'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Iniciant seeds...\n')

  // 1. Rols i permisos
  await seedRolesAndPermissions()
  console.log('')

  // 2. Components del sistema i scopes
  await seedSystemComponents()
  console.log('')

  // 3. Migrar categories existents (si n'hi ha)
  try {
    await migrateOfferCategories()
  } catch (error) {
    console.log('  ℹ️ No hi ha categories a migrar o ja estan migrades')
  }

  console.log('\n✅ Tots els seeds completats!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })