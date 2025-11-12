import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

/**
 * GET /api/admin/extras
 * Lista todos los extras con filtros opcionales
 * Query params: category, active, search
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Verificar autenticación y rol
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado. Inicia sesión requerida.' },
        { status: 401 }
      );
    }

    // Verificar rol de admin obteniendo el user completo de la DB
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email! },
      select: { userType: true, isActive: true }
    });

    if (!user || user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores.' },
        { status: 403 }
      );
    }

    // 2. Obtener parámetros de query
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const activeParam = searchParams.get('active');
    const search = searchParams.get('search');

    // 3. Construir filtros dinámicos
    const where: any = {};

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (activeParam !== null && activeParam !== 'ALL') {
      where.active = activeParam === 'true';
    }

    if (search && search.trim() !== '') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    // 4. Consultar base de datos
    const extras = await prismaClient.extra.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { order: 'asc' },
        { name: 'asc' },
      ],
      include: {
        _count: {
          select: {
            budgetItems: true,
            invoiceItems: true,
          },
        },
      },
    });

    // 5. Estadísticas rápidas
    const stats = {
      total: extras.length,
      active: extras.filter(e => e.active).length,
      featured: extras.filter(e => e.featured).length,
    };

    return NextResponse.json({
      success: true,
      extras,
      stats,
    });

  } catch (error) {
    console.error('❌ Error fetching extras:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener extras',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/extras
 * Crea un nuevo extra
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado. Inicia sesión requerida.' },
        { status: 401 }
      );
    }

    // Verificar rol de admin
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email! },
      select: { userType: true, isActive: true }
    });

    if (!user || user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores.' },
        { status: 403 }
      );
    }

    // 2. Obtener datos del body
    const body = await request.json();

    // 3. Validar campos requeridos
    const requiredFields = ['name', 'category', 'basePrice', 'priceType'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: 'Faltan campos requeridos',
          missing: missingFields
        },
        { status: 400 }
      );
    }

    // 4. Validar precio
    const price = parseFloat(body.basePrice);
    if (isNaN(price) || price < 0) {
      return NextResponse.json(
        { error: 'El precio debe ser un número positivo' },
        { status: 400 }
      );
    }

    // 5. Generar slug único
    let slug = body.slug;
    if (!slug) {
      slug = body.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    // 6. Verificar que el slug sea único
    const existingExtra = await prismaClient.extra.findUnique({
      where: { slug },
    });

    if (existingExtra) {
      // Añadir timestamp al slug para hacerlo único
      slug = `${slug}-${Date.now()}`;
    }

    // 7. Crear extra
    const extra = await prismaClient.extra.create({
      data: {
        name: body.name.trim(),
        slug,
        description: body.description?.trim() || '',
        category: body.category,
        basePrice: price,
        priceType: body.priceType,
        active: body.active ?? true,
        featured: body.featured ?? false,
        requiresApproval: body.requiresApproval ?? false,
        icon: body.icon?.trim() || null,
        image: body.image?.trim() || null,
        details: body.details || null,
        order: body.order ?? 0,
      },
    });

    console.log('✅ Extra creado:', extra.name);

    return NextResponse.json({
      success: true,
      extra,
      message: 'Extra creado correctamente'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating extra:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al crear extra',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}