import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import * as userLinksService from '@/lib/services/userLinksService'

// GET: Obtenir tots els enllaços personals
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get('folderId')

    const customLinks = await userLinksService.getUserCustomLinks(
      session.user.id,
      folderId === 'null' ? null : folderId || undefined
    )

    return NextResponse.json({ customLinks })
  } catch (error) {
    console.error('Error obtenint enllaços personals:', error)
    return NextResponse.json(
      { error: 'Error intern del servidor' },
      { status: 500 }
    )
  }
}

// POST: Crear un enllaç personal
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const body = await request.json()
    const { name, url, description, icon, color, folderId } = body

    if (!name || !url) {
      return NextResponse.json(
        { error: 'name i url són obligatoris' },
        { status: 400 }
      )
    }

    const customLink = await userLinksService.createCustomLink(
      session.user.id,
      { name, url, description, icon, color, folderId }
    )

    return NextResponse.json({ customLink }, { status: 201 })
  } catch (error) {
    console.error('Error creant enllaç personal:', error)
    return NextResponse.json(
      { error: 'Error intern del servidor' },
      { status: 500 }
    )
  }
}

// PUT: Reordenar enllaços personals
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

    await userLinksService.reorderCustomLinks(session.user.id, updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordenant enllaços personals:', error)
    return NextResponse.json(
      { error: 'Error intern del servidor' },
      { status: 500 }
    )
  }
}
