import { NextRequest, NextResponse } from 'next/server'
import { prismaClient as prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// POST - Copiar un rol
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
            return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
        }

        const body = await req.json()
        const { name, label } = body

        if (!name || !label) {
            return NextResponse.json({ error: 'Nom i etiqueta són obligatoris' }, { status: 400 })
        }

        // Obtenir rol original amb permisos
        const originalRole = await prisma.role.findUnique({
            where: { id: params.id },
            include: {
                permissions: true,
            },
        })

        if (!originalRole) {
            return NextResponse.json({ error: 'Rol original no trobat' }, { status: 404 })
        }

        // Comprovar si ja existeix
        const formattedName = name.toUpperCase().replace(/\s+/g, '_')
        const existing = await prisma.role.findUnique({ where: { name: formattedName } })
        if (existing) {
            return NextResponse.json({ error: 'Ja existeix un rol amb aquest nom' }, { status: 400 })
        }

        // Crear nou rol
        const newRole = await prisma.role.create({
            data: {
                name: formattedName,
                label,
                description: `Copiat de ${originalRole.label}`,
                color: originalRole.color,
                icon: originalRole.icon,
                dashboard: originalRole.dashboard,
                isSystem: false,
                copiedFromId: originalRole.id,
                createdById: session.user.id,
            },
        })

        // Copiar permisos
        if (originalRole.permissions.length > 0) {
            await prisma.rolePermission.createMany({
                data: originalRole.permissions.map((rp) => ({
                    roleId: newRole.id,
                    permissionId: rp.permissionId,
                    grantedById: session.user.id,
                })),
            })
        }

        return NextResponse.json(newRole, { status: 201 })
    } catch (error) {
        console.error('Error copiant rol:', error)
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
    }
}
