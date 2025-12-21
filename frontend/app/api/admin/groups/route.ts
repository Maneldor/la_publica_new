import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// GET - Llistar tots els grups (inclòs PUBLIC)
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const withoutAdmin = searchParams.get('withoutAdmin') === 'true'
    const statsOnly = searchParams.get('stats') === 'true'

    // Si nomes volem stats
    if (statsOnly) {
      // Comptar grups sense admin (cap membre amb rol ADMIN)
      const groupsWithAdminIds = await prismaClient.groupMember.findMany({
        where: { role: 'ADMIN' },
        select: { groupId: true },
        distinct: ['groupId']
      })
      const groupsWithAdminSet = new Set(groupsWithAdminIds.map(g => g.groupId))

      const allGroups = await prismaClient.group.findMany({
        select: { id: true, type: true }
      })

      const withoutAdminCount = allGroups.filter(g => !groupsWithAdminSet.has(g.id)).length

      // Comptar sol·licituds pendents de grups sense admin
      const pendingRequestsCount = await prismaClient.groupJoinRequest.count({
        where: {
          status: 'PENDING',
          group: {
            members: {
              none: { role: 'ADMIN' }
            }
          }
        }
      })

      const [publicCount, professional, privateCount, secret, total] = await Promise.all([
        prismaClient.group.count({ where: { type: 'PUBLIC' } }),
        prismaClient.group.count({ where: { type: 'PROFESSIONAL' } }),
        prismaClient.group.count({ where: { type: 'PRIVATE' } }),
        prismaClient.group.count({ where: { type: 'SECRET' } }),
        prismaClient.group.count(),
      ])

      return NextResponse.json({
        stats: {
          total,
          public: publicCount,
          professional,
          private: privateCount,
          secret,
          withoutAdmin: withoutAdminCount,
          pendingRequests: pendingRequestsCount
        }
      })
    }

    const where: Prisma.GroupWhereInput = {}

    // Filtrar per grups sense admin
    if (withoutAdmin) {
      where.members = {
        none: { role: 'ADMIN' }
      }
    }

    // Filtrar per tipus especific
    if (type && type !== 'all') {
      where.type = type as Prisma.EnumGroupTypeFilter['equals']
    }

    // Cercar per nom o slug
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [groups, total] = await Promise.all([
      prismaClient.group.findMany({
        where,
        orderBy: [
          { type: 'asc' },
          { name: 'asc' }
        ],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: {
              members: true,
              joinRequests: true
            }
          },
          members: {
            where: {
              role: { in: ['ADMIN', 'MODERATOR'] }
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  nick: true,
                  email: true,
                  image: true,
                }
              }
            }
          },
          joinRequests: {
            where: { status: 'PENDING' },
            select: { id: true }
          },
          sectorOffers: {
            include: {
              offer: {
                select: {
                  id: true,
                  title: true,
                  images: true,
                  company: {
                    select: { name: true }
                  },
                  category: {
                    select: { name: true }
                  }
                }
              }
            }
          },
          sensitiveJobCategory: {
            select: {
              id: true,
              name: true,
              description: true,
            }
          }
        }
      }),
      prismaClient.group.count({ where })
    ])

    // Formatejar grups amb informació d'admin
    const formattedGroups = groups.map(group => {
      const admin = group.members.find(m => m.role === 'ADMIN')
      const moderators = group.members.filter(m => m.role === 'MODERATOR')

      return {
        ...group,
        hasAdmin: !!admin,
        admin: admin ? admin.user : null,
        moderators: moderators.map(m => m.user),
        pendingRequestsCount: group.joinRequests.length,
        sectorOffers: group.sectorOffers.map(so => ({
          offerId: so.offerId,
          offer: so.offer ? {
            id: so.offer.id,
            title: so.offer.title,
            image: so.offer.images?.[0] || null,
            company: so.offer.company?.name || null,
            category: so.offer.category?.name || null,
          } : null
        }))
      }
    })

    return NextResponse.json({
      groups: formattedGroups,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })

  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Crear nou grup amb admin, moderadors i ofertes
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const {
      name,
      slug,
      description,
      type,
      image,
      coverImage,
      joinPolicy,
      contentVisibility,
      memberListVisibility,
      postPermission,
      enableForum,
      enableGallery,
      enableDocuments,
      enableGroupChat,
      isActive,
      adminId,
      moderatorIds,
      sectorOfferIds,
    } = body

    // Validacions
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'El nom i el slug son obligatoris' },
        { status: 400 }
      )
    }

    // Validar tipus de grup
    if (!['PUBLIC', 'PROFESSIONAL', 'PRIVATE', 'SECRET'].includes(type)) {
      return NextResponse.json(
        { error: 'El tipus ha de ser PUBLIC, PROFESSIONAL, PRIVATE o SECRET' },
        { status: 400 }
      )
    }

    // Comprovar si ja existeix un grup amb aquest slug
    const existingGroup = await prismaClient.group.findUnique({
      where: { slug: slug.toLowerCase().replace(/\s+/g, '-') }
    })

    if (existingGroup) {
      return NextResponse.json(
        { error: 'Ja existeix un grup amb aquest slug' },
        { status: 400 }
      )
    }

    // Crear grup amb transaccio
    const group = await prismaClient.$transaction(async (tx) => {
      // Crear el grup
      const newGroup = await tx.group.create({
        data: {
          name,
          slug: slug.toLowerCase().replace(/\s+/g, '-'),
          description: description || null,
          type,
          image: image || null,
          coverImage: coverImage || null,
          joinPolicy: joinPolicy || 'REQUEST',
          contentVisibility: contentVisibility || 'MEMBERS_ONLY',
          memberListVisibility: memberListVisibility || 'MEMBERS_ONLY',
          postPermission: postPermission || 'ALL_MEMBERS',
          enableForum: enableForum ?? true,
          enableGallery: enableGallery ?? false,
          enableDocuments: enableDocuments ?? false,
          enableGroupChat: enableGroupChat ?? false,
          isActive: isActive ?? true,
          createdById: session.user.id,
        }
      })

      // Assignar admin
      if (adminId) {
        await tx.groupMember.create({
          data: {
            groupId: newGroup.id,
            userId: adminId,
            role: 'ADMIN',
          }
        })
      }

      // Assignar moderadors
      if (moderatorIds && moderatorIds.length > 0) {
        await tx.groupMember.createMany({
          data: moderatorIds.map((userId: string) => ({
            groupId: newGroup.id,
            userId,
            role: 'MODERATOR',
          }))
        })
      }

      // Vincular ofertes sectorials
      if (sectorOfferIds && sectorOfferIds.length > 0) {
        await tx.groupSectorOffer.createMany({
          data: sectorOfferIds.map((offerId: string) => ({
            groupId: newGroup.id,
            offerId,
          }))
        })
      }

      // Actualitzar comptador de membres
      const membersCount = (adminId ? 1 : 0) + (moderatorIds?.length || 0)
      if (membersCount > 0) {
        await tx.group.update({
          where: { id: newGroup.id },
          data: { membersCount }
        })
      }

      return newGroup
    })

    // Obtenir el grup complet
    const fullGroup = await prismaClient.group.findUnique({
      where: { id: group.id },
      include: {
        _count: { select: { members: true } },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                nick: true,
                email: true,
                image: true,
              }
            }
          }
        },
        sectorOffers: {
          include: {
            offer: {
              select: {
                id: true,
                title: true,
                images: true,
              }
            }
          }
        }
      }
    })

    return NextResponse.json(fullGroup, { status: 201 })

  } catch (error) {
    console.error('Error creating group:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
