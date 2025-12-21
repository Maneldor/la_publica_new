import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Obtenir un grup amb tots els detalls
export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 403 })
  }

  try {
    const { id } = await params

    const group = await prismaClient.group.findUnique({
      where: { id },
      include: {
        _count: {
          select: { members: true }
        },
        members: {
          orderBy: [
            { role: 'asc' },
            { joinedAt: 'desc' }
          ],
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
                company: {
                  select: { name: true }
                },
                category: {
                  select: { name: true }
                }
              }
            }
          }
        }
      }
    })

    if (!group) {
      return NextResponse.json({ error: 'Grup no trobat' }, { status: 404 })
    }

    // Formatejar ofertes
    const formattedGroup = {
      ...group,
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

    return NextResponse.json(formattedGroup)

  } catch (error) {
    console.error('Error fetching group:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// PUT - Actualitzar grup amb admin, moderadors i ofertes
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 403 })
  }

  try {
    const { id } = await params
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

    // Verificar que el grup existeix
    const existingGroup = await prismaClient.group.findUnique({
      where: { id },
      include: {
        members: true,
        sectorOffers: true,
      }
    })

    if (!existingGroup) {
      return NextResponse.json({ error: 'Grup no trobat' }, { status: 404 })
    }

    // Si es canvia el slug, verificar que no existeixi
    if (slug && slug !== existingGroup.slug) {
      const slugExists = await prismaClient.group.findUnique({
        where: { slug: slug.toLowerCase().replace(/\s+/g, '-') }
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'Ja existeix un grup amb aquest slug' },
          { status: 400 }
        )
      }
    }

    // Validar tipus restringit si es proporciona
    if (type && !['PROFESSIONAL', 'PRIVATE', 'SECRET', 'PUBLIC'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipus de grup invalid' },
        { status: 400 }
      )
    }

    // Actualitzar amb transaccio
    await prismaClient.$transaction(async (tx) => {
      // Actualitzar el grup
      await tx.group.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(slug && { slug: slug.toLowerCase().replace(/\s+/g, '-') }),
          ...(description !== undefined && { description }),
          ...(type && { type }),
          ...(image !== undefined && { image }),
          ...(coverImage !== undefined && { coverImage }),
          ...(joinPolicy && { joinPolicy }),
          ...(contentVisibility && { contentVisibility }),
          ...(memberListVisibility && { memberListVisibility }),
          ...(postPermission && { postPermission }),
          ...(enableForum !== undefined && { enableForum }),
          ...(enableGallery !== undefined && { enableGallery }),
          ...(enableDocuments !== undefined && { enableDocuments }),
          ...(enableGroupChat !== undefined && { enableGroupChat }),
          ...(isActive !== undefined && { isActive }),
        }
      })

      // Gestionar admin i moderadors
      if (adminId !== undefined || moderatorIds !== undefined) {
        // Obtenir membres actuals amb rol ADMIN o MODERATOR
        const currentAdminMods = existingGroup.members.filter(
          m => m.role === 'ADMIN' || m.role === 'MODERATOR'
        )

        // Eliminar admins i moderadors actuals
        if (currentAdminMods.length > 0) {
          await tx.groupMember.deleteMany({
            where: {
              groupId: id,
              role: { in: ['ADMIN', 'MODERATOR'] }
            }
          })
        }

        // Afegir nou admin
        if (adminId) {
          await tx.groupMember.upsert({
            where: {
              groupId_userId: { groupId: id, userId: adminId }
            },
            create: {
              groupId: id,
              userId: adminId,
              role: 'ADMIN',
            },
            update: {
              role: 'ADMIN',
            }
          })
        }

        // Afegir nous moderadors
        if (moderatorIds && moderatorIds.length > 0) {
          for (const userId of moderatorIds) {
            await tx.groupMember.upsert({
              where: {
                groupId_userId: { groupId: id, userId }
              },
              create: {
                groupId: id,
                userId,
                role: 'MODERATOR',
              },
              update: {
                role: 'MODERATOR',
              }
            })
          }
        }
      }

      // Gestionar ofertes sectorials
      if (sectorOfferIds !== undefined) {
        // Eliminar ofertes actuals
        await tx.groupSectorOffer.deleteMany({
          where: { groupId: id }
        })

        // Afegir noves ofertes
        if (sectorOfferIds.length > 0) {
          await tx.groupSectorOffer.createMany({
            data: sectorOfferIds.map((offerId: string) => ({
              groupId: id,
              offerId,
            }))
          })
        }
      }

      // Actualitzar comptador de membres
      const membersCount = await tx.groupMember.count({
        where: { groupId: id }
      })
      await tx.group.update({
        where: { id },
        data: { membersCount }
      })
    })

    // Obtenir el grup actualitzat
    const updatedGroup = await prismaClient.group.findUnique({
      where: { id },
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

    return NextResponse.json(updatedGroup)

  } catch (error) {
    console.error('Error updating group:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar grup
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 403 })
  }

  try {
    const { id } = await params

    // Verificar que el grup existeix
    const group = await prismaClient.group.findUnique({
      where: { id },
      include: {
        _count: {
          select: { members: true }
        }
      }
    })

    if (!group) {
      return NextResponse.json({ error: 'Grup no trobat' }, { status: 404 })
    }

    // Comprovar si te membres (excepte admin/moderadors que es poden eliminar)
    const regularMembers = await prismaClient.groupMember.count({
      where: {
        groupId: id,
        role: 'MEMBER'
      }
    })

    if (regularMembers > 0) {
      return NextResponse.json(
        { error: `No es pot eliminar el grup perque te ${regularMembers} membres regulars. Elimina els membres primer.` },
        { status: 400 }
      )
    }

    // Eliminar el grup (cascade elimina membres i ofertes)
    await prismaClient.group.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting group:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
