import { NextRequest, NextResponse } from 'next/server'
import { runScheduledGeneration } from '@/lib/services/blogAutoScheduleService'

const CRON_SECRET = process.env.CRON_SECRET

export async function POST(request: NextRequest) {
  try {
    // Verificar autorització
    const authHeader = request.headers.get('authorization')

    if (!CRON_SECRET) {
      console.error('[CRON] CRON_SECRET no configurat')
      return NextResponse.json({ error: 'Configuració incorrecta' }, { status: 500 })
    }

    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    console.log('[CRON] Iniciant generació automàtica de blogs...')
    const startTime = Date.now()

    const result = await runScheduledGeneration()

    const duration = Date.now() - startTime
    console.log(`[CRON] Generació completada en ${duration}ms:`, result)

    return NextResponse.json({
      success: true,
      duration: `${duration}ms`,
      ...result
    })

  } catch (error) {
    console.error('[CRON] Error en generació automàtica:', error)
    return NextResponse.json(
      { error: 'Error del servidor', details: String(error) },
      { status: 500 }
    )
  }
}

// GET per testejar manualment (només en dev)
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Només disponible en desenvolupament' }, { status: 403 })
  }

  // En dev, permetre sense auth
  console.log('[CRON-DEV] Executant generació manual...')
  const startTime = Date.now()

  try {
    const result = await runScheduledGeneration()
    const duration = Date.now() - startTime

    return NextResponse.json({
      success: true,
      duration: `${duration}ms`,
      ...result
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error', details: String(error) },
      { status: 500 }
    )
  }
}
