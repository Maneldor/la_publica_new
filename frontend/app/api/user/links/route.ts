import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import * as userLinksService from '@/lib/services/userLinksService'

// GET: Obtenir tots els enllaços de l'usuari (favorits, personals i carpetes)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const [links, stats] = await Promise.all([
      userLinksService.getAllUserLinks(session.user.id),
      userLinksService.getUserLinksStats(session.user.id)
    ])

    return NextResponse.json({
      ...links,
      stats
    })
  } catch (error) {
    console.error('Error obtenint enllaços de l\'usuari:', error)
    return NextResponse.json(
      { error: 'Error intern del servidor' },
      { status: 500 }
    )
  }
}
