import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'
import { getVisibleGroupsFilter, getUserProfessionalGroup } from '@/lib/group-visibility'

/**
 * GET /api/groups
 * Obtenir llistat de grups visibles per l'usuari
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const currentUserId = session?.user?.id

    // Obtenir paràmetres de cerca
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Obtenir filtre de visibilitat
    const visibilityFilter = await getVisibleGroupsFilter(currentUserId)

    // Construir filtre addicional
    const additionalFilter: Record<string, unknown> = {}

    if (search) {
      additionalFilter.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (type && ['PUBLIC', 'PRIVATE', 'PROFESSIONAL', 'SECRET'].includes(type)) {
      additionalFilter.type = type
    }

    // Obtenir grups
    const groups = await prismaClient.group.findMany({
      where: {
        ...visibilityFilter,
        ...additionalFilter,
      },
      orderBy: [
        { membersCount: 'desc' },
        { createdAt: 'desc' },
      ],
      skip: offset,
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        type: true,
        image: true,
        coverImage: true,
        membersCount: true,
        isActive: true,
        createdAt: true,
        joinPolicy: true,
        contentVisibility: true,
        sensitiveJobCategoryId: true,
        sensitiveJobCategory: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            color: true,
          }
        },
        _count: {
          select: {
            members: true,
          }
        },
        // Incloure membership de l'usuari actual si està autenticat
        ...(currentUserId && {
          members: {
            where: { userId: currentUserId },
            select: {
              id: true,
              role: true,
              joinedAt: true,
            }
          }
        })
      }
    })

    // Comptar total
    const total = await prismaClient.group.count({
      where: {
        ...visibilityFilter,
        ...additionalFilter,
      }
    })

    // Info adicional per l'usuari
    let userProfessionalGroup = null
    let userHasProfessionalGroup = false

    if (currentUserId) {
      const professionalMembership = await getUserProfessionalGroup(currentUserId)
      if (professionalMembership) {
        userHasProfessionalGroup = true
        userProfessionalGroup = professionalMembership.group
      }
    }

    // Processar grups per afegir info de membership
    const processedGroups = groups.map(group => {
      const membership = currentUserId && 'members' in group ? (group.members as Array<{ id: string; role: string; joinedAt: Date }>)[0] : null

      return {
        id: group.id,
        name: group.name,
        slug: group.slug,
        description: group.description,
        type: group.type,
        image: group.image,
        coverImage: group.coverImage,
        membersCount: group._count.members,
        createdAt: group.createdAt,
        joinPolicy: group.joinPolicy,
        contentVisibility: group.contentVisibility,
        hasSensitiveCategory: !!group.sensitiveJobCategoryId,
        sensitiveJobCategory: group.sensitiveJobCategory,
        // Info de membership
        isMember: !!membership,
        userRole: membership?.role || null,
        userJoinedAt: membership?.joinedAt || null,
      }
    })

    return NextResponse.json({
      groups: processedGroups,
      total,
      hasMore: offset + groups.length < total,
      userHasProfessionalGroup,
      userProfessionalGroup,
    })

  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
