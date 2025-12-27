import { NextRequest, NextResponse } from 'next/server'
import { publishScheduledPosts, cleanExpiredPins } from '@/lib/services/postManagementService'

const CRON_SECRET = process.env.CRON_SECRET

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')

    if (!CRON_SECRET) {
      console.error('[CRON] CRON_SECRET no configurat')
      return NextResponse.json({ error: 'Configuració incorrecta' }, { status: 500 })
    }

    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    console.log('[CRON] Iniciant publicació de posts programats...')
    const startTime = Date.now()

    const [publishResult, cleanResult] = await Promise.all([
      publishScheduledPosts(),
      cleanExpiredPins()
    ])

    const duration = Date.now() - startTime
    console.log(`[CRON] Completat en ${duration}ms:`, {
      published: publishResult.published,
      expiredPinsCleaned: cleanResult.count
    })

    return NextResponse.json({
      success: true,
      duration: `${duration}ms`,
      published: publishResult.published,
      postIds: publishResult.postIds,
      expiredPinsCleaned: cleanResult.count
    })

  } catch (error) {
    console.error('[CRON] Error:', error)
    return NextResponse.json(
      { error: 'Error del servidor', details: String(error) },
      { status: 500 }
    )
  }
}

// GET per testejar manualment (només en dev)
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Només disponible en desenvolupament' },
      { status: 403 }
    )
  }

  console.log('[CRON-DEV] Executant publicació manual...')
  const startTime = Date.now()

  try {
    const [publishResult, cleanResult] = await Promise.all([
      publishScheduledPosts(),
      cleanExpiredPins()
    ])

    const duration = Date.now() - startTime

    return NextResponse.json({
      success: true,
      duration: `${duration}ms`,
      published: publishResult.published,
      postIds: publishResult.postIds,
      expiredPinsCleaned: cleanResult.count
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error', details: String(error) },
      { status: 500 }
    )
  }
}
