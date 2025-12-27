import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getContactById, updateContact, deleteContact, toggleFavorite
} from '@/lib/services/userContactsService'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  try {
    const { id } = await params
    const contact = await getContactById(session.user.id, id)
    if (!contact) {
      return NextResponse.json({ error: 'No trobat' }, { status: 404 })
    }
    return NextResponse.json({ contact })
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()

    if (body.action === 'toggle_favorite') {
      const contact = await toggleFavorite(session.user.id, id)
      return NextResponse.json({ contact })
    }

    const contact = await updateContact(session.user.id, id, body)
    return NextResponse.json({ contact })
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  try {
    const { id } = await params
    await deleteContact(session.user.id, id)
    return NextResponse.json({ message: 'Eliminat' })
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
