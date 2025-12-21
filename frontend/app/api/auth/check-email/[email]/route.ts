import { NextRequest, NextResponse } from 'next/server'
import { prismaClient } from '@/lib/prisma'

/**
 * GET /api/auth/check-email/[email]
 * Verifica si un email está disponible
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const email = decodeURIComponent(params.email)

    if (!email || !email.includes('@')) {
      return NextResponse.json({
        available: false,
        error: 'Email no vàlid'
      })
    }

    const existingUser = await prismaClient.user.findUnique({
      where: { email },
      select: { id: true }
    })

    return NextResponse.json({
      available: !existingUser,
      email
    })
  } catch (error) {
    console.error('Error verificant email:', error)
    return NextResponse.json({
      available: true,
      error: 'Error verificant email'
    })
  }
}
