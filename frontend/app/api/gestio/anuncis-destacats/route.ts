import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'
import {
  getAllFeaturedAds,
  getFeaturedAdsStats,
  createFeaturedAd,
  PERIOD_CONFIG
} from '@/lib/services/featuredAdsService'
import { FeaturedAdLevel, FeaturedAdSource } from '@prisma/client'

const ALLOWED_ROLES = ['ADMIN', 'SUPER_ADMIN', 'CRM_MANAGER', 'CRM_VENDES', 'CRM_CONTINGUT']

async function checkAuth() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return { error: 'No autoritzat', status: 401 }
  }

  const user = await prismaClient.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true }
  })

  if (!user || !ALLOWED_ROLES.includes(user.role)) {
    return { error: 'Accés denegat', status: 403 }
  }

  return { userId: user.id }
}

/**
 * GET /api/gestio/anuncis-destacats
 * Obtenir tots els anuncis destacats amb filtres
 */
export async function GET(request: NextRequest) {
  const auth = await checkAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as 'active' | 'scheduled' | 'expired' | 'all' | null
    const level = searchParams.get('level') as FeaturedAdLevel | null
    const source = searchParams.get('source') as FeaturedAdSource | null
    const companyId = searchParams.get('companyId')

    const [anuncis, stats] = await Promise.all([
      getAllFeaturedAds({
        status: status || undefined,
        level: level || undefined,
        source: source || undefined,
        companyId: companyId || undefined
      }),
      getFeaturedAdsStats()
    ])

    return NextResponse.json({ anuncis, stats })

  } catch (error) {
    console.error('Error obtenint anuncis destacats:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

/**
 * POST /api/gestio/anuncis-destacats
 * Crear un nou anunci destacat
 */
export async function POST(request: NextRequest) {
  const auth = await checkAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json()

    const {
      title,
      description,
      shortDescription,
      images,
      level,
      source,
      companyId,
      publisherName,
      publisherLogo,
      ctaText,
      ctaUrl,
      targetBlank,
      startsAt,
      period,
      scheduling, // Programación avanzada
      budgetId,
      invoiceId,
      generateInvoice,
      invoiceData,
      price
    } = body

    // Usar datos de scheduling si están disponibles
    const effectiveStartsAt = scheduling?.startsAt || startsAt
    const effectivePeriod = scheduling?.period || period

    // Validacions
    if (!title || !description || !level || !effectiveStartsAt) {
      return NextResponse.json(
        { error: 'Falten camps obligatoris: title, description, level, startsAt' },
        { status: 400 }
      )
    }

    if (!['PREMIUM', 'STANDARD', 'BASIC'].includes(level)) {
      return NextResponse.json(
        { error: 'Nivell invàlid. Opcions: PREMIUM, STANDARD, BASIC' },
        { status: 400 }
      )
    }

    // Permitir 'custom' como period válido
    const validPeriods = ['weekly', 'monthly', 'quarterly', 'biannual', 'annual', 'custom']
    if (effectivePeriod && !validPeriods.includes(effectivePeriod)) {
      return NextResponse.json(
        { error: 'Període invàlid' },
        { status: 400 }
      )
    }

    let createdInvoice = null

    // Generate invoice for COMPANY source if requested
    if (source === 'COMPANY' && generateInvoice && companyId && invoiceData) {
      const taxRate = 21
      const subtotalAmount = price || 0
      const taxAmount = Math.round((subtotalAmount * taxRate) / 100)
      const totalAmount = subtotalAmount + taxAmount

      // Generate invoice number (format: FA-YYYY-NNNN)
      const year = new Date().getFullYear()
      const lastInvoice = await prismaClient.invoice.findFirst({
        where: {
          invoiceNumber: { startsWith: `FA-${year}-` }
        },
        orderBy: { invoiceNumber: 'desc' }
      })

      let nextNumber = 1
      if (lastInvoice) {
        const lastNum = parseInt(lastInvoice.invoiceNumber.split('-')[2], 10)
        nextNumber = lastNum + 1
      }
      const invoiceNumber = `FA-${year}-${String(nextNumber).padStart(4, '0')}`

      createdInvoice = await prismaClient.invoice.create({
        data: {
          invoiceNumber,
          companyId,
          status: 'PENDING',
          issueDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          clientName: invoiceData.clientName,
          clientCif: invoiceData.clientCif,
          clientEmail: invoiceData.clientEmail,
          clientAddress: invoiceData.clientAddress,
          subtotalAmount,
          taxRate,
          taxAmount,
          totalAmount,
          notes: invoiceData.notes || `Anunci destacat: ${title}`,
          items: {
            create: [{
              description: `Anunci destacat ${level} - ${PERIOD_CONFIG[period as keyof typeof PERIOD_CONFIG].label}`,
              quantity: 1,
              unitPrice: subtotalAmount,
              subtotalAmount: subtotalAmount,
              taxRate: taxRate,
              taxAmount: taxAmount,
              totalAmount: subtotalAmount + taxAmount
            }]
          }
        }
      })
    }

    // Calcular fecha de fin para período custom
    let endsAt: Date | undefined
    if (effectivePeriod === 'custom' && scheduling?.endsAt) {
      endsAt = new Date(scheduling.endsAt)
    }

    const anunci = await createFeaturedAd({
      title,
      description,
      shortDescription,
      images: images || [],
      level,
      source: source || 'COMPANY',
      companyId,
      publisherName,
      publisherLogo,
      ctaText,
      ctaUrl,
      targetBlank: targetBlank || false,
      startsAt: new Date(effectiveStartsAt),
      endsAt,
      period: effectivePeriod,
      createdById: auth.userId,
      budgetId,
      invoiceId: createdInvoice?.id || invoiceId,
      // Programación avanzada
      scheduling: scheduling || undefined,
      priority: scheduling?.priority,
      maxImpressions: scheduling?.rotation?.maxImpressions,
      maxClicks: scheduling?.rotation?.maxClicks
    })

    return NextResponse.json({
      anunci,
      invoice: createdInvoice ? {
        id: createdInvoice.id,
        invoiceNumber: createdInvoice.invoiceNumber,
        totalAmount: createdInvoice.totalAmount
      } : null
    }, { status: 201 })

  } catch (error) {
    console.error('Error creant anunci destacat:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
