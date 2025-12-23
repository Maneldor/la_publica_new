import { NextRequest, NextResponse } from 'next/server'
import {
  getActiveFeaturedAds,
  getPremiumAdsForSlider,
  getSidebarAds,
  recordImpressions
} from '@/lib/services/featuredAdsService'

/**
 * GET /api/featured-ads
 * Obtenir anuncis destacats actius (públic)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'slider', 'sidebar', 'all'
    const recordImpressionsFlag = searchParams.get('impressions') === 'true'

    let ads

    switch (type) {
      case 'slider':
        ads = await getPremiumAdsForSlider()
        break
      case 'sidebar':
        ads = await getSidebarAds()
        break
      default:
        ads = await getActiveFeaturedAds()
    }

    // Registrar impressions si s'indica (fire and forget)
    if (recordImpressionsFlag && ads.length > 0) {
      recordImpressions(ads.map(ad => ad.id)).catch(console.error)
    }

    return NextResponse.json({ ads })

  } catch (error) {
    console.error('Error obtenint anuncis destacats:', error)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}
