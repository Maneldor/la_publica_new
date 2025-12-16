import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

async function checkAdminAccess() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return { authorized: false, error: 'No autenticat' }
  }
  const role = session.user.role as string
  if (!['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO'].includes(role)) {
    return { authorized: false, error: 'No autoritzat' }
  }
  return { authorized: true, userId: session.user.id }
}

// GET - Obtenir tots els extras amb filtres opcionals
export async function GET(request: NextRequest) {
  try {
    const access = await checkAdminAccess()
    if (!access.authorized) {
      return NextResponse.json({ success: false, error: access.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const active = searchParams.get('active')
    const search = searchParams.get('search')

    const where: any = {}

    if (category && category !== 'ALL') {
      where.category = category
    }

    if (active === 'true') {
      where.active = true
    } else if (active === 'false') {
      where.active = false
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const extras = await prismaClient.extra.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ],
      include: {
        _count: {
          select: {
            budgetItems: true,
            invoiceItems: true
          }
        }
      }
    })

    // Transformar Decimal a number per la UI
    const formattedExtras = extras.map(extra => ({
      ...extra,
      basePrice: Number(extra.basePrice)
    }))

    return NextResponse.json({ success: true, extras: formattedExtras })
  } catch (error) {
    console.error('Error fetching extras:', error)
    return NextResponse.json({ success: false, error: 'Error obtenint extras' }, { status: 500 })
  }
}

// POST - Crear nou extra o seed
export async function POST(request: NextRequest) {
  try {
    const access = await checkAdminAccess()
    if (!access.authorized) {
      return NextResponse.json({ success: false, error: access.error }, { status: 401 })
    }

    const body = await request.json()

    // Si és una petició de seed
    if (body.action === 'seed') {
      return await seedBaseExtras()
    }

    const newExtra = await prismaClient.extra.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description || '',
        category: body.category || 'OTHER',
        basePrice: body.basePrice || 0,
        priceType: body.priceType || 'FIXED',
        active: body.active ?? true,
        featured: body.featured || false,
        requiresApproval: body.requiresApproval || false,
        icon: body.icon,
        image: body.image,
        details: body.details || {},
        order: body.order || 0
      }
    })

    return NextResponse.json({ success: true, data: newExtra }, { status: 201 })
  } catch (error) {
    console.error('Error creating extra:', error)
    return NextResponse.json({ success: false, error: 'Error creant extra' }, { status: 500 })
  }
}

// Funció per crear extras base
async function seedBaseExtras() {
  try {
    // Eliminar extras existents amb slugs base
    await prismaClient.extra.deleteMany({
      where: {
        slug: { in: [
          'manteniment-web', 'branding-basic', 'seo-basic',
          'contingut-blog', 'formacio-equip', 'suport-premium'
        ]}
      }
    })

    const baseExtras = [
      {
        name: 'Manteniment Web',
        slug: 'manteniment-web',
        description: 'Manteniment mensual del lloc web: actualitzacions, còpies de seguretat i suport tècnic',
        category: 'WEB_MAINTENANCE' as const,
        basePrice: 150,
        priceType: 'MONTHLY' as const,
        active: true,
        featured: true,
        icon: 'wrench',
        order: 1
      },
      {
        name: 'Branding Bàsic',
        slug: 'branding-basic',
        description: 'Disseny de logotip, paleta de colors i guia d\'estil bàsica',
        category: 'BRANDING' as const,
        basePrice: 500,
        priceType: 'FIXED' as const,
        active: true,
        featured: false,
        icon: 'palette',
        order: 2
      },
      {
        name: 'SEO Bàsic',
        slug: 'seo-basic',
        description: 'Optimització SEO on-page, auditoria i recomanacions',
        category: 'SEO' as const,
        basePrice: 300,
        priceType: 'MONTHLY' as const,
        active: true,
        featured: true,
        icon: 'search',
        order: 3
      },
      {
        name: 'Contingut Blog',
        slug: 'contingut-blog',
        description: 'Redacció de 4 articles de blog mensuals optimitzats per SEO',
        category: 'CONTENT' as const,
        basePrice: 400,
        priceType: 'MONTHLY' as const,
        active: true,
        featured: false,
        icon: 'file-text',
        order: 4
      },
      {
        name: 'Formació Equip',
        slug: 'formacio-equip',
        description: 'Sessions de formació personalitzada per al vostre equip',
        category: 'TRAINING' as const,
        basePrice: 100,
        priceType: 'HOURLY' as const,
        active: true,
        featured: false,
        icon: 'users',
        order: 5
      },
      {
        name: 'Suport Premium',
        slug: 'suport-premium',
        description: 'Suport tècnic prioritari amb temps de resposta garantit de 4h',
        category: 'SUPPORT' as const,
        basePrice: 200,
        priceType: 'MONTHLY' as const,
        active: true,
        featured: true,
        icon: 'headphones',
        order: 6
      }
    ]

    let created = 0
    for (const extraData of baseExtras) {
      await prismaClient.extra.create({ data: extraData })
      created++
    }

    return NextResponse.json({
      success: true,
      message: `S'han creat ${created} serveis extra correctament.`,
      created
    })
  } catch (error) {
    console.error('Error seeding extras:', error)
    return NextResponse.json({ success: false, error: 'Error creant extras base' }, { status: 500 })
  }
}
