import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'
import { canUserSeeGroup } from '@/lib/group-visibility'

interface RouteParams {
  params: Promise<{ slug: string }>
}

/**
 * GET /api/groups/by-slug/[slug]
 * Obtenir informació d'un grup per slug
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    const currentUserId = session?.user?.id
    const { slug } = await params

    // Buscar el grup
    const group = await prismaClient.group.findFirst({
      where: {
        slug: slug,
        isActive: true,
      },
      include: {
        // Categoria sensible
        sensitiveJobCategory: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            color: true,
          }
        },
        // Creador
        createdBy: {
          select: {
            id: true,
            nick: true,
            name: true,
            firstName: true,
            lastName: true,
            image: true,
          }
        },
        // Membres amb rol (limitat)
        members: {
          take: 50,
          orderBy: [
            { role: 'asc' },
            { joinedAt: 'asc' }
          ],
          include: {
            user: {
              select: {
                id: true,
                nick: true,
                name: true,
                firstName: true,
                lastName: true,
                image: true,
                isOnline: true,
                lastSeenAt: true,
                cargo: true,
                profile: {
                  select: {
                    position: true,
                    department: true,
                  }
                }
              }
            }
          }
        },
        // Ofertes sectorials
        sectorOffers: {
          where: {
            offer: {
              status: 'PUBLISHED',
            }
          },
          include: {
            offer: {
              select: {
                id: true,
                title: true,
                slug: true,
                shortDescription: true,
                description: true,
                images: true,
                price: true,
                originalPrice: true,
                expiresAt: true,
                company: {
                  select: {
                    id: true,
                    name: true,
                    logo: true,
                  }
                }
              }
            }
          },
          take: 10,
        },
        // Comptar membres
        _count: {
          select: {
            members: true,
          }
        }
      }
    })

    if (!group) {
      return NextResponse.json({ error: 'Grup no trobat' }, { status: 404 })
    }

    // Verificar visibilitat amb el helper
    const visibility = await canUserSeeGroup(currentUserId || null, {
      id: group.id,
      type: group.type
    })

    if (!visibility.canSee) {
      // Per SECRET, simular que no existeix
      if (visibility.reason === 'not_found') {
        return NextResponse.json({ error: 'Grup no trobat' }, { status: 404 })
      }
      // Per PROFESSIONAL quan ja en té un, retornar 403 amb missatge
      return NextResponse.json(
        { error: visibility.reason || 'No tens accés a aquest grup' },
        { status: 403 }
      )
    }

    // Determinar el rol de l'usuari actual
    let userMembership = null
    let userRole: 'ADMIN' | 'MODERATOR' | 'MEMBER' | null = null

    if (currentUserId) {
      const membership = group.members.find(m => m.userId === currentUserId)
      if (membership) {
        userMembership = membership
        userRole = membership.role
      }
    }

    const isMember = !!userMembership
    const isAdmin = userRole === 'ADMIN'
    const isModerator = userRole === 'MODERATOR' || isAdmin

    // Preparar admins i moderadors
    const admins = group.members
      .filter(m => m.role === 'ADMIN')
      .map(m => ({
        id: m.user.id,
        nick: m.user.nick,
        name: [m.user.firstName, m.user.lastName].filter(Boolean).join(' ') || m.user.name || m.user.nick,
        image: m.user.image,
        isOnline: m.user.isOnline,
        position: m.user.profile?.position || m.user.cargo,
        joinedAt: m.joinedAt,
      }))

    const moderators = group.members
      .filter(m => m.role === 'MODERATOR')
      .map(m => ({
        id: m.user.id,
        nick: m.user.nick,
        name: [m.user.firstName, m.user.lastName].filter(Boolean).join(' ') || m.user.name || m.user.nick,
        image: m.user.image,
        isOnline: m.user.isOnline,
        position: m.user.profile?.position || m.user.cargo,
        joinedAt: m.joinedAt,
      }))

    // Preparar tots els membres (per a la vista de membres)
    const allMembers = group.members.map(m => ({
      id: m.user.id,
      nick: m.user.nick,
      name: [m.user.firstName, m.user.lastName].filter(Boolean).join(' ') || m.user.name || m.user.nick,
      image: m.user.image,
      isOnline: m.user.isOnline,
      lastSeenAt: m.user.lastSeenAt,
      position: m.user.profile?.position || m.user.cargo,
      department: m.user.profile?.department,
      role: m.role,
      joinedAt: m.joinedAt,
    }))

    // Preparar ofertes
    const offers = group.sectorOffers.map(so => ({
      id: so.offer.id,
      title: so.offer.title,
      slug: so.offer.slug,
      shortDescription: so.offer.shortDescription,
      description: so.offer.description,
      images: so.offer.images,
      price: so.offer.price,
      originalPrice: so.offer.originalPrice,
      expiresAt: so.offer.expiresAt,
      company: so.offer.company,
    }))

    // Preparar resposta
    const response = {
      id: group.id,
      name: group.name,
      slug: group.slug,
      description: group.description,
      type: group.type,
      image: group.image,
      coverImage: group.coverImage,
      membersCount: group._count.members,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,

      // Configuració
      joinPolicy: group.joinPolicy,
      contentVisibility: group.contentVisibility,
      memberListVisibility: group.memberListVisibility,
      postPermission: group.postPermission,
      enableFeed: group.enableFeed,
      enableForum: group.enableForum,
      enableGallery: group.enableGallery,
      enableDocuments: group.enableDocuments,
      enableGroupChat: group.enableGroupChat,

      // Categoria sensible
      sensitiveJobCategory: group.sensitiveJobCategory,
      hasSensitiveCategory: !!group.sensitiveJobCategoryId,

      // Creador
      createdBy: group.createdBy ? {
        id: group.createdBy.id,
        nick: group.createdBy.nick,
        name: [group.createdBy.firstName, group.createdBy.lastName].filter(Boolean).join(' ') || group.createdBy.name,
        image: group.createdBy.image,
      } : null,

      // Rol de l'usuari actual
      isMember,
      isAdmin,
      isModerator,
      userRole,
      userMembership: userMembership ? {
        id: userMembership.id,
        role: userMembership.role,
        joinedAt: userMembership.joinedAt,
      } : null,

      // Membres
      admins,
      moderators,
      members: allMembers,
      recentMembers: allMembers.slice(0, 8),

      // Ofertes
      offers,
      offersCount: offers.length,
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching group:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
