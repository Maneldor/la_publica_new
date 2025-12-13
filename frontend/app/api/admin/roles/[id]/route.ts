import { NextRequest, NextResponse } from 'next/server'
import { prismaClient as prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET - Obtenir un rol
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
            return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
        }

        const role = await prisma.role.findUnique({
            where: { id: params.id },
            include: {
                permissions: {
                    include: {
                        permission: {
                            include: { category: true },
                        },
                    },
                },
                copiedFrom: true,
                _count: { select: { users: true } },
            },
        })

        if (!role) {
            return NextResponse.json({ error: 'Rol no trobat' }, { status: 404 })
        }

        return NextResponse.json(role)
    } catch (error) {
        console.error('Error obtenint rol:', error)
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
    }
}

// PUT - Actualitzar rol
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
            return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
        }

        const role = await prisma.role.findUnique({ where: { id: params.id } })
        if (!role) {
            return NextResponse.json({ error: 'Rol no trobat' }, { status: 404 })
        }

        const body = await req.json()
        const { label, description, color, icon, dashboard, permissionIds } = body

        // No permetre modificar nom de rols del sistema
        const updateData: any = {
            description,
            color,
            icon,
            dashboard,
        }

        if (!role.isSystem) {
            updateData.label = label
        }

        // Actualitzar rol
        const updatedRole = await prisma.role.update({
            where: { id: params.id },
            data: updateData,
        })

        // Actualitzar permisos si s'han passat
        if (permissionIds !== undefined) {
            // Eliminar permisos actuals
            await prisma.rolePermission.deleteMany({
                where: { roleId: params.id },
            })

            // Afegir nous permisos
            if (permissionIds.length > 0) {
                await prisma.rolePermission.createMany({
                    data: permissionIds.map((permId: string) => ({
                        roleId: params.id,
                        permissionId: permId,
                        grantedById: session.user.id,
                    })),
                })
            }
        }

        return NextResponse.json(updatedRole)
    } catch (error) {
        console.error('Error actualitzant rol:', error)
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
    }
}

// DELETE - Eliminar rol
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Només Super Admin pot eliminar rols' }, { status: 401 })
        }

        const role = await prisma.role.findUnique({
            where: { id: params.id },
            include: { _count: { select: { users: true } } },
        })

        if (!role) {
            return NextResponse.json({ error: 'Rol no trobat' }, { status: 404 })
        }

        if (role.isSystem) {
            return NextResponse.json({ error: 'No es pot eliminar un rol del sistema' }, { status: 400 })
        }

        if (role._count.users > 0) {
            return NextResponse.json({
                error: `No es pot eliminar el rol perquè té ${role._count.users} usuaris assignats`
            }, { status: 400 })
        }

        await prisma.role.delete({ where: { id: params.id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error eliminant rol:', error)
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
    }
}
