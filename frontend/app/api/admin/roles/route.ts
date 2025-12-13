import { NextRequest, NextResponse } from 'next/server'
import { prismaClient as prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET - Llistar tots els rols
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
            return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
        }

        const roles = await prisma.role.findMany({
            where: { isActive: true },
            include: {
                permissions: {
                    include: {
                        permission: {
                            include: {
                                category: true,
                            },
                        },
                    },
                },
                _count: {
                    select: { users: true },
                },
            },
            orderBy: { createdAt: 'asc' },
        })

        if (!roles) {
            console.error('ERROR CRITICO: prisma.role.findMany devolvió null o undefined')
            return NextResponse.json({ error: 'Error interno: Base de datos no devolvió respuesta' }, { status: 500 })
        }

        return NextResponse.json(roles)
    } catch (error) {
        console.error('Error FATAL llistant rols:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error('Stack:', error instanceof Error ? error.stack : 'No stack')
        return NextResponse.json({ error: `Error del servidor: ${errorMessage}` }, { status: 500 })
    }
}

// POST - Crear nou rol
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
            return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
        }

        const body = await req.json()
        const { name, label, description, color, icon, dashboard, permissionIds, copyFromId } = body

        // Validacions
        if (!name || !label) {
            return NextResponse.json({ error: 'Nom i etiqueta són obligatoris' }, { status: 400 })
        }

        // Comprovar si ja existeix
        const existing = await prisma.role.findUnique({ where: { name } })
        if (existing) {
            return NextResponse.json({ error: 'Ja existeix un rol amb aquest nom' }, { status: 400 })
        }

        // Crear rol
        const role = await prisma.role.create({
            data: {
                name: name.toUpperCase().replace(/\s+/g, '_'),
                label,
                description,
                color: color || 'slate',
                icon: icon || 'Users',
                dashboard,
                isSystem: false,
                copiedFromId: copyFromId || null,
                createdById: session.user.id,
            },
        })

        // Assignar permisos
        if (permissionIds && permissionIds.length > 0) {
            await prisma.rolePermission.createMany({
                data: permissionIds.map((permId: string) => ({
                    roleId: role.id,
                    permissionId: permId,
                    grantedById: session.user.id,
                })),
            })
        }

        return NextResponse.json(role, { status: 201 })
    } catch (error) {
        console.error('Error creant rol:', error)
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
    }
}
