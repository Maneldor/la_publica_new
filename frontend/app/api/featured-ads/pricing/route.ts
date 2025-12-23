import { NextRequest, NextResponse } from 'next/server'
import { getFeaturedAdPricing, calculatePrice, PERIOD_CONFIG, LEVEL_CONFIG } from '@/lib/services/featuredAdsService'
import { FeaturedAdLevel } from '@prisma/client'

/**
 * GET /api/featured-ads/pricing
 * Obtenir configuració de preus
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level') as FeaturedAdLevel | null
    const period = searchParams.get('period')

    // Si demanen preu específic
    if (level && period && PERIOD_CONFIG[period as keyof typeof PERIOD_CONFIG]) {
      const price = await calculatePrice(level, period as any)
      return NextResponse.json({
        level,
        period,
        price,
        priceFormatted: `${(price / 100).toFixed(2)}€`
      })
    }

    // Sinó, retornar tots els preus
    const pricing = await getFeaturedAdPricing()

    // Afegir info addicional
    const enrichedPricing = pricing.map(p => ({
      ...p,
      levelInfo: LEVEL_CONFIG[p.level],
      prices: {
        weekly: { amount: p.priceWeekly, formatted: `${(p.priceWeekly / 100).toFixed(2)}€` },
        monthly: { amount: p.priceMonthly, formatted: `${(p.priceMonthly / 100).toFixed(2)}€` },
        quarterly: { amount: p.priceQuarterly, formatted: `${(p.priceQuarterly / 100).toFixed(2)}€` },
        biannual: { amount: p.priceBiannual, formatted: `${(p.priceBiannual / 100).toFixed(2)}€` },
        annual: { amount: p.priceAnnual, formatted: `${(p.priceAnnual / 100).toFixed(2)}€` }
      }
    }))

    return NextResponse.json({
      pricing: enrichedPricing,
      periods: Object.entries(PERIOD_CONFIG).map(([key, value]) => ({
        id: key,
        ...value
      }))
    })

  } catch (error) {
    console.error('Error obtenint preus:', error)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}
