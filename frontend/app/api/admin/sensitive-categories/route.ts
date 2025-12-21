import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

/**
 * GET /api/admin/sensitive-categories
 * Obtenir totes les categories sensibles
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    // Verificar permisos d'admin
    if (!session.user.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'No tens permisos' }, { status: 403 })
    }

    const categories = await prismaClient.sensitiveJobCategory.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        color: true,
        forceHidePosition: true,
        forceHideDepartment: true,
        forceHideBio: true,
        forceHideLocation: true,
        forceHidePhone: true,
        forceHideEmail: true,
        forceHideGroups: true,
        _count: {
          select: {
            users: true,
            groups: true,
          }
        }
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching sensitive categories:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
