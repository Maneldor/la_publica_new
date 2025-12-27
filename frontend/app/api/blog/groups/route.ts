import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getGroups } from '@/lib/services/blogService'

// GET - Obtenir grups disponibles
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const groups = await getGroups()

    return NextResponse.json({ groups })

  } catch (error) {
    console.error('Error obtenint grups:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
