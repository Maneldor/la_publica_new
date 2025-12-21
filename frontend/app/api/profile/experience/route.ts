import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Listar toda la experiencia
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const experiences = await prisma.userExperience.findMany({
      where: { userId: session.user.id },
      orderBy: { displayOrder: 'asc' }
    })

    return NextResponse.json(experiences)
  } catch (error) {
    console.error('Error obtenint experiència:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Añadir nueva experiencia
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validar campos requeridos
    if (!body.organization || !body.position) {
      return NextResponse.json({ 
        error: 'Els camps organització i càrrec són obligatoris' 
      }, { status: 400 })
    }
    
    // Obtener el orden más alto actual
    const lastItem = await prisma.userExperience.findFirst({
      where: { userId: session.user.id },
      orderBy: { displayOrder: 'desc' }
    })
    
    const experience = await prisma.userExperience.create({
      data: {
        userId: session.user.id,
        organization: body.organization,
        position: body.position,
        department: body.department || null,
        location: body.location || null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        isCurrent: body.isCurrent || false,
        description: body.description || null,
        employmentType: body.employmentType || null,
        displayOrder: (lastItem?.displayOrder || 0) + 1,
      }
    })

    return NextResponse.json(experience, { status: 201 })
  } catch (error) {
    console.error('Error creant experiència:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}