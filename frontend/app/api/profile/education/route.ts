import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Listar toda la educación
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const education = await prisma.userEducation.findMany({
      where: { userId: session.user.id },
      orderBy: { position: 'asc' }
    })

    return NextResponse.json(education)
  } catch (error) {
    console.error('Error obtenint educació:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Añadir nueva educación
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validar campos requeridos
    if (!body.institution || !body.degree) {
      return NextResponse.json({ 
        error: 'Els camps institució i títol són obligatoris' 
      }, { status: 400 })
    }
    
    // Obtener la posición más alta actual
    const lastItem = await prisma.userEducation.findFirst({
      where: { userId: session.user.id },
      orderBy: { position: 'desc' }
    })
    
    const education = await prisma.userEducation.create({
      data: {
        userId: session.user.id,
        institution: body.institution,
        degree: body.degree,
        field: body.field || null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        isCurrent: body.isCurrent || false,
        description: body.description || null,
        position: (lastItem?.position || 0) + 1,
      }
    })

    return NextResponse.json(education, { status: 201 })
  } catch (error) {
    console.error('Error creant educació:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}