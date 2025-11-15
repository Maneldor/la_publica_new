import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const categories = await prismaClient.offerCategory.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        color: true,
        _count: {
          select: {
            offers: {
              where: {
                status: 'PUBLISHED',
                publishedAt: {
                  not: null
                }
              }
            }
          }
        }
      }
    });

    // Transform to include offer count as a direct property
    const categoriesWithCount = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      color: category.color,
      offerCount: category._count.offers
    }));

    return NextResponse.json({
      success: true,
      data: categoriesWithCount
    });

  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Error al obtener categorías', details: error.message },
      { status: 500 }
    );
  }
}