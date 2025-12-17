// lib/actions/onboarding-actions.ts
'use server'

import { prismaClient } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function completeOnboarding(userId: string) {
  await prismaClient.user.update({
    where: { id: userId },
    data: {
      hasCompletedOnboarding: true,
      onboardingCompletedAt: new Date(),
    }
  })

  revalidatePath('/dashboard')
}

export async function checkOnboardingStatus(userId: string): Promise<boolean> {
  const user = await prismaClient.user.findUnique({
    where: { id: userId },
    select: { hasCompletedOnboarding: true }
  })

  return user?.hasCompletedOnboarding ?? false
}
