import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const userId = session.user.id
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Calcular inicio de semana (lunes)
    const startOfWeek = new Date(today)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
    startOfWeek.setDate(diff)

    // Ejecutar todas las queries en paralelo
    const [
      // Agenda del día
      todayEvents,
      todayGoal,
      
      // Hábitos de la semana
      habits,
      
      // Reflexiones de la semana
      weekReflections,
      
      // Notificaciones no leídas
      notifications,
      
      // Mensajes no leídos
      unreadMessages,
      
      // Ofertas activas
      offers,
      
      // Posts recientes
      recentPosts,
      
      // Conexiones
      connections,
      
      // Eventos próximos de la plataforma
      upcomingEvents,
      
      // Anuncios recientes
      announcements,
      
    ] = await Promise.all([
      // Eventos de hoy
      prisma.agendaEvent.findMany({
        where: { userId, date: today },
        orderBy: { time: 'asc' },
        take: 5
      }),
      
      // Objetivo de hoy con tareas
      prisma.agendaGoal.findUnique({
        where: { userId_date: { userId, date: today } },
        include: { tasks: { orderBy: { position: 'asc' } } }
      }),
      
      // Hábitos con logs de la semana
      prisma.agendaHabit.findMany({
        where: { userId, isActive: true },
        include: {
          logs: {
            where: { date: { gte: startOfWeek, lte: today } }
          }
        },
        orderBy: { position: 'asc' }
      }),
      
      // Reflexiones de la semana
      prisma.agendaReflection.count({
        where: {
          userId,
          date: { gte: startOfWeek, lte: today }
        }
      }),
      
      // Notificaciones no leídas (últimas 5)
      prisma.notification.findMany({
        where: { userId, isRead: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          sender: {
            select: { name: true, image: true }
          }
        }
      }),
      
      // Mensajes no leídos - contar conversaciones con mensajes no leídos
      prisma.conversation.count({
        where: {
          participants: {
            some: { userId }
          },
          messages: {
            some: {
              recipientId: userId,
              isRead: false
            }
          }
        }
      }),
      
      // Ofertas activas (3 más recientes)
      prisma.offer.findMany({
        where: {
          isActive: true,
          expiresAt: { gte: today }
        },
        include: { 
          company: { 
            select: { name: true, logo: true } 
          },
          category: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 3
      }),
      
      // Posts recientes (últimos 3)
      prisma.posts.findMany({
        where: { 
          isPublished: true,
          isArchived: false
        },
        include: {
          user: { 
            select: { name: true, image: true } 
          },
          _count: { 
            select: { 
              post_comments: true, 
              interactions: {
                where: { type: 'like' }
              }
            } 
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 3
      }),
      
      // Número de conexiones
      prisma.contacts.count({
        where: {
          OR: [
            { userId, status: 'accepted' },
            { contactUserId: userId, status: 'accepted' }
          ]
        }
      }),
      
      // Eventos próximos (próximos 7 días)
      prisma.events.findMany({
        where: {
          startDate: { 
            gte: today, 
            lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) 
          },
          isPublic: true
        },
        orderBy: { startDate: 'asc' },
        take: 3
      }),
      
      // Anuncios recientes de La Pública
      prisma.announcements.findMany({
        where: { 
          status: 'published',
          expiryDate: {
            OR: [
              { gte: today },
              { equals: null }
            ]
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 2
      }),
    ])

    // Calcular estadísticas de hábitos
    const habitStats = {
      total: habits.length,
      completedToday: habits.filter(h => 
        h.logs.some(l => {
          const logDate = new Date(l.date)
          return logDate.toDateString() === today.toDateString() && l.completed
        })
      ).length
    }

    // Calcular racha (días consecutivos con todos los hábitos completados)
    let streak = 0
    if (habits.length > 0) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - 1) // Empezar desde ayer
      
      while (streak < 365) { // Límite de seguridad
        const dayCompleted = habits.every(habit => 
          habit.logs.some(log => {
            const logDate = new Date(log.date)
            return logDate.toDateString() === checkDate.toDateString() && log.completed
          })
        )
        
        if (dayCompleted) {
          streak++
          checkDate.setDate(checkDate.getDate() - 1)
        } else {
          break
        }
      }
      
      // Verificar si hoy está completado para sumar a la racha
      const todayCompleted = habitStats.completedToday === habitStats.total && habitStats.total > 0
      if (todayCompleted) {
        streak++
      }
    }

    return NextResponse.json({
      agenda: {
        events: todayEvents,
        goal: todayGoal,
        eventsCount: todayEvents.length
      },
      progress: {
        streak,
        habitsCompleted: habitStats.completedToday,
        habitsTotal: habitStats.total,
        weekReflections,
        habitPercentage: habitStats.total > 0 
          ? Math.round((habitStats.completedToday / habitStats.total) * 100) 
          : 0
      },
      activity: {
        notifications,
        unreadNotifications: notifications.length,
        unreadMessages
      },
      offers,
      community: {
        recentPosts,
        connectionsCount: connections
      },
      platform: {
        upcomingEvents,
        announcements
      }
    })
  } catch (error) {
    console.error('Error loading avui data:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}