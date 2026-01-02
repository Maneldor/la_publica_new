import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

// GET - Obtenir un lead
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticat' }, { status: 401 })
    }

    const { id } = await params

    const lead = await prismaClient.companyLead.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead no trobat' }, { status: 404 })
    }

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Error getting lead:', error)
    return NextResponse.json({ error: 'Error intern' }, { status: 500 })
  }
}

// PATCH - Actualitzar un lead
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticat' }, { status: 401 })
    }

    const { id } = await params
    const data = await request.json()

    // Verificar que el lead existeix
    const existingLead = await prismaClient.companyLead.findUnique({
      where: { id },
      select: { id: true, assignedToId: true }
    })

    if (!existingLead) {
      return NextResponse.json({ error: 'Lead no trobat' }, { status: 404 })
    }

    // Preparar dades per actualitzar (filtrar camps no vàlids)
    const allowedFields = [
      'companyName', 'cif', 'sector', 'industry', 'website', 'description',
      'companySize', 'employeeCount', 'address', 'city', 'zipCode', 'state', 'country',
      'contactName', 'contactRole', 'email', 'phone',
      'linkedinProfile', 'facebookProfile', 'twitterProfile',
      'source', 'priority', 'estimatedRevenue', 'score', 'tags',
      'notes', 'internalNotes', 'nextFollowUpDate', 'status', 'stage'
    ]

    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (field in data && data[field] !== undefined) {
        // Convertir nextFollowUpDate a Date si és string
        if (field === 'nextFollowUpDate' && data[field]) {
          updateData[field] = new Date(data[field])
        } else {
          updateData[field] = data[field]
        }
      }
    }

    // Actualitzar lead
    const updatedLead = await prismaClient.companyLead.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    // Crear activitat
    await prismaClient.leadActivity.create({
      data: {
        leadId: id,
        userId: session.user.id,
        type: 'UPDATED',
        description: `Lead actualitzat per ${session.user.name || session.user.email}`
      }
    })

    return NextResponse.json(updatedLead)
  } catch (error) {
    console.error('Error updating lead:', error)
    return NextResponse.json({ error: 'Error actualitzant el lead' }, { status: 500 })
  }
}

// DELETE - Eliminar un lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticat' }, { status: 401 })
    }

    // Verificar rol admin
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN']
    if (!allowedRoles.includes(session.user.userType || '')) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 403 })
    }

    const { id } = await params

    await prismaClient.companyLead.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting lead:', error)
    return NextResponse.json({ error: 'Error eliminant el lead' }, { status: 500 })
  }
}
