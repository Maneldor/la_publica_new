/**
 * Script para generar nicks para usuarios USER (Empleados Públicos) que no tienen
 * Solo los USER necesitan nick, el resto de roles no.
 *
 * Ejecutar con: npx ts-node prisma/scripts/generate-nicks.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Generar nick único basado en nombre o email
function generateNick(firstName: string | null, lastName: string | null, email: string): string {
  // Intentar con nombre + apellido
  if (firstName && lastName) {
    const base = `${firstName.toLowerCase().charAt(0)}${lastName.toLowerCase().replace(/\s+/g, '')}`
    return base.substring(0, 15)
  }

  // Intentar solo con nombre
  if (firstName) {
    return firstName.toLowerCase().replace(/\s+/g, '').substring(0, 15)
  }

  // Usar parte del email antes del @
  const emailBase = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  return emailBase.substring(0, 15)
}

// Asegurar que el nick sea único añadiendo números si es necesario
async function ensureUniqueNick(baseNick: string): Promise<string> {
  let nick = baseNick
  let counter = 1

  while (true) {
    const existing = await prisma.user.findUnique({ where: { nick } })
    if (!existing) {
      return nick
    }
    nick = `${baseNick}${counter}`
    counter++

    if (counter > 100) {
      return `${baseNick}${Date.now()}`
    }
  }
}

async function main() {
  console.log('Buscando usuarios USER (Empleados Públicos) sin nick...')

  // Solo buscar usuarios con role USER que no tienen nick
  const usersWithoutNick = await prisma.user.findMany({
    where: {
      role: 'USER',
      nick: null
    },
    select: {
      id: true,
      email: true,
      name: true,
      firstName: true,
      lastName: true
    }
  })

  console.log(`Encontrados ${usersWithoutNick.length} usuarios USER sin nick`)

  for (const user of usersWithoutNick) {
    const baseNick = generateNick(user.firstName, user.lastName, user.email)
    const uniqueNick = await ensureUniqueNick(baseNick)

    await prisma.user.update({
      where: { id: user.id },
      data: { nick: uniqueNick }
    })

    console.log(`  - ${user.email} -> @${uniqueNick}`)
  }

  console.log('\nCompletado!')

  // Mostrar resumen
  const totalUsers = await prisma.user.count({ where: { role: 'USER' } })
  const usersWithNick = await prisma.user.count({ where: { role: 'USER', nick: { not: null } } })
  console.log(`Total usuarios USER: ${totalUsers}`)
  console.log(`Usuarios USER con nick: ${usersWithNick}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
