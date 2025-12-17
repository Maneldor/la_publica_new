import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH - Actualizar configuración
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const body = await request.json()

    const config = await prisma.agendaUserConfig.update({
      where: { userId: session.user.id },
      data: body
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error actualizando config:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}