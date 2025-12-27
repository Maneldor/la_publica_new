import { prisma } from '@/lib/prisma'
import {
  ForumVisibility,
  ForumTopicStatus,
  ForumPostStatus,
  ModerationStatus,
  PollType,
  ReportStatus
} from '@prisma/client'

// ============================================
// TIPUS
// ============================================

export interface CreateForumInput {
  name: string
  description?: string
  icon?: string
  coverImage?: string
  categoryId?: string
  visibility: ForumVisibility
  groupIds?: string[]
  requiresApproval?: boolean
  allowPolls?: boolean
  allowAttachments?: boolean
  createdById: string
}

export interface CreateTopicInput {
  forumId: string
  title: string
  content: string
  tags?: string[]
  isPinned?: boolean
  isFeatured?: boolean
  authorId: string
  poll?: {
    question: string
    type: PollType
    options: string[]
    endsAt?: Date
    isAnonymous?: boolean
    showResults?: 'ALWAYS' | 'AFTER_VOTE' | 'AFTER_END' | 'NEVER'
  }
}

export interface CreatePostInput {
  topicId: string
  content: string
  parentId?: string
  authorId: string
}

export interface ForumFilters {
  categoryId?: string
  visibility?: ForumVisibility
  isActive?: boolean
  search?: string
}

export interface TopicFilters {
  forumId?: string
  status?: ForumTopicStatus
  isPinned?: boolean
  isFeatured?: boolean
  isLocked?: boolean
  authorId?: string
  search?: string
  tags?: string[]
  moderationStatus?: ModerationStatus
  hasReports?: boolean
}

// ============================================
// CATEGORIES
// ============================================

export async function getCategories() {
  return prisma.forumCategory.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: { forums: { where: { isActive: true } } }
      }
    }
  })
}

export async function createCategory(data: {
  name: string
  description?: string
  icon?: string
  color?: string
}) {
  const slug = generateSlug(data.name)
  return prisma.forumCategory.create({
    data: { ...data, slug }
  })
}

export async function updateCategory(id: string, data: Partial<{
  name: string
  description: string
  icon: string
  color: string
  order: number
  isActive: boolean
}>) {
  return prisma.forumCategory.update({
    where: { id },
    data
  })
}

export async function deleteCategory(id: string) {
  await prisma.forum.updateMany({
    where: { categoryId: id },
    data: { categoryId: null }
  })
  return prisma.forumCategory.delete({ where: { id } })
}

// ============================================
// FÒRUMS - GESTIÓ
// ============================================

export async function getForumsForAdmin(filters: ForumFilters = {}) {
  const where: any = {}

  if (filters.categoryId) where.categoryId = filters.categoryId
  if (filters.visibility) where.visibility = filters.visibility
  if (filters.isActive !== undefined) where.isActive = filters.isActive
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } }
    ]
  }

  return prisma.forum.findMany({
    where,
    include: {
      category: true,
      groups: { select: { id: true, name: true } },
      moderators: { select: { id: true, name: true, image: true } },
      createdBy: { select: { id: true, name: true } },
      _count: {
        select: { topics: true }
      }
    },
    orderBy: [
      { category: { order: 'asc' } },
      { name: 'asc' }
    ]
  })
}

export async function getForumStats() {
  const [
    totalForums,
    activeForums,
    lockedForums,
    publicForums,
    groupForums,
    privateForums,
    totalTopics,
    totalPosts,
    pendingTopics,
    reportedContent
  ] = await Promise.all([
    prisma.forum.count(),
    prisma.forum.count({ where: { isActive: true } }),
    prisma.forum.count({ where: { isLocked: true } }),
    prisma.forum.count({ where: { visibility: 'PUBLIC' } }),
    prisma.forum.count({ where: { visibility: 'GROUPS' } }),
    prisma.forum.count({ where: { visibility: 'PRIVATE' } }),
    prisma.forumTopic.count(),
    prisma.forumPost.count(),
    prisma.forumTopic.count({ where: { moderationStatus: 'PENDING' } }),
    prisma.forumReport.count({ where: { status: 'PENDING' } })
  ])

  return {
    totalForums,
    activeForums,
    lockedForums,
    publicForums,
    groupForums,
    privateForums,
    totalTopics,
    totalPosts,
    pendingTopics,
    reportedContent
  }
}

export async function createForum(input: CreateForumInput) {
  const slug = await ensureUniqueSlug(generateSlug(input.name), 'forum')

  return prisma.forum.create({
    data: {
      name: input.name,
      slug,
      description: input.description,
      icon: input.icon,
      coverImage: input.coverImage,
      categoryId: input.categoryId,
      visibility: input.visibility,
      requiresApproval: input.requiresApproval || false,
      allowPolls: input.allowPolls ?? true,
      allowAttachments: input.allowAttachments ?? true,
      createdById: input.createdById,
      groups: input.visibility === 'GROUPS' && input.groupIds ? {
        connect: input.groupIds.map(id => ({ id }))
      } : undefined
    },
    include: {
      category: true,
      groups: { select: { id: true, name: true } }
    }
  })
}

export async function updateForum(id: string, data: Partial<{
  name: string
  description: string
  icon: string
  coverImage: string
  categoryId: string | null
  visibility: ForumVisibility
  groupIds: string[]
  isActive: boolean
  isLocked: boolean
  requiresApproval: boolean
  allowPolls: boolean
  allowAttachments: boolean
}>) {
  const { groupIds, ...rest } = data

  const updateData: any = { ...rest }

  if (groupIds !== undefined) {
    updateData.groups = {
      set: groupIds.map(id => ({ id }))
    }
  }

  return prisma.forum.update({
    where: { id },
    data: updateData,
    include: {
      category: true,
      groups: { select: { id: true, name: true } }
    }
  })
}

export async function deleteForum(id: string) {
  return prisma.forum.delete({ where: { id } })
}

export async function addModerator(forumId: string, userId: string) {
  return prisma.forum.update({
    where: { id: forumId },
    data: {
      moderators: { connect: { id: userId } }
    }
  })
}

export async function removeModerator(forumId: string, userId: string) {
  return prisma.forum.update({
    where: { id: forumId },
    data: {
      moderators: { disconnect: { id: userId } }
    }
  })
}

// ============================================
// FÒRUMS - PÚBLIC
// ============================================

export async function getPublicForums(userId: string, userGroupIds: string[] = []) {
  const forums = await prisma.forum.findMany({
    where: {
      isActive: true,
      OR: [
        { visibility: 'PUBLIC' },
        {
          visibility: 'GROUPS',
          groups: {
            some: { id: { in: userGroupIds } }
          }
        }
      ]
    },
    include: {
      category: true,
      _count: {
        select: { topics: { where: { status: 'PUBLISHED' } } }
      }
    },
    orderBy: [
      { category: { order: 'asc' } },
      { name: 'asc' }
    ]
  })

  return forums
}

export async function getForumBySlug(slug: string, userId?: string, userGroupIds: string[] = []) {
  const forum = await prisma.forum.findUnique({
    where: { slug },
    include: {
      category: true,
      groups: { select: { id: true, name: true } },
      moderators: { select: { id: true, name: true, image: true } },
      createdBy: { select: { id: true, name: true } }
    }
  })

  if (!forum) return null

  if (!forum.isActive) return null
  if (forum.visibility === 'PRIVATE') return null
  if (forum.visibility === 'GROUPS') {
    const hasAccess = forum.groups.some(g => userGroupIds.includes(g.id))
    if (!hasAccess) return null
  }

  return forum
}

export async function getForumById(id: string) {
  return prisma.forum.findUnique({
    where: { id },
    include: {
      category: true,
      groups: { select: { id: true, name: true } },
      moderators: { select: { id: true, name: true, image: true, email: true } },
      createdBy: { select: { id: true, name: true } },
      _count: {
        select: { topics: true }
      }
    }
  })
}

// ============================================
// TEMES - GESTIÓ
// ============================================

export async function getTopicsForAdmin(filters: TopicFilters = {}, page = 1, limit = 20) {
  const skip = (page - 1) * limit
  const where: any = {}

  if (filters.forumId) where.forumId = filters.forumId
  if (filters.status) where.status = filters.status
  if (filters.isPinned !== undefined) where.isPinned = filters.isPinned
  if (filters.isFeatured !== undefined) where.isFeatured = filters.isFeatured
  if (filters.isLocked !== undefined) where.isLocked = filters.isLocked
  if (filters.authorId) where.authorId = filters.authorId
  if (filters.moderationStatus) where.moderationStatus = filters.moderationStatus
  if (filters.hasReports) where.reportCount = { gt: 0 }
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { content: { contains: filters.search, mode: 'insensitive' } }
    ]
  }
  if (filters.tags?.length) {
    where.tags = { hasSome: filters.tags }
  }

  const [topics, total] = await Promise.all([
    prisma.forumTopic.findMany({
      where,
      include: {
        forum: { select: { id: true, name: true, slug: true } },
        author: { select: { id: true, name: true, nick: true, image: true } },
        poll: {
          include: {
            options: {
              orderBy: { order: 'asc' },
              include: { _count: { select: { votes: true } } }
            }
          }
        },
        _count: {
          select: { posts: true, likes: true, reports: true }
        }
      },
      orderBy: [
        { isPinned: 'desc' },
        { lastActivityAt: 'desc' }
      ],
      skip,
      take: limit
    }),
    prisma.forumTopic.count({ where })
  ])

  return {
    topics,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  }
}

export async function createTopicAdmin(input: CreateTopicInput) {
  const slug = await ensureUniqueSlug(generateSlug(input.title), 'topic', input.forumId)

  const topic = await prisma.forumTopic.create({
    data: {
      forumId: input.forumId,
      title: input.title,
      slug,
      content: input.content,
      tags: input.tags || [],
      isPinned: input.isPinned || false,
      pinnedAt: input.isPinned ? new Date() : null,
      isFeatured: input.isFeatured || false,
      featuredAt: input.isFeatured ? new Date() : null,
      authorId: input.authorId,
      status: 'PUBLISHED',
      moderationStatus: 'APPROVED',
      poll: input.poll ? {
        create: {
          question: input.poll.question,
          type: input.poll.type,
          endsAt: input.poll.endsAt,
          isAnonymous: input.poll.isAnonymous || false,
          showResults: input.poll.showResults || 'AFTER_VOTE',
          options: {
            create: input.poll.options.map((text, index) => ({
              text,
              order: index
            }))
          }
        }
      } : undefined
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
      poll: { include: { options: true } }
    }
  })

  await prisma.forum.update({
    where: { id: input.forumId },
    data: {
      topicsCount: { increment: 1 },
      lastActivityAt: new Date()
    }
  })

  return topic
}

export async function updateTopic(id: string, data: Partial<{
  title: string
  content: string
  tags: string[]
  status: ForumTopicStatus
}>) {
  return prisma.forumTopic.update({
    where: { id },
    data
  })
}

export async function deleteTopic(id: string) {
  const topic = await prisma.forumTopic.findUnique({
    where: { id },
    select: { forumId: true }
  })

  await prisma.forumTopic.delete({ where: { id } })

  if (topic) {
    const postsCount = await prisma.forumPost.count({ where: { topic: { forumId: topic.forumId } } })
    const topicsCount = await prisma.forumTopic.count({ where: { forumId: topic.forumId } })

    await prisma.forum.update({
      where: { id: topic.forumId },
      data: { topicsCount, postsCount }
    })
  }
}

export async function togglePinTopic(id: string, userId: string, isPinned: boolean) {
  return prisma.forumTopic.update({
    where: { id },
    data: {
      isPinned,
      pinnedAt: isPinned ? new Date() : null,
      pinnedById: isPinned ? userId : null
    }
  })
}

export async function toggleFeatureTopic(id: string, isFeatured: boolean) {
  return prisma.forumTopic.update({
    where: { id },
    data: {
      isFeatured,
      featuredAt: isFeatured ? new Date() : null
    }
  })
}

export async function toggleLockTopic(id: string, userId: string, isLocked: boolean, reason?: string) {
  return prisma.forumTopic.update({
    where: { id },
    data: {
      isLocked,
      lockedAt: isLocked ? new Date() : null,
      lockedById: isLocked ? userId : null,
      lockedReason: isLocked ? reason : null
    }
  })
}

export async function moderateTopic(
  id: string,
  moderatorId: string,
  status: ModerationStatus,
  note?: string
) {
  const updateData: any = {
    moderationStatus: status,
    moderatedAt: new Date(),
    moderatedById: moderatorId,
    moderationNote: note
  }

  if (status === 'APPROVED') {
    updateData.status = 'PUBLISHED'
  }
  if (status === 'REJECTED') {
    updateData.status = 'ARCHIVED'
  }

  return prisma.forumTopic.update({
    where: { id },
    data: updateData
  })
}

export async function getTopicById(id: string) {
  return prisma.forumTopic.findUnique({
    where: { id },
    include: {
      forum: { select: { id: true, name: true, slug: true } },
      author: { select: { id: true, name: true, nick: true, image: true } },
      pinnedBy: { select: { id: true, name: true } },
      lockedBy: { select: { id: true, name: true } },
      poll: {
        include: {
          options: {
            orderBy: { order: 'asc' },
            include: { _count: { select: { votes: true } } }
          }
        }
      },
      reports: {
        include: {
          reporter: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' }
      },
      _count: {
        select: { posts: true, likes: true, reports: true, bookmarks: true }
      }
    }
  })
}

// ============================================
// TEMES - PÚBLIC
// ============================================

export async function getForumTopics(
  forumId: string,
  userId?: string,
  page = 1,
  limit = 20
) {
  const skip = (page - 1) * limit

  const [topics, total] = await Promise.all([
    prisma.forumTopic.findMany({
      where: {
        forumId,
        status: 'PUBLISHED',
        moderationStatus: 'APPROVED'
      },
      include: {
        author: { select: { id: true, name: true, nick: true, image: true } },
        poll: {
          include: {
            options: {
              orderBy: { order: 'asc' },
              include: {
                _count: { select: { votes: true } },
                votes: userId ? {
                  where: { userId },
                  select: { id: true }
                } : false
              }
            }
          }
        },
        _count: {
          select: { posts: true, likes: true }
        }
      },
      orderBy: [
        { isPinned: 'desc' },
        { lastActivityAt: 'desc' }
      ],
      skip,
      take: limit
    }),
    prisma.forumTopic.count({
      where: {
        forumId,
        status: 'PUBLISHED',
        moderationStatus: 'APPROVED'
      }
    })
  ])

  return {
    topics,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  }
}

export async function getTopicBySlug(forumSlug: string, topicSlug: string, userId?: string) {
  const topic = await prisma.forumTopic.findFirst({
    where: {
      slug: topicSlug,
      forum: { slug: forumSlug },
      status: 'PUBLISHED',
      moderationStatus: 'APPROVED'
    },
    include: {
      forum: { select: { id: true, name: true, slug: true, isLocked: true } },
      author: { select: { id: true, name: true, nick: true, image: true } },
      pinnedBy: { select: { id: true, name: true } },
      lockedBy: { select: { id: true, name: true } },
      poll: {
        include: {
          options: {
            orderBy: { order: 'asc' },
            include: {
              votes: userId ? {
                where: { userId },
                select: { id: true }
              } : false,
              _count: { select: { votes: true } }
            }
          }
        }
      },
      _count: {
        select: { posts: true, likes: true, bookmarks: true }
      }
    }
  })

  if (!topic) return null

  await prisma.forumTopic.update({
    where: { id: topic.id },
    data: { viewsCount: { increment: 1 } }
  })

  if (userId) {
    const [userLike, userBookmark] = await Promise.all([
      prisma.forumTopicLike.findUnique({
        where: { topicId_userId: { topicId: topic.id, userId } }
      }),
      prisma.forumBookmark.findUnique({
        where: { topicId_userId: { topicId: topic.id, userId } }
      })
    ])

    return {
      ...topic,
      userHasLiked: !!userLike,
      userHasBookmarked: !!userBookmark,
      userVotedOptionIds: topic.poll?.options
        .filter(o => o.votes && o.votes.length > 0)
        .map(o => o.id) || []
    }
  }

  return topic
}

// ============================================
// RESPOSTES (POSTS)
// ============================================

export async function getTopicPosts(topicId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit

  const [posts, total] = await Promise.all([
    prisma.forumPost.findMany({
      where: {
        topicId,
        status: 'ACTIVE',
        parentId: null
      },
      include: {
        author: { select: { id: true, name: true, nick: true, image: true } },
        replies: {
          where: { status: 'ACTIVE' },
          include: {
            author: { select: { id: true, name: true, nick: true, image: true } },
            _count: { select: { likes: true } }
          },
          orderBy: { createdAt: 'asc' }
        },
        attachments: true,
        _count: { select: { likes: true } }
      },
      orderBy: { createdAt: 'asc' },
      skip,
      take: limit
    }),
    prisma.forumPost.count({
      where: { topicId, status: 'ACTIVE', parentId: null }
    })
  ])

  return {
    posts,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  }
}

export async function createPost(input: CreatePostInput) {
  const post = await prisma.forumPost.create({
    data: {
      topicId: input.topicId,
      content: input.content,
      parentId: input.parentId,
      authorId: input.authorId
    },
    include: {
      author: { select: { id: true, name: true, nick: true, image: true } }
    }
  })

  const topic = await prisma.forumTopic.update({
    where: { id: input.topicId },
    data: {
      postsCount: { increment: 1 },
      lastActivityAt: new Date(),
      lastPostId: post.id,
      lastPostAt: new Date(),
      lastPostById: input.authorId
    },
    select: { forumId: true }
  })

  await prisma.forum.update({
    where: { id: topic.forumId },
    data: {
      postsCount: { increment: 1 },
      lastActivityAt: new Date()
    }
  })

  return post
}

export async function updatePost(id: string, content: string) {
  return prisma.forumPost.update({
    where: { id },
    data: {
      content,
      isEdited: true,
      editedAt: new Date()
    }
  })
}

export async function deletePost(id: string) {
  const post = await prisma.forumPost.update({
    where: { id },
    data: { status: 'DELETED' },
    select: { topicId: true }
  })

  await prisma.forumTopic.update({
    where: { id: post.topicId },
    data: { postsCount: { decrement: 1 } }
  })
}

export async function markAsAcceptedAnswer(postId: string, userId: string) {
  const post = await prisma.forumPost.findUnique({
    where: { id: postId },
    include: { topic: { select: { authorId: true } } }
  })

  if (!post) throw new Error('Post no trobat')
  if (post.topic.authorId !== userId) {
    throw new Error('Només l\'autor del tema pot acceptar respostes')
  }

  await prisma.forumPost.updateMany({
    where: { topicId: post.topicId, isAcceptedAnswer: true },
    data: { isAcceptedAnswer: false, acceptedAt: null, acceptedById: null }
  })

  return prisma.forumPost.update({
    where: { id: postId },
    data: {
      isAcceptedAnswer: true,
      acceptedAt: new Date(),
      acceptedById: userId
    }
  })
}

// ============================================
// INTERACCIONS
// ============================================

export async function toggleTopicLike(topicId: string, userId: string) {
  const existing = await prisma.forumTopicLike.findUnique({
    where: { topicId_userId: { topicId, userId } }
  })

  if (existing) {
    await prisma.forumTopicLike.delete({ where: { id: existing.id } })
    await prisma.forumTopic.update({
      where: { id: topicId },
      data: { likesCount: { decrement: 1 } }
    })
    return { liked: false }
  } else {
    await prisma.forumTopicLike.create({
      data: { topicId, userId }
    })
    await prisma.forumTopic.update({
      where: { id: topicId },
      data: { likesCount: { increment: 1 } }
    })
    return { liked: true }
  }
}

export async function togglePostLike(postId: string, userId: string) {
  const existing = await prisma.forumPostLike.findUnique({
    where: { postId_userId: { postId, userId } }
  })

  if (existing) {
    await prisma.forumPostLike.delete({ where: { id: existing.id } })
    await prisma.forumPost.update({
      where: { id: postId },
      data: { likesCount: { decrement: 1 } }
    })
    return { liked: false }
  } else {
    await prisma.forumPostLike.create({
      data: { postId, userId }
    })
    await prisma.forumPost.update({
      where: { id: postId },
      data: { likesCount: { increment: 1 } }
    })
    return { liked: true }
  }
}

export async function toggleBookmark(topicId: string, userId: string) {
  const existing = await prisma.forumBookmark.findUnique({
    where: { topicId_userId: { topicId, userId } }
  })

  if (existing) {
    await prisma.forumBookmark.delete({ where: { id: existing.id } })
    return { bookmarked: false }
  } else {
    await prisma.forumBookmark.create({
      data: { topicId, userId }
    })
    return { bookmarked: true }
  }
}

// ============================================
// ENQUESTES
// ============================================

export async function votePoll(pollId: string, optionIds: string[], userId: string) {
  const poll = await prisma.forumPoll.findUnique({
    where: { id: pollId },
    include: { options: true }
  })

  if (!poll) throw new Error('Enquesta no trobada')
  if (poll.endsAt && new Date() > poll.endsAt) {
    throw new Error('L\'enquesta ha finalitzat')
  }

  const validOptionIds = poll.options.map(o => o.id)
  if (optionIds.some(id => !validOptionIds.includes(id))) {
    throw new Error('Opció invàlida')
  }

  if (poll.type === 'SINGLE' && optionIds.length > 1) {
    throw new Error('Només pots seleccionar una opció')
  }

  const existingVotes = await prisma.forumPollVote.findMany({
    where: {
      option: { pollId },
      userId
    }
  })

  if (existingVotes.length > 0 && !poll.allowChangeVote) {
    throw new Error('Ja has votat i no es permet canviar el vot')
  }

  if (existingVotes.length > 0) {
    for (const vote of existingVotes) {
      await prisma.forumPollOption.update({
        where: { id: vote.optionId },
        data: { voteCount: { decrement: 1 } }
      })
    }
    await prisma.forumPollVote.deleteMany({
      where: { option: { pollId }, userId }
    })
    await prisma.forumPoll.update({
      where: { id: pollId },
      data: { totalVotes: { decrement: 1 } }
    })
  }

  for (const optionId of optionIds) {
    await prisma.forumPollVote.create({
      data: { optionId, userId }
    })
    await prisma.forumPollOption.update({
      where: { id: optionId },
      data: { voteCount: { increment: 1 } }
    })
  }

  await prisma.forumPoll.update({
    where: { id: pollId },
    data: { totalVotes: { increment: 1 } }
  })

  return { success: true }
}

// ============================================
// REPORTS
// ============================================

export async function createReport(data: {
  topicId?: string
  postId?: string
  reporterId: string
  reason: string
  description?: string
}) {
  const report = await prisma.forumReport.create({
    data: {
      topicId: data.topicId,
      postId: data.postId,
      reporterId: data.reporterId,
      reason: data.reason as any,
      description: data.description
    }
  })

  if (data.topicId) {
    await prisma.forumTopic.update({
      where: { id: data.topicId },
      data: { reportCount: { increment: 1 } }
    })
  }
  if (data.postId) {
    await prisma.forumPost.update({
      where: { id: data.postId },
      data: { reportCount: { increment: 1 } }
    })
  }

  return report
}

export async function resolveReport(id: string, userId: string, note?: string) {
  return prisma.forumReport.update({
    where: { id },
    data: {
      status: 'RESOLVED',
      resolvedAt: new Date(),
      resolvedById: userId,
      resolvedNote: note
    }
  })
}

// ============================================
// UTILS
// ============================================

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function ensureUniqueSlug(baseSlug: string, type: 'forum' | 'topic', forumId?: string): Promise<string> {
  let slug = baseSlug
  let counter = 1

  if (type === 'forum') {
    while (await prisma.forum.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }
  } else {
    while (await prisma.forumTopic.findFirst({ where: { slug, forumId } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }
  }

  return slug
}
