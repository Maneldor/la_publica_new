import { prisma } from '@/lib/prisma'

export async function seedUserAgenda(userId: string): Promise<void> {
  // Verificar si el usuario ya tiene configuración
  const existingConfig = await prisma.agendaUserConfig.findUnique({
    where: { userId }
  })

  if (existingConfig) {
    return // Ya tiene datos, no hacer nada
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Crear todo en una transacción
  await prisma.$transaction(async (tx) => {
    // 1. Crear configuración del usuario
    await tx.agendaUserConfig.create({
      data: {
        userId,
        hasCompletedSetup: true,
        showBaseModules: {
          events: true,
          goals: true,
          habits: true,
          reflection: true
        }
      }
    })

    // 2. Crear eventos de ejemplo para hoy
    await tx.agendaEvent.createMany({
      data: [
        { userId, date: today, time: '09:00', title: "Reunió d'equip", description: 'Revisió setmanal de projectes' },
        { userId, date: today, time: '11:30', title: 'Trucada amb client', description: null },
        { userId, date: today, time: '14:00', title: 'Dinar', description: null },
        { userId, date: today, time: '16:00', title: 'Revisió documents', description: 'Preparar informe mensual' },
      ]
    })

    // 3. Crear objetivo del día con tareas
    const goal = await tx.agendaGoal.create({
      data: {
        userId,
        date: today,
        text: 'Avançar amb el projecte X'
      }
    })

    await tx.agendaTask.createMany({
      data: [
        { goalId: goal.id, text: 'Revisar documentació', completed: true, position: 0 },
        { goalId: goal.id, text: 'Enviar correus pendents', completed: false, position: 1 },
        { goalId: goal.id, text: 'Preparar presentació', completed: false, position: 2 },
      ]
    })

    // 4. Crear hábitos de ejemplo
    const habits = await Promise.all([
      tx.agendaHabit.create({ data: { userId, emoji: '🏃', name: 'Exercici', position: 0 } }),
      tx.agendaHabit.create({ data: { userId, emoji: '📚', name: 'Lectura', position: 1 } }),
      tx.agendaHabit.create({ data: { userId, emoji: '💧', name: 'Aigua (2L)', position: 2 } }),
      tx.agendaHabit.create({ data: { userId, emoji: '🧘', name: 'Meditació', position: 3 } }),
    ])

    // 5. Crear logs de hábitos para la última semana (datos de ejemplo)
    const habitLogs: { habitId: string; date: Date; completed: boolean }[] = []
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      // Ejercicio: L, M, J, S
      if ([1, 2, 4, 6].includes(date.getDay())) {
        habitLogs.push({ habitId: habits[0].id, date, completed: true })
      }
      // Lectura: L, X, J, V
      if ([1, 3, 4, 5].includes(date.getDay())) {
        habitLogs.push({ habitId: habits[1].id, date, completed: true })
      }
      // Agua: todos los días
      habitLogs.push({ habitId: habits[2].id, date, completed: true })
      // Meditación: ningún día (para que el usuario vea que puede mejorar)
    }

    await tx.agendaHabitLog.createMany({ data: habitLogs })

    // 6. Crear módulos opcionales (todos inactivos por defecto)
    const moduleTypes = [
      'desafiament', 'agraiments', 'conclusions', 'lectures',
      'viatges', 'triangles', 'capsula', 'visualitzacions', 'diari'
    ]

    await tx.agendaModule.createMany({
      data: moduleTypes.map((type, index) => ({
        userId,
        moduleType: type,
        isActive: false,
        position: index
      }))
    })
  })
}