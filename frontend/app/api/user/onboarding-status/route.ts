// app/api/user/onboarding-status/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ hasCompletedOnboarding: true }, { status: 401 })
    }

    const user = await prismaClient.user.findUnique({
      where: { id: session.user.id },
      select: { hasCompletedOnboarding: true }
    })

    return NextResponse.json({
      hasCompletedOnboarding: user?.hasCompletedOnboarding ?? false
    })
  } catch (error) {
    console.error('Error checking onboarding status:', error)
    return NextResponse.json({ hasCompletedOnboarding: true }, { status: 500 })
  }
}
