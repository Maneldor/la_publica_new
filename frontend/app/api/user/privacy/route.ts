import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtenir la meva configuració de privacitat
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        hasSystemRestrictions: true,
        sensitiveJobCategory: {
          select: {
            id: true,
            name: true,
            description: true,
            forceHidePosition: true,
            forceHideDepartment: true,
            forceHideBio: true,
            forceHideLocation: true,
            forceHidePhone: true,
            forceHideEmail: true,
            forceHideGroups: true,
          },
        },
        privacySettings: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuari no trobat' }, { status: 404 })
    }

    // Obtenir configuració global per saber què es pot canviar
    const globalConfig = await prisma.privacyConfig.findFirst()

    // Si no té privacySettings, crear-les amb valors per defecte
    let privacySettings = user.privacySettings
    if (!privacySettings && globalConfig) {
      privacySettings = await prisma.userPrivacySettings.create({
        data: {
          userId: session.user.id,
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

    return NextResponse.json({
      id: user.id,
      hasSystemRestrictions: user.hasSystemRestrictions,
      sensitiveJobCategory: user.sensitiveJobCategory,
      privacySettings,
      canChangePrivacy: globalConfig?.allowUsersToChangePrivacy ?? true,
    })
  } catch (error) {
    console.error('Error obtenint privacitat:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// PATCH - Actualitzar la meva configuració de privacitat
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    // Verificar si l'usuari pot canviar la seva privacitat
    const globalConfig = await prisma.privacyConfig.findFirst()

    if (!globalConfig?.allowUsersToChangePrivacy) {
      return NextResponse.json(
        { error: 'No tens permís per canviar la configuració de privacitat' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Obtenir usuari amb categoria sensible
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        sensitiveJobCategory: true,
        privacySettings: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuari no trobat' }, { status: 404 })
    }

    // Filtrar camps que estan forçats per la categoria sensible
    const category = user.sensitiveJobCategory
    const sanitizedSettings = { ...body }
    const blockedFields: string[] = []

    if (category) {
      if (category.forceHidePosition && 'showPosition' in sanitizedSettings) {
        delete sanitizedSettings.showPosition
        blockedFields.push('showPosition')
      }
      if (category.forceHideDepartment && 'showDepartment' in sanitizedSettings) {
        delete sanitizedSettings.showDepartment
        blockedFields.push('showDepartment')
      }
      if (category.forceHideBio && 'showBio' in sanitizedSettings) {
        delete sanitizedSettings.showBio
        blockedFields.push('showBio')
      }
      if (category.forceHideLocation && 'showLocation' in sanitizedSettings) {
        delete sanitizedSettings.showLocation
        blockedFields.push('showLocation')
      }
      if (category.forceHidePhone && 'showPhone' in sanitizedSettings) {
        delete sanitizedSettings.showPhone
        blockedFields.push('showPhone')
      }
      if (category.forceHideEmail && 'showEmail' in sanitizedSettings) {
        delete sanitizedSettings.showEmail
        blockedFields.push('showEmail')
      }
      if (category.forceHideGroups && 'showGroups' in sanitizedSettings) {
        delete sanitizedSettings.showGroups
        blockedFields.push('showGroups')
      }
    }

    // Si no hi ha res a actualitzar després de filtrar
    if (Object.keys(sanitizedSettings).length === 0) {
      return NextResponse.json({
        settings: user.privacySettings,
        blockedFields,
        message: 'No s\'ha pogut actualitzar cap camp. Tots els camps sol·licitats estan bloquejats per la teva categoria de treball.',
      })
    }

    // Actualitzar configuració
    const updatedSettings = await prisma.userPrivacySettings.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...sanitizedSettings,
      },
      update: sanitizedSettings,
    })

    // Log d'auditoria
    const oldSettings = user.privacySettings || {}
    for (const [key, value] of Object.entries(sanitizedSettings)) {
      const oldValue = (oldSettings as Record<string, unknown>)[key]
      if (oldValue !== value) {
        await prisma.privacyAuditLog.create({
          data: {
            userId: session.user.id,
            changedById: session.user.id,
            changedByRole: 'USER',
            fieldChanged: key,
            oldValue: String(oldValue ?? 'undefined'),
            newValue: String(value),
          },
        })
      }
    }

    return NextResponse.json({
      settings: updatedSettings,
      blockedFields, // Informar quins camps no s'han pogut canviar
    })
  } catch (error) {
    console.error('Error actualitzant privacitat:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
