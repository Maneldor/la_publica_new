import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener una experiencia específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const experience = await prisma.userExperience.findFirst({
      where: { 
        id: params.id,
        userId: session.user.id 
      }
    })

    if (!experience) {
      return NextResponse.json({ error: 'No trobat' }, { status: 404 })
    }

    return NextResponse.json(experience)
  } catch (error) {
    console.error('Error obtenint experiència:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// PATCH - Actualizar experiencia
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    // Verificar propiedad
    const existing = await prisma.userExperience.findFirst({
      where: { id: params.id, userId: session.user.id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'No trobat' }, { status: 404 })
    }

    const body = await request.json()
    
    // Validar campos requeridos
    if (body.organization === '' || body.position === '') {
      return NextResponse.json({ 
        error: 'Els camps organització i càrrec són obligatoris' 
      }, { status: 400 })
    }
    
    const updateData: any = {}
    
    if (body.organization !== undefined) updateData.organization = body.organization
    if (body.position !== undefined) updateData.position = body.position
    if (body.department !== undefined) updateData.department = body.department
    if (body.location !== undefined) updateData.location = body.location
    if (body.startDate !== undefined) updateData.startDate = body.startDate ? new Date(body.startDate) : null
    if (body.endDate !== undefined) updateData.endDate = body.endDate ? new Date(body.endDate) : null
    if (body.isCurrent !== undefined) updateData.isCurrent = body.isCurrent
    if (body.description !== undefined) updateData.description = body.description
    if (body.employmentType !== undefined) updateData.employmentType = body.employmentType
    if (body.displayOrder !== undefined) updateData.displayOrder = body.displayOrder
    
    const experience = await prisma.userExperience.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json(experience)
  } catch (error) {
    console.error('Error actualitzant experiència:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar experiencia
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    // Verificar propiedad
    const existing = await prisma.userExperience.findFirst({
      where: { id: params.id, userId: session.user.id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'No trobat' }, { status: 404 })
    }

    await prisma.userExperience.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error eliminant experiència:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}