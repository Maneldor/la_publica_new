import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import * as userLinksService from '@/lib/services/userLinksService'

// GET: Obtenir tots els favorits de l'usuari
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get('folderId')

    const favorites = await userLinksService.getUserFavorites(
      session.user.id,
      folderId === 'null' ? null : folderId || undefined
    )

    return NextResponse.json({ favorites })
  } catch (error) {
    console.error('Error obtenint favorits:', error)
    return NextResponse.json(
      { error: 'Error intern del servidor' },
      { status: 500 }
    )
  }
}

// POST: Afegir un favorit
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const body = await request.json()
    const { linkId, customName, notes, folderId } = body

    if (!linkId) {
      return NextResponse.json(
        { error: 'linkId és obligatori' },
        { status: 400 }
      )
    }

    const favorite = await userLinksService.addFavorite(
      session.user.id,
      linkId,
      { customName, notes, folderId }
    )

    return NextResponse.json({ favorite }, { status: 201 })
  } catch (error: any) {
    console.error('Error afegint favorit:', error)

    if (error.message === 'Ja és favorit') {
      return NextResponse.json(
        { error: 'Aquest enllaç ja és favorit' },
        { status: 409 }
      )
    }

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

// PUT: Reordenar favorits
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const body = await request.json()
    const { updates } = body

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'updates ha de ser un array' },
        { status: 400 }
      )
    }

    await userLinksService.reorderFavorites(session.user.id, updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordenant favorits:', error)
    return NextResponse.json(
      { error: 'Error intern del servidor' },
      { status: 500 }
    )
  }
}
