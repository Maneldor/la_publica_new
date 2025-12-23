/**
 * Sistema d'Expiració i Renovació d'Anuncis
 *
 * Flux:
 * - Dia 0: Anunci publicat (expiresAt = +60 dies)
 * - Dia 53: Notificació "Expira en 7 dies"
 * - Dia 59: Notificació "Expira DEMÀ"
 * - Dia 60: Status → "EXPIRED" (deletionScheduledAt = +7 dies)
 * - Dia 66: Notificació "S'elimina DEMÀ"
 * - Dia 67: Eliminació definitiva
 */

import { prismaClient } from '@/lib/prisma'

// Constants de configuració
export const AD_LIFETIME_DAYS = 60
export const WARNING_7_DAYS = 7
export const WARNING_24_HOURS = 1
export const GRACE_PERIOD_DAYS = 7

export interface ExpirationResult {
  processed: number
  expired: number
  deleted: number
  autoRenewed: number
  notified7d: number
  notified24h: number
  notifiedDeletion: number
  errors: string[]
}

/**
 * Calcula la data d'expiració per un anunci nou
 */
export function calculateExpirationDate(fromDate: Date = new Date()): Date {
  const expirationDate = new Date(fromDate)
  expirationDate.setDate(expirationDate.getDate() + AD_LIFETIME_DAYS)
  return expirationDate
}

/**
 * Afegeix dies a una data
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Processa totes les expiracions i notificacions
 * Cridat pel cron job diari
 */
export async function processAdExpirations(): Promise<ExpirationResult> {
  const result: ExpirationResult = {
    processed: 0,
    expired: 0,
    deleted: 0,
    autoRenewed: 0,
    notified7d: 0,
    notified24h: 0,
    notifiedDeletion: 0,
    errors: []
  }

  const now = new Date()

  try {
    // 1. ELIMINACIÓ DEFINITIVA: Anuncis amb deletionScheduledAt passat
    const toDelete = await prismaClient.anuncio.findMany({
      where: {
        status: 'EXPIRED',
        deletionScheduledAt: { lte: now },
        deletedAt: null
      },
      select: { id: true, title: true, authorId: true }
    })

    for (const anuncio of toDelete) {
      try {
        await prismaClient.$transaction(async (tx) => {
          // Eliminar missatges de converses associades
          await tx.message.deleteMany({
            where: { conversation: { anuncioId: anuncio.id } }
          })
          // Eliminar converses associades
          await tx.conversation.deleteMany({
            where: { anuncioId: anuncio.id }
          })
          // Eliminar favorits
          await tx.anuncioFavorite.deleteMany({
            where: { anuncioId: anuncio.id }
          })
          // Eliminar alertes
          await tx.adAlert.deleteMany({
            where: { anuncioId: anuncio.id }
          })
          // Marcar l'anunci com eliminat (soft delete)
          await tx.anuncio.update({
            where: { id: anuncio.id },
            data: { deletedAt: now }
          })

          // Notificar eliminació completada
          await tx.notification.create({
            data: {
              userId: anuncio.authorId,
              type: 'INFO',
              title: 'Anunci eliminat',
              message: `El teu anunci "${anuncio.title}" ha estat eliminat definitivament després del període de gràcia.`,
              actionUrl: '/dashboard/anuncis',
              isRead: false
            }
          })
        })
        result.deleted++
      } catch (error) {
        result.errors.push(`Error eliminant anunci ${anuncio.id}: ${error}`)
      }
    }

    // 2. AUTO-RENOVAR: Anuncis amb autoRenew activat que han expirat
    const toAutoRenew = await prismaClient.anuncio.findMany({
      where: {
        status: 'PUBLISHED',
        expiresAt: { lte: now },
        autoRenew: true,
        deletedAt: null
      },
      select: { id: true, title: true, authorId: true, renewalCount: true }
    })

    for (const anuncio of toAutoRenew) {
      try {
        const newExpirationDate = calculateExpirationDate(now)

        await prismaClient.$transaction(async (tx) => {
          await tx.anuncio.update({
            where: { id: anuncio.id },
            data: {
              expiresAt: newExpirationDate,
              renewalCount: { increment: 1 },
              lastRenewalAt: now,
              expirationWarning7d: false,
              expirationWarning24h: false
            }
          })

          await tx.notification.create({
            data: {
              userId: anuncio.authorId,
              type: 'INFO',
              title: 'Anunci renovat automàticament',
              message: `El teu anunci "${anuncio.title}" s'ha renovat automàticament per ${AD_LIFETIME_DAYS} dies més.`,
              actionUrl: '/dashboard/anuncis',
              isRead: false
            }
          })
        })
        result.autoRenewed++
      } catch (error) {
        result.errors.push(`Error auto-renovant anunci ${anuncio.id}: ${error}`)
      }
    }

    // 3. EXPIRAR: Anuncis amb expiresAt passat que encara estan PUBLISHED (sense autoRenew)
    const toExpire = await prismaClient.anuncio.findMany({
      where: {
        status: 'PUBLISHED',
        expiresAt: { lte: now },
        autoRenew: false,
        deletedAt: null
      },
      select: { id: true, title: true, authorId: true }
    })

    for (const anuncio of toExpire) {
      try {
        const deletionDate = addDays(now, GRACE_PERIOD_DAYS)

        await prismaClient.$transaction(async (tx) => {
          await tx.anuncio.update({
            where: { id: anuncio.id },
            data: {
              status: 'EXPIRED',
              expiredAt: now,
              deletionScheduledAt: deletionDate,
              deletionWarning: false
            }
          })

          await tx.notification.create({
            data: {
              userId: anuncio.authorId,
              type: 'WARNING',
              title: 'Anunci expirat',
              message: `El teu anunci "${anuncio.title}" ha expirat. Tens ${GRACE_PERIOD_DAYS} dies per renovar-lo abans que s'elimini definitivament.`,
              actionUrl: '/dashboard/anuncis',
              isRead: false
            }
          })
        })
        result.expired++
      } catch (error) {
        result.errors.push(`Error expirant anunci ${anuncio.id}: ${error}`)
      }
    }

    // 4. AVÍS 7 DIES: Anuncis que expiren en 7 dies o menys
    const warning7dDate = addDays(now, WARNING_7_DAYS)
    const warning24hDate = addDays(now, WARNING_24_HOURS)

    const toNotify7d = await prismaClient.anuncio.findMany({
      where: {
        status: 'PUBLISHED',
        expiresAt: {
          lte: warning7dDate,
          gt: warning24hDate
        },
        expirationWarning7d: false,
        deletedAt: null
      },
      select: { id: true, title: true, authorId: true, expiresAt: true }
    })

    for (const anuncio of toNotify7d) {
      try {
        await prismaClient.$transaction(async (tx) => {
          await tx.anuncio.update({
            where: { id: anuncio.id },
            data: { expirationWarning7d: true }
          })

          await tx.notification.create({
            data: {
              userId: anuncio.authorId,
              type: 'INFO',
              title: 'El teu anunci expira en 7 dies',
              message: `El teu anunci "${anuncio.title}" expirarà aviat. Renova'l per mantenir-lo actiu.`,
              actionUrl: '/dashboard/anuncis',
              isRead: false
            }
          })
        })
        result.notified7d++
      } catch (error) {
        result.errors.push(`Error notificant 7d anunci ${anuncio.id}: ${error}`)
      }
    }

    // 5. AVÍS 24 HORES: Anuncis que expiren demà
    const toNotify24h = await prismaClient.anuncio.findMany({
      where: {
        status: 'PUBLISHED',
        expiresAt: { lte: warning24hDate },
        expirationWarning24h: false,
        deletedAt: null
      },
      select: { id: true, title: true, authorId: true, expiresAt: true }
    })

    for (const anuncio of toNotify24h) {
      try {
        await prismaClient.$transaction(async (tx) => {
          await tx.anuncio.update({
            where: { id: anuncio.id },
            data: { expirationWarning24h: true }
          })

          await tx.notification.create({
            data: {
              userId: anuncio.authorId,
              type: 'WARNING',
              title: "El teu anunci expira DEMÀ",
              message: `El teu anunci "${anuncio.title}" expirarà demà! Renova'l ara per evitar que deixi de ser visible.`,
              actionUrl: '/dashboard/anuncis',
              isRead: false
            }
          })
        })
        result.notified24h++
      } catch (error) {
        result.errors.push(`Error notificant 24h anunci ${anuncio.id}: ${error}`)
      }
    }

    // 6. AVÍS ELIMINACIÓ: Anuncis expirats que s'eliminaran en 24h
    const deletionWarningDate = addDays(now, WARNING_24_HOURS)
    const toNotifyDeletion = await prismaClient.anuncio.findMany({
      where: {
        status: 'EXPIRED',
        deletionScheduledAt: { lte: deletionWarningDate },
        deletionWarning: false,
        deletedAt: null
      },
      select: { id: true, title: true, authorId: true, deletionScheduledAt: true }
    })

    for (const anuncio of toNotifyDeletion) {
      try {
        await prismaClient.$transaction(async (tx) => {
          await tx.anuncio.update({
            where: { id: anuncio.id },
            data: { deletionWarning: true }
          })

          await tx.notification.create({
            data: {
              userId: anuncio.authorId,
              type: 'ALERT',
              title: "Últim avís: Anunci s'eliminarà DEMÀ",
              message: `El teu anunci "${anuncio.title}" s'eliminarà definitivament demà. Aquesta és la teva última oportunitat per renovar-lo!`,
              actionUrl: '/dashboard/anuncis',
              isRead: false
            }
          })
        })
        result.notifiedDeletion++
      } catch (error) {
        result.errors.push(`Error notificant eliminació anunci ${anuncio.id}: ${error}`)
      }
    }

    result.processed = toDelete.length + toExpire.length + toAutoRenew.length +
                       toNotify7d.length + toNotify24h.length + toNotifyDeletion.length

  } catch (error) {
    result.errors.push(`Error general: ${error}`)
  }

  return result
}

/**
 * Renova un anunci (manual o des del botó)
 */
export async function renewAd(
  anuncioId: string,
  userId: string
): Promise<{ success: boolean; message: string; expiresAt?: Date }> {
  const anuncio = await prismaClient.anuncio.findUnique({
    where: { id: anuncioId },
    select: {
      id: true,
      authorId: true,
      status: true,
      title: true,
      renewalCount: true,
      deletedAt: true
    }
  })

  if (!anuncio) {
    return { success: false, message: 'Anunci no trobat' }
  }

  if (anuncio.deletedAt) {
    return { success: false, message: 'Aquest anunci ha estat eliminat' }
  }

  if (anuncio.authorId !== userId) {
    return { success: false, message: 'No tens permís per renovar aquest anunci' }
  }

  if (!['PUBLISHED', 'EXPIRED'].includes(anuncio.status)) {
    return { success: false, message: 'Només es poden renovar anuncis publicats o expirats' }
  }

  const now = new Date()
  const newExpirationDate = calculateExpirationDate(now)

  await prismaClient.$transaction(async (tx) => {
    await tx.anuncio.update({
      where: { id: anuncioId },
      data: {
        status: 'PUBLISHED',
        expiresAt: newExpirationDate,
        expiredAt: null,
        deletionScheduledAt: null,
        renewalCount: { increment: 1 },
        lastRenewalAt: now,
        expirationWarning7d: false,
        expirationWarning24h: false,
        deletionWarning: false
      }
    })

    await tx.notification.create({
      data: {
        userId: userId,
        type: 'INFO',
        title: 'Anunci renovat',
        message: `El teu anunci "${anuncio.title}" s'ha renovat correctament per ${AD_LIFETIME_DAYS} dies més.`,
        actionUrl: '/dashboard/anuncis',
        isRead: false
      }
    })
  })

  return {
    success: true,
    message: `Anunci renovat fins ${newExpirationDate.toLocaleDateString('ca-ES')}`,
    expiresAt: newExpirationDate
  }
}

/**
 * Activa/desactiva auto-renovació
 */
export async function toggleAutoRenew(
  anuncioId: string,
  userId: string,
  enabled: boolean
): Promise<{ success: boolean; message: string }> {
  const anuncio = await prismaClient.anuncio.findUnique({
    where: { id: anuncioId },
    select: { authorId: true, status: true, deletedAt: true }
  })

  if (!anuncio) {
    return { success: false, message: 'Anunci no trobat' }
  }

  if (anuncio.deletedAt) {
    return { success: false, message: 'Aquest anunci ha estat eliminat' }
  }

  if (anuncio.authorId !== userId) {
    return { success: false, message: 'No tens permís per modificar aquest anunci' }
  }

  await prismaClient.anuncio.update({
    where: { id: anuncioId },
    data: { autoRenew: enabled }
  })

  return {
    success: true,
    message: enabled ? 'Auto-renovació activada' : 'Auto-renovació desactivada'
  }
}

/**
 * Obté estadístiques d'expiració
 */
export async function getExpirationStats() {
  const now = new Date()
  const in7Days = addDays(now, 7)

  const [
    totalPublished,
    expiringIn7Days,
    expired,
    withAutoRenew
  ] = await Promise.all([
    prismaClient.anuncio.count({
      where: { status: 'PUBLISHED', deletedAt: null }
    }),
    prismaClient.anuncio.count({
      where: {
        status: 'PUBLISHED',
        expiresAt: { lte: in7Days },
        deletedAt: null
      }
    }),
    prismaClient.anuncio.count({
      where: { status: 'EXPIRED', deletedAt: null }
    }),
    prismaClient.anuncio.count({
      where: { autoRenew: true, deletedAt: null }
    })
  ])

  return {
    totalPublished,
    expiringIn7Days,
    expired,
    withAutoRenew
  }
}
