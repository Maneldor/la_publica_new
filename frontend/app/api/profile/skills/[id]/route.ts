import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener una habilidad específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const skill = await prisma.userSkill.findFirst({
      where: { 
        id: params.id,
        userId: session.user.id 
      }
    })

    if (!skill) {
      return NextResponse.json({ error: 'No trobat' }, { status: 404 })
    }

    return NextResponse.json(skill)
  } catch (error) {
    console.error('Error obtenint habilitat:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// PATCH - Actualizar habilidad
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
    const existing = await prisma.userSkill.findFirst({
      where: { id: params.id, userId: session.user.id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'No trobat' }, { status: 404 })
    }

    const body = await request.json()
    
    // Validar campos requeridos
    if (body.name === '') {
      return NextResponse.json({ 
        error: 'El nom de l\'habilitat és obligatori' 
      }, { status: 400 })
    }

    // Si se está cambiando el nombre, verificar que no existe otra habilidad con ese nombre
    if (body.name && body.name !== existing.name) {
      const conflictingSkill = await prisma.userSkill.findUnique({
        where: { 
          userId_name: {
            userId: session.user.id,
            name: body.name
          }
        }
      })

      if (conflictingSkill) {
        return NextResponse.json({ 
          error: 'Aquesta habilitat ja existeix al teu perfil' 
        }, { status: 409 })
      }
    }
    
    const updateData: any = {}
    
    if (body.name !== undefined) updateData.name = body.name
    if (body.category !== undefined) updateData.category = body.category
    if (body.level !== undefined) updateData.level = body.level
    if (body.isEndorsed !== undefined) updateData.isEndorsed = body.isEndorsed
    if (body.endorsements !== undefined) updateData.endorsements = body.endorsements
    
    const skill = await prisma.userSkill.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json(skill)
  } catch (error) {
    console.error('Error actualitzant habilitat:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar habilidad
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
    const existing = await prisma.userSkill.findFirst({
      where: { id: params.id, userId: session.user.id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'No trobat' }, { status: 404 })
    }

    await prisma.userSkill.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error eliminant habilitat:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}