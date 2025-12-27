import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ALLOWED_ROLES = ['ADMIN', 'SUPER_ADMIN', 'CRM_CONTINGUT', 'ADMIN_GESTIO']

// GET - Obtenir programacions
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || !ALLOWED_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Accés denegat' }, { status: 403 })
    }

    const schedules = await prisma.blogAutoSchedule.findMany({
      include: {
        fixedTopics: {
          orderBy: { dayOfWeek: 'asc' },
          include: { category: true }
        },
        dynamicTopics: {
          where: { status: 'PENDING' },
          orderBy: { priority: 'desc' },
          include: { category: true }
        },
        defaultCategory: true,
        createdBy: { select: { id: true, name: true, nick: true } },
        _count: {
          select: {
            logs: true,
            fixedTopics: true,
            dynamicTopics: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ schedules })

  } catch (error) {
    console.error('Error obtenint programacions:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Crear programació
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || !ALLOWED_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Accés denegat' }, { status: 403 })
    }

    const body = await request.json()

    const {
      name,
      frequency,
      daysOfWeek,
      publishTime,
      autoPublish,
      defaultCategoryId,
      defaultVisibility,
      notifyOnGenerate,
      notifyUserIds,
      language,
      tone,
      articleLength,
      fixedTopics,
      dynamicTopics
    } = body

    // Calcular nextRunAt
    const now = new Date()
    const [hours, minutes] = (publishTime || '08:00').split(':').map(Number)
    const nextRun = new Date(now)
    nextRun.setHours(hours, minutes, 0, 0)
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1)
    }

    const schedule = await prisma.blogAutoSchedule.create({
      data: {
        name: name || 'Programació principal',
        frequency: frequency || 'DAILY',
        daysOfWeek: daysOfWeek || [1, 2, 3, 4, 5],
        publishTime: publishTime || '08:00',
        autoPublish: autoPublish || false,
        defaultCategoryId,
        defaultVisibility: defaultVisibility || 'PUBLIC',
        notifyOnGenerate: notifyOnGenerate ?? true,
        notifyUserIds: notifyUserIds || [],
        language: language || 'ca',
        tone: tone || 'professional',
        articleLength: articleLength || 'MEDIUM',
        createdById: session.user.id,
        nextRunAt: nextRun,
        fixedTopics: fixedTopics ? {
          create: fixedTopics.map((topic: {
            dayOfWeek: number
            topic: string
            description?: string
            categoryId?: string
            keywords?: string[]
            suggestedSubtopics?: string[]
          }) => ({
            dayOfWeek: topic.dayOfWeek,
            topic: topic.topic,
            description: topic.description,
            categoryId: topic.categoryId,
            keywords: topic.keywords || [],
            suggestedSubtopics: topic.suggestedSubtopics || []
          }))
        } : undefined,
        dynamicTopics: dynamicTopics ? {
          create: dynamicTopics.map((topic: {
            topic: string
            description?: string
            categoryId?: string
            keywords?: string[]
            priority?: number
            useAfterDate?: string
            useBeforeDate?: string
          }) => ({
            topic: topic.topic,
            description: topic.description,
            categoryId: topic.categoryId,
            keywords: topic.keywords || [],
            priority: topic.priority || 0,
            useAfterDate: topic.useAfterDate ? new Date(topic.useAfterDate) : null,
            useBeforeDate: topic.useBeforeDate ? new Date(topic.useBeforeDate) : null,
            createdById: session.user.id
          }))
        } : undefined
      },
      include: {
        fixedTopics: true,
        dynamicTopics: true,
        defaultCategory: true
      }
    })

    return NextResponse.json({ schedule }, { status: 201 })

  } catch (error) {
    console.error('Error creant programació:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
