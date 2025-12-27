// app/api/gestio/courses/categories/route.ts

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

// GET - List all categories
export async function GET() {
  const auth = await checkAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const categories = await prisma.courseCategory.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { courses: true } }
      }
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error loading categories:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Create category
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

    // Check for existing category with same name
    const existing = await prisma.courseCategory.findFirst({
      where: { name: { equals: body.name.trim(), mode: 'insensitive' } }
    })

    if (existing) {
      return NextResponse.json({ error: 'Ja existeix una categoria amb aquest nom' }, { status: 400 })
    }

    const category = await prisma.courseCategory.create({
      data: {
        name: body.name.trim(),
        slug: generateSlug(body.name),
        description: body.description?.trim() || null
      },
      include: {
        _count: { select: { courses: true } }
      }
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
