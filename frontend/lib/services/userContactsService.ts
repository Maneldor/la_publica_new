import { prisma } from '@/lib/prisma'

// ============================================
// CATEGORIES
// ============================================

export async function getContactCategories(userId: string) {
  return prisma.userContactCategory.findMany({
    where: { userId },
    orderBy: { order: 'asc' },
    include: { _count: { select: { contacts: true } } }
  })
}

export async function createContactCategory(userId: string, data: {
  name: string
  icon?: string
  color?: string
}) {
  const maxOrder = await prisma.userContactCategory.findFirst({
    where: { userId },
    orderBy: { order: 'desc' },
    select: { order: true }
  })

  return prisma.userContactCategory.create({
    data: { userId, ...data, order: (maxOrder?.order ?? -1) + 1 }
  })
}

export async function updateContactCategory(userId: string, categoryId: string, data: {
  name?: string
  icon?: string
  color?: string
}) {
  return prisma.userContactCategory.update({
    where: { id: categoryId, userId },
    data
  })
}

export async function deleteContactCategory(userId: string, categoryId: string) {
  await prisma.userContact.updateMany({
    where: { userId, categoryId },
    data: { categoryId: null }
  })
  return prisma.userContactCategory.delete({ where: { id: categoryId, userId } })
}

// ============================================
// CONTACTES
// ============================================

export async function getContacts(userId: string, filters: {
  search?: string
  categoryId?: string
  isFavorite?: boolean
  limit?: number
} = {}) {
  const where: any = { userId }

  if (filters.categoryId) where.categoryId = filters.categoryId
  if (filters.isFavorite !== undefined) where.isFavorite = filters.isFavorite

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
      { organization: { contains: filters.search, mode: 'insensitive' } },
      { department: { contains: filters.search, mode: 'insensitive' } },
      { position: { contains: filters.search, mode: 'insensitive' } }
    ]
  }

  return prisma.userContact.findMany({
    where,
    include: { category: true },
    orderBy: [{ isFavorite: 'desc' }, { name: 'asc' }],
    take: filters.limit
  })
}

export async function getContactById(userId: string, contactId: string) {
  return prisma.userContact.findFirst({
    where: { id: contactId, userId },
    include: { category: true }
  })
}

export async function createContact(userId: string, data: {
  name: string
  position?: string
  department?: string
  organization?: string
  email?: string
  phone?: string
  mobile?: string
  extension?: string
  address?: string
  city?: string
  building?: string
  floor?: string
  linkedin?: string
  website?: string
  categoryId?: string
  notes?: string
  tags?: string[]
  isFavorite?: boolean
  color?: string
}) {
  return prisma.userContact.create({
    data: { userId, ...data },
    include: { category: true }
  })
}

export async function updateContact(userId: string, contactId: string, data: any) {
  return prisma.userContact.update({
    where: { id: contactId, userId },
    data,
    include: { category: true }
  })
}

export async function deleteContact(userId: string, contactId: string) {
  return prisma.userContact.delete({ where: { id: contactId, userId } })
}

export async function toggleFavorite(userId: string, contactId: string) {
  const contact = await prisma.userContact.findFirst({
    where: { id: contactId, userId },
    select: { isFavorite: true }
  })
  if (!contact) throw new Error('Contacte no trobat')

  return prisma.userContact.update({
    where: { id: contactId },
    data: { isFavorite: !contact.isFavorite },
    include: { category: true }
  })
}

export async function getContactsStats(userId: string) {
  const [total, favorites, categories] = await Promise.all([
    prisma.userContact.count({ where: { userId } }),
    prisma.userContact.count({ where: { userId, isFavorite: true } }),
    prisma.userContactCategory.count({ where: { userId } })
  ])
  return { total, favorites, categories }
}

export async function getRecentContacts(userId: string, limit = 5) {
  return prisma.userContact.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { updatedAt: 'desc' },
    take: limit
  })
}

export async function getFavoriteContacts(userId: string, limit = 10) {
  return prisma.userContact.findMany({
    where: { userId, isFavorite: true },
    include: { category: true },
    orderBy: { name: 'asc' },
    take: limit
  })
}
