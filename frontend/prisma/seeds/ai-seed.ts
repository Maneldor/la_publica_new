// prisma/seeds/ai-seed.ts
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedAIConfiguration() {
  console.log('🤖 Seeding AI Configuration...')

  try {
    // 1. Crear proveïdors
    const openai = await prisma.aIProvider.upsert({
      where: { type: 'OPENAI' },
      update: {},
      create: {
        type: 'OPENAI',
        name: 'OpenAI',
        isActive: true,
        useEnvKey: true,
        maxTokensPerRequest: 4000,
        maxTokensPerMonth: 1000000,
      },
    })

    const anthropic = await prisma.aIProvider.upsert({
      where: { type: 'ANTHROPIC' },
      update: {},
      create: {
        type: 'ANTHROPIC',
        name: 'Anthropic',
        isActive: true,
        useEnvKey: true,
        maxTokensPerRequest: 4000,
        maxTokensPerMonth: 1000000,
      },
    })

    const gemini = await prisma.aIProvider.upsert({
      where: { type: 'GEMINI' },
      update: {},
      create: {
        type: 'GEMINI',
        name: 'Google Gemini',
        isActive: true,
        useEnvKey: true,
        maxTokensPerRequest: 4000,
        maxTokensPerMonth: 1000000,
      },
    })

    console.log('✅ Proveïdors creats:', {
      openai: openai.id,
      anthropic: anthropic.id,
      gemini: gemini.id
    })

    // 2. Crear models OpenAI
    const gpt4o = await prisma.aIModel.upsert({
      where: { providerId_modelId: { providerId: openai.id, modelId: 'gpt-4o' } },
      update: {},
      create: {
        providerId: openai.id,
        modelId: 'gpt-4o',
        displayName: 'GPT-4o',
        description: 'Model més avançat i ràpid d\'OpenAI',
        isActive: true,
        maxContextTokens: 128000,
        maxOutputTokens: 4096,
        supportsVision: true,
        supportsTools: true,
        inputCostPer1M: 2.50,
        outputCostPer1M: 10.00,
      },
    })

    await prisma.aIModel.upsert({
      where: { providerId_modelId: { providerId: openai.id, modelId: 'gpt-4o-mini' } },
      update: {},
      create: {
        providerId: openai.id,
        modelId: 'gpt-4o-mini',
        displayName: 'GPT-4o Mini',
        description: 'Versió lleugera i econòmica de GPT-4o',
        isActive: true,
        maxContextTokens: 128000,
        maxOutputTokens: 16384,
        supportsVision: true,
        supportsTools: true,
        inputCostPer1M: 0.15,
        outputCostPer1M: 0.60,
      },
    })

    await prisma.aIModel.upsert({
      where: { providerId_modelId: { providerId: openai.id, modelId: 'o1' } },
      update: {},
      create: {
        providerId: openai.id,
        modelId: 'o1',
        displayName: 'O1',
        description: 'Model de raonament avançat',
        isActive: true,
        maxContextTokens: 200000,
        maxOutputTokens: 100000,
        supportsVision: true,
        supportsTools: false,
        inputCostPer1M: 15.00,
        outputCostPer1M: 60.00,
      },
    })

    // 3. Crear models Anthropic
    const claudeSonnet = await prisma.aIModel.upsert({
      where: { providerId_modelId: { providerId: anthropic.id, modelId: 'claude-3-5-sonnet-20241022' } },
      update: {},
      create: {
        providerId: anthropic.id,
        modelId: 'claude-3-5-sonnet-20241022',
        displayName: 'Claude 3.5 Sonnet',
        description: 'Model equilibrat entre velocitat i capacitat',
        isActive: true,
        maxContextTokens: 200000,
        maxOutputTokens: 8192,
        supportsVision: true,
        supportsTools: true,
        inputCostPer1M: 3.00,
        outputCostPer1M: 15.00,
      },
    })

    await prisma.aIModel.upsert({
      where: { providerId_modelId: { providerId: anthropic.id, modelId: 'claude-3-5-haiku-20241022' } },
      update: {},
      create: {
        providerId: anthropic.id,
        modelId: 'claude-3-5-haiku-20241022',
        displayName: 'Claude 3.5 Haiku',
        description: 'Model ràpid i econòmic',
        isActive: true,
        maxContextTokens: 200000,
        maxOutputTokens: 8192,
        supportsVision: true,
        supportsTools: true,
        inputCostPer1M: 0.80,
        outputCostPer1M: 4.00,
      },
    })

    // 4. Crear models Gemini
    const geminiPro = await prisma.aIModel.upsert({
      where: { providerId_modelId: { providerId: gemini.id, modelId: 'gemini-1.5-pro' } },
      update: {},
      create: {
        providerId: gemini.id,
        modelId: 'gemini-1.5-pro',
        displayName: 'Gemini 1.5 Pro',
        description: 'Model avançat de Google amb finestra de context gran',
        isActive: true,
        maxContextTokens: 2000000,
        maxOutputTokens: 8192,
        supportsVision: true,
        supportsTools: true,
        inputCostPer1M: 1.25,
        outputCostPer1M: 5.00,
      },
    })

    await prisma.aIModel.upsert({
      where: { providerId_modelId: { providerId: gemini.id, modelId: 'gemini-1.5-flash' } },
      update: {},
      create: {
        providerId: gemini.id,
        modelId: 'gemini-1.5-flash',
        displayName: 'Gemini 1.5 Flash',
        description: 'Model ràpid i econòmic de Google',
        isActive: true,
        maxContextTokens: 1000000,
        maxOutputTokens: 8192,
        supportsVision: true,
        supportsTools: true,
        inputCostPer1M: 0.075,
        outputCostPer1M: 0.30,
      },
    })

    await prisma.aIModel.upsert({
      where: { providerId_modelId: { providerId: gemini.id, modelId: 'gemini-2.0-flash' } },
      update: {},
      create: {
        providerId: gemini.id,
        modelId: 'gemini-2.0-flash',
        displayName: 'Gemini 2.0 Flash',
        description: 'Última versió Flash de Gemini',
        isActive: true,
        maxContextTokens: 1000000,
        maxOutputTokens: 8192,
        supportsVision: true,
        supportsTools: true,
        inputCostPer1M: 0.10,
        outputCostPer1M: 0.40,
      },
    })

    console.log('✅ Models creats')

    // 5. Crear configuracions per cas d'ús
    await prisma.aIConfiguration.upsert({
      where: { useCase: 'LEADS' },
      update: {},
      create: {
        useCase: 'LEADS',
        name: 'Generació de Leads',
        description: 'Configuració per la generació i anàlisi automàtica de leads comercials',
        isActive: true,
        providerId: openai.id,
        modelId: gpt4o.id,
        temperature: 0.7,
        maxTokens: 2000,
        maxRequestsPerDay: 500,
        maxTokensPerDay: 100000,
      },
    })

    await prisma.aIConfiguration.upsert({
      where: { useCase: 'CONTENT' },
      update: {},
      create: {
        useCase: 'CONTENT',
        name: 'Creació de Contingut',
        description: 'Configuració per la generació de contingut per la web (posts, blogs, anuncis)',
        isActive: true,
        providerId: anthropic.id,
        modelId: claudeSonnet.id,
        temperature: 0.8,
        maxTokens: 4000,
        maxRequestsPerDay: 200,
        maxTokensPerDay: 200000,
      },
    })

    console.log('✅ Configuracions creades')
    console.log('🎉 AI Configuration seed completat!')

    return {
      providers: { openai, anthropic, gemini },
      models: { gpt4o, claudeSonnet, geminiPro },
    }

  } catch (error) {
    console.error('❌ Error en el seed d\'IA:', error)
    throw error
  }
}

// Si s'executa directament
if (require.main === module) {
  seedAIConfiguration()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}