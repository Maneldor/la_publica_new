import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: 'No autoritzat' }, { status: 401 })
    }

    // Check PostgreSQL
    let dbStatus = { status: 'offline', latency: 0, message: 'No connectat' }
    try {
      const start = Date.now()
      await prismaClient.$queryRaw`SELECT 1`
      dbStatus = { status: 'online', latency: Date.now() - start, message: 'PostgreSQL operatiu' }
    } catch (e) {
      dbStatus = { status: 'offline', latency: 0, message: 'Error de connexió' }
    }

    // Check Redis (simplified - just check env)
    const redisStatus = process.env.REDIS_HOST 
      ? { status: 'online', latency: 0, message: 'Redis configurat' }
      : { status: 'offline', latency: 0, message: 'Redis no configurat' }

    // Check Email
    const emailStatus = process.env.RESEND_API_KEY
      ? { status: 'online', latency: 0, message: 'Resend configurat' }
      : { status: 'offline', latency: 0, message: 'Email no configurat' }

    // Check Cloudinary
    const storageStatus = process.env.CLOUDINARY_CLOUD_NAME
      ? { status: 'online', latency: 0, message: 'Cloudinary configurat' }
      : { status: 'offline', latency: 0, message: 'Storage no configurat' }

    // Get alerts
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const [pendingCompanies, pendingOffers, unverifiedUsers] = await Promise.all([
      prismaClient.company.count({ where: { status: 'PENDING', createdAt: { lt: threeDaysAgo } } }).catch(() => 0),
      prismaClient.offer.count({ where: { status: 'PENDING', createdAt: { lt: twoDaysAgo } } }).catch(() => 0),
      prismaClient.user.count({ where: { isEmailVerified: false, createdAt: { lt: sevenDaysAgo } } }).catch(() => 0)
    ])

    return NextResponse.json({
      success: true,
      services: {
        database: dbStatus,
        redis: redisStatus,
        email: emailStatus,
        storage: storageStatus
      },
      alerts: {
        pendingCompanies,
        pendingOffers,
        unverifiedUsers,
        total: pendingCompanies + pendingOffers + unverifiedUsers
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error' }, { status: 500 })
  }
}
