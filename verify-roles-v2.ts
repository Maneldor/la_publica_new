import { prismaClient } from './frontend/lib/prisma'

async function checkRoles() {
    try {
        const roles = await prismaClient.role.findMany({
            where: { isActive: true },
        })
        console.log(`Found ${roles.length} active roles`)
        if (roles.length > 0) console.log('First role:', roles[0].name)
    } catch (e) {
        console.error('DB Error:', e)
    } finally {
        await prismaClient.$disconnect()
    }
}

checkRoles()
