import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Obtenir una alerta
export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 403 })
  }

  try {
    const { id } = await params

    const alert = await prismaClient.adminAlert.findUnique({
      where: { id },
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
          }
        }
      }
    })

    if (!alert) {
      return NextResponse.json({ error: 'Alerta no trobada' }, { status: 404 })
    }

    // Marcar com a llegida
    if (!alert.isRead) {
      await prismaClient.adminAlert.update({
        where: { id },
        data: { isRead: true }
      })
    }

    return NextResponse.json(alert)

  } catch (error) {
    console.error('Error fetching alert:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// PATCH - Actualitzar/Resoldre alerta
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 403 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { status, resolution, action } = body

    const alert = await prismaClient.adminAlert.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!alert) {
      return NextResponse.json({ error: 'Alerta no trobada' }, { status: 404 })
    }

    // Si es una sol-licitud de canvi de grup i s'aprova
    if (action === 'APPROVE_GROUP_CHANGE' && alert.type === 'PROFESSIONAL_GROUP_CHANGE_REQUEST') {
      const metadata = alert.metadata as { currentGroupId?: string; requestedGroupId?: string }

      await prismaClient.$transaction(async (tx) => {
        // 1. Treure de l'actual grup professional (si en té)
        if (metadata.currentGroupId) {
          await tx.groupMember.deleteMany({
            where: {
              userId: alert.userId,
              groupId: metadata.currentGroupId,
            }
          })

          await tx.group.update({
            where: { id: metadata.currentGroupId },
            data: { membersCount: { decrement: 1 } }
          })
        }

        // 2. Obtenir el grup destí amb la seva categoria sensible
        if (!metadata.requestedGroupId) {
          throw new Error('Grup destí no especificat')
        }

        const targetGroup = await tx.group.findUnique({
          where: { id: metadata.requestedGroupId },
          include: {
            sensitiveJobCategory: true
          }
        })

        if (!targetGroup) {
          throw new Error('Grup no trobat')
        }

        // 3. Afegir al nou grup
        await tx.groupMember.create({
          data: {
            userId: alert.userId,
            groupId: metadata.requestedGroupId,
            role: 'MEMBER',
          }
        })

        await tx.group.update({
          where: { id: metadata.requestedGroupId },
          data: { membersCount: { increment: 1 } }
        })

        // 4. Si el grup té categoria sensible, assignar-la a l'usuari
        if (targetGroup.sensitiveJobCategoryId && targetGroup.sensitiveJobCategory) {
          const category = targetGroup.sensitiveJobCategory

          // Actualitzar usuari amb la categoria
          await tx.user.update({
            where: { id: alert.userId },
            data: {
              sensitiveJobCategoryId: targetGroup.sensitiveJobCategoryId,
              hasSystemRestrictions: true,
            }
          })

          // Crear o actualitzar UserPrivacySettings amb restriccions forçades
          await tx.userPrivacySettings.upsert({
            where: { userId: alert.userId },
            create: {
              userId: alert.userId,
              showRealName: true,
              showPosition: !category.forceHidePosition,
              showDepartment: !category.forceHideDepartment,
              showBio: !category.forceHideBio,
              showLocation: !category.forceHideLocation,
              showPhone: !category.forceHidePhone,
              showEmail: !category.forceHideEmail,
              showSocialLinks: true,
              showJoinedDate: true,
              showLastActive: true,
              showConnections: true,
              showGroups: !category.forceHideGroups,
            },
            update: {
              // Només actualitzar els camps forçats per la categoria
              ...(category.forceHidePosition && { showPosition: false }),
              ...(category.forceHideDepartment && { showDepartment: false }),
              ...(category.forceHideBio && { showBio: false }),
              ...(category.forceHideLocation && { showLocation: false }),
              ...(category.forceHidePhone && { showPhone: false }),
              ...(category.forceHideEmail && { showEmail: false }),
              ...(category.forceHideGroups && { showGroups: false }),
            }
          })

          // Crear log d'auditoria
          await tx.privacyAuditLog.create({
            data: {
              userId: alert.userId,
              changedById: session.user.id,
              changedByRole: 'ADMIN',
              fieldChanged: 'sensitiveJobCategory',
              oldValue: null,
              newValue: category.name,
              reason: `Assignada automàticament en aprovar sol·licitud per unir-se al grup "${targetGroup.name}"`,
            }
          })
        }
      })
    }

    // Actualitzar l'alerta
    const updatedAlert = await prismaClient.adminAlert.update({
      where: { id },
      data: {
        status: status || 'RESOLVED',
        resolution,
        resolvedAt: new Date(),
        resolvedById: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            nick: true,
          }
        }
      }
    })

    return NextResponse.json(updatedAlert)

  } catch (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar alerta
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 403 })
  }

  try {
    const { id } = await params

    await prismaClient.adminAlert.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting alert:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
