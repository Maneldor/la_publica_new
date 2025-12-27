import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { toggleBookmark } from '@/lib/services/blogService'

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

    const result = await toggleBookmark(id, session.user.id)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error amb bookmark:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
