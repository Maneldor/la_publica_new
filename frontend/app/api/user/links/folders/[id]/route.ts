import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import * as userLinksService from '@/lib/services/userLinksService'

// PATCH: Actualitzar una carpeta
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

    const folder = await userLinksService.updateFolder(
      session.user.id,
      id,
      body
    )

    return NextResponse.json({ folder })
  } catch (error: any) {
    console.error('Error actualitzant carpeta:', error)

    if (error.message === 'Carpeta no trobada') {
      return NextResponse.json(
        { error: 'Carpeta no trobada' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Error intern del servidor' },
      { status: 500 }
    )
  }
}

// DELETE: Eliminar una carpeta
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
    await userLinksService.deleteFolder(session.user.id, id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error eliminant carpeta:', error)

    if (error.message === 'Carpeta no trobada') {
      return NextResponse.json(
        { error: 'Carpeta no trobada' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Error intern del servidor' },
      { status: 500 }
    )
  }
}
