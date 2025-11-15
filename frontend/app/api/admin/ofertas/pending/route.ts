import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Verify user is admin
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accés no autoritzat' }, { status: 403 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {
      status: 'PENDING'
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { company: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    // Get total count
    const total = await prismaClient.offer.count({ where });

    // Get pending offers
    const offers = await prismaClient.offer.findMany({
      where,
      include: {
        category: true,
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            logo: true
          }
        }
      },
      orderBy: {
        submittedAt: 'asc' // Oldest first (FIFO)
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // Get stats
    const stats = {
      pending: total,
      today: await prismaClient.offer.count({
        where: {
          status: 'PENDING',
          submittedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      thisWeek: await prismaClient.offer.count({
        where: {
          status: 'PENDING',
          submittedAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 7))
          }
        }
      })
    };

    return NextResponse.json({
      offers,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    console.error('Error fetching pending offers:', error);
    return NextResponse.json(
      { error: 'Error al obtenir ofertes pendents', details: error.message },
      { status: 500 }
    );
  }
}