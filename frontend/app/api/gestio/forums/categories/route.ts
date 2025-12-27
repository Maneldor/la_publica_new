import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/services/forumService'

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

// GET - Llistar categories
export async function GET() {
  try {
    const categories = await getCategories()
    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Crear categoria
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

    const category = await createCategory(body)
    return NextResponse.json({ category }, { status: 201 })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// PATCH - Actualitzar categoria
export async function PATCH(request: NextRequest) {
  const auth = await checkAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ error: 'ID de categoria requerit' }, { status: 400 })
    }

    const { id, ...data } = body
    const category = await updateCategory(id, data)
    return NextResponse.json({ category })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar categoria
export async function DELETE(request: NextRequest) {
  const auth = await checkAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID de categoria requerit' }, { status: 400 })
    }

    await deleteCategory(id)
    return NextResponse.json({ message: 'Categoria eliminada' })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
