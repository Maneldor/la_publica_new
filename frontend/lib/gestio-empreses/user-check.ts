'use server'

import { prismaClient } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function checkUserByEmail(email: string) {
  try {
    console.log('🔍 Buscando usuario:', email)

    const user = await prismaClient.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        password: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      console.log('❌ Usuario no encontrado')
      return { user: null, exists: false }
    }

    console.log('✅ Usuario encontrado:', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      hasPassword: !!user.password,
      createdAt: user.createdAt
    })

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        hasPassword: !!user.password,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      exists: true
    }
  } catch (error) {
    console.error('❌ Error verificando usuario:', error)
    return { user: null, exists: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

export async function verifyUserPassword(email: string, password: string) {
  try {
    const user = await prismaClient.user.findUnique({
      where: { email },
      select: {
        id: true,
        password: true,
        isActive: true
      }
    })

    if (!user || !user.password) {
      return { valid: false, reason: 'Usuario no encontrado o sin password' }
    }

    if (!user.isActive) {
      return { valid: false, reason: 'Usuario inactivo' }
    }

    const isValidPassword = await bcrypt.compare(password, user.password)

    return {
      valid: isValidPassword,
      reason: isValidPassword ? 'Password válido' : 'Password incorrecto',
      userId: user.id
    }
  } catch (error) {
    console.error('❌ Error verificando password:', error)
    return { valid: false, reason: 'Error de servidor' }
  }
}

export async function createOrUpdateGestorUser(email: string, name: string, role: 'GESTOR_ESTANDARD' | 'GESTOR_ESTRATEGIC' | 'GESTOR_ENTERPRISE', password: string) {
  try {
    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prismaClient.user.upsert({
      where: { email },
      update: {
        name,
        role,
        password: hashedPassword,
        isActive: true
      },
      create: {
        email,
        name,
        role,
        password: hashedPassword,
        isActive: true
      }
    })

    console.log('✅ Usuario creado/actualizado:', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    })

    return { success: true, user }
  } catch (error) {
    console.error('❌ Error creando/actualizando usuario:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}