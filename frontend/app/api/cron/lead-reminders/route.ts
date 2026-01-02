import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { runAllLeadReminders } from '@/lib/cron/lead-reminders'

/**
 * GET /api/cron/lead-reminders
 *
 * Endpoint per executar les comprovacions de leads inactius i a punt d'expirar.
 * Pensat per ser cridat per un servei de cron (Vercel Cron, etc.)
 *
 * Autenticació:
 * - Header 'x-cron-secret' amb el valor de CRON_SECRET
 * - O Authorization header amb el valor de CRON_SECRET
 *
 * Configuració Vercel Cron (vercel.json):
 * {
 *   "crons": [
 *     {
 *       "path": "/api/cron/lead-reminders",
 *       "schedule": "0 9 * * *"  // Cada dia a les 9:00
 *     }
 *   ]
 * }
 */
export async function GET(request: NextRequest) {
  const headersList = await headers()

  // Verificar autenticació
  const cronSecret = process.env.CRON_SECRET
  const providedSecret =
    headersList.get('x-cron-secret') ||
    headersList.get('authorization')?.replace('Bearer ', '')

  // En desenvolupament, permetre sense secret
  const isDev = process.env.NODE_ENV === 'development'

  if (!isDev && cronSecret && providedSecret !== cronSecret) {
    console.log('❌ [Cron] Petició no autoritzada')
    return NextResponse.json(
      { error: 'Unauthorized - Invalid cron secret' },
      { status: 401 }
    )
  }

  try {
    console.log('🚀 [Cron] Executant comprovacions de leads...')

    const results = await runAllLeadReminders()

    console.log('✅ [Cron] Resultats:', JSON.stringify(results, null, 2))

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    })
  } catch (error) {
    console.error('❌ [Cron] Error executant comprovacions:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// També permet POST per compatibilitat amb alguns serveis de cron
export async function POST(request: NextRequest) {
  return GET(request)
}
