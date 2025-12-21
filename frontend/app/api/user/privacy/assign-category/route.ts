import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

/**
 * POST /api/user/privacy/assign-category
 * Assigna una categoria sensible a l'usuari actual
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  try {
    const { categoryId } = await request.json()

    if (!categoryId) {
      return NextResponse.json({ error: 'ID de categoria requerit' }, { status: 400 })
    }

    // Obtenir la categoria
    const category = await prismaClient.sensitiveJobCategory.findUnique({
      where: { id: categoryId }
    })

    if (!category || !category.isActive) {
      return NextResponse.json({ error: 'Categoria no trobada o inactiva' }, { status: 404 })
    }

    // Actualitzar usuari i crear/actualitzar privacitat en una transacció
    await prismaClient.$transaction(async (tx) => {
      // Actualitzar usuari amb la categoria
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          sensitiveJobCategoryId: categoryId,
          hasSystemRestrictions: true,
        }
      })

      // Crear o actualitzar UserPrivacySettings amb restriccions forçades
      await tx.userPrivacySettings.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          showRealName: true,
          showPosition: !category.forceHidePosition,
          showDepartment: !category.forceHideDepartment,
          showBio: !category.forceHideBio,
          showLocation: !category.forceHideLocation,
          showPhone: !category.forceHidePhone,
          showEmail: !category.forceHideEmail,
          showGroups: !category.forceHideGroups,
          showConnections: true,
          showLastActive: true,
          showJoinedDate: true,
          showSocialLinks: true,
        },
        update: {
          showPosition: !category.forceHidePosition,
          showDepartment: !category.forceHideDepartment,
          showBio: !category.forceHideBio,
          showLocation: !category.forceHideLocation,
          showPhone: !category.forceHidePhone,
          showEmail: !category.forceHideEmail,
          showGroups: !category.forceHideGroups,
        }
      })

      // Crear log d'auditoria
      await tx.privacyAuditLog.create({
        data: {
          userId: session.user.id,
          changedById: session.user.id,
          changedByRole: 'USER',
          fieldChanged: 'sensitiveJobCategory',
          oldValue: null,
          newValue: category.name,
          reason: 'Auto-detecció acceptada per l\'usuari',
        }
      })
    })

    return NextResponse.json({
      success: true,
      message: `Categoria "${category.name}" assignada correctament`,
      hasSystemRestrictions: true,
      category: {
        id: category.id,
        name: category.name,
      }
    })

  } catch (error) {
    console.error('Error assigning category:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

/**
 * DELETE /api/user/privacy/assign-category
 * Elimina la categoria sensible de l'usuari (si és admin)
 */
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  // Només admins poden eliminar categories assignades
  if (!session.user.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'No tens permisos' }, { status: 403 })
  }

  try {
    const { userId, reason } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'ID d\'usuari requerit' }, { status: 400 })
    }

    // Obtenir usuari actual amb categoria
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      include: { sensitiveJobCategory: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuari no trobat' }, { status: 404 })
    }

    const oldCategory = user.sensitiveJobCategory?.name || null

    // Actualitzar usuari
    await prismaClient.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          sensitiveJobCategoryId: null,
          hasSystemRestrictions: false,
        }
      })

      // Crear log d'auditoria
      await tx.privacyAuditLog.create({
        data: {
          userId: userId,
          changedById: session.user.id,
          changedByRole: 'ADMIN',
          fieldChanged: 'sensitiveJobCategory',
          oldValue: oldCategory,
          newValue: null,
          reason: reason || 'Eliminada per administrador',
        }
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Categoria eliminada correctament',
    })

  } catch (error) {
    console.error('Error removing category:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
