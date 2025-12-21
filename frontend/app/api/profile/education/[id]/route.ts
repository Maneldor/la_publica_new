import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener una educación específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const education = await prisma.userEducation.findFirst({
      where: { 
        id: params.id,
        userId: session.user.id 
      }
    })

    if (!education) {
      return NextResponse.json({ error: 'No trobat' }, { status: 404 })
    }

    return NextResponse.json(education)
  } catch (error) {
    console.error('Error obtenint educació:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// PATCH - Actualizar educación
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
    const existing = await prisma.userEducation.findFirst({
      where: { id: params.id, userId: session.user.id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'No trobat' }, { status: 404 })
    }

    const body = await request.json()
    
    // Validar campos requeridos
    if (body.institution === '' || body.degree === '') {
      return NextResponse.json({ 
        error: 'Els camps institució i títol són obligatoris' 
      }, { status: 400 })
    }
    
    const updateData: any = {}
    
    if (body.institution !== undefined) updateData.institution = body.institution
    if (body.degree !== undefined) updateData.degree = body.degree
    if (body.field !== undefined) updateData.field = body.field
    if (body.startDate !== undefined) updateData.startDate = body.startDate ? new Date(body.startDate) : null
    if (body.endDate !== undefined) updateData.endDate = body.endDate ? new Date(body.endDate) : null
    if (body.isCurrent !== undefined) updateData.isCurrent = body.isCurrent
    if (body.description !== undefined) updateData.description = body.description
    if (body.position !== undefined) updateData.position = body.position
    
    const education = await prisma.userEducation.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json(education)
  } catch (error) {
    console.error('Error actualitzant educació:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar educación
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
    const existing = await prisma.userEducation.findFirst({
      where: { id: params.id, userId: session.user.id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'No trobat' }, { status: 404 })
    }

    await prisma.userEducation.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error eliminant educació:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}