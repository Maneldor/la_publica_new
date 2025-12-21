import { NextRequest, NextResponse } from 'next/server'
import { prismaClient } from '@/lib/prisma'

/**
 * GET /api/auth/verify-email?token=xxx
 * Verifica el email del usuario usando el token
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token de verificació no proporcionat' },
        { status: 400 }
      )
    }

    // Buscar el token
    const verificationToken = await prismaClient.verificationToken.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nick: true,
            firstName: true,
            isEmailVerified: true,
          }
        }
      }
    })

    if (!verificationToken) {
      return NextResponse.json(
        {
          error: 'Token invàlid o ja utilitzat',
          code: 'INVALID_TOKEN'
        },
        { status: 400 }
      )
    }

    // Verificar que no haya expirado
    if (new Date() > verificationToken.expiresAt) {
      // Eliminar token expirado
      await prismaClient.verificationToken.delete({
        where: { id: verificationToken.id }
      })

      return NextResponse.json(
        {
          error: 'El token ha expirat. Sol·licita un nou correu de verificació.',
          code: 'TOKEN_EXPIRED'
        },
        { status: 400 }
      )
    }

    // Verificar que no se haya usado ya
    if (verificationToken.usedAt) {
      return NextResponse.json(
        {
          error: 'Aquest token ja ha estat utilitzat',
          code: 'TOKEN_USED'
        },
        { status: 400 }
      )
    }

    // Verificar que el usuario no esté ya verificado
    if (verificationToken.user.isEmailVerified) {
      // Marcar token como usado
      await prismaClient.verificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() }
      })

      return NextResponse.json({
        success: true,
        message: 'El teu compte ja estava verificat',
        alreadyVerified: true,
        user: {
          email: verificationToken.user.email,
          nick: verificationToken.user.nick,
        }
      })
    }

    // Actualizar usuario como verificado y marcar token como usado
    await prismaClient.$transaction([
      prismaClient.user.update({
        where: { id: verificationToken.userId },
        data: { isEmailVerified: true }
      }),
      prismaClient.verificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() }
      })
    ])

    console.log(`✅ Email verificado para usuario: ${verificationToken.user.email}`)

    return NextResponse.json({
      success: true,
      message: 'Correu verificat correctament! Ja pots iniciar sessió.',
      user: {
        email: verificationToken.user.email,
        nick: verificationToken.user.nick,
        firstName: verificationToken.user.firstName,
      }
    })

  } catch (error) {
    console.error('Error verificant email:', error)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/auth/verify-email
 * Reenviar email de verificación
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email no proporcionat' },
        { status: 400 }
      )
    }

    // Buscar usuario por email
    const user = await prismaClient.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        nick: true,
        firstName: true,
        isEmailVerified: true,
      }
    })

    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return NextResponse.json({
        success: true,
        message: 'Si el correu existeix, rebràs un nou enllaç de verificació.'
      })
    }

    if (user.isEmailVerified) {
      return NextResponse.json({
        success: true,
        message: 'El teu compte ja està verificat. Pots iniciar sessió.',
        alreadyVerified: true
      })
    }

    // Eliminar tokens anteriores no usados
    await prismaClient.verificationToken.deleteMany({
      where: {
        userId: user.id,
        type: 'EMAIL_VERIFICATION',
        usedAt: null
      }
    })

    // Generar nuevo token
    const crypto = await import('crypto')
    const newToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    await prismaClient.verificationToken.create({
      data: {
        token: newToken,
        type: 'EMAIL_VERIFICATION',
        userId: user.id,
        expiresAt,
      }
    })

    // Enviar email
    const { emailService } = await import('@/lib/email')
    const { EmailTemplate } = await import('@prisma/client')

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const verificationUrl = `${baseUrl}/verificar-email?token=${newToken}`

    try {
      await emailService.sendEmail({
        to: email,
        subject: 'Verifica tu correo electrónico - La Pública',
        template: EmailTemplate.EMAIL_VERIFICATION,
        templateProps: {
          user: {
            name: user.firstName || user.nick,
            email: user.email,
          },
          verificationUrl,
          expiresInHours: 24,
        },
        userId: user.id,
      })
      console.log(`📧 Email de verificación reenviado a ${email}`)
    } catch (emailError) {
      console.error('Error reenviando email de verificación:', emailError)
      return NextResponse.json(
        { error: 'Error enviant el correu. Torna-ho a provar més tard.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Nou correu de verificació enviat. Revisa la teva safata d\'entrada.'
    })

  } catch (error) {
    console.error('Error reenviando email:', error)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}
