import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

/**
 * GET /api/admin/groups/requests/[id]
 * Obtenir detalls d'una sol·licitud
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  const { id } = await params

  if (!session?.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 403 })
  }

  try {
    const joinRequest = await prismaClient.groupJoinRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            nick: true,
            email: true,
            image: true,
            createdAt: true,
          }
        },
        group: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            description: true,
            sensitiveJobCategory: true,
            members: {
              where: { role: 'ADMIN' },
              select: { userId: true }
            }
          }
        }
      }
    })

    if (!joinRequest) {
      return NextResponse.json({ error: 'Sol·licitud no trobada' }, { status: 404 })
    }

    return NextResponse.json({
      ...joinRequest,
      hasGroupAdmin: joinRequest.group.members.length > 0
    })

  } catch (error) {
    console.error('Error fetching request:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/groups/requests/[id]
 * Aprovar o rebutjar sol·licitud (admin del sistema)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  const { id } = await params

  if (!session?.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { action, responseMessage } = body

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Acció no vàlida' }, { status: 400 })
    }

    // Obtenir la sol·licitud amb info del grup
    const joinRequest = await prismaClient.groupJoinRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            nick: true,
          }
        },
        group: {
          select: {
            id: true,
            name: true,
            type: true,
            sensitiveJobCategoryId: true,
            members: {
              where: { role: 'ADMIN' },
              select: { userId: true }
            }
          }
        }
      }
    })

    if (!joinRequest) {
      return NextResponse.json({ error: 'Sol·licitud no trobada' }, { status: 404 })
    }

    if (joinRequest.status !== 'PENDING') {
      return NextResponse.json({ error: 'La sol·licitud ja ha estat processada' }, { status: 400 })
    }

    // Verificar que el grup no té admin (si en té, hauria de gestionar-ho l'admin del grup)
    if (joinRequest.group.members.length > 0) {
      return NextResponse.json(
        { error: 'Aquest grup té administrador. La sol·licitud s\'ha de gestionar des del grup.' },
        { status: 400 }
      )
    }

    if (action === 'approve') {
      // Aprovar sol·licitud
      await prismaClient.$transaction(async (tx) => {
        // Actualitzar sol·licitud
        await tx.groupJoinRequest.update({
          where: { id },
          data: {
            status: 'APPROVED',
            reviewedById: session.user.id,
            reviewedAt: new Date(),
            reviewNote: responseMessage || null,
          }
        })

        // Crear membre
        await tx.groupMember.create({
          data: {
            groupId: joinRequest.group.id,
            userId: joinRequest.user.id,
            role: 'MEMBER',
          }
        })

        // Actualitzar comptador
        await tx.group.update({
          where: { id: joinRequest.group.id },
          data: {
            membersCount: { increment: 1 }
          }
        })

        // Si és grup PROFESSIONAL amb categoria sensible, assignar a l'usuari
        if (joinRequest.group.type === 'PROFESSIONAL' && joinRequest.group.sensitiveJobCategoryId) {
          await tx.user.update({
            where: { id: joinRequest.user.id },
            data: { sensitiveJobCategoryId: joinRequest.group.sensitiveJobCategoryId }
          })
        }

        // Crear notificació per l'usuari
        await tx.notification.create({
          data: {
            userId: joinRequest.user.id,
            type: 'GROUP_REQUEST_APPROVED',
            title: 'Sol·licitud acceptada',
            message: `La teva sol·licitud per unir-te a "${joinRequest.group.name}" ha estat acceptada per un administrador del sistema.`,
            metadata: {
              groupId: joinRequest.group.id,
              groupName: joinRequest.group.name,
            }
          }
        })
      })

      return NextResponse.json({
        success: true,
        message: `S'ha aprovat la sol·licitud de ${joinRequest.user.name || joinRequest.user.nick}`
      })

    } else {
      // Rebutjar sol·licitud
      await prismaClient.$transaction(async (tx) => {
        await tx.groupJoinRequest.update({
          where: { id },
          data: {
            status: 'REJECTED',
            reviewedById: session.user.id,
            reviewedAt: new Date(),
            reviewNote: responseMessage || null,
          }
        })

        // Crear notificació
        await tx.notification.create({
          data: {
            userId: joinRequest.user.id,
            type: 'GROUP_REQUEST_REJECTED',
            title: 'Sol·licitud rebutjada',
            message: responseMessage
              ? `La teva sol·licitud per unir-te a "${joinRequest.group.name}" ha estat rebutjada: ${responseMessage}`
              : `La teva sol·licitud per unir-te a "${joinRequest.group.name}" ha estat rebutjada per un administrador del sistema.`,
            metadata: {
              groupId: joinRequest.group.id,
              groupName: joinRequest.group.name,
            }
          }
        })
      })

      return NextResponse.json({
        success: true,
        message: `S'ha rebutjat la sol·licitud de ${joinRequest.user.name || joinRequest.user.nick}`
      })
    }

  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
