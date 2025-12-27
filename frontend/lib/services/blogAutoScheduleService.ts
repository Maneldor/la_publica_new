import { prisma } from '@/lib/prisma'
import { callBlogAI } from '@/lib/ai/blog-ai-service'
import {
  BlogAutoSchedule,
  BlogAutoFixedTopic,
  BlogAutoDynamicTopic,
  BlogCategory,
  ArticleLength,
  TopicType,
  BlogVisibility
} from '@prisma/client'

// ============================================
// TIPUS
// ============================================

interface GenerationResult {
  success: boolean
  postId?: string
  logId?: string
  error?: string
}

interface TopicSelection {
  type: TopicType
  id: string
  topic: string
  description?: string
  categoryId?: string
  keywords: string[]
}

type ScheduleWithRelations = BlogAutoSchedule & {
  fixedTopics: (BlogAutoFixedTopic & { category: BlogCategory | null })[]
  dynamicTopics: (BlogAutoDynamicTopic & { category: BlogCategory | null })[]
  defaultCategory: BlogCategory | null
}

const LENGTH_WORDS: Record<ArticleLength, number> = {
  SHORT: 500,
  MEDIUM: 800,
  LONG: 1200,
  EXTRA_LONG: 1500
}

// ============================================
// FUNCIONS PRINCIPALS
// ============================================

/**
 * Executa la generació programada (cridat pel cron)
 */
export async function runScheduledGeneration(): Promise<{
  processed: number
  success: number
  failed: number
  skipped: number
  results: GenerationResult[]
}> {
  const results: GenerationResult[] = []
  let processed = 0, success = 0, failed = 0, skipped = 0

  // Obtenir programacions actives i no pausades
  const schedules = await prisma.blogAutoSchedule.findMany({
    where: {
      isActive: true,
      isPaused: false
    },
    include: {
      fixedTopics: {
        where: { isActive: true },
        include: { category: true }
      },
      dynamicTopics: {
        where: { status: 'PENDING' },
        orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
        include: { category: true }
      },
      defaultCategory: true
    }
  })

  const now = new Date()
  const today = now.getDay()  // 0-6 (0=diumenge)

  for (const schedule of schedules) {
    processed++

    // Verificar si avui toca generar
    if (!schedule.daysOfWeek.includes(today)) {
      skipped++
      continue
    }

    // Verificar si ja s'ha executat avui
    if (schedule.lastRunAt) {
      const lastRunDate = schedule.lastRunAt.toISOString().split('T')[0]
      const todayDate = now.toISOString().split('T')[0]
      if (lastRunDate === todayDate) {
        skipped++
        continue
      }
    }

    try {
      const result = await generateArticleForSchedule(schedule, today)
      results.push(result)

      if (result.success) {
        success++
      } else {
        failed++
      }
    } catch (error) {
      failed++
      results.push({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconegut'
      })
    }
  }

  return { processed, success, failed, skipped, results }
}

/**
 * Genera un article per una programació específica
 */
export async function generateArticleForSchedule(
  schedule: ScheduleWithRelations,
  dayOfWeek: number
): Promise<GenerationResult> {
  // Crear log inicial
  const log = await prisma.blogAutoLog.create({
    data: {
      scheduleId: schedule.id,
      status: 'RUNNING',
      topicType: 'FIXED',
      topicText: '',
      scheduledFor: new Date(),
      startedAt: new Date()
    }
  })

  try {
    // 1. Seleccionar tema
    const topic = selectTopic(schedule, dayOfWeek)

    if (!topic) {
      await prisma.blogAutoLog.update({
        where: { id: log.id },
        data: {
          status: 'SKIPPED',
          completedAt: new Date(),
          errorMessage: 'No hi ha temes disponibles per avui'
        }
      })
      return { success: false, logId: log.id, error: 'No hi ha temes disponibles' }
    }

    // Actualitzar log amb el tema
    await prisma.blogAutoLog.update({
      where: { id: log.id },
      data: {
        topicType: topic.type,
        topicId: topic.id,
        topicText: topic.topic
      }
    })

    // 2. Generar subtema específic
    const subtopic = await generateSubtopic(topic, schedule)

    await prisma.blogAutoLog.update({
      where: { id: log.id },
      data: { subtopic }
    })

    // 3. Generar article complet
    const startTime = Date.now()
    const articleResult = await generateArticle(subtopic || topic.topic, schedule)
    const generationTime = Date.now() - startTime

    if (!articleResult.success || !articleResult.content) {
      throw new Error(articleResult.error || 'Error generant article')
    }

    // 4. Generar títol
    const titleResult = await callBlogAI({
      action: 'generate_title',
      input: articleResult.content,
      context: { language: schedule.language as 'ca' | 'es' }
    })

    const titles = Array.isArray(titleResult.result)
      ? titleResult.result
      : [subtopic || topic.topic]
    const title = titles[0] as string

    // 5. Generar excerpt
    const excerptResult = await callBlogAI({
      action: 'generate_excerpt',
      input: articleResult.content,
      context: { language: schedule.language as 'ca' | 'es' }
    })
    const excerpt = typeof excerptResult.result === 'string'
      ? excerptResult.result.slice(0, 300)
      : ''

    // 6. Generar tags
    const tagsResult = await callBlogAI({
      action: 'suggest_tags',
      input: articleResult.content,
      context: { language: schedule.language as 'ca' | 'es' }
    })
    const tags = Array.isArray(tagsResult.result) ? tagsResult.result as string[] : []

    // 7. Crear el BlogPost
    const slug = generateSlug(title)
    const categoryId = topic.categoryId || schedule.defaultCategoryId

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug: await ensureUniqueSlug(slug),
        content: articleResult.content,
        excerpt,
        status: schedule.autoPublish ? 'PUBLISHED' : 'DRAFT',
        publishedAt: schedule.autoPublish ? new Date() : null,
        visibility: schedule.defaultVisibility,
        categoryId,
        isAutoGenerated: true,
        authorId: schedule.createdById,
        tags: {
          connectOrCreate: tags.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag, slug: generateSlug(tag) }
          }))
        }
      }
    })

    // 8. Actualitzar log amb èxit
    await prisma.blogAutoLog.update({
      where: { id: log.id },
      data: {
        status: 'SUCCESS',
        postId: post.id,
        generationTime,
        tokensUsed: articleResult.tokens?.total,
        completedAt: new Date()
      }
    })

    // 9. Actualitzar estadístiques del schedule
    await prisma.blogAutoSchedule.update({
      where: { id: schedule.id },
      data: {
        totalGenerated: { increment: 1 },
        lastRunAt: new Date(),
        nextRunAt: calculateNextRun(schedule),
        consecutiveErrors: 0
      }
    })

    // 10. Actualitzar tema usat
    if (topic.type === 'FIXED') {
      await prisma.blogAutoFixedTopic.update({
        where: { id: topic.id },
        data: {
          timesUsed: { increment: 1 },
          lastUsedAt: new Date()
        }
      })
    } else {
      await prisma.blogAutoDynamicTopic.update({
        where: { id: topic.id },
        data: {
          status: 'USED',
          usedAt: new Date(),
          usedInPostId: post.id
        }
      })
    }

    // 11. Notificar si cal
    if (schedule.notifyOnGenerate && schedule.notifyUserIds.length > 0) {
      await notifyUsers(schedule.notifyUserIds, post, schedule.autoPublish)
    }

    return { success: true, postId: post.id, logId: log.id }

  } catch (error) {
    // Actualitzar log amb error
    await prisma.blogAutoLog.update({
      where: { id: log.id },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Error desconegut',
        retryCount: { increment: 1 }
      }
    })

    // Incrementar errors consecutius
    await prisma.blogAutoSchedule.update({
      where: { id: schedule.id },
      data: {
        consecutiveErrors: { increment: 1 },
        lastRunAt: new Date()
      }
    })

    return {
      success: false,
      logId: log.id,
      error: error instanceof Error ? error.message : 'Error desconegut'
    }
  }
}

/**
 * Selecciona el tema a utilitzar
 */
function selectTopic(
  schedule: ScheduleWithRelations,
  dayOfWeek: number
): TopicSelection | null {
  // Primer, buscar tema fix per avui
  const fixedTopic = schedule.fixedTopics.find(t => t.dayOfWeek === dayOfWeek)

  if (fixedTopic) {
    return {
      type: 'FIXED',
      id: fixedTopic.id,
      topic: fixedTopic.topic,
      description: fixedTopic.description || undefined,
      categoryId: fixedTopic.categoryId || undefined,
      keywords: fixedTopic.keywords
    }
  }

  // Si no hi ha fix, buscar dinàmic disponible
  const now = new Date()
  const dynamicTopic = schedule.dynamicTopics.find(t => {
    if (t.useAfterDate && t.useAfterDate > now) return false
    if (t.useBeforeDate && t.useBeforeDate < now) return false
    return true
  })

  if (dynamicTopic) {
    return {
      type: 'DYNAMIC',
      id: dynamicTopic.id,
      topic: dynamicTopic.topic,
      description: dynamicTopic.description || undefined,
      categoryId: dynamicTopic.categoryId || undefined,
      keywords: dynamicTopic.keywords
    }
  }

  return null
}

/**
 * Genera un subtema específic a partir del tema general
 */
async function generateSubtopic(
  topic: TopicSelection,
  schedule: BlogAutoSchedule
): Promise<string | null> {
  const prompt = `Genera un subtema específic i actual per a un article sobre "${topic.topic}".
${topic.description ? `Context: ${topic.description}` : ''}
${topic.keywords.length > 0 ? `Paraules clau: ${topic.keywords.join(', ')}` : ''}

El subtema ha de ser:
- Específic i concret (no genèric)
- D'actualitat o interès per a empleats públics
- Diferent dels subtemes anteriors

Respon NOMÉS amb el subtema, sense explicacions. Màxim 100 caràcters.`

  const result = await callBlogAI({
    action: 'improve_text',  // Usem aquest per obtenir text curt
    input: prompt,
    context: {
      language: schedule.language as 'ca' | 'es'
    }
  })

  if (result.success && typeof result.result === 'string') {
    return result.result.trim().slice(0, 100)
  }

  return null
}

/**
 * Genera l'article complet
 */
async function generateArticle(
  topic: string,
  schedule: BlogAutoSchedule
): Promise<{
  success: boolean
  content?: string
  tokens?: { input: number; output: number; total: number }
  error?: string
}> {
  const wordCount = LENGTH_WORDS[schedule.articleLength]

  const result = await callBlogAI({
    action: 'generate_article',
    input: topic,
    context: {
      language: schedule.language as 'ca' | 'es',
      tone: schedule.tone as 'formal' | 'informal' | 'professional' | 'friendly',
      targetAudience: 'empleats públics de Catalunya'
    },
    options: {
      maxLength: wordCount
    }
  })

  if (result.success && typeof result.result === 'string') {
    return {
      success: true,
      content: result.result,
      tokens: result.tokens
    }
  }

  return {
    success: false,
    error: result.error || 'Error generant article'
  }
}

/**
 * Calcula la pròxima execució
 */
function calculateNextRun(schedule: BlogAutoSchedule): Date {
  const now = new Date()
  const [hours, minutes] = schedule.publishTime.split(':').map(Number)

  const nextRun = new Date(now)
  nextRun.setHours(hours, minutes, 0, 0)

  // Si ja ha passat l'hora d'avui, començar des de demà
  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1)
  }

  // Buscar el proper dia que estigui a daysOfWeek
  let attempts = 0
  while (!schedule.daysOfWeek.includes(nextRun.getDay()) && attempts < 7) {
    nextRun.setDate(nextRun.getDate() + 1)
    attempts++
  }

  return nextRun
}

/**
 * Notifica als usuaris
 */
async function notifyUsers(userIds: string[], post: { id: string; title: string }, isPublished: boolean) {
  const notifications = userIds.map(userId => ({
    userId,
    type: 'INFO' as const,
    title: isPublished ? 'Nou article publicat automàticament' : 'Nou article generat (esborrany)',
    message: `S'ha ${isPublished ? 'publicat' : 'generat'} l'article "${post.title}"`,
    data: { postId: post.id },
    actionUrl: `/gestio/contingut/blog/${post.id}`
  }))

  await prisma.notification.createMany({
    data: notifications
  })
}

/**
 * Genera slug
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Assegura slug únic
 */
async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug
  let counter = 1

  while (await prisma.blogPost.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

// ============================================
// FUNCIONS DE GESTIÓ
// ============================================

/**
 * Pausar/reprendre programació
 */
export async function toggleSchedulePause(scheduleId: string, userId: string): Promise<BlogAutoSchedule> {
  const schedule = await prisma.blogAutoSchedule.findUnique({
    where: { id: scheduleId }
  })

  if (!schedule) {
    throw new Error('Programació no trobada')
  }

  return prisma.blogAutoSchedule.update({
    where: { id: scheduleId },
    data: {
      isPaused: !schedule.isPaused,
      pausedAt: !schedule.isPaused ? new Date() : null,
      pausedById: !schedule.isPaused ? userId : null
    }
  })
}

/**
 * Executar manualment
 */
export async function runManualGeneration(scheduleId: string): Promise<GenerationResult> {
  const schedule = await prisma.blogAutoSchedule.findUnique({
    where: { id: scheduleId },
    include: {
      fixedTopics: {
        where: { isActive: true },
        include: { category: true }
      },
      dynamicTopics: {
        where: { status: 'PENDING' },
        orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
        include: { category: true }
      },
      defaultCategory: true
    }
  })

  if (!schedule) {
    throw new Error('Programació no trobada')
  }

  const today = new Date().getDay()
  return generateArticleForSchedule(schedule, today)
}

/**
 * Obtenir estadístiques
 */
export async function getScheduleStats(scheduleId: string) {
  const [schedule, recentLogs, successRate] = await Promise.all([
    prisma.blogAutoSchedule.findUnique({
      where: { id: scheduleId },
      include: {
        fixedTopics: true,
        dynamicTopics: { where: { status: 'PENDING' } },
        _count: {
          select: {
            logs: true,
            fixedTopics: true,
            dynamicTopics: true
          }
        }
      }
    }),
    prisma.blogAutoLog.findMany({
      where: { scheduleId },
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: {
        post: { select: { id: true, title: true, status: true, viewCount: true } }
      }
    }),
    prisma.blogAutoLog.groupBy({
      by: ['status'],
      where: { scheduleId },
      _count: true
    })
  ])

  return {
    schedule,
    recentLogs,
    stats: {
      total: schedule?._count.logs || 0,
      success: successRate.find(s => s.status === 'SUCCESS')?._count || 0,
      failed: successRate.find(s => s.status === 'FAILED')?._count || 0,
      skipped: successRate.find(s => s.status === 'SKIPPED')?._count || 0,
      pendingDynamicTopics: schedule?._count.dynamicTopics || 0
    }
  }
}
