import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateCategory, deleteCategory } from '@/lib/services/usefulLinkService'

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

// PATCH - Actualitzar categoria
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const category = await updateCategory(id, body)
    return NextResponse.json({ category })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar categoria
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params
    await deleteCategory(id)
    return NextResponse.json({ message: 'Categoria eliminada' })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
