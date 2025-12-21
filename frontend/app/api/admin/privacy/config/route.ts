import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

// GET - Obtenir configuració global de privacitat
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 403 })
    }

    let config = await prismaClient.privacyConfig.findFirst({
      where: { id: 'default' },
    })

    // Si no existeix, crear amb valors per defecte
    if (!config) {
      config = await prismaClient.privacyConfig.create({
        data: {
          id: 'default',
          defaultShowRealName: true,
          defaultShowPosition: true,
          defaultShowDepartment: true,
          defaultShowBio: true,
          defaultShowLocation: true,
          defaultShowPhone: false,
          defaultShowEmail: false,
          defaultShowSocialLinks: true,
          defaultShowJoinedDate: true,
          defaultShowLastActive: true,
          defaultShowConnections: true,
          defaultShowGroups: true,
          allowUsersToChangePrivacy: true,
          requireEmailVerification: false,
        },
      })
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error obtenint configuració de privacitat:', error)
    return NextResponse.json(
      { error: 'Error intern del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualitzar configuració global de privacitat
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.role || !['SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Només els superadmins poden modificar la configuració global' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const existingConfig = await prismaClient.privacyConfig.findFirst({
      where: { id: 'default' },
    })

    const config = await prismaClient.privacyConfig.upsert({
      where: { id: 'default' },
      update: {
        defaultShowRealName: body.defaultShowRealName ?? existingConfig?.defaultShowRealName ?? true,
        defaultShowPosition: body.defaultShowPosition ?? existingConfig?.defaultShowPosition ?? true,
        defaultShowDepartment: body.defaultShowDepartment ?? existingConfig?.defaultShowDepartment ?? true,
        defaultShowBio: body.defaultShowBio ?? existingConfig?.defaultShowBio ?? true,
        defaultShowLocation: body.defaultShowLocation ?? existingConfig?.defaultShowLocation ?? true,
        defaultShowPhone: body.defaultShowPhone ?? existingConfig?.defaultShowPhone ?? false,
        defaultShowEmail: body.defaultShowEmail ?? existingConfig?.defaultShowEmail ?? false,
        defaultShowSocialLinks: body.defaultShowSocialLinks ?? existingConfig?.defaultShowSocialLinks ?? true,
        defaultShowJoinedDate: body.defaultShowJoinedDate ?? existingConfig?.defaultShowJoinedDate ?? true,
        defaultShowLastActive: body.defaultShowLastActive ?? existingConfig?.defaultShowLastActive ?? true,
        defaultShowConnections: body.defaultShowConnections ?? existingConfig?.defaultShowConnections ?? true,
        defaultShowGroups: body.defaultShowGroups ?? existingConfig?.defaultShowGroups ?? true,
        allowUsersToChangePrivacy: body.allowUsersToChangePrivacy ?? existingConfig?.allowUsersToChangePrivacy ?? true,
        requireEmailVerification: body.requireEmailVerification ?? existingConfig?.requireEmailVerification ?? false,
        updatedById: session.user.id,
      },
      create: {
        id: 'default',
        defaultShowRealName: body.defaultShowRealName ?? true,
        defaultShowPosition: body.defaultShowPosition ?? true,
        defaultShowDepartment: body.defaultShowDepartment ?? true,
        defaultShowBio: body.defaultShowBio ?? true,
        defaultShowLocation: body.defaultShowLocation ?? true,
        defaultShowPhone: body.defaultShowPhone ?? false,
        defaultShowEmail: body.defaultShowEmail ?? false,
        defaultShowSocialLinks: body.defaultShowSocialLinks ?? true,
        defaultShowJoinedDate: body.defaultShowJoinedDate ?? true,
        defaultShowLastActive: body.defaultShowLastActive ?? true,
        defaultShowConnections: body.defaultShowConnections ?? true,
        defaultShowGroups: body.defaultShowGroups ?? true,
        allowUsersToChangePrivacy: body.allowUsersToChangePrivacy ?? true,
        requireEmailVerification: body.requireEmailVerification ?? false,
        updatedById: session.user.id,
      },
    })

    // Registrar al log d'auditoria
    await prismaClient.privacyAuditLog.create({
      data: {
        userId: 'SYSTEM',
        changedById: session.user.id,
        changedByRole: 'ADMIN',
        fieldChanged: 'global_config_updated',
        oldValue: existingConfig ? JSON.stringify(existingConfig) : null,
        newValue: JSON.stringify(config),
        reason: 'Configuració global de privacitat actualitzada',
      },
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error actualitzant configuració de privacitat:', error)
    return NextResponse.json(
      { error: 'Error intern del servidor' },
      { status: 500 }
    )
  }
}
