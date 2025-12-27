// app/api/gestio/courses/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  getCourseById,
  updateCourse,
  deleteCourse,
  duplicateCourse
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

// GET - Detall del curs
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
    const course = await getCourseById(id)

    if (!course) {
      return NextResponse.json({ error: 'Curs no trobat' }, { status: 404 })
    }

    return NextResponse.json({ course })

  } catch (error) {
    console.error('Error obtenint curs:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// PATCH - Actualitzar curs
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

    // Acció: Duplicar
    if (body.action === 'duplicate') {
      if (!body.newTitle?.trim()) {
        return NextResponse.json({ error: 'El nou títol és obligatori' }, { status: 400 })
      }
      const newCourse = await duplicateCourse(id, body.newTitle, auth.userId)
      return NextResponse.json({ course: newCourse })
    }

    // Acció: Publicar/Despublicar
    if (body.action === 'publish') {
      const course = await updateCourse(id, { isPublished: body.isPublished })
      return NextResponse.json({ course })
    }

    // Acció: Destacar
    if (body.action === 'feature') {
      const course = await updateCourse(id, { isFeatured: body.isFeatured })
      return NextResponse.json({ course })
    }

    // Acció: Activar/Desactivar
    if (body.action === 'toggle') {
      const course = await updateCourse(id, { isActive: body.isActive })
      return NextResponse.json({ course })
    }

    // Actualització general
    const allowedFields = [
      'title', 'description', 'shortDescription', 'thumbnail', 'coverImage',
      'type', 'level', 'categoryId', 'tags', 'instructorId', 'instructorName',
      'instructorBio', 'requirements', 'objectives', 'targetAudience',
      'price', 'isFree', 'isActive', 'isPublished', 'isFeatured',
      'hasCertificate', 'certificateTemplate'
    ]

    const updateData: any = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const course = await updateCourse(id, updateData)
    return NextResponse.json({ course })

  } catch (error) {
    console.error('Error actualitzant curs:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar curs
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

    // Verificar que existeix
    const course = await getCourseById(id)
    if (!course) {
      return NextResponse.json({ error: 'Curs no trobat' }, { status: 404 })
    }

    // Verificar que no té inscripcions actives
    const activeEnrollments = await prisma.courseEnrollment.count({
      where: { courseId: id, status: 'ACTIVE' }
    })

    if (activeEnrollments > 0) {
      return NextResponse.json({
        error: `No es pot eliminar: hi ha ${activeEnrollments} inscripcions actives`
      }, { status: 400 })
    }

    await deleteCourse(id)
    return NextResponse.json({ message: 'Curs eliminat correctament' })

  } catch (error) {
    console.error('Error eliminant curs:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
