import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { votePoll } from '@/lib/services/blogService'

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

    const { optionIds } = await request.json()

    if (!optionIds?.length) {
      return NextResponse.json({ error: 'Has de seleccionar almenys una opció' }, { status: 400 })
    }

    const result = await votePoll(id, optionIds, session.user.id)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error votant:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Error del servidor'
    }, { status: 500 })
  }
}
