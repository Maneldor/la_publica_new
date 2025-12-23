import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    if (query.length < 2) {
      return NextResponse.json({ empreses: [] })
    }

    const empreses = await prisma.company.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { cif: { contains: query, mode: 'insensitive' } }
        ],
        status: { in: ['APPROVED', 'PENDING'] }
      },
      select: {
        id: true,
        name: true,
        cif: true,
        email: true,
        logo: true,
        address: true,
        status: true
      },
      take: limit,
      orderBy: [
        { status: 'asc' }, // APPROVED first
        { name: 'asc' }
      ]
    })

    return NextResponse.json({ empreses })
  } catch (error) {
    console.error('Error searching companies:', error)
    return NextResponse.json({ error: 'Error cercant empreses' }, { status: 500 })
  }
}
