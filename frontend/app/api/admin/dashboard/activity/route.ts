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

    const [users, companies, offers] = await Promise.all([
      prismaClient.user.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, email: true, createdAt: true } }),
      prismaClient.company.findMany({ take: 3, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, createdAt: true } }),
      prismaClient.offer.findMany({ take: 3, orderBy: { createdAt: 'desc' }, select: { id: true, title: true, createdAt: true } })
    ])

    const activity = [
      ...users.map(u => ({ id: `u-${u.id}`, type: 'USER_CREATED', description: `Nou usuari: ${u.email}`, timestamp: u.createdAt, icon: 'UserPlus' })),
      ...companies.map(c => ({ id: `c-${c.id}`, type: 'COMPANY_CREATED', description: `Nova empresa: ${c.name}`, timestamp: c.createdAt, icon: 'Building2' })),
      ...offers.map(o => ({ id: `o-${o.id}`, type: 'OFFER_CREATED', description: `Nova oferta: ${o.title}`, timestamp: o.createdAt, icon: 'Tag' }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10)

    return NextResponse.json({ success: true, data: activity })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error' }, { status: 500 })
  }
}
