// app/api/gestio/empreses/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prismaClient as prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Buscar empresas directamente sin autenticación (temporal para debug)
    const where: any = {}

    // Aplicar filtros básicos
    if (searchParams.get('search')) {
      const search = searchParams.get('search')!
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { cif: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { sector: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (searchParams.get('status')) {
      where.status = { in: searchParams.get('status')!.split(',') }
    }

    if (searchParams.get('planTier')) {
      where.currentPlan = {
        tier: { in: searchParams.get('planTier')!.split(',') }
      }
    }

    if (searchParams.get('accountManagerId')) {
      where.accountManagerId = searchParams.get('accountManagerId')!
    }

    const empreses = await prisma.company.findMany({
      where,
      include: {
        currentPlan: {
          select: {
            id: true,
            tier: true,
            nombreCorto: true
          }
        },
        accountManager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    // Calcular completitud
    const empresesConCompletitud = empreses.map(empresa => ({
      ...empresa,
      completionPercentage: calculateCompletionPercentage(empresa)
    }))

    return NextResponse.json({ data: empresesConCompletitud })
  } catch (error) {
    console.error('Error en API gestio empreses:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor: ' + (error as Error).message, data: [] },
      { status: 200 }
    )
  }
}

function calculateCompletionPercentage(empresa: any): number {
  const requiredFields = [
    'name', 'cif', 'email', 'description', 'logo', 'phone', 'address', 'website', 'sector'
  ]

  let completed = 0
  requiredFields.forEach(field => {
    if (empresa[field]) completed++
  })

  return Math.round((completed / requiredFields.length) * 100)
}