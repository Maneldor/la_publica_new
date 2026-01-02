import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient as prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const sector = searchParams.get('sector') || ''
    const tab = searchParams.get('tab') || 'totes'

    // Obtener TODAS las empresas primero (como hace gestió)
    const todasEmpresas = await prisma.company.findMany({
      include: {
        currentPlan: {
          select: {
            tier: true,
            name: true,
            nombreCorto: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    // Filtrar solo las PUBLICADAS (status = 'PUBLISHED')
    let empresasPublicadas = todasEmpresas.filter(emp => emp.status === 'PUBLISHED')

    // Aplicar búsqueda
    if (search) {
      const searchLower = search.toLowerCase()
      empresasPublicadas = empresasPublicadas.filter(emp =>
        emp.name.toLowerCase().includes(searchLower) ||
        emp.description?.toLowerCase().includes(searchLower) ||
        emp.sector?.toLowerCase().includes(searchLower) ||
        emp.address?.toLowerCase().includes(searchLower)
      )
    }

    // Filtrar por sector
    if (sector) {
      empresasPublicadas = empresasPublicadas.filter(emp =>
        emp.sector?.toLowerCase().includes(sector.toLowerCase())
      )
    }

    // Estadísticas
    const stats = {
      total: empresasPublicadas.length,
      verificades: empresasPublicadas.filter(e => e.isVerified).length,
      noves: empresasPublicadas.filter(e => {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        return new Date(e.createdAt) >= thirtyDaysAgo
      }).length
    }

    // Filtrar por tab
    let empresasFiltradas = [...empresasPublicadas]
    if (tab === 'destacades') {
      empresasFiltradas = empresasPublicadas.filter(e =>
        e.isVerified ||
        ['PREMIUM', 'ENTERPRISE', 'STRATEGIC'].includes(e.currentPlan?.tier || '')
      )
    } else if (tab === 'noves') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      empresasFiltradas = empresasPublicadas.filter(e => new Date(e.createdAt) >= thirtyDaysAgo)
    }

    // Obtener sectores únicos
    const sectors = [...new Set(empresasPublicadas.map(e => e.sector).filter(Boolean))] as string[]

    // Mapear datos para el frontend
    const data = empresasFiltradas.map(empresa => ({
      id: empresa.id,
      slug: empresa.slug,
      name: empresa.name,
      description: empresa.description,
      slogan: empresa.slogan,
      sector: empresa.sector,
      address: empresa.address,
      logo: empresa.logo || empresa.logoUrl,
      coverImage: empresa.coverImage,
      website: empresa.website,
      email: empresa.email,
      phone: empresa.phone,
      size: empresa.size,
      foundingYear: empresa.foundingYear,
      isVerified: empresa.isVerified,
      tags: empresa.tags || [],
      currentPlan: empresa.currentPlan
    }))

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page: 1,
        limit: data.length,
        total: data.length,
        totalPages: 1
      },
      stats,
      filters: {
        sectors: sectors.sort()
      }
    })

  } catch (error) {
    console.error('Error en API dashboard empreses:', error)
    return NextResponse.json(
      { success: false, error: 'Error carregant empreses: ' + (error as Error).message, data: [] },
      { status: 500 }
    )
  }
}
