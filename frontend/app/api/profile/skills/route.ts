import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Listar todas las habilidades
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const skills = await prisma.userSkill.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(skills)
  } catch (error) {
    console.error('Error obtenint habilitats:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Añadir nueva habilidad
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validar campos requeridos
    if (!body.name) {
      return NextResponse.json({ 
        error: 'El nom de l\'habilitat és obligatori' 
      }, { status: 400 })
    }

    // Verificar que no existe ya esta habilidad para el usuario
    const existingSkill = await prisma.userSkill.findUnique({
      where: { 
        userId_name: {
          userId: session.user.id,
          name: body.name
        }
      }
    })

    if (existingSkill) {
      return NextResponse.json({ 
        error: 'Aquesta habilitat ja existeix al teu perfil' 
      }, { status: 409 })
    }
    
    const skill = await prisma.userSkill.create({
      data: {
        userId: session.user.id,
        name: body.name,
        category: body.category || null,
        level: body.level || null,
        isEndorsed: body.isEndorsed || false,
        endorsements: body.endorsements || 0,
      }
    })

    return NextResponse.json(skill, { status: 201 })
  } catch (error) {
    console.error('Error creant habilitat:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}