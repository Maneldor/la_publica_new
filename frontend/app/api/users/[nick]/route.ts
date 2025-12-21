import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ nick: string }>
}

/**
 * GET /api/users/[nick]
 * Obtenir el perfil públic d'un usuari per nick
 * Aplica configuració de privacitat per a usuaris que no són el propietari
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    const currentUserId = session?.user?.id
    const { nick } = await params

    // Buscar usuari per nick
    const user = await prismaClient.user.findFirst({
      where: {
        nick: nick,
        isActive: true,
      },
      include: {
        profile: true,
        // Configuració de privacitat
        privacySettings: true,
        // Categoria sensible (policia, presons, etc.)
        sensitiveJobCategory: {
          select: {
            id: true,
            name: true,
            forceHidePosition: true,
            forceHideDepartment: true,
            forceHideBio: true,
          }
        },
        // Xarxes socials
        socialLinks: {
          select: {
            platform: true,
            url: true,
            username: true,
          }
        },
        // Comptar connexions
        _count: {
          select: {
            connectionsSent: { where: { status: 'ACCEPTED' } },
            connectionsReceived: { where: { status: 'ACCEPTED' } },
          }
        },
        // Grups públics
        groupMemberships: {
          where: {
            group: {
              type: 'PUBLIC',
              isActive: true,
            }
          },
          select: {
            role: true,
            group: {
              select: {
                id: true,
                name: true,
                slug: true,
                image: true,
                membersCount: true,
              }
            }
          },
          take: 10,
        },
        // Experiència laboral
        experiences: {
          orderBy: { startDate: 'desc' },
          take: 5,
          select: {
            id: true,
            position: true,
            organization: true,
            department: true,
            startDate: true,
            endDate: true,
            isCurrent: true,
            description: true,
          }
        },
        // Educació
        education: {
          orderBy: { startDate: 'desc' },
          take: 5,
          select: {
            id: true,
            degree: true,
            field: true,
            institution: true,
            startDate: true,
            endDate: true,
          }
        },
        // Habilitats
        skills: {
          take: 20,
          select: {
            id: true,
            name: true,
          }
        },
        // Idiomes
        languages: {
          take: 10,
          select: {
            id: true,
            language: true,
            level: true,
          }
        },
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuari no trobat' }, { status: 404 })
    }

    // Determinar si és el propi perfil
    const isOwnProfile = currentUserId === user.id

    // Preparar xarxes socials com a objecte
    const socialLinksObj: Record<string, string> = {}
    user.socialLinks.forEach(link => {
      socialLinksObj[link.platform] = link.url || link.username || ''
    })

    // Si és el propi perfil, retornar tot sense restriccions
    if (isOwnProfile) {
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.name || user.nick
      const totalConnections = user._count.connectionsSent + user._count.connectionsReceived
      const lastActive = user.lastSeenAt || user.lastLogin

      return NextResponse.json({
        id: user.id,
        nick: user.nick,
        name: fullName,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        image: user.image,
        coverImage: user.coverImage,
        coverColor: user.coverColor,
        position: user.profile?.position || user.cargo,
        department: user.profile?.department,
        headline: user.profile?.headline,
        bio: user.profile?.bio,
        location: [user.profile?.city, user.profile?.province].filter(Boolean).join(', '),
        organization: user.profile?.organization,
        phone: user.profile?.phone,
        socialLinks: socialLinksObj,
        administration: user.administration,
        isOnline: user.isOnline,
        lastActive,
        createdAt: user.createdAt,
        connectionsCount: totalConnections,
        groups: user.groupMemberships.map(gm => ({
          ...gm.group,
          role: gm.role,
        })),
        experiences: user.experiences.map(exp => ({
          id: exp.id,
          title: exp.position,
          company: exp.organization,
          department: exp.department,
          startDate: exp.startDate,
          endDate: exp.endDate,
          current: exp.isCurrent,
          description: exp.description,
        })),
        educations: user.education,
        skills: user.skills,
        languages: user.languages.map(lang => ({
          id: lang.id,
          name: lang.language,
          level: lang.level,
        })),
        isOwnProfile: true,
        privacyApplied: false,
        hasSystemRestrictions: !!user.sensitiveJobCategory,
      })
    }

    // Per a altres usuaris: aplicar privacitat
    const privacy = user.privacySettings
    const category = user.sensitiveJobCategory

    // Calcular privacitat efectiva (preferències + restriccions forçades)
    const effectivePrivacy = {
      showRealName: privacy?.showRealName ?? true,
      showPosition: (privacy?.showPosition ?? true) && !category?.forceHidePosition,
      showDepartment: (privacy?.showDepartment ?? true) && !category?.forceHideDepartment,
      showBio: (privacy?.showBio ?? true) && !category?.forceHideBio,
      showLocation: privacy?.showLocation ?? true,
      showPhone: privacy?.showPhone ?? false, // Privat per defecte
      showEmail: privacy?.showEmail ?? false, // Privat per defecte
      showSocialLinks: privacy?.showSocialLinks ?? true,
      showJoinedDate: privacy?.showJoinedDate ?? true,
      showLastActive: privacy?.showLastActive ?? true,
      showConnections: privacy?.showConnections ?? true,
      showGroups: privacy?.showGroups ?? true,
    }

    // Preparar dades amb privacitat aplicada
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.name || user.nick
    const totalConnections = user._count.connectionsSent + user._count.connectionsReceived
    const lastActive = user.lastSeenAt || user.lastLogin

    const filteredUser = {
      id: user.id,
      nick: user.nick,
      // Sempre visible
      image: user.image,
      coverImage: user.coverImage,
      coverColor: user.coverColor,
      administration: user.administration,
      isOnline: user.isOnline,

      // Camps amb privacitat
      name: effectivePrivacy.showRealName ? fullName : null,
      firstName: effectivePrivacy.showRealName ? user.firstName : null,
      lastName: effectivePrivacy.showRealName ? user.lastName : null,
      position: effectivePrivacy.showPosition ? (user.profile?.position || user.cargo) : null,
      department: effectivePrivacy.showDepartment ? user.profile?.department : null,
      headline: user.profile?.headline, // Sempre visible (és el tagline professional)
      bio: effectivePrivacy.showBio ? user.profile?.bio : null,
      location: effectivePrivacy.showLocation
        ? [user.profile?.city, user.profile?.province].filter(Boolean).join(', ')
        : null,
      organization: user.profile?.organization, // Sempre visible
      phone: effectivePrivacy.showPhone ? user.profile?.phone : null,
      email: effectivePrivacy.showEmail ? user.email : null,
      socialLinks: effectivePrivacy.showSocialLinks ? socialLinksObj : null,
      createdAt: effectivePrivacy.showJoinedDate ? user.createdAt : null,
      lastActive: effectivePrivacy.showLastActive ? lastActive : null,
      connectionsCount: effectivePrivacy.showConnections ? totalConnections : null,

      // Grups - amb privacitat
      groups: effectivePrivacy.showGroups
        ? user.groupMemberships.map(gm => ({
            ...gm.group,
            role: gm.role,
          }))
        : null,

      // Experiència i educació - sempre visibles (són dades professionals)
      experiences: user.experiences.map(exp => ({
        id: exp.id,
        title: exp.position,
        company: exp.organization,
        department: exp.department,
        startDate: exp.startDate,
        endDate: exp.endDate,
        current: exp.isCurrent,
        description: exp.description,
      })),
      educations: user.education,
      skills: user.skills,
      languages: user.languages.map(lang => ({
        id: lang.id,
        name: lang.language,
        level: lang.level,
      })),

      // Meta informació
      isOwnProfile: false,
      privacyApplied: true,
      privacySettings: effectivePrivacy,
      hasSystemRestrictions: !!category,
    }

    // Obtenir estat de connexió amb l'usuari actual
    let connectionStatus = 'none'
    let connectionId: string | null = null
    let isIncoming = false

    if (currentUserId) {
      const connection = await prismaClient.userConnection.findFirst({
        where: {
          OR: [
            { senderId: currentUserId, receiverId: user.id },
            { senderId: user.id, receiverId: currentUserId },
          ]
        },
        select: {
          id: true,
          status: true,
          senderId: true,
        }
      })

      if (connection) {
        connectionStatus = connection.status.toLowerCase()
        connectionId = connection.id
        isIncoming = connection.senderId === user.id
      }
    }

    return NextResponse.json({
      ...filteredUser,
      connectionStatus,
      connectionId,
      isIncoming,
    })

  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
