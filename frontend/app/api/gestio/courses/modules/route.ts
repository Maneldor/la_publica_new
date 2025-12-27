// app/api/gestio/courses/modules/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  createModule,
  updateModule,
  deleteModule,
  reorderModules
} from '@/lib/services/courseService'

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

// GET - Obtenir mòduls d'un curs
export async function GET(request: NextRequest) {
  const auth = await checkAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json({ error: 'courseId és obligatori' }, { status: 400 })
    }

    const modules = await prisma.courseModule.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            slug: true,
            type: true,
            estimatedDuration: true,
            isFree: true,
            isPublished: true
          }
        },
        _count: {
          select: { lessons: true }
        }
      }
    })

    return NextResponse.json({ modules })

  } catch (error) {
    console.error('Error obtenint mòduls:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Crear mòdul
export async function POST(request: NextRequest) {
  const auth = await checkAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json()

    if (!body.courseId) {
      return NextResponse.json({ error: 'courseId és obligatori' }, { status: 400 })
    }

    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'El títol és obligatori' }, { status: 400 })
    }

    // Verificar que el curs existeix
    const course = await prisma.course.findUnique({
      where: { id: body.courseId }
    })

    if (!course) {
      return NextResponse.json({ error: 'Curs no trobat' }, { status: 404 })
    }

    const module = await createModule({
      courseId: body.courseId,
      title: body.title,
      description: body.description,
      order: body.order,
      isFree: body.isFree
    })

    return NextResponse.json({ module }, { status: 201 })

  } catch (error) {
    console.error('Error creant mòdul:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// PATCH - Actualitzar mòdul o reordenar
export async function PATCH(request: NextRequest) {
  const auth = await checkAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json()

    // Reordenar mòduls
    if (body.action === 'reorder') {
      if (!body.courseId || !Array.isArray(body.moduleIds)) {
        return NextResponse.json({
          error: 'courseId i moduleIds són obligatoris'
        }, { status: 400 })
      }

      await reorderModules(body.courseId, body.moduleIds)
      return NextResponse.json({ success: true })
    }

    // Actualitzar mòdul individual
    if (!body.id) {
      return NextResponse.json({ error: 'ID del mòdul obligatori' }, { status: 400 })
    }

    const allowedFields = ['title', 'description', 'order', 'isPublished', 'isFree']
    const updateData: any = {}

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const module = await updateModule(body.id, updateData)
    return NextResponse.json({ module })

  } catch (error) {
    console.error('Error actualitzant mòdul:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar mòdul
export async function DELETE(request: NextRequest) {
  const auth = await checkAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID del mòdul obligatori' }, { status: 400 })
    }

    // Verificar que existeix
    const module = await prisma.courseModule.findUnique({
      where: { id },
      include: { _count: { select: { lessons: true } } }
    })

    if (!module) {
      return NextResponse.json({ error: 'Mòdul no trobat' }, { status: 404 })
    }

    // Avisar si té lliçons
    if (module._count.lessons > 0) {
      // Eliminar igualment (cascade delete s'encarrega)
      console.log(`Eliminant mòdul amb ${module._count.lessons} lliçons`)
    }

    await deleteModule(id)
    return NextResponse.json({ message: 'Mòdul eliminat correctament' })

  } catch (error) {
    console.error('Error eliminant mòdul:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
