import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener perfil completo del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    // Obtener perfil con todas las relaciones
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
        education: { orderBy: { position: 'asc' } },
        experiences: { orderBy: { displayOrder: 'asc' } },
        skills: { orderBy: { category: 'asc' } },
        languages: true,
        socialLinks: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuari no trobat' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error obtenint perfil:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// PATCH - Actualizar perfil básico (UserProfile + campos de User)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const body = await request.json()

    // Campos permitidos para UserProfile
    const profileFields = [
      'bio', 'headline', 'birthDate', 'city', 'province', 'country',
      'organization', 'department', 'position', 'yearsInPublicSector',
      'website', 'publicEmail', 'phone',
      'isPublic', 'showEmail', 'showPhone', 'showBirthDate'
    ]

    // Campos permitidos para User (datos básicos que están en el modelo User)
    const userFields = [
      'firstName', 'lastName', 'secondLastName',
      'administration', 'displayPreference', 'coverColor', 'coverImage', 'image'
    ]

    // Filtrar campos de profile
    const profileData: Record<string, any> = {}
    for (const field of profileFields) {
      if (body[field] !== undefined) {
        profileData[field] = body[field]
      }
    }

    // Filtrar campos de user
    const userData: Record<string, any> = {}
    for (const field of userFields) {
      if (body[field] !== undefined) {
        userData[field] = body[field]
      }
    }

    // Convertir birthDate a Date si viene como string
    if (profileData.birthDate && typeof profileData.birthDate === 'string') {
      profileData.birthDate = new Date(profileData.birthDate)
    }

    // Actualizar User si hay datos
    if (Object.keys(userData).length > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: userData
      })
    }

    // Upsert UserProfile - crear si no existe, actualizar si existe
    const profile = await prisma.userProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...profileData
      },
      update: profileData
    })

    // Obtener el usuario actualizado con todos los datos
    const updatedUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true }
    })

    return NextResponse.json({
      ...profile,
      // Incluir campos de User en la respuesta
      firstName: updatedUser?.firstName,
      lastName: updatedUser?.lastName,
      secondLastName: updatedUser?.secondLastName,
      administration: updatedUser?.administration,
      displayPreference: updatedUser?.displayPreference,
      coverColor: updatedUser?.coverColor,
      coverImage: updatedUser?.coverImage,
      image: updatedUser?.image,
    })
  } catch (error) {
    console.error('Error actualitzant perfil:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}