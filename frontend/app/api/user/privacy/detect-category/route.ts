import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

/**
 * POST /api/user/privacy/detect-category
 * Detecta si la posició o departament de l'usuari coincideix amb alguna categoria sensible
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  try {
    const { position, department } = await request.json()

    if (!position && !department) {
      return NextResponse.json({ category: null })
    }

    // Obtenir totes les categories sensibles actives amb patrons
    const categories = await prismaClient.sensitiveJobCategory.findMany({
      where: {
        isActive: true,
        OR: [
          { positionPatterns: { isEmpty: false } },
          { departmentPatterns: { isEmpty: false } },
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        color: true,
        positionPatterns: true,
        departmentPatterns: true,
        forceHidePosition: true,
        forceHideDepartment: true,
        forceHideBio: true,
        forceHideLocation: true,
        forceHidePhone: true,
        forceHideEmail: true,
        forceHideGroups: true,
      }
    })

    // Normalitzar text per a comparació
    const normalizeText = (text: string) => {
      return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Eliminar accents
        .trim()
    }

    const normalizedPosition = position ? normalizeText(position) : ''
    const normalizedDepartment = department ? normalizeText(department) : ''

    // Buscar coincidències
    for (const category of categories) {
      // Comprovar patrons de posició
      if (normalizedPosition && category.positionPatterns.length > 0) {
        for (const pattern of category.positionPatterns) {
          const normalizedPattern = normalizeText(pattern)
          if (normalizedPosition.includes(normalizedPattern) ||
              normalizedPattern.includes(normalizedPosition)) {
            return NextResponse.json({
              category: {
                id: category.id,
                name: category.name,
                slug: category.slug,
                description: category.description,
                icon: category.icon,
                color: category.color,
                forceHidePosition: category.forceHidePosition,
                forceHideDepartment: category.forceHideDepartment,
                forceHideBio: category.forceHideBio,
                forceHideLocation: category.forceHideLocation,
                forceHidePhone: category.forceHidePhone,
                forceHideEmail: category.forceHideEmail,
                forceHideGroups: category.forceHideGroups,
              },
              matchedOn: 'position',
              matchedPattern: pattern,
            })
          }
        }
      }

      // Comprovar patrons de departament
      if (normalizedDepartment && category.departmentPatterns.length > 0) {
        for (const pattern of category.departmentPatterns) {
          const normalizedPattern = normalizeText(pattern)
          if (normalizedDepartment.includes(normalizedPattern) ||
              normalizedPattern.includes(normalizedDepartment)) {
            return NextResponse.json({
              category: {
                id: category.id,
                name: category.name,
                slug: category.slug,
                description: category.description,
                icon: category.icon,
                color: category.color,
                forceHidePosition: category.forceHidePosition,
                forceHideDepartment: category.forceHideDepartment,
                forceHideBio: category.forceHideBio,
                forceHideLocation: category.forceHideLocation,
                forceHidePhone: category.forceHidePhone,
                forceHideEmail: category.forceHideEmail,
                forceHideGroups: category.forceHideGroups,
              },
              matchedOn: 'department',
              matchedPattern: pattern,
            })
          }
        }
      }
    }

    // No s'ha trobat cap coincidència
    return NextResponse.json({ category: null })

  } catch (error) {
    console.error('Error detecting sensitive category:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
