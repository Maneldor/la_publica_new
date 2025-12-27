import { prisma } from '@/lib/prisma'

// ============================================
// CATEGORIES
// ============================================

export async function getCategories(includeInactive = false) {
  return prisma.usefulLinkCategory.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: { links: { where: { isActive: true } } }
      }
    }
  })
}

export async function getCategoryById(id: string) {
  return prisma.usefulLinkCategory.findUnique({
    where: { id },
    include: {
      _count: {
        select: { links: true }
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
  const maxOrder = await prisma.usefulLinkCategory.findFirst({
    orderBy: { order: 'desc' },
    select: { order: true }
  })

  return prisma.usefulLinkCategory.create({
    data: {
      ...data,
      slug,
      order: (maxOrder?.order ?? -1) + 1
    }
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
  return prisma.usefulLinkCategory.update({
    where: { id },
    data
  })
}

export async function deleteCategory(id: string) {
  // Primer eliminar els enllaços
  await prisma.usefulLink.deleteMany({
    where: { categoryId: id }
  })

  return prisma.usefulLinkCategory.delete({
    where: { id }
  })
}

// ============================================
// ENLLAÇOS
// ============================================

export async function getLinks(filters: {
  categoryId?: string
  isActive?: boolean
  isHighlighted?: boolean
  search?: string
} = {}) {
  const where: any = {}

  if (filters.categoryId) where.categoryId = filters.categoryId
  if (filters.isActive !== undefined) where.isActive = filters.isActive
  if (filters.isHighlighted !== undefined) where.isHighlighted = filters.isHighlighted
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { slogan: { contains: filters.search, mode: 'insensitive' } }
    ]
  }

  return prisma.usefulLink.findMany({
    where,
    include: {
      category: true
    },
    orderBy: [
      { isHighlighted: 'desc' },
      { order: 'asc' },
      { name: 'asc' }
    ]
  })
}

export async function getLinksGroupedByCategory() {
  const categories = await prisma.usefulLinkCategory.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    include: {
      links: {
        where: { isActive: true },
        orderBy: [
          { isHighlighted: 'desc' },
          { order: 'asc' }
        ]
      }
    }
  })

  return categories.filter(cat => cat.links.length > 0)
}

export async function getLinkById(id: string) {
  return prisma.usefulLink.findUnique({
    where: { id },
    include: { category: true }
  })
}

export async function createLink(data: {
  name: string
  slogan?: string
  description?: string
  website: string
  phone?: string
  email?: string
  address?: string
  logo?: string
  categoryId: string
  isHighlighted?: boolean
}) {
  const slug = await ensureUniqueSlug(generateSlug(data.name))
  const maxOrder = await prisma.usefulLink.findFirst({
    where: { categoryId: data.categoryId },
    orderBy: { order: 'desc' },
    select: { order: true }
  })

  return prisma.usefulLink.create({
    data: {
      ...data,
      slug,
      order: (maxOrder?.order ?? -1) + 1
    },
    include: { category: true }
  })
}

export async function updateLink(id: string, data: Partial<{
  name: string
  slogan: string
  description: string
  website: string
  phone: string
  email: string
  address: string
  logo: string
  categoryId: string
  order: number
  isActive: boolean
  isHighlighted: boolean
}>) {
  return prisma.usefulLink.update({
    where: { id },
    data,
    include: { category: true }
  })
}

export async function deleteLink(id: string) {
  return prisma.usefulLink.delete({
    where: { id }
  })
}

export async function incrementVisits(id: string) {
  return prisma.usefulLink.update({
    where: { id },
    data: { totalVisits: { increment: 1 } }
  })
}

export async function getStats() {
  const [totalLinks, totalCategories, highlightedLinks, totalVisits] = await Promise.all([
    prisma.usefulLink.count({ where: { isActive: true } }),
    prisma.usefulLinkCategory.count({ where: { isActive: true } }),
    prisma.usefulLink.count({ where: { isActive: true, isHighlighted: true } }),
    prisma.usefulLink.aggregate({
      _sum: { totalVisits: true }
    })
  ])

  return {
    totalLinks,
    totalCategories,
    highlightedLinks,
    totalVisits: totalVisits._sum.totalVisits || 0
  }
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

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug
  let counter = 1

  while (await prisma.usefulLink.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}
