import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'
import { userHasProfessionalGroup } from '@/lib/group-visibility'

interface RouteParams {
  params: Promise<{ id: string; requestId: string }>
}

/**
 * GET /api/groups/[id]/requests/[requestId]
 * Obtenir detalls d'una sol·licitud
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { id: groupId, requestId } = await params

  try {
    // Verificar permisos
    const membership = await prismaClient.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId: session.user.id }
      }
    })

    if (!membership || !['ADMIN', 'MODERATOR'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'No tens permisos' },
        { status: 403 }
      )
    }

    const joinRequest = await prismaClient.groupJoinRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: {
            id: true,
            nick: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
            cargo: true,
            createdAt: true,
            profile: {
              select: {
                position: true,
                department: true,
                bio: true,
              }
            }
          }
        },
        group: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            sensitiveJobCategoryId: true,
          }
        },
        reviewedBy: {
          select: {
            id: true,
            nick: true,
            name: true,
            image: true,
          }
        }
      }
    })

    if (!joinRequest || joinRequest.groupId !== groupId) {
      return NextResponse.json({ error: 'Sol·licitud no trobada' }, { status: 404 })
    }

    return NextResponse.json({ request: joinRequest })

  } catch (error) {
    console.error('Error fetching join request:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

/**
 * PATCH /api/groups/[id]/requests/[requestId]
 * Aprovar o rebutjar sol·licitud
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { id: groupId, requestId } = await params
  const reviewerId = session.user.id

  try {
    // Verificar permisos
    const membership = await prismaClient.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId: reviewerId }
      }
    })

    if (!membership || !['ADMIN', 'MODERATOR'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'No tens permisos per gestionar sol·licituds' },
        { status: 403 }
      )
    }

    // Obtenir sol·licitud amb grup
    const joinRequest = await prismaClient.groupJoinRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: {
            id: true,
            nick: true,
            name: true,
          }
        },
        group: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            sensitiveJobCategoryId: true,
          }
        }
      }
    })

    if (!joinRequest || joinRequest.groupId !== groupId) {
      return NextResponse.json({ error: 'Sol·licitud no trobada' }, { status: 404 })
    }

    if (joinRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Aquesta sol·licitud ja ha estat processada' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { action, note } = body

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Acció invàlida. Ha de ser "approve" o "reject"' },
        { status: 400 }
      )
    }

    const userId = joinRequest.userId
    const group = joinRequest.group

    // Si és APROVAR
    if (action === 'approve') {
      // Verificar restricció de grup professional
      if (group.type === 'PROFESSIONAL') {
        const hasProfessional = await userHasProfessionalGroup(userId)
        if (hasProfessional) {
          return NextResponse.json(
            { error: 'L\'usuari ja pertany a un grup professional' },
            { status: 400 }
          )
        }
      }

      // Usar transacció per garantir consistència
      await prismaClient.$transaction(async (tx) => {
        // Actualitzar sol·licitud
        await tx.groupJoinRequest.update({
          where: { id: requestId },
          data: {
            status: 'APPROVED',
            reviewedById: reviewerId,
            reviewedAt: new Date(),
            reviewNote: note || null,
          }
        })

        // Crear membre
        await tx.groupMember.create({
          data: {
            groupId,
            userId,
            role: 'MEMBER',
          }
        })

        // Si és grup PROFESSIONAL amb categoria sensible, assignar-la
        if (group.type === 'PROFESSIONAL' && group.sensitiveJobCategoryId) {
          await tx.user.update({
            where: { id: userId },
            data: { sensitiveJobCategoryId: group.sensitiveJobCategoryId }
          })
        }

        // Notificar l'usuari
        await tx.notification.create({
          data: {
            userId,
            senderId: reviewerId,
            type: 'GROUP_REQUEST_APPROVED',
            title: 'Sol·licitud acceptada',
            message: `La teva sol·licitud per unir-te al grup "${group.name}" ha estat acceptada!`,
            actionUrl: `/dashboard/grups/${group.slug}`,
            metadata: {
              groupId: group.id,
              groupName: group.name,
              groupSlug: group.slug,
            }
          }
        })
      })

      return NextResponse.json({
        success: true,
        message: 'Sol·licitud aprovada. L\'usuari ara és membre del grup.',
        status: 'APPROVED',
      })
    }

    // Si és REBUTJAR
    if (action === 'reject') {
      await prismaClient.$transaction(async (tx) => {
        // Actualitzar sol·licitud
        await tx.groupJoinRequest.update({
          where: { id: requestId },
          data: {
            status: 'REJECTED',
            reviewedById: reviewerId,
            reviewedAt: new Date(),
            reviewNote: note || null,
          }
        })

        // Notificar l'usuari
        await tx.notification.create({
          data: {
            userId,
            senderId: reviewerId,
            type: 'GROUP_REQUEST_REJECTED',
            title: 'Sol·licitud rebutjada',
            message: note
              ? `La teva sol·licitud per unir-te al grup "${group.name}" ha estat rebutjada: ${note}`
              : `La teva sol·licitud per unir-te al grup "${group.name}" ha estat rebutjada.`,
            actionUrl: `/dashboard/grups`,
            metadata: {
              groupId: group.id,
              groupName: group.name,
            }
          }
        })
      })

      return NextResponse.json({
        success: true,
        message: 'Sol·licitud rebutjada.',
        status: 'REJECTED',
      })
    }

  } catch (error) {
    console.error('Error processing join request:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
