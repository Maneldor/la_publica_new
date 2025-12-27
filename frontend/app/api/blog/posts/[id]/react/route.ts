import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { toggleReaction } from '@/lib/services/blogService'
import { ReactionType } from '@prisma/client'

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

    const { type } = await request.json()

    if (!Object.values(ReactionType).includes(type)) {
      return NextResponse.json({ error: 'Tipus de reacció invàlid' }, { status: 400 })
    }

    const result = await toggleReaction(id, session.user.id, type)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error amb reacció:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
