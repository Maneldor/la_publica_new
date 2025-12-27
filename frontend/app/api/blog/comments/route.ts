import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPendingComments, moderateComment } from '@/lib/services/blogService'
import { CommentStatus } from '@prisma/client'

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'CRM_CONTINGUT', 'ADMIN_GESTIO', 'MODERATOR']

// GET - Obtenir comentaris pendents de moderació
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || !ADMIN_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Accés denegat' }, { status: 403 })
    }

    const comments = await getPendingComments()

    return NextResponse.json({ comments })

  } catch (error) {
    console.error('Error obtenint comentaris:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// PATCH - Moderar comentari
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || !ADMIN_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Accés denegat' }, { status: 403 })
    }

    const { commentId, status } = await request.json()

    if (!commentId || !status) {
      return NextResponse.json({ error: 'Falten dades' }, { status: 400 })
    }

    if (!Object.values(CommentStatus).includes(status)) {
      return NextResponse.json({ error: 'Estat invàlid' }, { status: 400 })
    }

    const comment = await moderateComment(commentId, session.user.id, status)

    return NextResponse.json({ comment })

  } catch (error) {
    console.error('Error moderant comentari:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
