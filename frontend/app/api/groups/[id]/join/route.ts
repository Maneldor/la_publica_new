import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const userId = session.user.id
  const { id: groupId } = await params

  try {
    // Obtenir el grup al qual vol unir-se (amb categoria sensible)
    const targetGroup = await prismaClient.group.findUnique({
      where: { id: groupId },
      select: {
        id: true,
        name: true,
        type: true,
        isActive: true,
        requiresApproval: true,
        sensitiveJobCategoryId: true,
        sensitiveJobCategory: true,
      }
    })

    if (!targetGroup) {
      return NextResponse.json({ error: 'Grup no trobat' }, { status: 404 })
    }

    if (!targetGroup.isActive) {
      return NextResponse.json({ error: 'Aquest grup no esta actiu' }, { status: 400 })
    }

    // Comprovar si ja es membre
    const existingMembership = await prismaClient.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        }
      }
    })

    if (existingMembership) {
      return NextResponse.json({ error: 'Ja ets membre d\'aquest grup' }, { status: 400 })
    }

    // Si el grup es PROFESSIONAL, comprovar restriccions
    if (targetGroup.type === 'PROFESSIONAL') {
      // Buscar si l'usuari ja es MEMBER d'un altre grup professional
      // (Moderadors i Admins de grup estan exempts)
      const existingProfessionalMembership = await prismaClient.groupMember.findFirst({
        where: {
          userId,
          role: 'MEMBER', // Nomes membres normals tenen restriccio
          group: {
            type: 'PROFESSIONAL',
          }
        },
        include: {
          group: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      })

      if (existingProfessionalMembership) {
        // BLOQUEJAR i crear alerta per admin
        await prismaClient.adminAlert.create({
          data: {
            type: 'MULTIPLE_PROFESSIONAL_GROUP_ATTEMPT',
            severity: 'MEDIUM',
            userId,
            title: 'Intent d\'unir-se a multiples grups professionals',
            message: `L'usuari ha intentat unir-se al grup professional "${targetGroup.name}" pero ja es membre de "${existingProfessionalMembership.group.name}".`,
            metadata: {
              currentGroupId: existingProfessionalMembership.group.id,
              currentGroupName: existingProfessionalMembership.group.name,
              requestedGroupId: targetGroup.id,
              requestedGroupName: targetGroup.name,
              attemptedAt: new Date().toISOString(),
            },
          }
        })

        return NextResponse.json({
          error: 'Ja ets membre d\'un grup professional. Nomes pots pertanyer a un grup professional alhora.',
          currentGroup: existingProfessionalMembership.group.name,
          needsAdminApproval: true,
        }, { status: 403 })
      }
    }

    // Crear la membresia
    const membership = await prismaClient.groupMember.create({
      data: {
        groupId,
        userId,
        role: 'MEMBER',
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            type: true,
          }
        }
      }
    })

    // Actualitzar comptador de membres del grup
    await prismaClient.group.update({
      where: { id: groupId },
      data: {
        membersCount: {
          increment: 1
        }
      }
    })

    // Si el grup és PROFESSIONAL i té categoria sensible, assignar-la a l'usuari
    let categoryAssigned = false
    if (targetGroup.type === 'PROFESSIONAL' && targetGroup.sensitiveJobCategoryId && targetGroup.sensitiveJobCategory) {
      const category = targetGroup.sensitiveJobCategory

      await prismaClient.$transaction(async (tx) => {
        // Actualitzar usuari amb la categoria
        await tx.user.update({
          where: { id: userId },
          data: {
            sensitiveJobCategoryId: targetGroup.sensitiveJobCategoryId,
            hasSystemRestrictions: true,
          }
        })

        // Crear o actualitzar UserPrivacySettings amb restriccions forçades
        await tx.userPrivacySettings.upsert({
          where: { userId },
          create: {
            userId,
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
            userId,
            changedById: userId,
            changedByRole: 'USER',
            fieldChanged: 'sensitiveJobCategory',
            oldValue: null,
            newValue: category.name,
            reason: `Assignada automàticament en unir-se al grup "${targetGroup.name}"`,
          }
        })
      })

      categoryAssigned = true
    }

    return NextResponse.json({
      success: true,
      membership,
      message: `T'has unit al grup "${targetGroup.name}" correctament`,
      categoryAssigned,
      hasSystemRestrictions: categoryAssigned,
    })

  } catch (error) {
    console.error('Error joining group:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
