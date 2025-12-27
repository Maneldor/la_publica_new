import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ALLOWED_ROLES = ['ADMIN', 'SUPER_ADMIN', 'CRM_CONTINGUT', 'ADMIN_GESTIO']

// POST - Afegir tema (fix o dinàmic)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: scheduleId } = await params
    const body = await request.json()
    const { type, ...topicData } = body

    if (type === 'fixed') {
      // Verificar que no existeix ja un tema per aquest dia
      const existing = await prisma.blogAutoFixedTopic.findUnique({
        where: {
          scheduleId_dayOfWeek: {
            scheduleId,
            dayOfWeek: topicData.dayOfWeek
          }
        }
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Ja existeix un tema per aquest dia' },
          { status: 400 }
        )
      }

      const topic = await prisma.blogAutoFixedTopic.create({
        data: {
          scheduleId,
          dayOfWeek: topicData.dayOfWeek,
          topic: topicData.topic,
          description: topicData.description,
          categoryId: topicData.categoryId,
          keywords: topicData.keywords || [],
          suggestedSubtopics: topicData.suggestedSubtopics || []
        },
        include: { category: true }
      })

      return NextResponse.json({ topic }, { status: 201 })
    }

    if (type === 'dynamic') {
      const topic = await prisma.blogAutoDynamicTopic.create({
        data: {
          scheduleId,
          topic: topicData.topic,
          description: topicData.description,
          categoryId: topicData.categoryId,
          keywords: topicData.keywords || [],
          priority: topicData.priority || 0,
          useAfterDate: topicData.useAfterDate ? new Date(topicData.useAfterDate) : null,
          useBeforeDate: topicData.useBeforeDate ? new Date(topicData.useBeforeDate) : null,
          createdById: session.user.id
        },
        include: { category: true }
      })

      return NextResponse.json({ topic }, { status: 201 })
    }

    return NextResponse.json({ error: 'Tipus invàlid' }, { status: 400 })

  } catch (error) {
    console.error('Error afegint tema:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar tema
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { searchParams } = new URL(request.url)
    const topicId = searchParams.get('topicId')
    const type = searchParams.get('type')

    if (!topicId || !type) {
      return NextResponse.json({ error: 'Paràmetres requerits: topicId, type' }, { status: 400 })
    }

    if (type === 'fixed') {
      await prisma.blogAutoFixedTopic.delete({
        where: { id: topicId }
      })
    } else if (type === 'dynamic') {
      await prisma.blogAutoDynamicTopic.delete({
        where: { id: topicId }
      })
    } else {
      return NextResponse.json({ error: 'Tipus invàlid' }, { status: 400 })
    }

    return NextResponse.json({ message: 'Tema eliminat' })

  } catch (error) {
    console.error('Error eliminant tema:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
