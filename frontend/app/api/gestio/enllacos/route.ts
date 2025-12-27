import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getLinks, getStats, getCategories, createLink } from '@/lib/services/usefulLinkService'

const ALLOWED_ROLES = ['ADMIN', 'SUPER_ADMIN', 'CRM_CONTINGUT', 'ADMIN_GESTIO']

async function checkAuth() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return { error: 'No autoritzat', status: 401 }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  if (!user || !ALLOWED_ROLES.includes(user.role)) {
    return { error: 'Accés denegat', status: 403 }
  }

  return { userId: session.user.id }
}

// GET - Llistar enllaços
export async function GET(request: NextRequest) {
  const auth = await checkAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      categoryId: searchParams.get('category') || undefined,
      isActive: searchParams.get('active') === 'true' ? true :
                searchParams.get('active') === 'false' ? false : undefined,
      isHighlighted: searchParams.get('highlighted') === 'true' ? true : undefined,
      search: searchParams.get('search') || undefined
    }

    const [links, stats, categories] = await Promise.all([
      getLinks(filters),
      getStats(),
      getCategories(true)
    ])

    return NextResponse.json({ links, stats, categories })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Crear enllaç
export async function POST(request: NextRequest) {
  const auth = await checkAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json()

    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'El nom és obligatori' }, { status: 400 })
    }

    if (!body.website?.trim()) {
      return NextResponse.json({ error: 'La URL és obligatòria' }, { status: 400 })
    }

    if (!body.categoryId) {
      return NextResponse.json({ error: 'La categoria és obligatòria' }, { status: 400 })
    }

    const link = await createLink(body)
    return NextResponse.json({ link }, { status: 201 })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
