import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedExtrasCompleto() {
  console.log('🌱 Iniciando seed completo de extras y servicios...');

  const extras = [
    // ============================================
    // PLAN EMPRESARIAL - RECURSOS TÉCNICOS
    // ============================================

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
    },

    // ============================================
    // SERVICIOS PROFESIONALES
    // ============================================

    // BRANDING
    {
      nombre: 'Disseny Identitat Corporativa Completa',
      descripcion: 'Logo, paleta de colors, tipografies, manual d\'ús i aplicacions',
      categoria: 'branding',
      precio: 1500,
      limitesJSON: null,
      activo: true,
      orden: 20
    },
    {
      nombre: 'Redisseny de Marca',
      descripcion: 'Actualització i modernització de la identitat visual existent',
      categoria: 'branding',
      precio: 800,
      limitesJSON: null,
      activo: true,
      orden: 21
    },
    {
      nombre: 'Manual de Marca Digital',
      descripcion: 'Guia completa d\'ús de marca per a entorns digitals',
      categoria: 'branding',
      precio: 400,
      limitesJSON: null,
      activo: true,
      orden: 22
    },

    // WEB
    {
      nombre: 'Landing Page Personalitzada',
      descripcion: 'Disseny i desenvolupament de landing page a mida (fins a 5 seccions)',
      categoria: 'web',
      precio: 2500,
      limitesJSON: null,
      activo: true,
      orden: 23
    },
    {
      nombre: 'Portal Web Complet',
      descripcion: 'Desenvolupament de portal web amb panell d\'administració',
      categoria: 'web',
      precio: 8000,
      limitesJSON: null,
      activo: true,
      orden: 24
    },
    {
      nombre: 'Manteniment Web Mensual',
      descripcion: 'Actualitzacions, backup, seguretat i suport tècnic',
      categoria: 'web',
      precio: 200,
      limitesJSON: null,
      activo: true,
      orden: 25
    },
    {
      nombre: 'Optimització SEO',
      descripcion: 'Anàlisi i optimització completa per a motors de cerca',
      categoria: 'web',
      precio: 600,
      limitesJSON: null,
      activo: true,
      orden: 26
    },

    // RRSS
    {
      nombre: 'Gestió RRSS - Pack Bàsic',
      descripcion: '10 posts/mes + community management (2h/setmana)',
      categoria: 'rrss',
      precio: 250,
      limitesJSON: null,
      activo: true,
      orden: 27
    },
    {
      nombre: 'Gestió RRSS - Pack Estàndard',
      descripcion: '20 posts/mes + community management (5h/setmana) + anàlisi mensual',
      categoria: 'rrss',
      precio: 450,
      limitesJSON: null,
      activo: true,
      orden: 28
    },
    {
      nombre: 'Gestió RRSS - Pack Premium',
      descripcion: '30 posts/mes + community management (10h/setmana) + estratègia + anàlisi',
      categoria: 'rrss',
      precio: 750,
      limitesJSON: null,
      activo: true,
      orden: 29
    },
    {
      nombre: 'Campanya Publicitària RRSS',
      descripcion: 'Disseny, gestió i optimització de campanya (gestió inclosa, pressupost publicitat a part)',
      categoria: 'rrss',
      precio: 600,
      limitesJSON: null,
      activo: true,
      orden: 30
    },

    // AUTOMATION
    {
      nombre: 'Automatització de Processos',
      descripcion: 'Creació de workflows automàtics amb Make/Zapier (fins a 5 processos)',
      categoria: 'automation',
      precio: 1200,
      limitesJSON: null,
      activo: true,
      orden: 31
    },
    {
      nombre: 'Integració amb API Externa',
      descripcion: 'Connexió i sincronització amb sistemes externs (CRM, ERP, etc)',
      categoria: 'automation',
      precio: 800,
      limitesJSON: null,
      activo: true,
      orden: 32
    },
    {
      nombre: 'Bot d\'Atenció al Client',
      descripcion: 'Chatbot intel·ligent per WhatsApp, web o Telegram',
      categoria: 'automation',
      precio: 1500,
      limitesJSON: null,
      activo: true,
      orden: 33
    },

    // PROGRAMMING
    {
      nombre: 'Desenvolupament Custom - Pack Hores',
      descripcion: 'Pack de 10 hores de programació a mida',
      categoria: 'programming',
      precio: 800,
      limitesJSON: null,
      activo: true,
      orden: 34
    },
    {
      nombre: 'Aplicació Web Personalitzada',
      descripcion: 'Desenvolupament d\'aplicació web completa segons especificacions',
      categoria: 'programming',
      precio: 5000,
      limitesJSON: null,
      activo: true,
      orden: 35
    },
    {
      nombre: 'App Mòbil Nativa',
      descripcion: 'Desenvolupament d\'aplicació mòbil per iOS i Android',
      categoria: 'programming',
      precio: 12000,
      limitesJSON: null,
      activo: true,
      orden: 36
    },

    // TRAINING
    {
      nombre: 'Taller de Formació (4h)',
      descripcion: 'Sessió formativa a mida per l\'equip presencial o virtual',
      categoria: 'training',
      precio: 400,
      limitesJSON: null,
      activo: true,
      orden: 37
    },
    {
      nombre: 'Programa de Formació Complet',
      descripcion: 'Cicle de 5 sessions formatives amb material i seguiment',
      categoria: 'training',
      precio: 1800,
      limitesJSON: null,
      activo: true,
      orden: 38
    },
    {
      nombre: 'Curs Online Personalitzat',
      descripcion: 'Creació de curs e-learning amb vídeos, materials i certificat',
      categoria: 'training',
      precio: 2500,
      limitesJSON: null,
      activo: true,
      orden: 39
    },

    // CONSULTING
    {
      nombre: 'Consultoria Estratègica',
      descripcion: 'Anàlisi i recomanacions estratègiques (8 hores)',
      categoria: 'consulting',
      precio: 800,
      limitesJSON: null,
      activo: true,
      orden: 40
    },
    {
      nombre: 'Auditoria Digital Completa',
      descripcion: 'Anàlisi exhaustiva de presència digital i recomanacions',
      categoria: 'consulting',
      precio: 1200,
      limitesJSON: null,
      activo: true,
      orden: 41
    },
    {
      nombre: 'Pla de Transformació Digital',
      descripcion: 'Estratègia completa de digitalització per l\'empresa',
      categoria: 'consulting',
      precio: 3000,
      limitesJSON: null,
      activo: true,
      orden: 42
    }
  ];

  let creados = 0;
  let errores = 0;

  for (const extra of extras) {
    try {
      await prisma.featureExtra.create({
        data: extra
      });
      creados++;
      console.log(`✅ ${extra.nombre}`);
    } catch (error: any) {
      if (error.code === 'P2002') {
        // Ya existe
        console.log(`⚠️  ${extra.nombre} (ya existe)`);
      } else {
        errores++;
        console.error(`❌ ${extra.nombre}:`, error.message);
      }
    }
  }

  console.log(`\n🎉 Seed completado:`);
  console.log(`   ✅ Creados: ${creados}`);
  console.log(`   ⚠️  Ya existían: ${extras.length - creados - errores}`);
  console.log(`   ❌ Errores: ${errores}`);
  console.log(`   📊 Total extras: ${extras.length}`);
}

seedExtrasCompleto()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });