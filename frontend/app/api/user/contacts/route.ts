import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getContacts, createContact, getContactsStats,
  getContactCategories, getFavoriteContacts, getRecentContacts
} from '@/lib/services/userContactsService'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const view = searchParams.get('view')

    // Vista compacta per mòdul agenda
    if (view === 'compact') {
      const [favorites, recent, stats] = await Promise.all([
        getFavoriteContacts(session.user.id, 6),
        getRecentContacts(session.user.id, 5),
        getContactsStats(session.user.id)
      ])
      return NextResponse.json({ favorites, recent, stats })
    }

    const filters = {
      search: searchParams.get('search') || undefined,
      categoryId: searchParams.get('category') || undefined,
      isFavorite: searchParams.get('favorites') === 'true' ? true : undefined
    }

    const [contacts, stats, categories] = await Promise.all([
      getContacts(session.user.id, filters),
      getContactsStats(session.user.id),
      getContactCategories(session.user.id)
    ])

    return NextResponse.json({ contacts, stats, categories })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  try {
    const body = await request.json()
    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'El nom és obligatori' }, { status: 400 })
    }

    const contact = await createContact(session.user.id, body)
    return NextResponse.json({ contact }, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
