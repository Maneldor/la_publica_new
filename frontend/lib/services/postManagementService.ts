import { prisma } from '@/lib/prisma'
import {
  PostStatus,
  ModerationStatus,
  PostVisibility,
  PostType,
  PollType,
  ReportStatus,
  PostPollResultsShow
} from '@prisma/client'

// ============================================
// TIPUS
// ============================================

export interface CreateOfficialPostInput {
  content: string
  type?: PostType
  visibility?: PostVisibility
  officialBadge?: string
  groupId?: string
  isPinned?: boolean
  pinnedUntil?: Date
  isFeatured?: boolean
  scheduledAt?: Date
  attachments?: {
    type: string
    url: string
    filename?: string
  }[]
  poll?: {
    question: string
    type?: PollType
    options: string[]
    endsAt?: Date
    isAnonymous?: boolean
    showResults?: PostPollResultsShow
  }
  authorId: string
}

export interface PostFilters {
  status?: PostStatus
  moderationStatus?: ModerationStatus
  type?: PostType
  isOfficial?: boolean
  isPinned?: boolean
  isFeatured?: boolean
  authorId?: string
  groupId?: string
  search?: string
  hasReports?: boolean
  dateFrom?: Date
  dateTo?: Date
}

export interface PostStats {
  total: number
  published: number
  scheduled: number
  draft: number
  pendingModeration: number
  reported: number
  pinned: number
  official: number
}

// ============================================
// FUNCIONS DE CONSULTA
// ============================================

/**
 * Obtenir posts per a gestió (admin)
 */
export async function getPostsForManagement(
  filters: PostFilters = {},
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit

  const where: any = {}

  if (filters.status) where.status = filters.status
  if (filters.moderationStatus) where.moderationStatus = filters.moderationStatus
  if (filters.type) where.type = filters.type
  if (filters.isOfficial !== undefined) where.isOfficial = filters.isOfficial
  if (filters.isPinned !== undefined) where.isPinned = filters.isPinned
  if (filters.isFeatured !== undefined) where.isFeatured = filters.isFeatured
  if (filters.authorId) where.authorId = filters.authorId
  if (filters.groupId) where.groupId = filters.groupId

  if (filters.hasReports) {
    where.reportCount = { gt: 0 }
  }

  if (filters.search) {
    where.content = { contains: filters.search, mode: 'insensitive' }
  }

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {}
    if (filters.dateFrom) where.createdAt.gte = filters.dateFrom
    if (filters.dateTo) where.createdAt.lte = filters.dateTo
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true, nick: true, image: true, role: true }
        },
        group: {
          select: { id: true, name: true }
        },
        attachments: true,
        poll: {
          include: {
            options: {
              orderBy: { order: 'asc' },
              include: {
                _count: { select: { votes: true } }
              }
            }
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true,
            reports: true
          }
        }
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ],
      skip,
      take: limit
    }),
    prisma.post.count({ where })
  ])

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}

/**
 * Obtenir estadístiques de posts
 */
export async function getPostStats(): Promise<PostStats> {
  const [
    total,
    published,
    scheduled,
    draft,
    pendingModeration,
    reported,
    pinned,
    official
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: 'PUBLISHED' } }),
    prisma.post.count({ where: { status: 'SCHEDULED' } }),
    prisma.post.count({ where: { status: 'DRAFT' } }),
    prisma.post.count({ where: { moderationStatus: 'PENDING' } }),
    prisma.post.count({ where: { reportCount: { gt: 0 } } }),
    prisma.post.count({ where: { isPinned: true } }),
    prisma.post.count({ where: { isOfficial: true } })
  ])

  return {
    total,
    published,
    scheduled,
    draft,
    pendingModeration,
    reported,
    pinned,
    official
  }
}

// ============================================
// FUNCIONS DE CREACIÓ
// ============================================

/**
 * Crear post oficial de La Pública
 */
export async function createOfficialPost(input: CreateOfficialPostInput) {
  const {
    content,
    type = 'TEXT',
    visibility = 'PUBLIC',
    officialBadge,
    groupId,
    isPinned,
    pinnedUntil,
    isFeatured,
    scheduledAt,
    attachments,
    poll,
    authorId
  } = input

  // Determinar estat
  let status: PostStatus = 'PUBLISHED'
  let publishedAt: Date | null = new Date()

  if (scheduledAt && scheduledAt > new Date()) {
    status = 'SCHEDULED'
    publishedAt = scheduledAt
  }

  return prisma.post.create({
    data: {
      content,
      type: poll ? 'POLL' : type,
      visibility,
      isOfficial: true,
      officialBadge: officialBadge || 'La Pública',
      groupId,
      isPinned: isPinned || false,
      pinnedAt: isPinned ? new Date() : null,
      pinnedUntil,
      pinnedById: isPinned ? authorId : null,
      isFeatured: isFeatured || false,
      featuredAt: isFeatured ? new Date() : null,
      status,
      scheduledAt: status === 'SCHEDULED' ? scheduledAt : null,
      publishedAt,
      moderationStatus: 'APPROVED',
      authorId,
      attachments: attachments ? {
        create: attachments.map((att, index) => ({
          type: att.type as any,
          url: att.url,
          filename: att.filename
        }))
      } : undefined,
      poll: poll ? {
        create: {
          question: poll.question,
          type: poll.type || 'SINGLE',
          endsAt: poll.endsAt,
          isAnonymous: poll.isAnonymous || false,
          showResults: poll.showResults || 'AFTER_VOTE',
          options: {
            create: poll.options.map((text, index) => ({
              text,
              order: index
            }))
          }
        }
      } : undefined
    },
    include: {
      author: { select: { id: true, name: true, nick: true, image: true } },
      attachments: true,
      poll: { include: { options: true } }
    }
  })
}

// ============================================
// FUNCIONS DE MODERACIÓ
// ============================================

/**
 * Moderar post
 */
export async function moderatePost(
  postId: string,
  moderatorId: string,
  status: ModerationStatus,
  note?: string
) {
  return prisma.post.update({
    where: { id: postId },
    data: {
      moderationStatus: status,
      moderatedAt: new Date(),
      moderatedById: moderatorId,
      moderationNote: note,
      status: status === 'REJECTED' ? 'ARCHIVED' : undefined
    }
  })
}

/**
 * Obtenir posts pendents de moderació
 */
export async function getPendingModerationPosts(limit: number = 20) {
  return prisma.post.findMany({
    where: {
      OR: [
        { moderationStatus: 'PENDING' },
        { moderationStatus: 'FLAGGED' },
        { reportCount: { gt: 0 } }
      ]
    },
    include: {
      author: { select: { id: true, name: true, nick: true, image: true } },
      reports: {
        include: {
          reporter: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' }
      },
      _count: {
        select: { likes: true, comments: true, reports: true }
      }
    },
    orderBy: [
      { reportCount: 'desc' },
      { createdAt: 'asc' }
    ],
    take: limit
  })
}

// ============================================
// FUNCIONS DE FIXAR/DESTACAR
// ============================================

/**
 * Fixar/desfixar post
 */
export async function togglePinPost(
  postId: string,
  userId: string,
  isPinned: boolean,
  pinnedUntil?: Date
) {
  return prisma.post.update({
    where: { id: postId },
    data: {
      isPinned,
      pinnedAt: isPinned ? new Date() : null,
      pinnedUntil: isPinned ? pinnedUntil : null,
      pinnedById: isPinned ? userId : null
    }
  })
}

/**
 * Destacar/desdestacar post
 */
export async function toggleFeaturePost(postId: string, isFeatured: boolean) {
  return prisma.post.update({
    where: { id: postId },
    data: {
      isFeatured,
      featuredAt: isFeatured ? new Date() : null
    }
  })
}

/**
 * Obtenir posts fixats
 */
export async function getPinnedPosts() {
  const now = new Date()

  return prisma.post.findMany({
    where: {
      isPinned: true,
      OR: [
        { pinnedUntil: null },
        { pinnedUntil: { gt: now } }
      ]
    },
    include: {
      author: { select: { id: true, name: true, nick: true, image: true } },
      pinnedBy: { select: { id: true, name: true } }
    },
    orderBy: { pinnedAt: 'desc' }
  })
}

// ============================================
// FUNCIONS DE DENÚNCIES
// ============================================

/**
 * Crear denúncia
 */
export async function createPostReport(
  postId: string,
  reporterId: string,
  reason: any,
  description?: string
) {
  const [report] = await prisma.$transaction([
    prisma.postReport.create({
      data: {
        postId,
        reporterId,
        reason,
        description
      }
    }),
    prisma.post.update({
      where: { id: postId },
      data: { reportCount: { increment: 1 } }
    })
  ])

  return report
}

/**
 * Obtenir denúncies pendents
 */
export async function getPendingReports(limit: number = 20) {
  return prisma.postReport.findMany({
    where: { status: 'PENDING' },
    include: {
      post: {
        include: {
          author: { select: { id: true, name: true, nick: true, image: true } }
        }
      },
      reporter: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: 'asc' },
    take: limit
  })
}

/**
 * Resoldre denúncia
 */
export async function resolveReport(
  reportId: string,
  resolverId: string,
  status: ReportStatus,
  note?: string
) {
  return prisma.postReport.update({
    where: { id: reportId },
    data: {
      status,
      resolvedAt: new Date(),
      resolvedById: resolverId,
      resolvedNote: note
    }
  })
}

// ============================================
// FUNCIONS D'ENQUESTES
// ============================================

/**
 * Votar en enquesta
 */
export async function votePoll(
  pollId: string,
  optionIds: string[],
  userId: string
) {
  const poll = await prisma.postPoll.findUnique({
    where: { id: pollId },
    include: { options: true }
  })

  if (!poll) throw new Error('Enquesta no trobada')
  if (poll.endsAt && new Date() > poll.endsAt) {
    throw new Error('L\'enquesta ha finalitzat')
  }

  // Validar opcions
  const validOptionIds = poll.options.map(o => o.id)
  if (optionIds.some(id => !validOptionIds.includes(id))) {
    throw new Error('Opció invàlida')
  }

  // Si és SINGLE, només una opció
  if (poll.type === 'SINGLE' && optionIds.length > 1) {
    throw new Error('Només pots seleccionar una opció')
  }

  // Verificar si ja ha votat
  const existingVotes = await prisma.postPollVote.findMany({
    where: {
      option: { pollId },
      userId
    }
  })

  // Si ja ha votat, eliminar vots anteriors
  if (existingVotes.length > 0) {
    await prisma.$transaction([
      prisma.postPollVote.deleteMany({
        where: {
          option: { pollId },
          userId
        }
      }),
      // Decrementar comptadors d'opcions anteriors
      ...existingVotes.map(vote =>
        prisma.postPollOption.update({
          where: { id: vote.optionId },
          data: { voteCount: { decrement: 1 } }
        })
      ),
      prisma.postPoll.update({
        where: { id: pollId },
        data: { totalVotes: { decrement: 1 } }
      })
    ])
  }

  // Crear nous vots
  await prisma.$transaction([
    ...optionIds.map(optionId =>
      prisma.postPollVote.create({
        data: { optionId, userId }
      })
    ),
    ...optionIds.map(optionId =>
      prisma.postPollOption.update({
        where: { id: optionId },
        data: { voteCount: { increment: 1 } }
      })
    ),
    prisma.postPoll.update({
      where: { id: pollId },
      data: { totalVotes: { increment: 1 } }
    })
  ])

  return { success: true }
}

/**
 * Obtenir resultats d'enquesta
 */
export async function getPollResults(pollId: string, userId?: string) {
  const poll = await prisma.postPoll.findUnique({
    where: { id: pollId },
    include: {
      options: {
        orderBy: { order: 'asc' },
        include: {
          _count: { select: { votes: true } }
        }
      }
    }
  })

  if (!poll) return null

  // Obtenir vots de l'usuari si s'ha proporcionat
  let userVotedOptionIds: string[] = []
  if (userId) {
    const userVotes = await prisma.postPollVote.findMany({
      where: {
        option: { pollId },
        userId
      },
      select: { optionId: true }
    })
    userVotedOptionIds = userVotes.map(v => v.optionId)
  }

  return {
    ...poll,
    userVotedOptionIds,
    options: poll.options.map(o => ({
      id: o.id,
      text: o.text,
      voteCount: o._count.votes,
      percentage: poll.totalVotes > 0
        ? Math.round((o._count.votes / poll.totalVotes) * 100)
        : 0
    }))
  }
}

// ============================================
// PROGRAMACIÓ DE POSTS
// ============================================

/**
 * Publicar posts programats (cridat per cron)
 */
export async function publishScheduledPosts() {
  const now = new Date()

  const scheduledPosts = await prisma.post.findMany({
    where: {
      status: 'SCHEDULED',
      scheduledAt: { lte: now }
    }
  })

  const results = await Promise.all(
    scheduledPosts.map(post =>
      prisma.post.update({
        where: { id: post.id },
        data: {
          status: 'PUBLISHED',
          publishedAt: now
        }
      })
    )
  )

  return {
    published: results.length,
    postIds: results.map(p => p.id)
  }
}

/**
 * Netejar posts fixats expirats
 */
export async function cleanExpiredPins() {
  const now = new Date()

  return prisma.post.updateMany({
    where: {
      isPinned: true,
      pinnedUntil: { lt: now }
    },
    data: {
      isPinned: false,
      pinnedAt: null,
      pinnedUntil: null,
      pinnedById: null
    }
  })
}

/**
 * Actualitzar post
 */
export async function updatePost(
  postId: string,
  data: {
    content?: string
    visibility?: PostVisibility
    status?: PostStatus
    scheduledAt?: Date | null
    isOfficial?: boolean
    officialBadge?: string
  }
) {
  return prisma.post.update({
    where: { id: postId },
    data: {
      ...data,
      updatedAt: new Date()
    },
    include: {
      author: { select: { id: true, name: true, nick: true, image: true } },
      attachments: true,
      poll: { include: { options: true } }
    }
  })
}

/**
 * Eliminar post
 */
export async function deletePost(postId: string) {
  return prisma.post.delete({
    where: { id: postId }
  })
}
