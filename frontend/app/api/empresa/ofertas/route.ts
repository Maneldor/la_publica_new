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

    // Buscar usuario y empresa
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email },
      include: {
        ownedCompany: true,
        memberCompany: true
      }
    });

    // Determinar la empresa (owned o member)
    const company = user?.ownedCompany || user?.memberCompany;

    if (!company) {
      return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');

    // Build where clause
    const where: any = {
      companyId: company.id
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status) {
      where.status = status.toUpperCase();
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get total count
    const total = await prismaClient.offer.count({ where });

    // Get paginated offers
    const offers = await prismaClient.offer.findMany({
      where,
      include: {
        category: true
      },
      orderBy: [
        { featured: 'desc' },
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    });

    // Get comprehensive stats
    const stats = {
      total,
      draft: await prismaClient.offer.count({
        where: { companyId: company.id, status: 'DRAFT' }
      }),
      pending: await prismaClient.offer.count({
        where: { companyId: company.id, status: 'PENDING' }
      }),
      published: await prismaClient.offer.count({
        where: { companyId: company.id, status: 'PUBLISHED' }
      }),
      rejected: await prismaClient.offer.count({
        where: { companyId: company.id, status: 'REJECTED' }
      }),
      paused: await prismaClient.offer.count({
        where: { companyId: company.id, status: 'PAUSED' }
      }),
      expired: await prismaClient.offer.count({
        where: { companyId: company.id, status: 'EXPIRED' }
      }),
      featured: await prismaClient.offer.count({
        where: { companyId: company.id, featured: true }
      })
    };

    return NextResponse.json({
      success: true,
      data: {
        offers,
        stats,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error: any) {
    console.error('Error fetching offers:', error);
    return NextResponse.json(
      { error: 'Error al obtener ofertas', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Buscar usuario y empresa
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email },
      include: {
        ownedCompany: {
          include: {
            currentPlan: true,
            subscriptions: {
              where: { status: 'ACTIVE' },
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        },
        memberCompany: {
          include: {
            currentPlan: true,
            subscriptions: {
              where: { status: 'ACTIVE' },
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      }
    });

    // Determinar la empresa (owned o member)
    const company = user?.ownedCompany || user?.memberCompany;

    if (!company) {
      return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 });
    }

    // Check limit - usar maxActiveOffers del plan
    const currentCount = await prismaClient.offer.count({
      where: { companyId: company.id, status: 'PUBLISHED' }
    });

    const limit = company.currentPlan?.maxActiveOffers || 0;

    if (limit !== -1 && currentCount >= limit) {
      return NextResponse.json({
        error: 'Límit d\'ofertes assolit',
        message: `Has arribat al límit de ${limit} ofertes actives del teu pla. Actualitza el teu pla per crear més ofertes.`,
        currentCount,
        limit
      }, { status: 403 });
    }

    // Get body
    const body = await request.json();
    const {
      title,
      categoryId,
      description,
      shortDescription,
      price,
      originalPrice,
      currency = 'EUR',
      priceType,
      status = 'DRAFT',
      priority = 0,
      featured = false,
      featuredUntil,
      contactMethod = 'EMAIL',
      contactEmail,
      contactPhone,
      contactForm,
      externalUrl,
      requirements,
      benefits,
      duration,
      location,
      remote = false,
      tags = [],
      seoTitle,
      seoDescription,
      seoKeywords = [],
      images = [],
      internalNotes
    } = body;

    // Validate required fields
    if (!title || !categoryId || !description) {
      return NextResponse.json({
        error: 'Camps obligatoris',
        message: 'Títol, categoria i descripció són obligatoris'
      }, { status: 400 });
    }

    // Validate category exists
    const category = await prismaClient.offerCategory.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return NextResponse.json({
        error: 'Categoria no vàlida',
        message: 'La categoria seleccionada no existeix'
      }, { status: 400 });
    }

    // Generate slug
    const baseSlug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if slug exists and make it unique
    let slug = baseSlug;
    let counter = 1;
    while (await prismaClient.offer.findFirst({
      where: { companyId: company.id, slug }
    })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create offer with proper status handling
    const offer = await prismaClient.offer.create({
      data: {
        companyId: company.id,
        categoryId,
        title,
        slug,
        description,
        shortDescription,
        price: price ? parseFloat(price) : null,
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        currency,
        priceType: priceType || 'FIXED',

        // Status handling
        status: status.toUpperCase(),
        publishedAt: status.toUpperCase() === 'PUBLISHED' ? new Date() : null,
        submittedAt: body.submittedAt || (status.toUpperCase() === 'PENDING' ? new Date() : null),

        priority,
        featured,
        featuredUntil: featuredUntil ? new Date(featuredUntil) : null,
        contactMethod: contactMethod ? contactMethod.toUpperCase() : 'EMAIL',
        contactEmail,
        contactPhone,
        contactForm,
        externalUrl,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        requirements,
        benefits,
        duration,
        location,
        remote,
        tags,
        images,
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || shortDescription || description.substring(0, 160),
        seoKeywords,
        internalNotes
      },
      include: {
        category: true
      }
    });

    return NextResponse.json({
      success: true,
      data: offer
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating offer:', error);
    return NextResponse.json(
      { error: 'Error al crear oferta', details: error.message },
      { status: 500 }
    );
  }
}