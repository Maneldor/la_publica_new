import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const userId = session.user.id

    // Obtener datos del perfil
    const [user, profile, education, experiences, skills, languages, socialLinks] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { name: true, image: true } }),
      prisma.userProfile.findUnique({ where: { userId } }),
      prisma.userEducation.count({ where: { userId } }),
      prisma.userExperience.count({ where: { userId } }),
      prisma.userSkill.count({ where: { userId } }),
      prisma.userLanguage.count({ where: { userId } }),
      prisma.userSocialLink.count({ where: { userId } }),
    ])

    // Calcular completitud por secciones
    const sections = {
      basicInfo: {
        name: 'Informació Bàsica',
        completed: !!(user?.name && user?.image),
        weight: 15,
      },
      personalInfo: {
        name: 'Informació Personal',
        completed: !!(profile?.bio && profile?.city && profile?.headline),
        weight: 15,
      },
      professionalInfo: {
        name: 'Informació Professional',
        completed: !!(profile?.organization && profile?.position),
        weight: 15,
      },
      education: {
        name: 'Formació',
        completed: education > 0,
        weight: 15,
      },
      experience: {
        name: 'Experiència',
        completed: experiences > 0,
        weight: 15,
      },
      skills: {
        name: 'Habilitats',
        completed: skills >= 3,
        weight: 10,
      },
      languages: {
        name: 'Idiomes',
        completed: languages > 0,
        weight: 10,
      },
      social: {
        name: 'Xarxes Socials',
        completed: socialLinks > 0,
        weight: 5,
      },
    }

    // Calcular porcentaje total
    let totalWeight = 0
    let completedWeight = 0

    for (const section of Object.values(sections)) {
      totalWeight += section.weight
      if (section.completed) {
        completedWeight += section.weight
      }
    }

    const percentage = Math.round((completedWeight / totalWeight) * 100)

    // Determinar nivel
    let level: 'low' | 'medium' | 'high'
    let color: string
    
    if (percentage >= 80) {
      level = 'high'
      color = 'green'
    } else if (percentage >= 60) {
      level = 'medium'
      color = 'yellow'
    } else {
      level = 'low'
      color = 'red'
    }

    // Secciones pendientes
    const pending = Object.entries(sections)
      .filter(([_, s]) => !s.completed)
      .map(([key, s]) => ({ key, name: s.name }))

    return NextResponse.json({
      percentage,
      level,
      color,
      sections,
      pending,
      counts: {
        education,
        experiences,
        skills,
        languages,
        socialLinks,
      }
    })
  } catch (error) {
    console.error('Error calculant completitud:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}