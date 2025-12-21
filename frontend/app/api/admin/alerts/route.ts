import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// GET - Llistar alertes
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const severity = searchParams.get('severity')

    const where: Prisma.AdminAlertWhereInput = {}
    if (status && status !== 'all') where.status = status as Prisma.EnumAlertStatusFilter['equals']
    if (type && type !== 'all') where.type = type as Prisma.EnumAlertTypeFilter['equals']
    if (severity && severity !== 'all') where.severity = severity as Prisma.EnumAlertSeverityFilter['equals']

    const [alerts, total, unreadCount] = await Promise.all([
      prismaClient.adminAlert.findMany({
        where,
        orderBy: [
          { status: 'asc' }, // PENDING primer
          { severity: 'desc' }, // CRITICAL primer
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              nick: true,
              email: true,
              image: true,
            }
          },
          resolvedBy: {
            select: {
              id: true,
              name: true,
              nick: true,
            }
          }
        }
      }),
      prismaClient.adminAlert.count({ where }),
      prismaClient.adminAlert.count({ where: { isRead: false } })
    ])

    return NextResponse.json({
      alerts,
      total,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })

  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
