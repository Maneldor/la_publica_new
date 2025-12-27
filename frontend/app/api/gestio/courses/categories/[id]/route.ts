// app/api/gestio/courses/categories/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// GET - Get single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params

    const category = await prisma.courseCategory.findUnique({
      where: { id },
      include: {
        _count: { select: { courses: true } },
        courses: {
          select: {
            id: true,
            title: true,
            isPublished: true
          },
          take: 10
        }
      }
    })

    if (!category) {
      return NextResponse.json({ error: 'Categoria no trobada' }, { status: 404 })
    }

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Error loading category:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// PATCH - Update category
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

    // Check if exists
    const existing = await prisma.courseCategory.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Categoria no trobada' }, { status: 404 })
    }

    // Check for name conflict
    if (body.name && body.name.trim() !== existing.name) {
      const conflict = await prisma.courseCategory.findFirst({
        where: {
          name: { equals: body.name.trim(), mode: 'insensitive' },
          id: { not: id }
        }
      })

      if (conflict) {
        return NextResponse.json({ error: 'Ja existeix una categoria amb aquest nom' }, { status: 400 })
      }
    }

    const updateData: any = {}
    if (body.name !== undefined) {
      updateData.name = body.name.trim()
      updateData.slug = generateSlug(body.name)
    }
    if (body.description !== undefined) {
      updateData.description = body.description?.trim() || null
    }

    const category = await prisma.courseCategory.update({
      where: { id },
      data: updateData,
      include: {
        _count: { select: { courses: true } }
      }
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// DELETE - Delete category
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

    // Check if exists
    const category = await prisma.courseCategory.findUnique({
      where: { id },
      include: {
        _count: { select: { courses: true } }
      }
    })

    if (!category) {
      return NextResponse.json({ error: 'Categoria no trobada' }, { status: 404 })
    }

    if (category._count.courses > 0) {
      return NextResponse.json({
        error: `No es pot eliminar: hi ha ${category._count.courses} cursos en aquesta categoria`
      }, { status: 400 })
    }

    await prisma.courseCategory.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Categoria eliminada correctament' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
