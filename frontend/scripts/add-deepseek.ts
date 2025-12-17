import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check all providers
  const providers = await prisma.aIProvider.findMany({
    include: { models: true }
  });

  console.log('Current Providers:');
  providers.forEach((p: any) => {
    console.log(`- ${p.type}: ${p.name} (active: ${p.isActive})`);
    p.models.forEach((m: any) => console.log(`    Model: ${m.displayName}`));
  });

  // Check if DeepSeek exists
  const deepseek = providers.find((p: any) => p.type === 'DEEPSEEK');

  if (deepseek) {
    console.log('\nDeepSeek found! ID:', deepseek.id);

    // Add models if they don't exist
    if (!deepseek.models || deepseek.models.length === 0) {
      console.log('Adding DeepSeek models...');
      await prisma.aIModel.createMany({
        data: [
          {
            providerId: deepseek.id,
            modelId: 'deepseek-chat',
            displayName: 'DeepSeek Chat',
            description: 'Model de conversa general',
            maxOutputTokens: 8192,
            maxContextTokens: 64000,
            inputCostPer1M: 0.14,
            outputCostPer1M: 0.28,
            isActive: true,
            supportsVision: false,
            supportsTools: true,
          },
          {
            providerId: deepseek.id,
            modelId: 'deepseek-reasoner',
            displayName: 'DeepSeek Reasoner',
            description: 'Model de raonament avançat',
            maxOutputTokens: 8192,
            maxContextTokens: 64000,
            inputCostPer1M: 0.55,
            outputCostPer1M: 2.19,
            isActive: true,
            supportsVision: false,
            supportsTools: true,
          }
        ],
        skipDuplicates: true
      });
      console.log('Models added!');
    } else {
      console.log('DeepSeek already has models:', deepseek.models.length);
    }
  } else {
    console.log('\nDeepSeek NOT found, creating it...');
    const newProvider = await prisma.aIProvider.create({
      data: {
        type: 'DEEPSEEK',
        name: 'DeepSeek',
        isActive: true,
        useEnvKey: true,
        maxTokensPerRequest: 8192,
        maxTokensPerDay: 2000000,
        maxTokensPerMonth: 20000000,
        models: {
          create: [
            {
              modelId: 'deepseek-chat',
              displayName: 'DeepSeek Chat',
              description: 'Model de conversa general',
              maxOutputTokens: 8192,
              maxContextTokens: 64000,
              inputCostPer1M: 0.14,
              outputCostPer1M: 0.28,
              isActive: true,
              supportsVision: false,
              supportsTools: true,
            },
            {
              modelId: 'deepseek-reasoner',
              displayName: 'DeepSeek Reasoner',
              description: 'Model de raonament avançat',
              maxOutputTokens: 8192,
              maxContextTokens: 64000,
              inputCostPer1M: 0.55,
              outputCostPer1M: 2.19,
              isActive: true,
              supportsVision: false,
              supportsTools: true,
            }
          ]
        }
      }
    });
    console.log('DeepSeek created with ID:', newProvider.id);
  }

  // Show final state
  const finalProviders = await prisma.aIProvider.findMany({
    include: { models: true }
  });
  console.log('\n--- Final State ---');
  finalProviders.forEach((p: any) => {
    console.log(`${p.type}: ${p.name} (${p.models.length} models)`);
  });

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
