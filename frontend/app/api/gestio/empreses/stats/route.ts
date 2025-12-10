// app/api/gestio/empreses/stats/route.ts
import { NextResponse } from 'next/server'
import { prismaClient as prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Calcular estadísticas directamente sin autenticación (temporal para debug)
    const [total, verificades, actives, pendents] = await Promise.all([
      prisma.company.count(),
      prisma.company.count({ where: { isVerified: true } }),
      prisma.company.count({ where: { isActive: true } }),
      prisma.company.count({ where: { status: 'PENDING' } })
    ])

    // Calcular empresas pendientes de completar
    const empreses = await prisma.company.findMany({
      select: {
        name: true,
        cif: true,
        email: true,
        description: true,
        logo: true,
        phone: true,
        address: true,
        website: true,
        sector: true
      }
    })

    const pendentsCompletar = empreses.filter(empresa => {
      const requiredFields = ['name', 'cif', 'email', 'description', 'logo', 'phone', 'address', 'website', 'sector']
      return requiredFields.some(field => !(empresa as any)[field])
    }).length

    const stats = {
      total,
      verificades,
      actives,
      pendents,
      pendentsCompletar
    }

    return NextResponse.json({ data: stats })
  } catch (error) {
    console.error('Error en API gestio empreses stats:', error)
    return NextResponse.json(
      {
        error: 'Error interno del servidor: ' + (error as Error).message,
        data: { total: 0, verificades: 0, actives: 0, pendents: 0, pendentsCompletar: 0 }
      },
      { status: 200 }
    )
  }
}