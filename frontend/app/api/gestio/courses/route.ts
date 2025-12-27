// app/api/gestio/courses/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  getCoursesForAdmin,
  getCourseStats,
  createCourse,
  getCourseCategories,
  createCourseCategory
} from '@/lib/services/courseService'
import { CourseType, CourseLevel } from '@prisma/client'

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

// GET - Llistar cursos i estadístiques
export async function GET(request: NextRequest) {
  const auth = await checkAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)

    // Si es demanen categories
    if (searchParams.get('categories') === 'true') {
      const categories = await getCourseCategories()
      return NextResponse.json({ categories })
    }

    // Si es demanen estadístiques
    if (searchParams.get('stats') === 'true') {
      const stats = await getCourseStats()
      return NextResponse.json({ stats })
    }

    const filters = {
      type: searchParams.get('type') as CourseType | undefined,
      level: searchParams.get('level') as CourseLevel | undefined,
      categoryId: searchParams.get('category') || undefined,
      isPublished: searchParams.get('published') === 'true' ? true :
                   searchParams.get('published') === 'false' ? false : undefined,
      isFeatured: searchParams.get('featured') === 'true' ? true : undefined,
      isFree: searchParams.get('free') === 'true' ? true :
              searchParams.get('free') === 'false' ? false : undefined,
      search: searchParams.get('search') || undefined
    }

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const [result, stats, categories] = await Promise.all([
      getCoursesForAdmin(filters, page, limit),
      getCourseStats(),
      getCourseCategories()
    ])

    return NextResponse.json({ ...result, stats, categories })

  } catch (error) {
    console.error('Error obtenint cursos:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Crear curs o categoria
export async function POST(request: NextRequest) {
  const auth = await checkAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json()

    // Crear categoria
    if (body.action === 'createCategory') {
      if (!body.name?.trim()) {
        return NextResponse.json({ error: 'El nom de la categoria és obligatori' }, { status: 400 })
      }

      const category = await createCourseCategory({
        name: body.name,
        description: body.description,
        icon: body.icon,
        color: body.color
      })

      return NextResponse.json({ category }, { status: 201 })
    }

    // Crear curs
    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'El títol és obligatori' }, { status: 400 })
    }

    const course = await createCourse({
      title: body.title,
      description: body.description,
      shortDescription: body.shortDescription,
      thumbnail: body.thumbnail,
      type: body.type || 'BASIC',
      level: body.level || 'BEGINNER',
      categoryId: body.categoryId,
      tags: body.tags,
      instructorId: body.instructorId,
      instructorName: body.instructorName,
      instructorBio: body.instructorBio,
      requirements: body.requirements,
      objectives: body.objectives,
      targetAudience: body.targetAudience,
      price: body.price,
      isFree: body.isFree,
      hasCertificate: body.hasCertificate,
      aiGenerated: body.aiGenerated,
      aiPrompt: body.aiPrompt,
      createdById: auth.userId
    })

    return NextResponse.json({ course }, { status: 201 })

  } catch (error) {
    console.error('Error creant curs:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
