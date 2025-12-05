// scripts/clean-fake-users.ts
import { prismaClient as prisma } from '@/lib/prisma'

async function main() {
  console.log('🔍 Cercant usuaris al sistema...\n')

  // Obtenir tots els usuaris
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      userType: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: {
          assignedLeads: true,
          managedCompanies: true,
          sentMessages: true,
          tasksAssigned: true,
          leadActivities: true,
          leadTasks: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  console.log(`📋 Total usuaris: ${users.length}\n`)

  // Identificar usuaris reals vs inventats
  const realUsers: typeof users = []
  const fakeUsers: typeof users = []

  for (const user of users) {
    // Comprovar activitat real
    const hasActivity =
      user._count.assignedLeads > 0 ||
      user._count.managedCompanies > 0 ||
      user._count.sentMessages > 0 ||
      user._count.tasksAssigned > 0 ||
      user._count.leadActivities > 0 ||
      user._count.leadTasks > 0

    // Noms genèrics que indiquen usuari de prova
    const hasGenericName = [
      'Account Manager',
      'Administrador',
      'CRM Contingut',
      'G-Enterprise',
      'G-Estandar',
      'G-Estrategic',
      'Test',
      'Demo',
      'Prova',
      'Gestor',
      'Admin System',
    ].some(name => user.name?.toLowerCase().includes(name.toLowerCase()))

    // Emails genèrics
    const hasGenericEmail =
      user.email.includes('test@') ||
      user.email.includes('demo@') ||
      user.email.includes('fake@') ||
      user.email.includes('example.com') ||
      user.email.includes('gestor-') ||
      user.email.includes('admin@system') ||
      user.email.includes('noreply')

    // Decisió basada en múltiples factors
    if (hasActivity && !hasGenericEmail && !hasGenericName) {
      // Usuari amb activitat real i email/nom no genèric = REAL
      realUsers.push(user)
    } else if (hasGenericName || hasGenericEmail) {
      // Nom o email genèric = FALS
      fakeUsers.push(user)
    } else if (!hasActivity) {
      // Sense activitat = probablement FALS
      fakeUsers.push(user)
    } else {
      // Per defecte, mantenir si hi ha dubte
      realUsers.push(user)
    }
  }

  console.log('✅ USUARIS REALS (es mantindran):')
  console.log('─'.repeat(60))
  for (const user of realUsers) {
    console.log(`  • ${user.name || 'Sense nom'} (${user.email})`)
    console.log(`    Rol: ${user.role || user.userType} | Actiu: ${user.isActive ? 'Sí' : 'No'}`)
    console.log(`    Leads: ${user._count.assignedLeads} | Empreses: ${user._count.managedCompanies} | Tasques: ${user._count.tasksAssigned}`)
    console.log('')
  }

  console.log('\n❌ USUARIS INVENTATS (s\'eliminaran):')
  console.log('─'.repeat(60))
  for (const user of fakeUsers) {
    console.log(`  • ${user.name || 'Sense nom'} (${user.email})`)
    console.log(`    Rol: ${user.role || user.userType} | Actiu: ${user.isActive ? 'Sí' : 'No'}`)
    console.log(`    Leads: ${user._count.assignedLeads} | Empreses: ${user._count.managedCompanies}`)
    console.log('')
  }

  console.log('\n' + '═'.repeat(60))
  console.log(`📊 RESUM: ${realUsers.length} reals, ${fakeUsers.length} a eliminar`)
  console.log('═'.repeat(60) + '\n')

  // Confirmar eliminació
  const readline = await import('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  const answer = await new Promise<string>((resolve) => {
    rl.question('⚠️  Vols eliminar els usuaris inventats? (s/n): ', resolve)
  })
  rl.close()

  if (answer.toLowerCase() !== 's') {
    console.log('\n❌ Operació cancel·lada')
    return
  }

  // Eliminar usuaris inventats
  console.log('\n🗑️  Eliminant usuaris inventats...\n')

  let eliminats = 0
  let errors = 0

  for (const user of fakeUsers) {
    try {
      console.log(`  Processant: ${user.name || user.email}...`)

      // Desassignar leads
      const leadsUpdated = await prisma.companyLead.updateMany({
        where: { assignedToId: user.id },
        data: { assignedToId: null },
      })
      if (leadsUpdated.count > 0) {
        console.log(`    → Desassignats ${leadsUpdated.count} leads`)
      }

      // Eliminar activitats de leads
      const activitiesDeleted = await prisma.leadActivity.deleteMany({
        where: { userId: user.id },
      })
      if (activitiesDeleted.count > 0) {
        console.log(`    → Eliminades ${activitiesDeleted.count} activitats`)
      }

      // Eliminar tasques assignades (assignedToId és required, no pot ser null)
      const tasksAssigned = await prisma.task.deleteMany({
        where: { assignedToId: user.id },
      })
      if (tasksAssigned.count > 0) {
        console.log(`    → Eliminades ${tasksAssigned.count} tasques assignades`)
      }

      // Eliminar tasques creades
      const tasksCreated = await prisma.task.deleteMany({
        where: { createdById: user.id },
      })
      if (tasksCreated.count > 0) {
        console.log(`    → Eliminades ${tasksCreated.count} tasques creades`)
      }

      // Nota: No hi ha model CalendarEvent en aquest schema

      // Eliminar missatges (només com a sender, no hi ha receiverId)
      const messagesDeleted = await prisma.message.deleteMany({
        where: { senderId: user.id },
      })
      if (messagesDeleted.count > 0) {
        console.log(`    → Eliminats ${messagesDeleted.count} missatges`)
      }

      // Eliminar notificacions
      const notificationsDeleted = await prisma.notification.deleteMany({
        where: {
          OR: [
            { userId: user.id },
            { senderId: user.id }
          ]
        },
      })
      if (notificationsDeleted.count > 0) {
        console.log(`    → Eliminades ${notificationsDeleted.count} notificacions`)
      }

      // Desassignar empreses
      const companiesUpdated = await prisma.company.updateMany({
        where: { accountManagerId: user.id },
        data: { accountManagerId: null },
      })
      if (companiesUpdated.count > 0) {
        console.log(`    → Desassignades ${companiesUpdated.count} empreses`)
      }

      // Eliminar lead tasks
      const leadTasksDeleted = await prisma.leadTask.deleteMany({
        where: { userId: user.id },
      })
      if (leadTasksDeleted.count > 0) {
        console.log(`    → Eliminades ${leadTasksDeleted.count} lead tasks`)
      }

      // Finalment, eliminar l'usuari
      await prisma.user.delete({
        where: { id: user.id },
      })

      console.log(`  ✅ Eliminat: ${user.name || user.email}\n`)
      eliminats++
    } catch (error) {
      console.log(`  ⚠️  Error eliminant ${user.name}: ${(error as Error).message}\n`)
      errors++
    }
  }

  console.log('\n' + '═'.repeat(60))
  console.log('🎉 Neteja completada!')
  console.log(`   ✅ Usuaris eliminats: ${eliminats}`)
  if (errors > 0) {
    console.log(`   ⚠️  Errors: ${errors}`)
  }
  console.log(`   📋 Usuaris restants: ${realUsers.length}`)
  console.log('═'.repeat(60))
}

main()
  .catch((e) => {
    console.error('\n❌ Error:', e)
    process.exit(1)
  })