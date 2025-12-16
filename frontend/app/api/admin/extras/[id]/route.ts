import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

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

// GET - Obtenir un extra per ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = await checkAdminAccess()
    if (!access.authorized) {
      return NextResponse.json({ success: false, error: access.error }, { status: 401 })
    }

    const extra = await prismaClient.extra.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            budgetItems: true,
            invoiceItems: true
          }
        }
      }
    })

    if (!extra) {
      return NextResponse.json({ success: false, error: 'Extra no trobat' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: { ...extra, basePrice: Number(extra.basePrice) }
    })
  } catch (error) {
    console.error('Error fetching extra:', error)
    return NextResponse.json({ success: false, error: 'Error obtenint extra' }, { status: 500 })
  }
}

// PATCH - Actualitzar un extra
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

    const allowedFields = [
      'name', 'slug', 'description', 'category', 'basePrice',
      'priceType', 'active', 'featured', 'requiresApproval',
      'icon', 'image', 'details', 'order'
    ]

    const updateData: any = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const updatedExtra = await prismaClient.extra.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      data: { ...updatedExtra, basePrice: Number(updatedExtra.basePrice) }
    })
  } catch (error) {
    console.error('Error updating extra:', error)
    return NextResponse.json({ success: false, error: 'Error actualitzant extra' }, { status: 500 })
  }
}

// DELETE - Eliminar un extra
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = await checkAdminAccess()
    if (!access.authorized) {
      return NextResponse.json({ success: false, error: access.error }, { status: 401 })
    }

    // Verificar ús en pressupostos o factures
    const usage = await prismaClient.extra.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            budgetItems: true,
            invoiceItems: true
          }
        }
      }
    })

    if (usage && (usage._count.budgetItems > 0 || usage._count.invoiceItems > 0)) {
      return NextResponse.json({
        success: false,
        error: `No es pot eliminar: s'utilitza en ${usage._count.budgetItems} pressupostos i ${usage._count.invoiceItems} factures`
      }, { status: 400 })
    }

    await prismaClient.extra.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true, message: 'Extra eliminat correctament' })
  } catch (error) {
    console.error('Error deleting extra:', error)
    return NextResponse.json({ success: false, error: 'Error eliminant extra' }, { status: 500 })
  }
}
