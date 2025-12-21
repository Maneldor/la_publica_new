import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Listar todas las redes sociales
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const socialLinks = await prisma.userSocialLink.findMany({
      where: { userId: session.user.id },
      orderBy: { platform: 'asc' }
    })

    return NextResponse.json(socialLinks)
  } catch (error) {
    console.error('Error obtenint xarxes socials:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Añadir nueva red social
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validar campos requeridos
    if (!body.platform || !body.url) {
      return NextResponse.json({ 
        error: 'Els camps plataforma i URL són obligatoris' 
      }, { status: 400 })
    }

    // Validar formato de URL
    try {
      new URL(body.url)
    } catch {
      return NextResponse.json({ 
        error: 'La URL proporcionada no és vàlida' 
      }, { status: 400 })
    }

    // Verificar que no existe ya esta plataforma para el usuario
    const existingSocial = await prisma.userSocialLink.findUnique({
      where: { 
        userId_platform: {
          userId: session.user.id,
          platform: body.platform
        }
      }
    })

    if (existingSocial) {
      return NextResponse.json({ 
        error: 'Aquesta plataforma ja existeix al teu perfil' 
      }, { status: 409 })
    }
    
    const socialLink = await prisma.userSocialLink.create({
      data: {
        userId: session.user.id,
        platform: body.platform,
        url: body.url,
        username: body.username || null,
        isVerified: body.isVerified || false,
      }
    })

    return NextResponse.json(socialLink, { status: 201 })
  } catch (error) {
    console.error('Error creant xarxa social:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}