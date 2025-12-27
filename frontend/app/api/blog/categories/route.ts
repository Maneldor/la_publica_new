import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCategories, createCategory } from '@/lib/services/blogService'

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'CRM_CONTINGUT', 'ADMIN_GESTIO']

export async function GET() {
  try {
    const categories = await getCategories()
    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error obtenint categories:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

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

    if (!user || !ADMIN_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Accés denegat' }, { status: 403 })
    }

    const body = await request.json()

    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'El nom és obligatori' }, { status: 400 })
    }

    const category = await createCategory(body)

    return NextResponse.json({ category }, { status: 201 })

  } catch (error) {
    console.error('Error creant categoria:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
