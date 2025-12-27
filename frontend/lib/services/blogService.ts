import { prisma } from '@/lib/prisma'
import { BlogPostStatus, BlogVisibility, PollType, CommentStatus, PollResultsVisibility, ReactionType } from '@prisma/client'
import { calculateReadingTime, generateSlug } from '@/lib/utils/blog'

// ============================================
// TIPUS
// ============================================

export interface CreateBlogPostInput {
  title: string
  content: string
  excerpt?: string
  coverImage?: string
  categoryId?: string
  tags?: string[]
  visibility: BlogVisibility
  targetGroupIds?: string[]
  status: BlogPostStatus
  scheduledAt?: Date
  isPinned?: boolean
  pinnedUntil?: Date
  isFeatured?: boolean
  allowComments?: boolean
  allowReactions?: boolean
  authorId: string
  poll?: {
    question: string
    type: PollType
    options: string[]
    showResults: PollResultsVisibility
    endsAt?: Date
  }
}

export interface UpdateBlogPostInput extends Partial<CreateBlogPostInput> {
  id: string
}

export interface BlogPostFilters {
  status?: BlogPostStatus
  categoryId?: string
  authorId?: string
  isPinned?: boolean
  isFeatured?: boolean
  search?: string
  visibility?: BlogVisibility
}

// ============================================
// FUNCIONS CRUD
// ============================================

/**
 * Obtenir posts per gestió (admin)
 */
export async function getBlogPostsForAdmin(filters: BlogPostFilters = {}) {
  const where: any = {}

  if (filters.status) where.status = filters.status
  if (filters.categoryId) where.categoryId = filters.categoryId
  if (filters.authorId) where.authorId = filters.authorId
  if (filters.isPinned !== undefined) where.isPinned = filters.isPinned
  if (filters.isFeatured !== undefined) where.isFeatured = filters.isFeatured
  if (filters.visibility) where.visibility = filters.visibility

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { excerpt: { contains: filters.search, mode: 'insensitive' } }
    ]
  }

  const posts = await prisma.blogPost.findMany({
    where,
    include: {
      author: {
        select: { id: true, name: true, image: true, nick: true }
      },
      category: true,
      tags: true,
      poll: {
        include: {
          options: {
            orderBy: { order: 'asc' }
          }
        }
      },
      _count: {
        select: {
          comments: { where: { status: 'APPROVED' } },
          reactions: true,
          bookmarks: true
        }
      }
    },
    orderBy: [
      { isPinned: 'desc' },
      { publishedAt: 'desc' },
      { createdAt: 'desc' }
    ]
  })

  return posts
}

/**
 * Obtenir posts publicats per dashboard (empleats)
 */
export async function getPublishedBlogPosts(userId: string, options: {
  categoryId?: string
  page?: number
  limit?: number
  userGroupIds?: string[]
} = {}) {
  const { categoryId, page = 1, limit = 10, userGroupIds = [] } = options
  const skip = (page - 1) * limit

  const now = new Date()

  // Condició de visibilitat
  const visibilityCondition: any = {
    OR: [
      { visibility: 'PUBLIC' as BlogVisibility }
    ]
  }

  // Afegir condició de grups si l'usuari pertany a algun
  if (userGroupIds.length > 0) {
    visibilityCondition.OR.push({
      visibility: 'GROUPS' as BlogVisibility,
      targetGroups: {
        some: {
          id: { in: userGroupIds }
        }
      }
    })
  }

  const where: any = {
    status: 'PUBLISHED',
    publishedAt: { lte: now },
    ...visibilityCondition
  }

  if (categoryId) {
    where.categoryId = categoryId
  }

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true, image: true, nick: true }
        },
        category: true,
        tags: true,
        poll: {
          include: {
            options: {
              orderBy: { order: 'asc' },
              include: {
                _count: {
                  select: { votes: true }
                }
              }
            }
          }
        },
        reactions: {
          where: { userId },
          select: { type: true }
        },
        bookmarks: {
          where: { userId },
          select: { id: true }
        },
        _count: {
          select: {
            comments: { where: { status: 'APPROVED' } },
            reactions: true
          }
        }
      },
      orderBy: [
        { isPinned: 'desc' },
        { publishedAt: 'desc' }
      ],
      skip,
      take: limit
    }),
    prisma.blogPost.count({ where })
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
 * Obtenir un post per slug
 */
export async function getBlogPostBySlug(slug: string, userId?: string) {
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      author: {
        select: { id: true, name: true, image: true, nick: true, role: true }
      },
      category: true,
      tags: true,
      targetGroups: {
        select: { id: true, name: true }
      },
      poll: {
        include: {
          options: {
            orderBy: { order: 'asc' },
            include: {
              votes: userId ? {
                where: { userId },
                select: { id: true }
              } : false,
              _count: {
                select: { votes: true }
              }
            }
          }
        }
      },
      comments: {
        where: {
          status: 'APPROVED',
          parentId: null  // Només comentaris arrel
        },
        include: {
          author: {
            select: { id: true, name: true, image: true, nick: true }
          },
          replies: {
            where: { status: 'APPROVED' },
            include: {
              author: {
                select: { id: true, name: true, image: true, nick: true }
              }
            },
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      _count: {
        select: {
          reactions: true,
          comments: { where: { status: 'APPROVED' } },
          bookmarks: true
        }
      }
    }
  })

  if (!post) return null

  // Incrementar comptador de visites
  await prisma.blogPost.update({
    where: { id: post.id },
    data: { viewCount: { increment: 1 } }
  })

  // Afegir info de l'usuari actual
  if (userId) {
    const [userReaction, userBookmark, userPollVotes] = await Promise.all([
      prisma.blogReaction.findFirst({
        where: { postId: post.id, userId }
      }),
      prisma.blogBookmark.findFirst({
        where: { postId: post.id, userId }
      }),
      post.poll ? prisma.blogPollVote.findMany({
        where: {
          option: { pollId: post.poll.id },
          userId
        },
        select: { optionId: true }
      }) : []
    ])

    return {
      ...post,
      userReaction: userReaction?.type || null,
      isBookmarked: !!userBookmark,
      userVotedOptions: userPollVotes.map(v => v.optionId)
    }
  }

  return post
}

/**
 * Obtenir un post per ID
 */
export async function getBlogPostById(id: string) {
  return prisma.blogPost.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, image: true, nick: true } },
      category: true,
      tags: true,
      targetGroups: { select: { id: true, name: true } },
      poll: { include: { options: { orderBy: { order: 'asc' } } } }
    }
  })
}

/**
 * Crear post
 */
export async function createBlogPost(input: CreateBlogPostInput) {
  const {
    title,
    content,
    excerpt,
    coverImage,
    categoryId,
    tags = [],
    visibility,
    targetGroupIds = [],
    status,
    scheduledAt,
    isPinned,
    pinnedUntil,
    isFeatured,
    allowComments,
    allowReactions,
    authorId,
    poll
  } = input

  // Generar slug únic
  const baseSlug = generateSlug(title)
  let slug = baseSlug
  let counter = 1

  while (await prisma.blogPost.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  // Calcular temps de lectura
  const readingTime = calculateReadingTime(content)

  // Determinar data de publicació
  let publishedAt: Date | null = null
  if (status === 'PUBLISHED') {
    publishedAt = new Date()
  } else if (status === 'SCHEDULED' && scheduledAt) {
    publishedAt = scheduledAt
  }

  // Crear o connectar tags
  const tagOperations = tags.map(tagName => ({
    where: { name: tagName },
    create: {
      name: tagName,
      slug: generateSlug(tagName)
    }
  }))

  return prisma.blogPost.create({
    data: {
      title,
      slug,
      content,
      excerpt,
      coverImage,
      readingTime,
      categoryId,
      visibility,
      status,
      publishedAt,
      scheduledAt: status === 'SCHEDULED' ? scheduledAt : null,
      isPinned: isPinned || false,
      pinnedAt: isPinned ? new Date() : null,
      pinnedUntil,
      isFeatured: isFeatured || false,
      allowComments: allowComments ?? true,
      allowReactions: allowReactions ?? true,
      authorId,
      tags: {
        connectOrCreate: tagOperations
      },
      targetGroups: visibility === 'GROUPS' ? {
        connect: targetGroupIds.map(id => ({ id }))
      } : undefined,
      poll: poll ? {
        create: {
          question: poll.question,
          type: poll.type,
          showResults: poll.showResults,
          endsAt: poll.endsAt,
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
      author: { select: { id: true, name: true, image: true, nick: true } },
      category: true,
      tags: true,
      poll: {
        include: { options: true }
      }
    }
  })
}

/**
 * Actualitzar post
 */
export async function updateBlogPost(input: UpdateBlogPostInput) {
  const { id, tags, targetGroupIds, poll, ...data } = input

  // Recalcular temps de lectura si canvia el contingut
  const updateData: any = { ...data }

  if (data.content) {
    updateData.readingTime = calculateReadingTime(data.content)
  }

  // Actualitzar dates segons status
  if (data.status === 'PUBLISHED' && !updateData.publishedAt) {
    updateData.publishedAt = new Date()
  }

  // Actualitzar pinnedAt
  if (data.isPinned && !updateData.pinnedAt) {
    updateData.pinnedAt = new Date()
  } else if (data.isPinned === false) {
    updateData.pinnedAt = null
    updateData.pinnedUntil = null
  }

  // Actualitzar tags si es proporcionen
  if (tags !== undefined) {
    updateData.tags = {
      set: [],  // Desconnectar tots
      connectOrCreate: tags.map(tagName => ({
        where: { name: tagName },
        create: { name: tagName, slug: generateSlug(tagName) }
      }))
    }
  }

  // Actualitzar grups objectiu
  if (targetGroupIds !== undefined) {
    updateData.targetGroups = {
      set: targetGroupIds.map(gid => ({ id: gid }))
    }
  }

  return prisma.blogPost.update({
    where: { id },
    data: updateData,
    include: {
      author: { select: { id: true, name: true, image: true, nick: true } },
      category: true,
      tags: true,
      targetGroups: { select: { id: true, name: true } },
      poll: { include: { options: true } }
    }
  })
}

/**
 * Eliminar post
 */
export async function deleteBlogPost(id: string) {
  return prisma.blogPost.delete({
    where: { id }
  })
}

/**
 * Anclar/Desanclar post
 */
export async function togglePinPost(id: string, isPinned: boolean, pinnedUntil?: Date) {
  return prisma.blogPost.update({
    where: { id },
    data: {
      isPinned,
      pinnedAt: isPinned ? new Date() : null,
      pinnedUntil: isPinned ? pinnedUntil : null
    }
  })
}

/**
 * Destacar/Desdestacar post
 */
export async function toggleFeaturePost(id: string, isFeatured: boolean) {
  return prisma.blogPost.update({
    where: { id },
    data: { isFeatured }
  })
}

// ============================================
// ENQUESTES
// ============================================

/**
 * Votar en una enquesta
 */
export async function votePoll(pollId: string, optionIds: string[], userId: string) {
  const poll = await prisma.blogPoll.findUnique({
    where: { id: pollId },
    include: { options: true }
  })

  if (!poll || !poll.isActive) {
    throw new Error('Enquesta no disponible')
  }

  if (poll.endsAt && new Date() > poll.endsAt) {
    throw new Error("L'enquesta ha finalitzat")
  }

  // Validar opcions
  const validOptionIds = poll.options.map(o => o.id)
  const invalidOptions = optionIds.filter(id => !validOptionIds.includes(id))

  if (invalidOptions.length > 0) {
    throw new Error('Opcions invàlides')
  }

  // Si és SINGLE, només una opció
  if (poll.type === 'SINGLE' && optionIds.length > 1) {
    throw new Error('Només pots seleccionar una opció')
  }

  // Eliminar vots anteriors de l'usuari
  const previousVotes = await prisma.blogPollVote.findMany({
    where: {
      option: { pollId },
      userId
    }
  })

  // Transacció per actualitzar vots
  await prisma.$transaction(async (tx) => {
    // Decrementar comptadors dels vots anteriors
    for (const vote of previousVotes) {
      await tx.blogPollOption.update({
        where: { id: vote.optionId },
        data: { voteCount: { decrement: 1 } }
      })
    }

    // Eliminar vots anteriors
    await tx.blogPollVote.deleteMany({
      where: {
        option: { pollId },
        userId
      }
    })

    // Crear nous vots i actualitzar comptadors
    for (const optionId of optionIds) {
      await tx.blogPollVote.create({
        data: { optionId, userId }
      })
      await tx.blogPollOption.update({
        where: { id: optionId },
        data: { voteCount: { increment: 1 } }
      })
    }

    // Actualitzar total de vots de l'enquesta
    const totalVotes = await tx.blogPollVote.count({
      where: { option: { pollId } }
    })
    await tx.blogPoll.update({
      where: { id: pollId },
      data: { totalVotes }
    })
  })

  return { success: true }
}

// ============================================
// REACCIONS
// ============================================

/**
 * Afegir/canviar reacció
 */
export async function toggleReaction(postId: string, userId: string, type: ReactionType) {
  const existing = await prisma.blogReaction.findFirst({
    where: { postId, userId }
  })

  if (existing) {
    if (existing.type === type) {
      // Eliminar reacció
      await prisma.blogReaction.delete({
        where: { id: existing.id }
      })
      return { action: 'removed' }
    } else {
      // Canviar tipus
      await prisma.blogReaction.update({
        where: { id: existing.id },
        data: { type }
      })
      return { action: 'changed', type }
    }
  } else {
    // Crear nova
    await prisma.blogReaction.create({
      data: { postId, userId, type }
    })
    return { action: 'added', type }
  }
}

// ============================================
// BOOKMARKS
// ============================================

/**
 * Guardar/treure dels guardats
 */
export async function toggleBookmark(postId: string, userId: string) {
  const existing = await prisma.blogBookmark.findUnique({
    where: {
      postId_userId: { postId, userId }
    }
  })

  if (existing) {
    await prisma.blogBookmark.delete({
      where: { id: existing.id }
    })
    return { bookmarked: false }
  } else {
    await prisma.blogBookmark.create({
      data: { postId, userId }
    })
    return { bookmarked: true }
  }
}

// ============================================
// COMENTARIS
// ============================================

/**
 * Crear comentari
 */
export async function createComment(postId: string, userId: string, content: string, parentId?: string) {
  const post = await prisma.blogPost.findUnique({
    where: { id: postId },
    select: { allowComments: true }
  })

  if (!post?.allowComments) {
    throw new Error('Els comentaris estan desactivats per aquest post')
  }

  return prisma.blogComment.create({
    data: {
      postId,
      authorId: userId,
      content,
      parentId,
      status: 'PENDING'  // Requereix moderació
    },
    include: {
      author: { select: { id: true, name: true, image: true, nick: true } }
    }
  })
}

/**
 * Obtenir comentaris pendents de moderació
 */
export async function getPendingComments() {
  return prisma.blogComment.findMany({
    where: { status: 'PENDING' },
    include: {
      author: { select: { id: true, name: true, image: true, nick: true } },
      post: { select: { id: true, title: true, slug: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

/**
 * Moderar comentari
 */
export async function moderateComment(commentId: string, moderatorId: string, status: CommentStatus) {
  return prisma.blogComment.update({
    where: { id: commentId },
    data: {
      status,
      moderatedById: moderatorId,
      moderatedAt: new Date()
    }
  })
}

// ============================================
// CATEGORIES
// ============================================

export async function getCategories() {
  return prisma.blogCategory.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: { posts: { where: { status: 'PUBLISHED' } } }
      }
    }
  })
}

export async function createCategory(data: { name: string; description?: string; color?: string; icon?: string }) {
  const slug = generateSlug(data.name)
  return prisma.blogCategory.create({
    data: { ...data, slug }
  })
}

export async function updateCategory(id: string, data: Partial<{ name: string; description: string; color: string; icon: string; isActive: boolean; order: number }>) {
  return prisma.blogCategory.update({
    where: { id },
    data
  })
}

export async function deleteCategory(id: string) {
  // Desassignar posts abans d'eliminar
  await prisma.blogPost.updateMany({
    where: { categoryId: id },
    data: { categoryId: null }
  })

  return prisma.blogCategory.delete({
    where: { id }
  })
}

// ============================================
// ESTADÍSTIQUES
// ============================================

export async function getBlogStats() {
  const [
    totalPosts,
    publishedPosts,
    draftPosts,
    scheduledPosts,
    totalViews,
    totalComments,
    pendingComments
  ] = await Promise.all([
    prisma.blogPost.count(),
    prisma.blogPost.count({ where: { status: 'PUBLISHED' } }),
    prisma.blogPost.count({ where: { status: 'DRAFT' } }),
    prisma.blogPost.count({ where: { status: 'SCHEDULED' } }),
    prisma.blogPost.aggregate({ _sum: { viewCount: true } }),
    prisma.blogComment.count({ where: { status: 'APPROVED' } }),
    prisma.blogComment.count({ where: { status: 'PENDING' } })
  ])

  return {
    totalPosts,
    publishedPosts,
    draftPosts,
    scheduledPosts,
    totalViews: totalViews._sum.viewCount || 0,
    totalComments,
    pendingComments
  }
}

// ============================================
// GRUPS
// ============================================

export async function getGroups() {
  return prisma.group.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true, membersCount: true },
    orderBy: { name: 'asc' }
  })
}
