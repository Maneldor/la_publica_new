import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

// Verificar accés admin
async function checkAdminAccess() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return { authorized: false, error: 'No autenticat' }
  }
  const role = session.user.role as string
  if (!['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO'].includes(role)) {
    return { authorized: false, error: 'No autoritzat' }
  }
  return { authorized: true, userId: session.user.id }
}

// GET - Obtenir un pla per ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = await checkAdminAccess()
    if (!access.authorized) {
      return NextResponse.json({ success: false, error: access.error }, { status: 401 })
    }

    const plan = await prismaClient.planConfig.findUnique({
      where: { id: params.id }
    })

    if (!plan) {
      return NextResponse.json({ success: false, error: 'Pla no trobat' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: plan })
  } catch (error) {
    console.error('Error fetching plan:', error)
    return NextResponse.json({ success: false, error: 'Error obtenint pla' }, { status: 500 })
  }
}

// PATCH - Actualitzar un pla
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = await checkAdminAccess()
    if (!access.authorized) {
      return NextResponse.json({ success: false, error: access.error }, { status: 401 })
    }

    const body = await request.json()

    // Construir objecte d'actualització dinàmicament
    const updateData: any = {}

    // Camps que es poden actualitzar
    const allowedFields = [
      'name', 'nombre', 'nombreCorto', 'description', 'descripcion',
      'basePrice', 'precioMensual', 'precioAnual',
      'firstYearDiscount', 'maxTeamMembers', 'maxActiveOffers',
      'maxFeaturedOffers', 'maxStorage', 'hasFreeTrial', 'trialDurationDays',
      'isActive', 'isVisible', 'activo', 'visible', 'destacado',
      'color', 'icono', 'orden', 'features', 'funcionalidades',
      'tier', 'badge', 'badgeColor'
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // Sincronitzar camps relacionats
    if (body.isActive !== undefined) {
      updateData.activo = body.isActive
    }
    if (body.isVisible !== undefined) {
      updateData.visible = body.isVisible
    }

    const updatedPlan = await prismaClient.planConfig.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json({ success: true, data: updatedPlan })
  } catch (error) {
    console.error('Error updating plan:', error)
    return NextResponse.json({ success: false, error: 'Error actualitzant pla' }, { status: 500 })
  }
}

// DELETE - Eliminar un pla
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = await checkAdminAccess()
    if (!access.authorized) {
      return NextResponse.json({ success: false, error: access.error }, { status: 401 })
    }

    // Verificar que no té subscripcions actives
    const subscriptions = await prismaClient.subscription.count({
      where: { planId: params.id, status: 'ACTIVE' }
    })

    if (subscriptions > 0) {
      return NextResponse.json({
        success: false,
        error: `No es pot eliminar: hi ha ${subscriptions} subscripcions actives`
      }, { status: 400 })
    }

    await prismaClient.planConfig.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true, message: 'Pla eliminat correctament' })
  } catch (error) {
    console.error('Error deleting plan:', error)
    return NextResponse.json({ success: false, error: 'Error eliminant pla' }, { status: 500 })
  }
}