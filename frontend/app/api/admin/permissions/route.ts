import { NextRequest, NextResponse } from 'next/server'
import { prismaClient as prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET - Llistar tots els permisos agrupats per categoria
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
            return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
        }

        const categories = await prisma.permissionCategory.findMany({
            where: { isActive: true },
            include: {
                permissions: {
                    where: { isActive: true },
                    orderBy: { order: 'asc' },
                },
            },
            orderBy: { order: 'asc' },
        })

        return NextResponse.json(categories)
    } catch (error) {
        console.error('Error llistant permisos:', error)
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
    }
}
