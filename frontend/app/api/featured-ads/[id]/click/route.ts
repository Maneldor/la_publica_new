import { NextRequest, NextResponse } from 'next/server'
import { recordClick } from '@/lib/services/featuredAdsService'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/featured-ads/[id]/click
 * Registrar un clic en un anunci destacat
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    await recordClick(id)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error registrant clic:', error)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}
