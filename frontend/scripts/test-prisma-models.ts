// scripts/test-prisma-models.ts
import { prismaClient as prisma } from '@/lib/prisma'

async function testModels() {
  console.log('Testing Prisma models...')

  const models = [
    'companyLead',
    'leadActivity',
    'task',
    'calendarEvent',
    'message',
    'notification',
    'company',
    'user'
  ]

  for (const modelName of models) {
    try {
      const model = (prisma as any)[modelName]
      if (model && model.findFirst) {
        console.log(`✅ ${modelName} - OK`)
      } else {
        console.log(`❌ ${modelName} - UNDEFINED or NO findFirst`)
      }
    } catch (error) {
      console.log(`⚠️ ${modelName} - ERROR:`, error)
    }
  }
}

testModels().catch(console.error)