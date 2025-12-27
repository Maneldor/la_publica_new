// app/api/gestio/courses/generate/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  generateCourseOutline,
  generateFullCourse,
  regenerateLessonContent,
  improveLessonContent,
  expandLessonContent,
  simplifyLessonContent,
  generateLessonSummary,
  generatePracticeExercises
} from '@/lib/services/courseAIService'
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

// POST - Generar curs o contingut amb IA
export async function POST(request: NextRequest) {
  const auth = await checkAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      // Generar estructura/outline del curs
      case 'outline': {
        if (!body.topic?.trim()) {
          return NextResponse.json({ error: 'El tema és obligatori' }, { status: 400 })
        }

        const outline = await generateCourseOutline({
          topic: body.topic,
          type: (body.type as CourseType) || 'BASIC',
          level: (body.level as CourseLevel) || 'BEGINNER',
          targetAudience: body.targetAudience,
          additionalInstructions: body.additionalInstructions,
          createdById: auth.userId,
          language: body.language
        })

        return NextResponse.json({ outline })
      }

      // Generar curs complet
      case 'full': {
        if (!body.topic?.trim()) {
          return NextResponse.json({ error: 'El tema és obligatori' }, { status: 400 })
        }

        const courseId = await generateFullCourse({
          topic: body.topic,
          type: (body.type as CourseType) || 'BASIC',
          level: (body.level as CourseLevel) || 'BEGINNER',
          targetAudience: body.targetAudience,
          additionalInstructions: body.additionalInstructions,
          categoryId: body.categoryId,
          createdById: auth.userId,
          language: body.language
        })

        return NextResponse.json({ courseId }, { status: 201 })
      }

      // Regenerar contingut d'una lliçó
      case 'regenerate': {
        if (!body.lessonId) {
          return NextResponse.json({ error: 'L\'ID de la lliçó és obligatori' }, { status: 400 })
        }

        await regenerateLessonContent(body.lessonId)
        return NextResponse.json({ success: true })
      }

      // Millorar contingut d'una lliçó
      case 'improve': {
        if (!body.lessonId) {
          return NextResponse.json({ error: 'L\'ID de la lliçó és obligatori' }, { status: 400 })
        }
        if (!body.instructions?.trim()) {
          return NextResponse.json({ error: 'Les instruccions són obligatòries' }, { status: 400 })
        }

        await improveLessonContent(body.lessonId, body.instructions)
        return NextResponse.json({ success: true })
      }

      // Expandir contingut
      case 'expand': {
        if (!body.lessonId) {
          return NextResponse.json({ error: 'L\'ID de la lliçó és obligatori' }, { status: 400 })
        }

        await expandLessonContent(body.lessonId)
        return NextResponse.json({ success: true })
      }

      // Simplificar contingut
      case 'simplify': {
        if (!body.lessonId) {
          return NextResponse.json({ error: 'L\'ID de la lliçó és obligatori' }, { status: 400 })
        }

        await simplifyLessonContent(body.lessonId)
        return NextResponse.json({ success: true })
      }

      // Generar resum
      case 'summary': {
        if (!body.lessonId) {
          return NextResponse.json({ error: 'L\'ID de la lliçó és obligatori' }, { status: 400 })
        }

        const summary = await generateLessonSummary(body.lessonId)
        return NextResponse.json({ summary })
      }

      // Generar exercicis pràctics
      case 'exercises': {
        if (!body.lessonId) {
          return NextResponse.json({ error: 'L\'ID de la lliçó és obligatori' }, { status: 400 })
        }

        const exercises = await generatePracticeExercises(body.lessonId)
        return NextResponse.json({ exercises })
      }

      default:
        return NextResponse.json({ error: 'Acció no vàlida' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error generant contingut IA:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Error generant el contingut'
    }, { status: 500 })
  }
}
