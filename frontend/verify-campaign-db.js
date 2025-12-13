
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Testing connection...')
        const count = await prisma.campaign.count()
        console.log('Successfully connected! Campaign count:', count)

        const campaigns = await prisma.campaign.findMany({ take: 1 })
        console.log('First campaign:', campaigns[0] || 'None')
    } catch (e) {
        console.error('Connection failed:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
