import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import * as userLinksService from '@/lib/services/userLinksService'

// GET: Comprovar si un enllaç és favorit
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { linkId } = await params
    const isFavorited = await userLinksService.isLinkFavorited(session.user.id, linkId)

    return NextResponse.json({ isFavorited })
  } catch (error) {
    console.error('Error comprovant favorit:', error)
    return NextResponse.json(
      { error: 'Error intern del servidor' },
      { status: 500 }
    )
  }
}

// PATCH: Actualitzar un favorit
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { linkId } = await params
    const body = await request.json()

    const favorite = await userLinksService.updateFavorite(
      session.user.id,
      linkId,
      body
    )

    return NextResponse.json({ favorite })
  } catch (error) {
    console.error('Error actualitzant favorit:', error)
    return NextResponse.json(
      { error: 'Error intern del servidor' },
      { status: 500 }
    )
  }
}

// DELETE: Eliminar un favorit
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { linkId } = await params
    await userLinksService.removeFavorite(session.user.id, linkId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error eliminant favorit:', error)
    return NextResponse.json(
      { error: 'Error intern del servidor' },
      { status: 500 }
    )
  }
}
