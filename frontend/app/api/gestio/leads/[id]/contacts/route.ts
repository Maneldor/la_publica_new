import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

// GET - Obtener contactos del lead
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

    const contacts = await prismaClient.contacts.findMany({
      where: { companyLeadId: id },
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'asc' }
      ]
    })

    return NextResponse.json({ contacts })
  } catch (error) {
    console.error('Error getting contacts:', error)
    return NextResponse.json({ error: 'Error intern' }, { status: 500 })
  }
}

// POST - Crear nuevo contacto
export async function POST(
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

    // Verificar que el lead existe
    const lead = await prismaClient.companyLead.findUnique({
      where: { id },
      select: { id: true }
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead no trobat' }, { status: 404 })
    }

    // Si es el primer contacto o se marca como principal, desmarcar otros
    if (data.isPrimary) {
      await prismaClient.contacts.updateMany({
        where: { companyLeadId: id },
        data: { isPrimary: false }
      })
    }

    // Crear contacto
    const contact = await prismaClient.contacts.create({
      data: {
        id: crypto.randomUUID(),
        companyLeadId: id,
        firstName: data.firstName,
        lastName: data.lastName || null,
        email: data.email || null,
        phone: data.phone || null,
        position: data.position || null,
        isPrimary: data.isPrimary || false,
        isActive: true,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ contact })
  } catch (error) {
    console.error('Error creating contact:', error)
    return NextResponse.json({ error: 'Error creant contacte' }, { status: 500 })
  }
}
