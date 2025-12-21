import { NextRequest, NextResponse } from 'next/server'
import { prismaClient } from '@/lib/prisma'
import { emailService } from '@/lib/email'
import { EmailTemplate } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

/**
 * Genera un token seguro para verificación
 */
function generateVerificationToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * POST /api/auth/register
 * Registra un nuevo usuario (Empleado Público)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      nick,
      firstName,
      lastName,
      secondLastName,
      email,
      password,
      administration,
      displayPreference,
      avatarUrl,
      avatarColor
    } = body

    // Validaciones básicas con detalles
    const missingFields = []
    if (!nick) missingFields.push('nick')
    if (!firstName) missingFields.push('firstName')
    if (!lastName) missingFields.push('lastName')
    if (!email) missingFields.push('email')
    if (!password) missingFields.push('password')

    if (missingFields.length > 0) {
      console.log('Campos faltantes:', missingFields)
      console.log('Body recibido:', JSON.stringify(body, null, 2))
      return NextResponse.json(
        { error: `Falten camps obligatoris: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Verificar nick único
    const existingNick = await prismaClient.user.findUnique({
      where: { nick },
      select: { id: true }
    })

    if (existingNick) {
      return NextResponse.json(
        { error: 'Aquest nick ja està en ús' },
        { status: 400 }
      )
    }

    // Verificar email único
    const existingEmail = await prismaClient.user.findUnique({
      where: { email },
      select: { id: true }
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Aquest email ja està registrat' },
        { status: 400 }
      )
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Crear nombre completo
    const fullName = [firstName, lastName, secondLastName].filter(Boolean).join(' ')

    // Crear usuario
    const user = await prismaClient.user.create({
      data: {
        nick,
        firstName,
        lastName,
        secondLastName: secondLastName || null,
        name: fullName,
        email,
        password: hashedPassword,
        administration: administration || null,
        displayPreference: displayPreference || 'NICK',
        image: avatarUrl || null,
        coverColor: avatarColor || null,
        role: 'USER',
        userType: 'EMPLOYEE',
        isActive: true,
        isEmailVerified: false,
      },
      select: {
        id: true,
        nick: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        image: true,
        role: true,
        userType: true,
        administration: true,
        displayPreference: true,
        createdAt: true,
      }
    })

    // Crear perfil vacío
    await prismaClient.userProfile.create({
      data: {
        userId: user.id,
      }
    })

    // Generar token de verificación (expira en 24 horas)
    const verificationToken = generateVerificationToken()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    await prismaClient.verificationToken.create({
      data: {
        token: verificationToken,
        type: 'EMAIL_VERIFICATION',
        userId: user.id,
        expiresAt,
      }
    })

    // Enviar email de verificación
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const verificationUrl = `${baseUrl}/verificar-email?token=${verificationToken}`

    try {
      await emailService.sendEmail({
        to: email,
        subject: 'Verifica tu correo electrónico - La Pública',
        template: EmailTemplate.EMAIL_VERIFICATION,
        templateProps: {
          user: {
            name: firstName || nick,
            email: email,
          },
          verificationUrl,
          expiresInHours: 24,
        },
        userId: user.id,
      })
      console.log(`📧 Email de verificación enviado a ${email}`)
    } catch (emailError) {
      // No fallamos el registro si falla el email, pero lo logueamos
      console.error('Error enviando email de verificación:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Usuari creat correctament. Revisa el teu correu per verificar el compte.',
      user,
      requiresVerification: true,
    }, { status: 201 })

  } catch (error: unknown) {
    const err = error as { message?: string; code?: string; meta?: unknown }
    console.error('Error registrant usuari:', {
      message: err.message,
      code: err.code,
      meta: err.meta,
      full: error
    })
    return NextResponse.json(
      { error: err.message || 'Error creant usuari' },
      { status: 500 }
    )
  }
}
