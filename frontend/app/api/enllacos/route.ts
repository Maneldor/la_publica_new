import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getLinks, getCategories, incrementVisits } from '@/lib/services/usefulLinkService'

// GET - Llistar enllaços per al dashboard (públic, sense autenticació)
export async function GET() {
  try {
    const [links, categories] = await Promise.all([
      getLinks({ isActive: true }),
      getCategories(false)
    ])

    return NextResponse.json({
      links,
      categories: categories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        color: c.color,
        isActive: c.isActive
      }))
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Registrar visita
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  try {
    const body = await request.json()

    if (!body.linkId) {
      return NextResponse.json({ error: 'linkId obligatori' }, { status: 400 })
    }

    await incrementVisits(body.linkId)
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
