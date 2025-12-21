import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

/**
 * GET /api/admin/users/by-nick/[nick]
 * Obtiene detalles de un usuario por su nick o ID (fallback)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { nick: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    // Verificar rol de admin
    const adminUser = await prismaClient.user.findUnique({
      where: { email: session.user.email! },
      select: { userType: true }
    })

    if (!adminUser || adminUser.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'No autoritzat. Només administradors.' }, { status: 403 })
    }

    // Intentar buscar por nick primero, luego por ID
    let user = await prismaClient.user.findUnique({
      where: { nick: params.nick },
      include: {
        profile: true,
        education: true,
        experiences: true,
        skills: true,
        languages: true,
        socialLinks: true,
      }
    })

    // Si no se encuentra por nick, intentar por ID
    if (!user) {
      user = await prismaClient.user.findUnique({
        where: { id: params.nick },
        include: {
          profile: true,
          education: true,
          experiences: true,
          skills: true,
          languages: true,
          socialLinks: true,
        }
      })
    }

    if (!user) {
      return NextResponse.json({ error: 'Usuari no trobat' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error obtenint usuari per nick:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
