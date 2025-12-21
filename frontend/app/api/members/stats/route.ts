import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

/**
 * GET /api/members/stats
 * Obtenir estadístiques reals de membres
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    const twoMonthsAgo = new Date()
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)

    // Base filter: solo empleados públicos (no CRM, Gestores, Empresas, etc.)
    const employeeFilter = { userType: 'EMPLOYEE' as const }

    // Executar totes les consultes en paral·lel per eficiència
    const [
      totalMembers,
      totalLastMonth,
      newToday,
      newYesterday,
      activeThisMonth,
      activeLastMonth,
      onlineNow,
      myConnections,
      pendingReceived,
      pendingSent
    ] = await Promise.all([
      // Total membres actius (solo empleados públicos)
      prismaClient.user.count({
        where: { isActive: true, ...employeeFilter }
      }),

      // Total mes passat (per calcular tendència)
      prismaClient.user.count({
        where: {
          isActive: true,
          ...employeeFilter,
          createdAt: { lt: oneMonthAgo }
        }
      }),

      // Nous avui
      prismaClient.user.count({
        where: {
          ...employeeFilter,
          createdAt: { gte: todayStart }
        }
      }),

      // Nous ahir (per calcular tendència)
      prismaClient.user.count({
        where: {
          ...employeeFilter,
          createdAt: {
            gte: yesterdayStart,
            lt: todayStart
          }
        }
      }),

      // Actius aquest mes (amb activitat recent)
      prismaClient.user.count({
        where: {
          isActive: true,
          ...employeeFilter,
          OR: [
            { isOnline: true },
            { lastSeenAt: { gte: oneMonthAgo } },
            { lastLogin: { gte: oneMonthAgo } }
          ]
        }
      }),

      // Actius mes passat (per tendència)
      prismaClient.user.count({
        where: {
          isActive: true,
          ...employeeFilter,
          OR: [
            { lastSeenAt: { gte: twoMonthsAgo, lt: oneMonthAgo } },
            { lastLogin: { gte: twoMonthsAgo, lt: oneMonthAgo } }
          ]
        }
      }),

      // En línia ara
      prismaClient.user.count({
        where: {
          isOnline: true,
          ...employeeFilter
        }
      }),

      // Les meves connexions acceptades
      prismaClient.userConnection.count({
        where: {
          OR: [
            { senderId: session.user.id, status: 'ACCEPTED' },
            { receiverId: session.user.id, status: 'ACCEPTED' }
          ]
        }
      }),

      // Sol·licituds pendents rebudes
      prismaClient.userConnection.count({
        where: {
          receiverId: session.user.id,
          status: 'PENDING'
        }
      }),

      // Sol·licituds pendents enviades
      prismaClient.userConnection.count({
        where: {
          senderId: session.user.id,
          status: 'PENDING'
        }
      })
    ])

    // Funcions de format
    const formatNumber = (num: number): string => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
      return num.toString()
    }

    const calculateTrend = (current: number, previous: number): string => {
      if (previous === 0) return current > 0 ? `+${current}` : '0'
      const diff = current - previous
      const percent = Math.round((diff / previous) * 100)
      if (percent === 0) return '='
      return percent > 0 ? `+${percent}%` : `${percent}%`
    }

    const diffTrend = (current: number, previous: number): string => {
      const diff = current - previous
      if (diff === 0) return '='
      return diff > 0 ? `+${diff}` : `${diff}`
    }

    return NextResponse.json({
      stats: [
        {
          label: 'Total Membres',
          value: formatNumber(totalMembers),
          trend: calculateTrend(totalMembers, totalLastMonth),
          rawValue: totalMembers
        },
        {
          label: 'Nous Avui',
          value: newToday.toString(),
          trend: diffTrend(newToday, newYesterday),
          rawValue: newToday
        },
        {
          label: 'Actius Aquest Mes',
          value: formatNumber(activeThisMonth),
          trend: calculateTrend(activeThisMonth, activeLastMonth),
          rawValue: activeThisMonth
        },
        {
          label: 'En Línia Ara',
          value: onlineNow.toString(),
          trend: onlineNow > 0 ? `🟢` : '',
          rawValue: onlineNow
        }
      ],
      myStats: {
        connections: myConnections,
        pendingReceived,
        pendingSent
      }
    })
  } catch (error) {
    console.error('Error obtenint estadístiques:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
