import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener una red social específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const socialLink = await prisma.userSocialLink.findFirst({
      where: { 
        id: params.id,
        userId: session.user.id 
      }
    })

    if (!socialLink) {
      return NextResponse.json({ error: 'No trobat' }, { status: 404 })
    }

    return NextResponse.json(socialLink)
  } catch (error) {
    console.error('Error obtenint xarxa social:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// PATCH - Actualizar red social
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
    const existing = await prisma.userSocialLink.findFirst({
      where: { id: params.id, userId: session.user.id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'No trobat' }, { status: 404 })
    }

    const body = await request.json()
    
    // Validar campos requeridos
    if (body.platform === '' || body.url === '') {
      return NextResponse.json({ 
        error: 'Els camps plataforma i URL són obligatoris' 
      }, { status: 400 })
    }

    // Validar formato de URL si se proporciona
    if (body.url) {
      try {
        new URL(body.url)
      } catch {
        return NextResponse.json({ 
          error: 'La URL proporcionada no és vàlida' 
        }, { status: 400 })
      }
    }

    // Si se está cambiando la plataforma, verificar que no existe otra con ese nombre
    if (body.platform && body.platform !== existing.platform) {
      const conflictingSocial = await prisma.userSocialLink.findUnique({
        where: { 
          userId_platform: {
            userId: session.user.id,
            platform: body.platform
          }
        }
      })

      if (conflictingSocial) {
        return NextResponse.json({ 
          error: 'Aquesta plataforma ja existeix al teu perfil' 
        }, { status: 409 })
      }
    }
    
    const updateData: any = {}
    
    if (body.platform !== undefined) updateData.platform = body.platform
    if (body.url !== undefined) updateData.url = body.url
    if (body.username !== undefined) updateData.username = body.username
    if (body.isVerified !== undefined) updateData.isVerified = body.isVerified
    
    const socialLink = await prisma.userSocialLink.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json(socialLink)
  } catch (error) {
    console.error('Error actualitzant xarxa social:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar red social
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
    const existing = await prisma.userSocialLink.findFirst({
      where: { id: params.id, userId: session.user.id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'No trobat' }, { status: 404 })
    }

    await prisma.userSocialLink.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error eliminant xarxa social:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}