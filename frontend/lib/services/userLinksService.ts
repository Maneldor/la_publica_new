import { prisma } from '@/lib/prisma'

// ============================================
// CARPETES D'USUARI
// ============================================

export async function getUserFolders(userId: string) {
  return prisma.userLinkFolder.findMany({
    where: { userId },
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: {
          favoriteLinks: true,
          customLinks: true
        }
      }
    }
  })
}

export async function createFolder(userId: string, data: {
  name: string
  icon?: string
  color?: string
}) {
  const maxOrder = await prisma.userLinkFolder.findFirst({
    where: { userId },
    orderBy: { order: 'desc' },
    select: { order: true }
  })

  return prisma.userLinkFolder.create({
    data: {
      ...data,
      userId,
      order: (maxOrder?.order ?? -1) + 1
    }
  })
}

export async function updateFolder(userId: string, folderId: string, data: Partial<{
  name: string
  icon: string
  color: string
  order: number
}>) {
  // Verificar que la carpeta pertany a l'usuari
  const folder = await prisma.userLinkFolder.findFirst({
    where: { id: folderId, userId }
  })

  if (!folder) {
    throw new Error('Carpeta no trobada')
  }

  return prisma.userLinkFolder.update({
    where: { id: folderId },
    data
  })
}

export async function deleteFolder(userId: string, folderId: string) {
  // Verificar que la carpeta pertany a l'usuari
  const folder = await prisma.userLinkFolder.findFirst({
    where: { id: folderId, userId }
  })

  if (!folder) {
    throw new Error('Carpeta no trobada')
  }

  // Treure els favorits i enllaços de la carpeta abans d'eliminar-la
  await prisma.userFavoriteLink.updateMany({
    where: { userId, folderId },
    data: { folderId: null }
  })

  await prisma.userCustomLink.updateMany({
    where: { userId, folderId },
    data: { folderId: null }
  })

  return prisma.userLinkFolder.delete({
    where: { id: folderId }
  })
}

// ============================================
// FAVORITS
// ============================================

export async function getUserFavorites(userId: string, folderId?: string | null) {
  const where: any = { userId }

  if (folderId !== undefined) {
    where.folderId = folderId
  }

  return prisma.userFavoriteLink.findMany({
    where,
    orderBy: { order: 'asc' },
    include: {
      link: {
        include: {
          category: true
        }
      },
      folder: true
    }
  })
}

export async function addFavorite(userId: string, linkId: string, data?: {
  customName?: string
  notes?: string
  folderId?: string
}) {
  // Verificar que l'enllaç existeix
  const link = await prisma.usefulLink.findUnique({
    where: { id: linkId }
  })

  if (!link) {
    throw new Error('Enllaç no trobat')
  }

  // Verificar que no és ja favorit
  const existing = await prisma.userFavoriteLink.findUnique({
    where: {
      userId_linkId: { userId, linkId }
    }
  })

  if (existing) {
    throw new Error('Ja és favorit')
  }

  const maxOrder = await prisma.userFavoriteLink.findFirst({
    where: { userId },
    orderBy: { order: 'desc' },
    select: { order: true }
  })

  return prisma.userFavoriteLink.create({
    data: {
      userId,
      linkId,
      customName: data?.customName,
      notes: data?.notes,
      folderId: data?.folderId,
      order: (maxOrder?.order ?? -1) + 1
    },
    include: {
      link: {
        include: {
          category: true
        }
      }
    }
  })
}

export async function removeFavorite(userId: string, linkId: string) {
  return prisma.userFavoriteLink.delete({
    where: {
      userId_linkId: { userId, linkId }
    }
  })
}

export async function updateFavorite(userId: string, linkId: string, data: Partial<{
  customName: string
  notes: string
  folderId: string | null
  order: number
}>) {
  return prisma.userFavoriteLink.update({
    where: {
      userId_linkId: { userId, linkId }
    },
    data,
    include: {
      link: {
        include: {
          category: true
        }
      }
    }
  })
}

export async function isLinkFavorited(userId: string, linkId: string) {
  const favorite = await prisma.userFavoriteLink.findUnique({
    where: {
      userId_linkId: { userId, linkId }
    }
  })
  return !!favorite
}

export async function getFavoriteIds(userId: string) {
  const favorites = await prisma.userFavoriteLink.findMany({
    where: { userId },
    select: { linkId: true }
  })
  return favorites.map(f => f.linkId)
}

// ============================================
// ENLLAÇOS PERSONALS
// ============================================

export async function getUserCustomLinks(userId: string, folderId?: string | null) {
  const where: any = { userId, isActive: true }

  if (folderId !== undefined) {
    where.folderId = folderId
  }

  return prisma.userCustomLink.findMany({
    where,
    orderBy: { order: 'asc' },
    include: {
      folder: true
    }
  })
}

export async function createCustomLink(userId: string, data: {
  name: string
  url: string
  description?: string
  icon?: string
  color?: string
  folderId?: string
}) {
  const maxOrder = await prisma.userCustomLink.findFirst({
    where: { userId },
    orderBy: { order: 'desc' },
    select: { order: true }
  })

  return prisma.userCustomLink.create({
    data: {
      ...data,
      userId,
      order: (maxOrder?.order ?? -1) + 1
    }
  })
}

export async function updateCustomLink(userId: string, linkId: string, data: Partial<{
  name: string
  url: string
  description: string
  icon: string
  color: string
  folderId: string | null
  order: number
  isActive: boolean
}>) {
  // Verificar que l'enllaç pertany a l'usuari
  const link = await prisma.userCustomLink.findFirst({
    where: { id: linkId, userId }
  })

  if (!link) {
    throw new Error('Enllaç no trobat')
  }

  return prisma.userCustomLink.update({
    where: { id: linkId },
    data
  })
}

export async function deleteCustomLink(userId: string, linkId: string) {
  // Verificar que l'enllaç pertany a l'usuari
  const link = await prisma.userCustomLink.findFirst({
    where: { id: linkId, userId }
  })

  if (!link) {
    throw new Error('Enllaç no trobat')
  }

  return prisma.userCustomLink.delete({
    where: { id: linkId }
  })
}

export async function incrementCustomLinkVisits(userId: string, linkId: string) {
  const link = await prisma.userCustomLink.findFirst({
    where: { id: linkId, userId }
  })

  if (!link) {
    throw new Error('Enllaç no trobat')
  }

  return prisma.userCustomLink.update({
    where: { id: linkId },
    data: {
      visitCount: { increment: 1 },
      lastVisitAt: new Date()
    }
  })
}

// ============================================
// ESTADÍSTIQUES
// ============================================

export async function getUserLinksStats(userId: string) {
  const [totalFavorites, totalCustomLinks, totalFolders] = await Promise.all([
    prisma.userFavoriteLink.count({ where: { userId } }),
    prisma.userCustomLink.count({ where: { userId, isActive: true } }),
    prisma.userLinkFolder.count({ where: { userId } })
  ])

  return {
    totalFavorites,
    totalCustomLinks,
    totalFolders,
    totalLinks: totalFavorites + totalCustomLinks
  }
}

// ============================================
// TOT EN UN (per la pàgina principal)
// ============================================

export async function getAllUserLinks(userId: string) {
  const [favorites, customLinks, folders] = await Promise.all([
    getUserFavorites(userId),
    getUserCustomLinks(userId),
    getUserFolders(userId)
  ])

  return {
    favorites,
    customLinks,
    folders
  }
}

// ============================================
// REORDENAR
// ============================================

export async function reorderFavorites(userId: string, updates: Array<{ linkId: string; order: number }>) {
  const operations = updates.map(({ linkId, order }) =>
    prisma.userFavoriteLink.update({
      where: { userId_linkId: { userId, linkId } },
      data: { order }
    })
  )

  return prisma.$transaction(operations)
}

export async function reorderCustomLinks(userId: string, updates: Array<{ id: string; order: number }>) {
  const operations = updates.map(({ id, order }) =>
    prisma.userCustomLink.updateMany({
      where: { id, userId },
      data: { order }
    })
  )

  return prisma.$transaction(operations)
}

export async function reorderFolders(userId: string, updates: Array<{ id: string; order: number }>) {
  const operations = updates.map(({ id, order }) =>
    prisma.userLinkFolder.updateMany({
      where: { id, userId },
      data: { order }
    })
  )

  return prisma.$transaction(operations)
}
