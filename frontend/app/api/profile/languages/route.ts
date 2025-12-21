import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Listar todos los idiomas
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const languages = await prisma.userLanguage.findMany({
      where: { userId: session.user.id },
      orderBy: { language: 'asc' }
    })

    return NextResponse.json(languages)
  } catch (error) {
    console.error('Error obtenint idiomes:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Añadir nuevo idioma
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validar campos requeridos
    if (!body.language || !body.level) {
      return NextResponse.json({ 
        error: 'Els camps idioma i nivell són obligatoris' 
      }, { status: 400 })
    }

    // Verificar que no existe ya este idioma para el usuario
    const existingLanguage = await prisma.userLanguage.findUnique({
      where: { 
        userId_language: {
          userId: session.user.id,
          language: body.language
        }
      }
    })

    if (existingLanguage) {
      return NextResponse.json({ 
        error: 'Aquest idioma ja existeix al teu perfil' 
      }, { status: 409 })
    }
    
    const language = await prisma.userLanguage.create({
      data: {
        userId: session.user.id,
        language: body.language,
        level: body.level,
        certification: body.certification || null,
      }
    })

    return NextResponse.json(language, { status: 201 })
  } catch (error) {
    console.error('Error creant idioma:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}