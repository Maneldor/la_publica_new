
import { prismaClient } from './frontend/lib/prisma'

async function debugRolesDeep() {
    console.log('--- Starting Deep Debug of Roles Query ---')
    try {
        console.log('1. Testing simple connection...')
        const count = await prismaClient.role.count()
        console.log(`Simple count: ${count}`)

        console.log('2. Testing complex query from API...')
        const roles = await prismaClient.role.findMany({
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
            take: 1, // Just take 1 to test structure
            orderBy: { createdAt: 'asc' },
        })

        console.log('Query successful!')
        if (roles.length > 0) {
            console.log('Sample role loaded:', roles[0].name)
            console.log('Permissions count:', roles[0].permissions.length)
            if (roles[0].permissions.length > 0) {
                console.log('Sample permission category:', roles[0].permissions[0].permission.category?.name)
            }
        } else {
            console.log('No active roles found (but count was ' + count + ')')
        }

    } catch (error) {
        console.error('!!! ERROR EXECUTING QUERY !!!')
        console.error(error)
    } finally {
        await prismaClient.$disconnect()
    }
}

debugRolesDeep()
