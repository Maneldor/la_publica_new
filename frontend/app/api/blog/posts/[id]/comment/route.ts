import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createComment } from '@/lib/services/blogService'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { content, parentId } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: 'El contingut és obligatori' }, { status: 400 })
    }

    const comment = await createComment(id, session.user.id, content, parentId)

    return NextResponse.json({
      comment,
      message: 'Comentari enviat. Pendent de moderació.'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creant comentari:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Error del servidor'
    }, { status: 500 })
  }
}
