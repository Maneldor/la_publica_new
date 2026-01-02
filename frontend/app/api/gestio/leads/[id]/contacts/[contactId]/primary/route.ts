import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

// PUT - Marcar contacto como principal
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; contactId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticat' }, { status: 401 })
    }

    const { id, contactId } = await params

    // Verificar que el contacto pertenece al lead
    const contact = await prismaClient.contacts.findFirst({
      where: {
        id: contactId,
        companyLeadId: id
      }
    })

    if (!contact) {
      return NextResponse.json({ error: 'Contacte no trobat' }, { status: 404 })
    }

    // Desmarcar todos los contactos del lead como principal
    await prismaClient.contacts.updateMany({
      where: { companyLeadId: id },
      data: { isPrimary: false }
    })

    // Marcar este contacto como principal
    await prismaClient.contacts.update({
      where: { id: contactId },
      data: { isPrimary: true }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error setting primary contact:', error)
    return NextResponse.json({ error: 'Error actualitzant contacte' }, { status: 500 })
  }
}
