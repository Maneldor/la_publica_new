import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

// DELETE - Eliminar contacto
export async function DELETE(
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

    const wasPrimary = contact.isPrimary

    // Eliminar contacto
    await prismaClient.contacts.delete({
      where: { id: contactId }
    })

    // Si era principal, hacer principal al primer contacto restante
    if (wasPrimary) {
      const firstContact = await prismaClient.contacts.findFirst({
        where: { companyLeadId: id },
        orderBy: { createdAt: 'asc' }
      })

      if (firstContact) {
        await prismaClient.contacts.update({
          where: { id: firstContact.id },
          data: { isPrimary: true }
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting contact:', error)
    return NextResponse.json({ error: 'Error eliminant contacte' }, { status: 500 })
  }
}
