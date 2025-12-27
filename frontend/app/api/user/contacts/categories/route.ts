import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getContactCategories, createContactCategory,
  updateContactCategory, deleteContactCategory
} from '@/lib/services/userContactsService'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  try {
    const categories = await getContactCategories(session.user.id)
    return NextResponse.json({ categories })
  } catch (error) {
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
      return NextResponse.json({ error: 'Nom obligatori' }, { status: 400 })
    }

    const category = await createContactCategory(session.user.id, body)
    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  try {
    const body = await request.json()
    if (!body.categoryId) {
      return NextResponse.json({ error: 'categoryId obligatori' }, { status: 400 })
    }

    const category = await updateContactCategory(session.user.id, body.categoryId, body)
    return NextResponse.json({ category })
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    if (!categoryId) {
      return NextResponse.json({ error: 'categoryId obligatori' }, { status: 400 })
    }

    await deleteContactCategory(session.user.id, categoryId)
    return NextResponse.json({ message: 'Eliminada' })
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
