import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    if (q.length < 2) {
      return NextResponse.json({ offers: [] })
    }

    const offers = await prismaClient.offer.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { shortDescription: { contains: q, mode: 'insensitive' } },
        ]
      },
      select: {
        id: true,
        title: true,
        shortDescription: true,
        images: true,
        company: {
          select: {
            name: true,
          }
        },
        category: {
          select: {
            name: true,
          }
        },
      },
      take: limit,
      orderBy: { title: 'asc' },
    })

    // Formatejar la resposta
    const formattedOffers = offers.map(offer => ({
      id: offer.id,
      title: offer.title,
      company: offer.company?.name || null,
      category: offer.category?.name || null,
      image: offer.images?.[0] || null,
    }))

    return NextResponse.json({ offers: formattedOffers })
  } catch (error) {
    console.error('Error searching offers:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
