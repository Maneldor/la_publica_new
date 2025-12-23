import { NextRequest, NextResponse } from 'next/server'
import { processAdExpirations, getExpirationStats } from '@/lib/services/adExpirationService'

// Clau secreta per autoritzar el cron (configurar a .env)
const CRON_SECRET = process.env.CRON_SECRET

/**
 * POST /api/cron/process-ad-expirations
 * Processa expiracions d'anuncis (cridat pel cron job diari)
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autorització
    const authHeader = request.headers.get('authorization')

    if (!CRON_SECRET) {
      console.error('[CRON] CRON_SECRET no configurat')
      return NextResponse.json({ error: 'Configuració incorrecta' }, { status: 500 })
    }

    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      console.warn('[CRON] Intent no autoritzat')
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    console.log('[CRON] Iniciant processament d\'expiracions...')
    const startTime = Date.now()

    const result = await processAdExpirations()

    const duration = Date.now() - startTime
    console.log(`[CRON] Processament completat en ${duration}ms:`, result)

    return NextResponse.json({
      success: true,
      duration: `${duration}ms`,
      ...result
    })

  } catch (error) {
    console.error('[CRON] Error processant expiracions:', error)
    return NextResponse.json(
      { error: 'Error del servidor', details: String(error) },
      { status: 500 }
    )
  }
}

/**
 * GET /api/cron/process-ad-expirations
 * Obtenir estadístiques (només en dev o amb auth)
 */
export async function GET(request: NextRequest) {
  try {
    // En producció, requerir autenticació
    if (process.env.NODE_ENV === 'production') {
      const authHeader = request.headers.get('authorization')
      if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
      }
    }

    const stats = await getExpirationStats()

    return NextResponse.json({
      success: true,
      stats,
      config: {
        lifetimeDays: 60,
        warning7Days: 7,
        warning24Hours: 1,
        gracePeriodDays: 7
      }
    })

  } catch (error) {
    console.error('[CRON] Error obtenint stats:', error)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}
