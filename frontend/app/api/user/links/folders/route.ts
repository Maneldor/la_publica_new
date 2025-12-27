import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import * as userLinksService from '@/lib/services/userLinksService'

// GET: Obtenir totes les carpetes
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const folders = await userLinksService.getUserFolders(session.user.id)

    return NextResponse.json({ folders })
  } catch (error) {
    console.error('Error obtenint carpetes:', error)
    return NextResponse.json(
      { error: 'Error intern del servidor' },
      { status: 500 }
    )
  }
}

// POST: Crear una carpeta
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const body = await request.json()
    const { name, icon, color } = body

    if (!name) {
      return NextResponse.json(
        { error: 'name és obligatori' },
        { status: 400 }
      )
    }

    const folder = await userLinksService.createFolder(
      session.user.id,
      { name, icon, color }
    )

    return NextResponse.json({ folder }, { status: 201 })
  } catch (error) {
    console.error('Error creant carpeta:', error)
    return NextResponse.json(
      { error: 'Error intern del servidor' },
      { status: 500 }
    )
  }
}

// PUT: Reordenar carpetes
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

    await userLinksService.reorderFolders(session.user.id, updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordenant carpetes:', error)
    return NextResponse.json(
      { error: 'Error intern del servidor' },
      { status: 500 }
    )
  }
}
