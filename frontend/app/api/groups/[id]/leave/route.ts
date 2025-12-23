import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/groups/[id]/leave
 * Sortir d'un grup
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { id: groupId } = await params
  const userId = session.user.id

  try {
    // Verificar que l'usuari és membre
    const membership = await prismaClient.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId }
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            sensitiveJobCategoryId: true,
            sensitiveJobCategory: true,
          }
        }
      }
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'No ets membre d\'aquest grup' },
        { status: 400 }
      )
    }

    // Verificar que no és l'únic admin
    if (membership.role === 'ADMIN') {
      const adminCount = await prismaClient.groupMember.count({
        where: {
          groupId,
          role: 'ADMIN'
        }
      })

      if (adminCount === 1) {
        return NextResponse.json(
          { error: 'No pots sortir del grup sent l\'únic administrador. Assigna un altre admin primer.' },
          { status: 400 }
        )
      }
    }

    // Transacció per sortir del grup
    await prismaClient.$transaction(async (tx) => {
      // Eliminar membre
      await tx.groupMember.delete({
        where: {
          groupId_userId: { groupId, userId }
        }
      })

      // Decrementar comptador
      await tx.group.update({
        where: { id: groupId },
        data: { membersCount: { decrement: 1 } }
      })

      // Si era un grup PROFESSIONAL amb categoria sensible, treure-la de l'usuari
      if (membership.group.type === 'PROFESSIONAL' &&
          membership.group.sensitiveJobCategoryId) {

        // Verificar que la categoria de l'usuari és la mateixa del grup
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { sensitiveJobCategoryId: true }
        })

        if (user?.sensitiveJobCategoryId === membership.group.sensitiveJobCategoryId) {
          // Treure categoria sensible
          await tx.user.update({
            where: { id: userId },
            data: {
              sensitiveJobCategoryId: null,
              hasSystemRestrictions: false,
            }
          })

          // Restaurar privacitat per defecte (intenta actualitzar si existeix)
          await tx.userPrivacySettings.upsert({
            where: { userId },
            create: {
              userId,
              showPosition: true,
              showDepartment: true,
              showBio: true,
              showLocation: true,
              showPhone: false, // Per defecte privat
              showEmail: false, // Per defecte privat
              showGroups: true,
              showRealName: true,
              showSocialLinks: true,
              showJoinedDate: true,
              showLastActive: true,
              showConnections: true,
            },
            update: {
              showPosition: true,
              showDepartment: true,
              showBio: true,
              showLocation: true,
              showGroups: true,
            }
          })

          // Audit log
          await tx.privacyAuditLog.create({
            data: {
              userId,
              changedById: userId,
              changedByRole: 'USER',
              fieldChanged: 'sensitiveJobCategory',
              oldValue: membership.group.sensitiveJobCategory?.name || membership.group.sensitiveJobCategoryId,
              newValue: null,
              reason: `Eliminada en sortir del grup "${membership.group.name}"`,
            }
          })
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `Has sortit del grup "${membership.group.name}"`,
      groupSlug: membership.group.slug,
    })

  } catch (error) {
    console.error('Error leaving group:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
