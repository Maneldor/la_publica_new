import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  getPendingModerationPosts,
  getPendingReports,
  resolveReport
} from '@/lib/services/postManagementService'

const ALLOWED_ROLES = ['ADMIN', 'SUPER_ADMIN', 'CRM_CONTINGUT', 'ADMIN_GESTIO', 'COMMUNITY_MANAGER', 'MODERATOR']

// GET - Obtenir posts o reports pendents de moderació
export async function GET(request: NextRequest) {
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
    const type = searchParams.get('type') || 'posts'
    const limit = parseInt(searchParams.get('limit') || '20')

    if (type === 'reports') {
      const reports = await getPendingReports(limit)
      return NextResponse.json({ reports })
    }

    const posts = await getPendingModerationPosts(limit)
    return NextResponse.json({ posts })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Resoldre report
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
    const { reportId, status, note } = body

    if (!reportId || !status) {
      return NextResponse.json(
        { error: 'reportId i status són obligatoris' },
        { status: 400 }
      )
    }

    const report = await resolveReport(reportId, session.user.id, status, note)

    return NextResponse.json({ report })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
