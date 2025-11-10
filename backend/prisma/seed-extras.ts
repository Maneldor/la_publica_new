import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedExtras() {
  console.log('🌱 Iniciando seed de extras...');

  const extras = [
    // STORAGE
    {
      nombre: 'Emmagatzematge +50GB',
      descripcion: 'Ampliació de 50GB d\'emmagatzematge addicional',
      categoria: 'storage',
      precio: 40,
      limitesJSON: JSON.stringify({ maxStorage: 50 }),
      activo: true,
      orden: 1
    },
    {
      nombre: 'Emmagatzematge +100GB',
      descripcion: 'Ampliació de 100GB d\'emmagatzematge addicional',
      categoria: 'storage',
      precio: 70,
      limitesJSON: JSON.stringify({ maxStorage: 100 }),
      activo: true,
      orden: 2
    },
    {
      nombre: 'Emmagatzematge +250GB',
      descripcion: 'Ampliació de 250GB d\'emmagatzematge addicional',
      categoria: 'storage',
      precio: 150,
      limitesJSON: JSON.stringify({ maxStorage: 250 }),
      activo: true,
      orden: 3
    },

    // USERS
    {
      nombre: 'Usuaris +10',
      descripcion: '10 usuaris addicionals al teu equip',
      categoria: 'users',
      precio: 50,
      limitesJSON: JSON.stringify({ maxUsuarios: 10 }),
      activo: true,
      orden: 4
    },
    {
      nombre: 'Usuaris +25',
      descripcion: '25 usuaris addicionals al teu equip',
      categoria: 'users',
      precio: 100,
      limitesJSON: JSON.stringify({ maxUsuarios: 25 }),
      activo: true,
      orden: 5
    },
    {
      nombre: 'Usuaris +50',
      descripcion: '50 usuaris addicionals al teu equip',
      categoria: 'users',
      precio: 180,
      limitesJSON: JSON.stringify({ maxUsuarios: 50 }),
      activo: true,
      orden: 6
    },

    // IA
    {
      nombre: 'Pack 5 Agents IA',
      descripcion: '5 agents IA addicionals per a automatització',
      categoria: 'ia',
      precio: 80,
      limitesJSON: JSON.stringify({ maxAgentsIA: 5 }),
      activo: true,
      orden: 7
    },
    {
      nombre: 'Pack 10 Agents IA',
      descripcion: '10 agents IA addicionals per a automatització',
      categoria: 'ia',
      precio: 140,
      limitesJSON: JSON.stringify({ maxAgentsIA: 10 }),
      activo: true,
      orden: 8
    },
    {
      nombre: 'Pack 20 Agents IA',
      descripcion: '20 agents IA addicionals per a automatització avançada',
      categoria: 'ia',
      precio: 250,
      limitesJSON: JSON.stringify({ maxAgentsIA: 20 }),
      activo: true,
      orden: 9
    },

    // FEATURES
    {
      nombre: 'API Access Pro',
      descripcion: 'Accés complet a l\'API amb límits estesos',
      categoria: 'features',
      precio: 50,
      limitesJSON: null,
      activo: true,
      orden: 10
    },
    {
      nombre: 'Webhooks Premium',
      descripcion: 'Sistema de webhooks per a integracions en temps real',
      categoria: 'features',
      precio: 40,
      limitesJSON: null,
      activo: true,
      orden: 11
    },
    {
      nombre: 'White Label',
      descripcion: 'Marca blanca personalitzada amb el teu branding',
      categoria: 'features',
      precio: 200,
      limitesJSON: null,
      activo: true,
      orden: 12
    },

    // SUPPORT
    {
      nombre: 'Suport 24/7 Premium',
      descripcion: 'Suport prioritari 24/7 amb temps de resposta garantit',
      categoria: 'support',
      precio: 150,
      limitesJSON: null,
      activo: true,
      orden: 13
    },
    {
      nombre: 'Formació Personalitzada',
      descripcion: 'Sessions de formació personalitzades per al teu equip',
      categoria: 'support',
      precio: 300,
      limitesJSON: null,
      activo: true,
      orden: 14
    },
    {
      nombre: 'Account Manager Dedicat',
      descripcion: 'Gestor de compte dedicat per a la teva empresa',
      categoria: 'support',
      precio: 500,
      limitesJSON: null,
      activo: true,
      orden: 15
    },

    // SECURITY
    {
      nombre: 'Backups Avançats',
      descripcion: 'Sistema de còpies de seguretat automàtiques cada hora',
      categoria: 'security',
      precio: 80,
      limitesJSON: null,
      activo: true,
      orden: 16
    },

    // CONTENT
    {
      nombre: 'Templates Premium',
      descripcion: 'Accés a biblioteca de plantilles professionals',
      categoria: 'content',
      precio: 60,
      limitesJSON: null,
      activo: true,
      orden: 17
    }
  ];

  for (const extra of extras) {
    try {
      const resultado = await prisma.featureExtra.create({
        data: extra
      });
      console.log(`✅ Extra ${resultado.nombre} creado`);
    } catch (error: any) {
      // Si ya existe, intentar actualizar
      if (error.code === 'P2002') {
        console.log(`⚠️  Extra ${extra.nombre} ya existe, saltando...`);
      } else {
        console.error(`❌ Error con extra ${extra.nombre}:`, error);
      }
    }
  }

  console.log('\n🎉 Seed de extras completado');
  console.log(`Total extras: ${extras.length}`);
}

seedExtras()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });