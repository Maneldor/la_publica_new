import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { seedUserAgenda } from '@/lib/agenda/seed-user-agenda'

// GET - Inicializar agenda del usuario y devolver config
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    // Intentar seed (no hace nada si ya existe)
    await seedUserAgenda(session.user.id)

    // Obtener configuración
    const config = await prisma.agendaUserConfig.findUnique({
      where: { userId: session.user.id }
    })

    return NextResponse.json({ 
      success: true,
      config: config ? {
        hasCompletedSetup: config.hasCompletedSetup,
        hasSeenWelcome: config.hasSeenWelcome,
        showBaseModules: config.showBaseModules
      } : null
    })
  } catch (error) {
    console.error('Error inicializando agenda:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}