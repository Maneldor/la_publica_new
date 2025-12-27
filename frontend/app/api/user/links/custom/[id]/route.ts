import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import * as userLinksService from '@/lib/services/userLinksService'

// PATCH: Actualitzar un enllaç personal
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const customLink = await userLinksService.updateCustomLink(
      session.user.id,
      id,
      body
    )

    return NextResponse.json({ customLink })
  } catch (error: any) {
    console.error('Error actualitzant enllaç personal:', error)

    if (error.message === 'Enllaç no trobat') {
      return NextResponse.json(
        { error: 'Enllaç no trobat' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Error intern del servidor' },
      { status: 500 }
    )
  }
}

// DELETE: Eliminar un enllaç personal
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { id } = await params
    await userLinksService.deleteCustomLink(session.user.id, id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error eliminant enllaç personal:', error)

    if (error.message === 'Enllaç no trobat') {
      return NextResponse.json(
        { error: 'Enllaç no trobat' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Error intern del servidor' },
      { status: 500 }
    )
  }
}

// POST: Incrementar visites (comptador)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { id } = await params
    await userLinksService.incrementCustomLinkVisits(session.user.id, id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error incrementant visites:', error)

    if (error.message === 'Enllaç no trobat') {
      return NextResponse.json(
        { error: 'Enllaç no trobat' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Error intern del servidor' },
      { status: 500 }
    )
  }
}
