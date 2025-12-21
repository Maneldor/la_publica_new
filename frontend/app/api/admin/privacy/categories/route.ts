import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

// GET - Llistar categories sensibles
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const categories = await prismaClient.sensitiveJobCategory.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { users: true },
        },
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error obtenint categories sensibles:', error)
    return NextResponse.json(
      { error: 'Error intern del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nova categoria sensible
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 403 })
    }

    const body = await request.json()

    // Validar camps requerits
    if (!body.name) {
      return NextResponse.json(
        { error: 'El nom és obligatori' },
        { status: 400 }
      )
    }

    // Generar slug si no es proporciona
    const slug =
      body.slug ||
      body.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

    // Verificar que el slug no existeixi
    const existingCategory = await prismaClient.sensitiveJobCategory.findUnique({
      where: { slug },
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Ja existeix una categoria amb aquest slug' },
        { status: 400 }
      )
    }

    const category = await prismaClient.sensitiveJobCategory.create({
      data: {
        name: body.name,
        slug,
        description: body.description || null,
        icon: body.icon || null,
        color: body.color || null,
        departmentPatterns: body.departmentPatterns || [],
        positionPatterns: body.positionPatterns || [],
        forceHidePosition: body.forceHidePosition ?? true,
        forceHideDepartment: body.forceHideDepartment ?? false,
        forceHideBio: body.forceHideBio ?? true,
        forceHideLocation: body.forceHideLocation ?? true,
        forceHidePhone: body.forceHidePhone ?? true,
        forceHideEmail: body.forceHideEmail ?? true,
        forceHideGroups: body.forceHideGroups ?? true,
        isActive: body.isActive ?? true,
        createdById: session.user.id,
      },
    })

    // Registrar al log d'auditoria
    await prismaClient.privacyAuditLog.create({
      data: {
        userId: 'SYSTEM',
        changedById: session.user.id,
        changedByRole: 'ADMIN',
        fieldChanged: 'category_created',
        oldValue: null,
        newValue: JSON.stringify({ id: category.id, name: category.name }),
        reason: `Categoria sensible "${category.name}" creada`,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creant categoria sensible:', error)
    return NextResponse.json(
      { error: 'Error intern del servidor' },
      { status: 500 }
    )
  }
}
