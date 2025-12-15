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

    const days = ['Dg', 'Dl', 'Dm', 'Dc', 'Dj', 'Dv', 'Ds']
    const result = []
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)
      
      const count = await prismaClient.user.count({
        where: {
          createdAt: { gte: date, lt: nextDate }
        }
      })
      
      result.push({
        day: days[date.getDay()],
        date: date.toISOString().split('T')[0],
        count
      })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error' }, { status: 500 })
  }
}
