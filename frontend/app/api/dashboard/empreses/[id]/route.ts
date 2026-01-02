import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient as prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    // Buscar per slug o per ID
    let empresa = await prisma.company.findFirst({
      where: {
        OR: [
          { slug: params.id },
          { id: params.id }
        ]
      },
      include: {
        currentPlan: {
          select: {
            id: true,
            tier: true,
            name: true,
            nombreCorto: true
          }
        }
      }
    })

    if (!empresa) {
      return NextResponse.json(
        { error: 'Empresa no trobada', data: null },
        { status: 404 }
      )
    }

    // Solo mostrar empresas publicadas
    if (empresa.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Empresa no disponible', data: null },
        { status: 404 }
      )
    }

    // Mapear datos para el frontend
    const data = {
      id: empresa.id,
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
      contactEmail: empresa.contactEmail,
      contactPhone: empresa.contactPhone,
      workingHours: empresa.workingHours,
      size: empresa.size,
      foundingYear: empresa.foundingYear,
      employeeCount: empresa.employeeCount,
      isVerified: empresa.isVerified,
      services: empresa.services || [],
      tags: empresa.tags || [],
      specializations: empresa.specializations || [],
      certifications: empresa.certifications,
      gallery: empresa.gallery || [],
      socialMedia: empresa.socialMedia,
      currentPlan: empresa.currentPlan
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error obtenint empresa:', error)
    return NextResponse.json(
      { error: 'Error carregant empresa: ' + (error as Error).message, data: null },
      { status: 500 }
    )
  }
}
