// app/api/gestio/courses/lessons/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  createLesson,
  getLessonById,
  updateLesson,
  deleteLesson,
  reorderLessons,
  createLessonResource,
  deleteLessonResource,
  createQuiz,
  updateQuiz,
  deleteQuiz
} from '@/lib/services/courseService'
import { LessonType } from '@prisma/client'

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

// GET - Obtenir lliçó o lliçons d'un mòdul
export async function GET(request: NextRequest) {
  const auth = await checkAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get('id')
    const moduleId = searchParams.get('moduleId')

    // Obtenir una lliçó específica
    if (lessonId) {
      const lesson = await getLessonById(lessonId)

      if (!lesson) {
        return NextResponse.json({ error: 'Lliçó no trobada' }, { status: 404 })
      }

      return NextResponse.json({ lesson })
    }

    // Obtenir lliçons d'un mòdul
    if (moduleId) {
      const lessons = await prisma.courseLesson.findMany({
        where: { moduleId },
        orderBy: { order: 'asc' },
        include: {
          quiz: {
            select: {
              id: true,
              title: true,
              passingScore: true,
              _count: { select: { questions: true } }
            }
          },
          resources: { orderBy: { order: 'asc' } },
          _count: { select: { progress: true } }
        }
      })

      return NextResponse.json({ lessons })
    }

    return NextResponse.json({ error: 'id o moduleId és obligatori' }, { status: 400 })

  } catch (error) {
    console.error('Error obtenint lliçons:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Crear lliçó, recurs o quiz
export async function POST(request: NextRequest) {
  const auth = await checkAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json()

    // Crear recurs
    if (body.action === 'createResource') {
      if (!body.lessonId || !body.title?.trim() || !body.url?.trim()) {
        return NextResponse.json({
          error: 'lessonId, title i url són obligatoris'
        }, { status: 400 })
      }

      const resource = await createLessonResource({
        lessonId: body.lessonId,
        title: body.title,
        type: body.type || 'LINK',
        url: body.url,
        description: body.description,
        fileSize: body.fileSize
      })

      return NextResponse.json({ resource }, { status: 201 })
    }

    // Crear quiz
    if (body.action === 'createQuiz') {
      if (!body.lessonId) {
        return NextResponse.json({ error: 'lessonId és obligatori' }, { status: 400 })
      }

      if (!Array.isArray(body.questions) || body.questions.length === 0) {
        return NextResponse.json({ error: 'Cal almenys una pregunta' }, { status: 400 })
      }

      const quiz = await createQuiz(body.lessonId, {
        title: body.title,
        description: body.description,
        passingScore: body.passingScore,
        maxAttempts: body.maxAttempts,
        timeLimit: body.timeLimit,
        shuffleQuestions: body.shuffleQuestions,
        showCorrectAnswers: body.showCorrectAnswers,
        questions: body.questions
      })

      return NextResponse.json({ quiz }, { status: 201 })
    }

    // Crear lliçó
    if (!body.moduleId) {
      return NextResponse.json({ error: 'moduleId és obligatori' }, { status: 400 })
    }

    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'El títol és obligatori' }, { status: 400 })
    }

    // Verificar que el mòdul existeix
    const module = await prisma.courseModule.findUnique({
      where: { id: body.moduleId }
    })

    if (!module) {
      return NextResponse.json({ error: 'Mòdul no trobat' }, { status: 404 })
    }

    const lesson = await createLesson({
      moduleId: body.moduleId,
      title: body.title,
      description: body.description,
      type: (body.type as LessonType) || 'TEXT',
      content: body.content,
      videoUrl: body.videoUrl,
      videoDuration: body.videoDuration,
      documentUrl: body.documentUrl,
      externalUrl: body.externalUrl,
      estimatedDuration: body.estimatedDuration,
      order: body.order,
      isFree: body.isFree,
      aiGenerated: body.aiGenerated
    })

    return NextResponse.json({ lesson }, { status: 201 })

  } catch (error) {
    console.error('Error creant lliçó:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// PATCH - Actualitzar lliçó, reordenar, o actualitzar quiz
export async function PATCH(request: NextRequest) {
  const auth = await checkAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json()

    // Reordenar lliçons
    if (body.action === 'reorder') {
      if (!body.moduleId || !Array.isArray(body.lessonIds)) {
        return NextResponse.json({
          error: 'moduleId i lessonIds són obligatoris'
        }, { status: 400 })
      }

      await reorderLessons(body.moduleId, body.lessonIds)
      return NextResponse.json({ success: true })
    }

    // Actualitzar quiz
    if (body.action === 'updateQuiz') {
      if (!body.quizId) {
        return NextResponse.json({ error: 'quizId és obligatori' }, { status: 400 })
      }

      const quiz = await updateQuiz(body.quizId, {
        title: body.title,
        description: body.description,
        passingScore: body.passingScore,
        maxAttempts: body.maxAttempts,
        timeLimit: body.timeLimit,
        shuffleQuestions: body.shuffleQuestions,
        showCorrectAnswers: body.showCorrectAnswers
      })

      return NextResponse.json({ quiz })
    }

    // Moure lliçó a un altre mòdul
    if (body.action === 'move') {
      if (!body.id || !body.targetModuleId) {
        return NextResponse.json({
          error: 'id i targetModuleId són obligatoris'
        }, { status: 400 })
      }

      // Obtenir ordre màxim del mòdul destí
      const maxOrder = await prisma.courseLesson.findFirst({
        where: { moduleId: body.targetModuleId },
        orderBy: { order: 'desc' },
        select: { order: true }
      })

      const lesson = await prisma.courseLesson.update({
        where: { id: body.id },
        data: {
          moduleId: body.targetModuleId,
          order: (maxOrder?.order ?? -1) + 1
        }
      })

      return NextResponse.json({ lesson })
    }

    // Actualitzar lliçó individual
    if (!body.id) {
      return NextResponse.json({ error: 'ID de la lliçó obligatori' }, { status: 400 })
    }

    const allowedFields = [
      'title', 'description', 'type', 'content', 'videoUrl', 'videoDuration',
      'documentUrl', 'externalUrl', 'estimatedDuration', 'order',
      'isPublished', 'isFree', 'requiresCompletion'
    ]

    const updateData: any = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const lesson = await updateLesson(body.id, updateData)
    return NextResponse.json({ lesson })

  } catch (error) {
    console.error('Error actualitzant lliçó:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar lliçó, recurs o quiz
export async function DELETE(request: NextRequest) {
  const auth = await checkAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const resourceId = searchParams.get('resourceId')
    const quizId = searchParams.get('quizId')

    // Eliminar recurs
    if (resourceId) {
      await deleteLessonResource(resourceId)
      return NextResponse.json({ message: 'Recurs eliminat' })
    }

    // Eliminar quiz
    if (quizId) {
      await deleteQuiz(quizId)
      return NextResponse.json({ message: 'Quiz eliminat' })
    }

    // Eliminar lliçó
    if (!id) {
      return NextResponse.json({ error: 'ID de la lliçó obligatori' }, { status: 400 })
    }

    // Verificar que existeix
    const lesson = await prisma.courseLesson.findUnique({
      where: { id },
      include: { _count: { select: { progress: true } } }
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lliçó no trobada' }, { status: 404 })
    }

    // Avisar si té progrés d'usuaris
    if (lesson._count.progress > 0) {
      console.log(`Eliminant lliçó amb ${lesson._count.progress} registres de progrés`)
    }

    await deleteLesson(id)
    return NextResponse.json({ message: 'Lliçó eliminada correctament' })

  } catch (error) {
    console.error('Error eliminant:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
