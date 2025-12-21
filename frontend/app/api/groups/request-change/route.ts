import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const userId = session.user.id

  try {
    const body = await request.json()
    const { targetGroupId, reason } = body

    if (!targetGroupId) {
      return NextResponse.json({ error: 'Grup desti requerit' }, { status: 400 })
    }

    // Obtenir grup actual i grup desti
    const [currentMembership, targetGroup] = await Promise.all([
      prismaClient.groupMember.findFirst({
        where: {
          userId,
          role: 'MEMBER',
          group: { type: 'PROFESSIONAL' }
        },
        include: {
          group: { select: { id: true, name: true } }
        }
      }),
      prismaClient.group.findUnique({
        where: { id: targetGroupId },
        select: { id: true, name: true, type: true }
      })
    ])

    if (!targetGroup) {
      return NextResponse.json({ error: 'Grup desti no trobat' }, { status: 404 })
    }

    if (targetGroup.type !== 'PROFESSIONAL') {
      return NextResponse.json({ error: 'El grup desti no es professional' }, { status: 400 })
    }

    // Comprovar si ja hi ha una sol-licitud pendent
    const existingRequest = await prismaClient.adminAlert.findFirst({
      where: {
        userId,
        type: 'PROFESSIONAL_GROUP_CHANGE_REQUEST',
        status: 'PENDING',
      }
    })

    if (existingRequest) {
      return NextResponse.json({
        error: 'Ja tens una sol-licitud de canvi de grup pendent',
      }, { status: 400 })
    }

    // Crear sol-licitud (alerta per admin)
    const alert = await prismaClient.adminAlert.create({
      data: {
        type: 'PROFESSIONAL_GROUP_CHANGE_REQUEST',
        severity: 'LOW',
        userId,
        title: 'Sol-licitud de canvi de grup professional',
        message: currentMembership
          ? `L'usuari sol-licita canviar del grup "${currentMembership.group.name}" al grup "${targetGroup.name}".`
          : `L'usuari sol-licita unir-se al grup professional "${targetGroup.name}".`,
        metadata: {
          currentGroupId: currentMembership?.group.id || null,
          currentGroupName: currentMembership?.group.name || null,
          requestedGroupId: targetGroup.id,
          requestedGroupName: targetGroup.name,
          reason: reason || null,
          requestedAt: new Date().toISOString(),
        },
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Sol-licitud enviada correctament. Un administrador la revisara.',
      alertId: alert.id,
    })

  } catch (error) {
    console.error('Error requesting group change:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
