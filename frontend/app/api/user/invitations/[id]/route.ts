import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/user/invitations/[id]
 * Obtenir detalls d'una invitació
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { id: invitationId } = await params

  try {
    const invitation = await prismaClient.groupInvitation.findUnique({
      where: { id: invitationId },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            image: true,
            type: true,
            membersCount: true,
          }
        },
        invitedBy: {
          select: {
            id: true,
            name: true,
            nick: true,
            image: true,
          }
        }
      }
    })

    if (!invitation || invitation.userId !== session.user.id) {
      return NextResponse.json({ error: 'Invitació no trobada' }, { status: 404 })
    }

    return NextResponse.json({ invitation })

  } catch (error) {
    console.error('Error fetching invitation:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

/**
 * PATCH /api/user/invitations/[id]
 * Acceptar o rebutjar invitació
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { id: invitationId } = await params
  const userId = session.user.id

  try {
    const invitation = await prismaClient.groupInvitation.findUnique({
      where: { id: invitationId },
      include: {
        group: {
          include: {
            sensitiveJobCategory: true
          }
        }
      }
    })

    if (!invitation || invitation.userId !== userId) {
      return NextResponse.json({ error: 'Invitació no trobada' }, { status: 404 })
    }

    if (invitation.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Aquesta invitació ja ha estat processada' },
        { status: 400 }
      )
    }

    // Verificar expiració
    if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
      await prismaClient.groupInvitation.update({
        where: { id: invitationId },
        data: { status: 'EXPIRED' }
      })
      return NextResponse.json(
        { error: 'Aquesta invitació ha expirat' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { action } = body // 'accept' | 'reject'

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Acció no vàlida' }, { status: 400 })
    }

    const group = invitation.group

    if (action === 'accept') {
      // Acceptar invitació
      await prismaClient.$transaction(async (tx) => {
        // Actualitzar invitació
        await tx.groupInvitation.update({
          where: { id: invitationId },
          data: {
            status: 'ACCEPTED',
            respondedAt: new Date(),
          }
        })

        // Afegir com a membre
        await tx.groupMember.create({
          data: {
            groupId: group.id,
            userId,
            role: 'MEMBER',
          }
        })

        // Incrementar comptador
        await tx.group.update({
          where: { id: group.id },
          data: { membersCount: { increment: 1 } }
        })

        // Si el grup té categoria sensible, assignar-la
        if (group.sensitiveJobCategoryId && group.sensitiveJobCategory) {
          const category = group.sensitiveJobCategory

          await tx.user.update({
            where: { id: userId },
            data: {
              sensitiveJobCategoryId: group.sensitiveJobCategoryId,
              hasSystemRestrictions: true,
            }
          })

          // Actualitzar configuració de privacitat
          await tx.userPrivacySettings.upsert({
            where: { userId },
            create: {
              userId,
              showPosition: !category.forceHidePosition,
              showDepartment: !category.forceHideDepartment,
              showBio: !category.forceHideBio,
              showLocation: !category.forceHideLocation,
              showPhone: !category.forceHidePhone,
              showEmail: !category.forceHideEmail,
              showGroups: !category.forceHideGroups,
            },
            update: {
              ...(category.forceHidePosition && { showPosition: false }),
              ...(category.forceHideDepartment && { showDepartment: false }),
              ...(category.forceHideBio && { showBio: false }),
              ...(category.forceHideLocation && { showLocation: false }),
              ...(category.forceHidePhone && { showPhone: false }),
              ...(category.forceHideEmail && { showEmail: false }),
              ...(category.forceHideGroups && { showGroups: false }),
            }
          })

          // Registrar al audit log
          await tx.privacyAuditLog.create({
            data: {
              userId,
              changedById: userId,
              changedByRole: 'USER',
              fieldChanged: 'sensitiveJobCategory',
              oldValue: null,
              newValue: category.name,
              reason: `Assignada en acceptar invitació al grup "${group.name}"`,
            }
          })
        }

        // Notificar qui va convidar
        await tx.notification.create({
          data: {
            userId: invitation.invitedById,
            senderId: userId,
            type: 'GROUP_INVITATION_ACCEPTED',
            title: 'Invitació acceptada',
            content: `${session.user.name || session.user.nick} ha acceptat la invitació al grup "${group.name}"`,
            link: `/dashboard/grups/${group.slug}`,
          }
        })
      })

      return NextResponse.json({
        success: true,
        message: `T'has unit al grup "${group.name}"`,
        groupSlug: group.slug,
      })

    } else {
      // Rebutjar invitació
      await prismaClient.$transaction(async (tx) => {
        await tx.groupInvitation.update({
          where: { id: invitationId },
          data: {
            status: 'REJECTED',
            respondedAt: new Date(),
          }
        })

        // Notificar qui va convidar
        await tx.notification.create({
          data: {
            userId: invitation.invitedById,
            senderId: userId,
            type: 'GROUP_INVITATION_REJECTED',
            title: 'Invitació rebutjada',
            content: `${session.user.name || session.user.nick} ha rebutjat la invitació al grup "${group.name}"`,
            link: `/dashboard/grups/${group.slug}/gestio/invitacions`,
          }
        })
      })

      return NextResponse.json({
        success: true,
        message: 'Invitació rebutjada',
      })
    }

  } catch (error) {
    console.error('Error processing invitation:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
