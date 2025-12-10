// app/api/gestio/gestors/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient as prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ data: [] }) // Devolver array vacío si no hay sesión
    }

    const role = session.user.role as string
    const hasFullAccess = ['SUPER_ADMIN', 'ADMIN', 'CRM_COMERCIAL'].includes(role)

    if (!hasFullAccess) {
      return NextResponse.json({ data: [] }) // Devolver array vacío si no tiene acceso
    }

    const gestors = await prisma.user.findMany({
      where: {
        role: {
          in: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE', 'CRM_COMERCIAL']
        },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ data: gestors })
  } catch (error) {
    console.error('Error en API gestio gestors:', error)
    return NextResponse.json({ data: [] }) // Devolver array vacío en caso de error
  }
}