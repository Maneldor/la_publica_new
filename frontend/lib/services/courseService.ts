// lib/services/courseService.ts

import { prisma } from '@/lib/prisma'
import {
  CourseType,
  CourseLevel,
  LessonType,
  EnrollmentStatus,
  LessonStatus
} from '@prisma/client'

// ============================================
// TIPUS
// ============================================

export interface CreateCourseInput {
  title: string
  description?: string
  shortDescription?: string
  thumbnail?: string
  type: CourseType
  level: CourseLevel
  categoryId?: string
  tags?: string[]
  instructorId?: string
  instructorName?: string
  instructorBio?: string
  requirements?: string[]
  objectives?: string[]
  targetAudience?: string
  price?: number
  isFree?: boolean
  hasCertificate?: boolean
  aiGenerated?: boolean
  aiPrompt?: string
  createdById: string
}

export interface CreateModuleInput {
  courseId: string
  title: string
  description?: string
  order?: number
  isFree?: boolean
}

export interface CreateLessonInput {
  moduleId: string
  title: string
  description?: string
  type: LessonType
  content?: string
  videoUrl?: string
  videoDuration?: number
  documentUrl?: string
  externalUrl?: string
  estimatedDuration?: number
  order?: number
  isFree?: boolean
  aiGenerated?: boolean
}

export interface CourseFilters {
  type?: CourseType
  level?: CourseLevel
  categoryId?: string
  isPublished?: boolean
  isFeatured?: boolean
  isFree?: boolean
  search?: string
  tags?: string[]
}

// ============================================
// CATEGORIES
// ============================================

export async function getCourseCategories() {
  return prisma.courseCategory.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: { courses: { where: { isActive: true } } }
      }
    }
  })
}

export async function createCourseCategory(data: {
  name: string
  description?: string
  icon?: string
  color?: string
}) {
  const slug = generateSlug(data.name)
  return prisma.courseCategory.create({
    data: { ...data, slug }
  })
}

export async function updateCourseCategory(id: string, data: Partial<{
  name: string
  description: string
  icon: string
  color: string
  order: number
  isActive: boolean
}>) {
  return prisma.courseCategory.update({
    where: { id },
    data
  })
}

export async function deleteCourseCategory(id: string) {
  return prisma.courseCategory.delete({ where: { id } })
}

// ============================================
// CURSOS - GESTIÓ (ADMIN)
// ============================================

export async function getCoursesForAdmin(filters: CourseFilters = {}, page = 1, limit = 20) {
  const skip = (page - 1) * limit
  const where: any = {}

  if (filters.type) where.type = filters.type
  if (filters.level) where.level = filters.level
  if (filters.categoryId) where.categoryId = filters.categoryId
  if (filters.isPublished !== undefined) where.isPublished = filters.isPublished
  if (filters.isFeatured !== undefined) where.isFeatured = filters.isFeatured
  if (filters.isFree !== undefined) where.isFree = filters.isFree
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } }
    ]
  }
  if (filters.tags?.length) {
    where.tags = { hasSome: filters.tags }
  }

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      include: {
        category: true,
        instructor: { select: { id: true, name: true, image: true } },
        createdBy: { select: { id: true, name: true } },
        _count: {
          select: {
            modules: true,
            enrollments: true,
            reviews: true
          }
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' }
      ],
      skip,
      take: limit
    }),
    prisma.course.count({ where })
  ])

  return {
    courses,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  }
}

export async function getCourseStats() {
  const [
    totalCourses,
    publishedCourses,
    draftCourses,
    microCourses,
    basicCourses,
    completeCourses,
    premiumCourses,
    totalEnrollments,
    totalCompletions,
    aiGeneratedCourses
  ] = await Promise.all([
    prisma.course.count(),
    prisma.course.count({ where: { isPublished: true } }),
    prisma.course.count({ where: { isPublished: false } }),
    prisma.course.count({ where: { type: 'MICRO' } }),
    prisma.course.count({ where: { type: 'BASIC' } }),
    prisma.course.count({ where: { type: 'COMPLETE' } }),
    prisma.course.count({ where: { type: 'PREMIUM' } }),
    prisma.courseEnrollment.count(),
    prisma.courseEnrollment.count({ where: { status: 'COMPLETED' } }),
    prisma.course.count({ where: { aiGenerated: true } })
  ])

  return {
    totalCourses,
    publishedCourses,
    draftCourses,
    byType: {
      micro: microCourses,
      basic: basicCourses,
      complete: completeCourses,
      premium: premiumCourses
    },
    totalEnrollments,
    totalCompletions,
    aiGeneratedCourses,
    completionRate: totalEnrollments > 0
      ? Math.round((totalCompletions / totalEnrollments) * 100)
      : 0
  }
}

export async function getCourseById(id: string) {
  return prisma.course.findUnique({
    where: { id },
    include: {
      category: true,
      instructor: { select: { id: true, name: true, image: true, email: true } },
      createdBy: { select: { id: true, name: true } },
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            include: {
              quiz: {
                include: {
                  questions: {
                    orderBy: { order: 'asc' },
                    include: { options: { orderBy: { order: 'asc' } } }
                  }
                }
              },
              resources: { orderBy: { order: 'asc' } }
            }
          }
        }
      },
      _count: {
        select: { enrollments: true, reviews: true }
      }
    }
  })
}

export async function getCourseBySlug(slug: string) {
  return prisma.course.findUnique({
    where: { slug },
    include: {
      category: true,
      instructor: { select: { id: true, name: true, image: true } },
      modules: {
        where: { isPublished: true },
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            where: { isPublished: true },
            orderBy: { order: 'asc' },
            select: {
              id: true,
              title: true,
              slug: true,
              type: true,
              estimatedDuration: true,
              isFree: true
            }
          }
        }
      },
      reviews: {
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: { select: { id: true, name: true, image: true } }
        }
      },
      _count: {
        select: { enrollments: true, reviews: true }
      }
    }
  })
}

export async function createCourse(input: CreateCourseInput) {
  const slug = await ensureUniqueSlug(generateSlug(input.title), 'course')

  return prisma.course.create({
    data: {
      title: input.title,
      slug,
      description: input.description,
      shortDescription: input.shortDescription,
      thumbnail: input.thumbnail,
      type: input.type,
      level: input.level,
      categoryId: input.categoryId,
      tags: input.tags || [],
      instructorId: input.instructorId,
      instructorName: input.instructorName,
      instructorBio: input.instructorBio,
      requirements: input.requirements || [],
      objectives: input.objectives || [],
      targetAudience: input.targetAudience,
      price: input.price || 0,
      isFree: input.isFree ?? true,
      hasCertificate: input.hasCertificate || false,
      aiGenerated: input.aiGenerated || false,
      aiPrompt: input.aiPrompt,
      createdById: input.createdById
    },
    include: {
      category: true
    }
  })
}

export async function updateCourse(id: string, data: Partial<{
  title: string
  description: string
  shortDescription: string
  thumbnail: string
  coverImage: string
  type: CourseType
  level: CourseLevel
  categoryId: string | null
  tags: string[]
  instructorId: string | null
  instructorName: string
  instructorBio: string
  requirements: string[]
  objectives: string[]
  targetAudience: string
  price: number
  isFree: boolean
  isActive: boolean
  isPublished: boolean
  isFeatured: boolean
  hasCertificate: boolean
  certificateTemplate: string
}>) {
  const updateData: any = { ...data }

  // Si es publica, afegir data
  if (data.isPublished === true) {
    const course = await prisma.course.findUnique({ where: { id }, select: { publishedAt: true } })
    if (!course?.publishedAt) {
      updateData.publishedAt = new Date()
    }
  }

  return prisma.course.update({
    where: { id },
    data: updateData,
    include: {
      category: true,
      modules: { include: { lessons: true } }
    }
  })
}

export async function deleteCourse(id: string) {
  return prisma.course.delete({ where: { id } })
}

export async function duplicateCourse(id: string, newTitle: string, createdById: string) {
  const original = await getCourseById(id)
  if (!original) throw new Error('Curs no trobat')

  const slug = await ensureUniqueSlug(generateSlug(newTitle), 'course')

  // Crear nou curs
  const newCourse = await prisma.course.create({
    data: {
      title: newTitle,
      slug,
      description: original.description,
      shortDescription: original.shortDescription,
      thumbnail: original.thumbnail,
      type: original.type,
      level: original.level,
      categoryId: original.categoryId,
      tags: original.tags,
      instructorId: original.instructorId,
      instructorName: original.instructorName,
      instructorBio: original.instructorBio,
      requirements: original.requirements,
      objectives: original.objectives,
      targetAudience: original.targetAudience,
      price: original.price,
      isFree: original.isFree,
      hasCertificate: original.hasCertificate,
      isPublished: false,
      createdById
    }
  })

  // Copiar mòduls i lliçons
  for (const module of original.modules) {
    const newModule = await prisma.courseModule.create({
      data: {
        courseId: newCourse.id,
        title: module.title,
        description: module.description,
        order: module.order,
        isFree: module.isFree,
        estimatedDuration: module.estimatedDuration
      }
    })

    for (const lesson of module.lessons) {
      const newLesson = await prisma.courseLesson.create({
        data: {
          moduleId: newModule.id,
          title: lesson.title,
          slug: lesson.slug,
          description: lesson.description,
          type: lesson.type,
          content: lesson.content,
          videoUrl: lesson.videoUrl,
          videoDuration: lesson.videoDuration,
          documentUrl: lesson.documentUrl,
          externalUrl: lesson.externalUrl,
          estimatedDuration: lesson.estimatedDuration,
          order: lesson.order,
          isFree: lesson.isFree,
          aiGenerated: lesson.aiGenerated
        }
      })

      // Copiar recursos
      for (const resource of lesson.resources) {
        await prisma.lessonResource.create({
          data: {
            lessonId: newLesson.id,
            title: resource.title,
            type: resource.type,
            url: resource.url,
            description: resource.description,
            fileSize: resource.fileSize,
            order: resource.order
          }
        })
      }

      // Copiar quiz si existeix
      if (lesson.quiz) {
        const newQuiz = await prisma.lessonQuiz.create({
          data: {
            lessonId: newLesson.id,
            title: lesson.quiz.title,
            description: lesson.quiz.description,
            passingScore: lesson.quiz.passingScore,
            maxAttempts: lesson.quiz.maxAttempts,
            timeLimit: lesson.quiz.timeLimit,
            shuffleQuestions: lesson.quiz.shuffleQuestions,
            showCorrectAnswers: lesson.quiz.showCorrectAnswers
          }
        })

        for (const question of lesson.quiz.questions) {
          const newQuestion = await prisma.quizQuestion.create({
            data: {
              quizId: newQuiz.id,
              type: question.type,
              question: question.question,
              explanation: question.explanation,
              order: question.order,
              points: question.points
            }
          })

          for (const option of question.options) {
            await prisma.quizOption.create({
              data: {
                questionId: newQuestion.id,
                text: option.text,
                isCorrect: option.isCorrect,
                order: option.order
              }
            })
          }
        }
      }
    }
  }

  // Recalcular estadístiques
  await recalculateCourseStats(newCourse.id)

  return getCourseById(newCourse.id)
}

// ============================================
// MÒDULS
// ============================================

export async function createModule(input: CreateModuleInput) {
  // Obtenir ordre màxim
  const maxOrder = await prisma.courseModule.findFirst({
    where: { courseId: input.courseId },
    orderBy: { order: 'desc' },
    select: { order: true }
  })

  const module = await prisma.courseModule.create({
    data: {
      courseId: input.courseId,
      title: input.title,
      description: input.description,
      order: input.order ?? (maxOrder?.order ?? -1) + 1,
      isFree: input.isFree || false
    }
  })

  await recalculateCourseStats(input.courseId)

  return module
}

export async function updateModule(id: string, data: Partial<{
  title: string
  description: string
  order: number
  isPublished: boolean
  isFree: boolean
}>) {
  return prisma.courseModule.update({
    where: { id },
    data
  })
}

export async function deleteModule(id: string) {
  const module = await prisma.courseModule.findUnique({
    where: { id },
    select: { courseId: true }
  })

  await prisma.courseModule.delete({ where: { id } })

  if (module) {
    await recalculateCourseStats(module.courseId)
  }
}

export async function reorderModules(courseId: string, moduleIds: string[]) {
  const updates = moduleIds.map((id, index) =>
    prisma.courseModule.update({
      where: { id },
      data: { order: index }
    })
  )
  await prisma.$transaction(updates)
}

// ============================================
// LLIÇONS
// ============================================

export async function createLesson(input: CreateLessonInput) {
  const module = await prisma.courseModule.findUnique({
    where: { id: input.moduleId },
    select: { courseId: true }
  })

  if (!module) throw new Error('Mòdul no trobat')

  // Obtenir ordre màxim
  const maxOrder = await prisma.courseLesson.findFirst({
    where: { moduleId: input.moduleId },
    orderBy: { order: 'desc' },
    select: { order: true }
  })

  const slug = await ensureUniqueLessonSlug(generateSlug(input.title), input.moduleId)

  const lesson = await prisma.courseLesson.create({
    data: {
      moduleId: input.moduleId,
      title: input.title,
      slug,
      description: input.description,
      type: input.type,
      content: input.content,
      videoUrl: input.videoUrl,
      videoDuration: input.videoDuration,
      documentUrl: input.documentUrl,
      externalUrl: input.externalUrl,
      estimatedDuration: input.estimatedDuration || 5,
      order: input.order ?? (maxOrder?.order ?? -1) + 1,
      isFree: input.isFree || false,
      aiGenerated: input.aiGenerated || false
    }
  })

  await recalculateCourseStats(module.courseId)

  return lesson
}

export async function getLessonById(id: string) {
  return prisma.courseLesson.findUnique({
    where: { id },
    include: {
      module: {
        include: {
          course: true
        }
      },
      quiz: {
        include: {
          questions: {
            orderBy: { order: 'asc' },
            include: { options: { orderBy: { order: 'asc' } } }
          }
        }
      },
      resources: { orderBy: { order: 'asc' } }
    }
  })
}

export async function updateLesson(id: string, data: Partial<{
  title: string
  description: string
  type: LessonType
  content: string
  videoUrl: string
  videoDuration: number
  documentUrl: string
  externalUrl: string
  estimatedDuration: number
  order: number
  isPublished: boolean
  isFree: boolean
  requiresCompletion: boolean
}>) {
  const lesson = await prisma.courseLesson.update({
    where: { id },
    data
  })

  // Recalcular stats si ha canviat duració
  if (data.estimatedDuration !== undefined) {
    const lessonWithModule = await prisma.courseLesson.findUnique({
      where: { id },
      include: { module: { select: { courseId: true } } }
    })
    if (lessonWithModule) {
      await recalculateCourseStats(lessonWithModule.module.courseId)
    }
  }

  return lesson
}

export async function deleteLesson(id: string) {
  const lesson = await prisma.courseLesson.findUnique({
    where: { id },
    include: { module: { select: { courseId: true } } }
  })

  await prisma.courseLesson.delete({ where: { id } })

  if (lesson) {
    await recalculateCourseStats(lesson.module.courseId)
  }
}

export async function reorderLessons(moduleId: string, lessonIds: string[]) {
  const updates = lessonIds.map((id, index) =>
    prisma.courseLesson.update({
      where: { id },
      data: { order: index }
    })
  )
  await prisma.$transaction(updates)
}

// ============================================
// RECURSOS
// ============================================

export async function createLessonResource(data: {
  lessonId: string
  title: string
  type: 'LINK' | 'PDF' | 'VIDEO' | 'AUDIO' | 'FILE'  // LessonResourceType
  url: string
  description?: string
  fileSize?: number
}) {
  const maxOrder = await prisma.lessonResource.findFirst({
    where: { lessonId: data.lessonId },
    orderBy: { order: 'desc' },
    select: { order: true }
  })

  return prisma.lessonResource.create({
    data: {
      ...data,
      order: (maxOrder?.order ?? -1) + 1
    }
  })
}

export async function deleteLessonResource(id: string) {
  return prisma.lessonResource.delete({ where: { id } })
}

// ============================================
// QUIZ
// ============================================

export async function createQuiz(lessonId: string, data: {
  title?: string
  description?: string
  passingScore?: number
  maxAttempts?: number
  timeLimit?: number
  shuffleQuestions?: boolean
  showCorrectAnswers?: boolean
  questions: {
    type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER'
    question: string
    explanation?: string
    points?: number
    options: { text: string; isCorrect: boolean }[]
  }[]
}) {
  return prisma.lessonQuiz.create({
    data: {
      lessonId,
      title: data.title,
      description: data.description,
      passingScore: data.passingScore || 70,
      maxAttempts: data.maxAttempts || 3,
      timeLimit: data.timeLimit,
      shuffleQuestions: data.shuffleQuestions || false,
      showCorrectAnswers: data.showCorrectAnswers ?? true,
      questions: {
        create: data.questions.map((q, i) => ({
          type: q.type,
          question: q.question,
          explanation: q.explanation,
          points: q.points || 1,
          order: i,
          options: {
            create: q.options.map((o, j) => ({
              text: o.text,
              isCorrect: o.isCorrect,
              order: j
            }))
          }
        }))
      }
    },
    include: {
      questions: {
        include: { options: true },
        orderBy: { order: 'asc' }
      }
    }
  })
}

export async function updateQuiz(id: string, data: Partial<{
  title: string
  description: string
  passingScore: number
  maxAttempts: number
  timeLimit: number | null
  shuffleQuestions: boolean
  showCorrectAnswers: boolean
}>) {
  return prisma.lessonQuiz.update({
    where: { id },
    data
  })
}

export async function deleteQuiz(id: string) {
  return prisma.lessonQuiz.delete({ where: { id } })
}

// ============================================
// INSCRIPCIONS I PROGRÉS
// ============================================

export async function enrollUser(courseId: string, userId: string) {
  // Verificar que no estigui ja inscrit
  const existing = await prisma.courseEnrollment.findUnique({
    where: { courseId_userId: { courseId, userId } }
  })

  if (existing) {
    throw new Error('Ja estàs inscrit a aquest curs')
  }

  const enrollment = await prisma.courseEnrollment.create({
    data: {
      courseId,
      userId,
      enrolledAt: new Date()
    }
  })

  // Actualitzar comptador
  await prisma.course.update({
    where: { id: courseId },
    data: { enrollmentsCount: { increment: 1 } }
  })

  return enrollment
}

export async function getEnrollment(courseId: string, userId: string) {
  return prisma.courseEnrollment.findUnique({
    where: { courseId_userId: { courseId, userId } },
    include: {
      course: {
        include: {
          modules: {
            include: {
              lessons: true
            }
          }
        }
      },
      lessonProgress: true,
      certificate: true
    }
  })
}

export async function getUserEnrollments(userId: string, status?: EnrollmentStatus) {
  return prisma.courseEnrollment.findMany({
    where: {
      userId,
      ...(status && { status })
    },
    include: {
      course: {
        include: {
          category: true,
          instructor: { select: { id: true, name: true, image: true } }
        }
      },
      certificate: true
    },
    orderBy: { enrolledAt: 'desc' }
  })
}

export async function updateLessonProgress(enrollmentId: string, lessonId: string, data: {
  status?: LessonStatus
  progress?: number
  timeSpent?: number
  quizScore?: number
  quizPassed?: boolean
}) {
  const existing = await prisma.lessonProgress.findUnique({
    where: { enrollmentId_lessonId: { enrollmentId, lessonId } }
  })

  const updateData: any = {
    ...data,
    lastAccessAt: new Date()
  }

  if (data.status === 'COMPLETED' && !existing?.completedAt) {
    updateData.completedAt = new Date()
  }

  if (data.status === 'IN_PROGRESS' && !existing?.startedAt) {
    updateData.startedAt = new Date()
  }

  if (data.quizScore !== undefined) {
    updateData.quizAttempts = (existing?.quizAttempts || 0) + 1
  }

  const progress = await prisma.lessonProgress.upsert({
    where: { enrollmentId_lessonId: { enrollmentId, lessonId } },
    create: {
      enrollmentId,
      lessonId,
      ...updateData,
      startedAt: new Date()
    },
    update: updateData
  })

  // Recalcular progrés del curs
  await recalculateEnrollmentProgress(enrollmentId)

  return progress
}

async function recalculateEnrollmentProgress(enrollmentId: string) {
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      course: {
        include: {
          modules: {
            include: {
              lessons: { select: { id: true } }
            }
          }
        }
      },
      lessonProgress: {
        where: { status: 'COMPLETED' }
      }
    }
  })

  if (!enrollment) return

  const totalLessons = enrollment.course.modules.reduce(
    (acc, m) => acc + m.lessons.length, 0
  )
  const completedLessons = enrollment.lessonProgress.length

  const progress = totalLessons > 0
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0

  const updateData: any = {
    progress,
    lessonsCompleted: completedLessons,
    lastAccessAt: new Date()
  }

  // Si s'ha completat
  if (progress >= 100 && enrollment.status !== 'COMPLETED') {
    updateData.status = 'COMPLETED'
    updateData.completedAt = new Date()

    // Actualitzar comptador del curs
    await prisma.course.update({
      where: { id: enrollment.courseId },
      data: { completionsCount: { increment: 1 } }
    })

    // Generar certificat si el curs en té
    const course = enrollment.course
    if (course.hasCertificate) {
      await generateCertificate(enrollment.id)
    }
  }

  // Marcar inici si és el primer progrés
  if (!enrollment.startedAt && completedLessons > 0) {
    updateData.startedAt = new Date()
  }

  await prisma.courseEnrollment.update({
    where: { id: enrollmentId },
    data: updateData
  })
}

// ============================================
// CERTIFICATS
// ============================================

export async function generateCertificate(enrollmentId: string) {
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      course: true,
      user: true,
      lessonProgress: true
    }
  })

  if (!enrollment) throw new Error('Inscripció no trobada')
  if (enrollment.status !== 'COMPLETED') throw new Error('Curs no completat')

  // Calcular nota mitjana (si hi ha quizzes)
  const quizScores = enrollment.lessonProgress
    .filter(p => p.quizScore !== null)
    .map(p => p.quizScore!)

  const grade = quizScores.length > 0
    ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length
    : null

  // Calcular hores
  const hoursCompleted = Math.round(enrollment.course.estimatedDuration / 60)

  // Generar número de certificat únic
  const certificateNumber = `CERT-${enrollment.courseId.slice(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`

  const certificate = await prisma.courseCertificate.create({
    data: {
      courseId: enrollment.courseId,
      userId: enrollment.userId,
      certificateNumber,
      title: enrollment.course.title,
      grade,
      hoursCompleted,
      completionDate: new Date()
    }
  })

  // Vincular a la inscripció
  await prisma.courseEnrollment.update({
    where: { id: enrollmentId },
    data: { certificateId: certificate.id }
  })

  return certificate
}

export async function getUserCertificates(userId: string) {
  return prisma.courseCertificate.findMany({
    where: { userId, isValid: true },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          thumbnail: true,
          type: true,
          level: true
        }
      }
    },
    orderBy: { completionDate: 'desc' }
  })
}

// ============================================
// REVIEWS
// ============================================

export async function createReview(data: {
  courseId: string
  userId: string
  rating: number
  title?: string
  comment?: string
}) {
  // Verificar que l'usuari ha completat el curs
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: { courseId_userId: { courseId: data.courseId, userId: data.userId } }
  })

  const review = await prisma.courseReview.create({
    data: {
      ...data,
      isVerified: enrollment?.status === 'COMPLETED'
    }
  })

  // Actualitzar mitjana
  await recalculateCourseRating(data.courseId)

  return review
}

async function recalculateCourseRating(courseId: string) {
  const result = await prisma.courseReview.aggregate({
    where: { courseId, isPublished: true },
    _avg: { rating: true },
    _count: { rating: true }
  })

  await prisma.course.update({
    where: { id: courseId },
    data: {
      averageRating: result._avg.rating || 0,
      ratingsCount: result._count.rating
    }
  })
}

// ============================================
// UTILS
// ============================================

async function recalculateCourseStats(courseId: string) {
  const modules = await prisma.courseModule.findMany({
    where: { courseId },
    include: {
      lessons: {
        select: { estimatedDuration: true }
      }
    }
  })

  const modulesCount = modules.length
  const lessonsCount = modules.reduce((acc, m) => acc + m.lessons.length, 0)
  const estimatedDuration = modules.reduce(
    (acc, m) => acc + m.lessons.reduce((a, l) => a + (l.estimatedDuration || 0), 0),
    0
  )

  // Actualitzar duració dels mòduls
  for (const module of modules) {
    const moduleDuration = module.lessons.reduce((a, l) => a + (l.estimatedDuration || 0), 0)
    await prisma.courseModule.update({
      where: { id: module.id },
      data: { estimatedDuration: moduleDuration }
    })
  }

  await prisma.course.update({
    where: { id: courseId },
    data: { modulesCount, lessonsCount, estimatedDuration }
  })
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function ensureUniqueSlug(baseSlug: string, type: string): Promise<string> {
  let slug = baseSlug
  let counter = 1

  while (await prisma.course.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

async function ensureUniqueLessonSlug(baseSlug: string, moduleId: string): Promise<string> {
  let slug = baseSlug
  let counter = 1

  while (await prisma.courseLesson.findFirst({ where: { slug, moduleId } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

// ============================================
// CURSOS PÚBLICS (Frontend)
// ============================================

export async function getPublishedCourses(filters: CourseFilters = {}, page = 1, limit = 12) {
  const skip = (page - 1) * limit
  const where: any = {
    isPublished: true,
    isActive: true
  }

  if (filters.type) where.type = filters.type
  if (filters.level) where.level = filters.level
  if (filters.categoryId) where.categoryId = filters.categoryId
  if (filters.isFree !== undefined) where.isFree = filters.isFree
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { tags: { hasSome: [filters.search] } }
    ]
  }

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      include: {
        category: true,
        instructor: { select: { id: true, name: true, image: true } },
        _count: {
          select: { enrollments: true, reviews: true, modules: true }
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { enrollmentsCount: 'desc' },
        { createdAt: 'desc' }
      ],
      skip,
      take: limit
    }),
    prisma.course.count({ where })
  ])

  return {
    courses,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  }
}

export async function getFeaturedCourses(limit = 6) {
  return prisma.course.findMany({
    where: {
      isPublished: true,
      isActive: true,
      isFeatured: true
    },
    include: {
      category: true,
      instructor: { select: { id: true, name: true, image: true } },
      _count: {
        select: { enrollments: true }
      }
    },
    orderBy: { enrollmentsCount: 'desc' },
    take: limit
  })
}
