import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Obtenir configuració de privacitat d'un usuari
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 403 })
    }

    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        nick: true,
        email: true,
        hasSystemRestrictions: true,
        sensitiveJobCategory: true,
        privacySettings: true,
        profile: {
          select: {
            position: true,
            department: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuari no trobat' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error obtenint privacitat:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// PUT - Assignar categoria sensible a un usuari
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { sensitiveJobCategoryId, reason } = body

    // Obtenir usuari actual per al log
    const currentUser = await prisma.user.findUnique({
      where: { id },
      select: {
        sensitiveJobCategoryId: true,
        sensitiveJobCategory: { select: { name: true } },
      },
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'Usuari no trobat' }, { status: 404 })
    }

    // Si s'assigna una categoria, obtenir les seves restriccions
    let hasSystemRestrictions = false
    let categoryName = null

    if (sensitiveJobCategoryId) {
      const category = await prisma.sensitiveJobCategory.findUnique({
        where: { id: sensitiveJobCategoryId },
      })

      if (!category) {
        return NextResponse.json({ error: 'Categoria no trobada' }, { status: 404 })
      }

      hasSystemRestrictions = true
      categoryName = category.name

      // Aplicar restriccions forçades a la configuració de privacitat
      await prisma.userPrivacySettings.upsert({
        where: { userId: id },
        create: {
          userId: id,
          showPosition: !category.forceHidePosition,
          showDepartment: !category.forceHideDepartment,
          showBio: !category.forceHideBio,
          showLocation: !category.forceHideLocation,
          showPhone: !category.forceHidePhone,
          showEmail: !category.forceHideEmail,
          showGroups: !category.forceHideGroups,
        },
        update: {
          showPosition: !category.forceHidePosition,
          showDepartment: !category.forceHideDepartment,
          showBio: !category.forceHideBio,
          showLocation: !category.forceHideLocation,
          showPhone: !category.forceHidePhone,
          showEmail: !category.forceHideEmail,
          showGroups: !category.forceHideGroups,
        },
      })
    } else {
      // Si es treu la categoria, restaurar valors per defecte
      const globalConfig = await prisma.privacyConfig.findFirst()

      if (globalConfig) {
        await prisma.userPrivacySettings.upsert({
          where: { userId: id },
          create: {
            userId: id,
            showRealName: globalConfig.defaultShowRealName,
            showPosition: globalConfig.defaultShowPosition,
            showDepartment: globalConfig.defaultShowDepartment,
            showBio: globalConfig.defaultShowBio,
            showLocation: globalConfig.defaultShowLocation,
            showPhone: globalConfig.defaultShowPhone,
            showEmail: globalConfig.defaultShowEmail,
            showSocialLinks: globalConfig.defaultShowSocialLinks,
            showJoinedDate: globalConfig.defaultShowJoinedDate,
            showLastActive: globalConfig.defaultShowLastActive,
            showConnections: globalConfig.defaultShowConnections,
            showGroups: globalConfig.defaultShowGroups,
          },
          update: {
            showRealName: globalConfig.defaultShowRealName,
            showPosition: globalConfig.defaultShowPosition,
            showDepartment: globalConfig.defaultShowDepartment,
            showBio: globalConfig.defaultShowBio,
            showLocation: globalConfig.defaultShowLocation,
            showPhone: globalConfig.defaultShowPhone,
            showEmail: globalConfig.defaultShowEmail,
            showSocialLinks: globalConfig.defaultShowSocialLinks,
            showJoinedDate: globalConfig.defaultShowJoinedDate,
            showLastActive: globalConfig.defaultShowLastActive,
            showConnections: globalConfig.defaultShowConnections,
            showGroups: globalConfig.defaultShowGroups,
          },
        })
      }
    }

    // Actualitzar usuari
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        sensitiveJobCategoryId: sensitiveJobCategoryId || null,
        hasSystemRestrictions,
      },
      include: {
        sensitiveJobCategory: true,
        privacySettings: true,
      },
    })

    // Crear log d'auditoria
    await prisma.privacyAuditLog.create({
      data: {
        userId: id,
        changedById: session.user.id,
        changedByRole: 'ADMIN',
        fieldChanged: 'sensitiveJobCategory',
        oldValue: currentUser.sensitiveJobCategory?.name || null,
        newValue: categoryName,
        reason: reason || null,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error assignant categoria:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// PATCH - Actualitzar configuració de privacitat específica
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { settings, reason } = body

    // Obtenir usuari i la seva categoria sensible
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        sensitiveJobCategory: true,
        privacySettings: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuari no trobat' }, { status: 404 })
    }

    // Si té categoria sensible, no permetre canviar camps forçats
    const category = user.sensitiveJobCategory
    const sanitizedSettings = { ...settings }

    if (category) {
      // Eliminar camps que estan forçats per la categoria
      if (category.forceHidePosition) delete sanitizedSettings.showPosition
      if (category.forceHideDepartment) delete sanitizedSettings.showDepartment
      if (category.forceHideBio) delete sanitizedSettings.showBio
      if (category.forceHideLocation) delete sanitizedSettings.showLocation
      if (category.forceHidePhone) delete sanitizedSettings.showPhone
      if (category.forceHideEmail) delete sanitizedSettings.showEmail
      if (category.forceHideGroups) delete sanitizedSettings.showGroups
    }

    // Actualitzar configuració
    const updatedSettings = await prisma.userPrivacySettings.upsert({
      where: { userId: id },
      create: {
        userId: id,
        ...sanitizedSettings,
      },
      update: sanitizedSettings,
    })

    // Log d'auditoria per cada camp canviat
    const oldSettings = user.privacySettings || {}
    for (const [key, value] of Object.entries(sanitizedSettings)) {
      const oldValue = (oldSettings as Record<string, unknown>)[key]
      if (oldValue !== value) {
        await prisma.privacyAuditLog.create({
          data: {
            userId: id,
            changedById: session.user.id,
            changedByRole: 'ADMIN',
            fieldChanged: key,
            oldValue: String(oldValue ?? 'undefined'),
            newValue: String(value),
            reason: reason || null,
          },
        })
      }
    }

    return NextResponse.json(updatedSettings)
  } catch (error) {
    console.error('Error actualitzant privacitat:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
