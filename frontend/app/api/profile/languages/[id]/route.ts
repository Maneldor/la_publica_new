import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener un idioma específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const language = await prisma.userLanguage.findFirst({
      where: { 
        id: params.id,
        userId: session.user.id 
      }
    })

    if (!language) {
      return NextResponse.json({ error: 'No trobat' }, { status: 404 })
    }

    return NextResponse.json(language)
  } catch (error) {
    console.error('Error obtenint idioma:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// PATCH - Actualizar idioma
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
    const existing = await prisma.userLanguage.findFirst({
      where: { id: params.id, userId: session.user.id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'No trobat' }, { status: 404 })
    }

    const body = await request.json()
    
    // Validar campos requeridos
    if (body.language === '' || body.level === '') {
      return NextResponse.json({ 
        error: 'Els camps idioma i nivell són obligatoris' 
      }, { status: 400 })
    }

    // Si se está cambiando el idioma, verificar que no existe otro con ese nombre
    if (body.language && body.language !== existing.language) {
      const conflictingLanguage = await prisma.userLanguage.findUnique({
        where: { 
          userId_language: {
            userId: session.user.id,
            language: body.language
          }
        }
      })

      if (conflictingLanguage) {
        return NextResponse.json({ 
          error: 'Aquest idioma ja existeix al teu perfil' 
        }, { status: 409 })
      }
    }
    
    const updateData: any = {}
    
    if (body.language !== undefined) updateData.language = body.language
    if (body.level !== undefined) updateData.level = body.level
    if (body.certification !== undefined) updateData.certification = body.certification
    
    const language = await prisma.userLanguage.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json(language)
  } catch (error) {
    console.error('Error actualitzant idioma:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar idioma
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
    const existing = await prisma.userLanguage.findFirst({
      where: { id: params.id, userId: session.user.id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'No trobat' }, { status: 404 })
    }

    await prisma.userLanguage.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error eliminant idioma:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}