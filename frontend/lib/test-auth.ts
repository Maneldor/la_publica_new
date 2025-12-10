'use server'

import { prismaClient } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function testUserLogin() {
  try {
    console.log('🔍 Buscando usuario g-estandar@lapublica.cat...')

    const user = await prismaClient.user.findUnique({
      where: { email: 'g-estandar@lapublica.cat' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        password: true,
        userType: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return { success: false, error: 'Usuario no encontrado' }
    }

    console.log('✅ Usuario encontrado:', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      hasPassword: !!user.password,
      userType: user.userType
    })

    // Probar contraseña
    if (!user.password) {
      return { success: false, error: 'Usuario sin contraseña' }
    }

    console.log('🔍 Probando contraseña...')
    const isValidPassword = await bcrypt.compare('gestor123', user.password)

    console.log('✅ Resultado contraseña:', isValidPassword)

    // Simular el flujo de authorize()
    const validRoles = [
      'SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO',
      'CRM_COMERCIAL', 'CRM_CONTINGUT',
      'GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE',
      'MODERATOR', 'COMPANY', 'USER'
    ]

    let role = 'USER'
    if (user.role && validRoles.includes(user.role)) {
      role = user.role
    }

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role,
        isActive: user.isActive,
        userType: user.userType,
        passwordValid: isValidPassword
      }
    }

  } catch (error) {
    console.error('❌ Error en test:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined
    }
  }
}