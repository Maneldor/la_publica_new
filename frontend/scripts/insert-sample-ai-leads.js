// Script per inserir leads ficticis d'IA a la base de dades
// Nota: Aquest script assumeix que s'executarà des de l'entorn Next.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const sampleAILeads = [
  {
    companyName: "TechnoSolucions BCN",
    city: "Barcelona",
    sector: "Tecnologia",
    industry: "Software Development",
    phone: "+34 93 123 4567",
    email: "info@technosolucions.cat",
    website: "https://technosolucions.cat",
    address: "Carrer de Balmes, 145, Barcelona",
    description: "Empresa especialitzada en desenvolupament de software personalitzat per a pimes catalanes",
    aiScore: 92,
    aiScoreReasoning: "Alt potencial degut a la seva especialització en digitalització de pimes, coincideix perfectament amb els nostres serveis de màrqueting digital",
    aiInsights: {
      strengths: [
        "Empresa consolidada amb 15 anys d'experiència",
        "Cartera de clients diversificada",
        "Equip tècnic altament qualificat"
      ],
      weaknesses: [
        "Presència digital limitada",
        "Estratègia de màrqueting poc desenvolupada",
        "Falta de presència en xarxes socials"
      ],
      opportunities: [
        "Expansió a mercats internacionals",
        "Desenvolupament de productes SaaS propis",
        "Col·laboració amb startups tecnològiques"
      ]
    },
    suggestedPitch: "Podem ajudar TechnoSolucions BCN a potenciar la seva presència digital i atreure nous clients mitjançant estratègies de màrqueting especialitzades en el sector tecnològic. La nostra experiència amb empreses tech catalanes ens permet oferir solucions adaptades al seu mercat objectiu.",
    targetAudience: "Pimes catalanes que busquen digitalitzar-se i necessiten solucions tecnològiques personalitzades",
    estimatedSize: "50-100 empleats",
    generationMethod: "AI_SCRAPING",
    reviewStatus: "PENDING",
    status: "AI_REVIEW"
  },
  {
    companyName: "EcoVerde Consultoria",
    city: "Girona",
    sector: "Medi Ambient",
    industry: "Environmental Consulting",
    phone: "+34 972 34 56 78",
    email: "contacte@ecoverde.es",
    website: "https://ecoverde.es",
    address: "Plaça Independència, 8, Girona",
    description: "Consultoria especialitzada en sostenibilitat i energies renovables per a empreses i ajuntaments",
    aiScore: 78,
    aiScoreReasoning: "Bon potencial en un sector en creixement, però la seva ubicació a Girona pot limitar les oportunitats de col·laboració directa",
    aiInsights: {
      strengths: [
        "Sector en creixement accelerat",
        "Subvencions públiques disponibles",
        "Compromís amb la sostenibilitat"
      ],
      weaknesses: [
        "Mercat molt competitiu",
        "Dependència de regulacions governamentals",
        "Cicles de vendes llargs"
      ],
      opportunities: [
        "Expansió a Catalunya i Balears",
        "Serveis de certificació ambiental",
        "Consulting per a fons europeus"
      ]
    },
    suggestedPitch: "La vostra experiència en sostenibilitat és valuosa, però necessiteu amplificar el vostre missatge. Podem crear campanyes de màrqueting que posicionin EcoVerde com a referent en consultoria ambiental a Catalunya, connectant amb empreses que busquen certificacions verdes.",
    targetAudience: "Empreses industrials, ajuntaments i promotors immobiliaris compromesos amb la sostenibilitat",
    estimatedSize: "10-25 empleats",
    generationMethod: "AI_SCRAPING",
    reviewStatus: "PENDING",
    status: "AI_REVIEW"
  },
  {
    companyName: "Gastronòmic Mediterrani",
    city: "València",
    sector: "Restauració",
    industry: "Food & Beverage",
    phone: "+34 96 789 01 23",
    email: "hola@gastronomicmediterrani.com",
    website: "https://gastronomicmediterrani.com",
    address: "Carrer de Colón, 42, València",
    description: "Cadena de restaurants especialitzada en cuina mediterrània amb 5 locals a la Comunitat Valenciana",
    aiScore: 85,
    aiScoreReasoning: "Excel·lent candidat per màrqueting gastronòmic i presència digital. El sector restauració té alta demanda de serveis de màrqueting visual i gestió de xarxes socials",
    aiInsights: {
      strengths: [
        "Múltiples ubicacions estratègiques",
        "Cuina de qualitat reconeguda",
        "Base de clients fidels"
      ],
      weaknesses: [
        "Gestió de xarxes socials inconsistent",
        "Falta de estratègia digital unificada",
        "Competència local molt alta"
      ],
      opportunities: [
        "Delivery i take-away",
        "Esdeveniments corporatius",
        "Expansió a altres ciutats"
      ]
    },
    suggestedPitch: "Els restaurants necessiten una presència digital sòlida per competir. Podem transformar Gastronòmic Mediterrani en una marca digital potent amb contingut visual atractiu, gestió de ressenyes i campanyes geolocalitzades que portin més clients als vostres locals.",
    targetAudience: "Famílies, turistes i professionals que busquen experiències gastronòmiques autèntiques mediterrànies",
    estimatedSize: "25-50 empleats",
    generationMethod: "AI_SCRAPING",
    reviewStatus: "PENDING",
    status: "AI_REVIEW"
  },
  {
    companyName: "FitnessPro Wellness",
    city: "Sevilla",
    sector: "Esport i Benestar",
    industry: "Health & Fitness",
    phone: "+34 95 456 78 90",
    email: "info@fitnessprowellness.es",
    website: "https://fitnessprowellness.es",
    address: "Avenida de la Constitución, 12, Sevilla",
    description: "Centre de fitness amb serveis integrals de entrenament personal, nutrició i teràpies de recuperació",
    aiScore: 88,
    aiScoreReasoning: "Sector amb alta demanda de màrqueting digital, especialment per captar nous socis i fidelitzar existents. El wellness té molt potencial online",
    aiInsights: {
      strengths: [
        "Serveis integrals de wellness",
        "Equip de professionals certificats",
        "Instal·lacions modernes i equipades"
      ],
      weaknesses: [
        "Mercat saturat de gimnasos",
        "Estacionalitat en les subscripcions",
        "Alt cost d'adquisició de clients"
      ],
      opportunities: [
        "Classes online i híbrides",
        "Programs corporatius de wellness",
        "Aplicació mòbil pròpia"
      ]
    },
    suggestedPitch: "El fitness és més que exercici, és un estil de vida. Podem ajudar FitnessPro a crear una comunitat digital sòlida amb contingut motivacional, testimonis reals i campanyes que converteixin seguidors en socis compromesos amb el seu benestar.",
    targetAudience: "Adults de 25-45 anys interessats en fitness, wellness i estil de vida saludable",
    estimatedSize: "15-30 empleats",
    generationMethod: "AI_SCRAPING",
    reviewStatus: "PENDING",
    status: "AI_REVIEW"
  },
  {
    companyName: "AgroTech Innova",
    city: "Lleida",
    sector: "Agricultura",
    industry: "AgriTech",
    phone: "+34 973 12 34 56",
    email: "innovacio@agrotechinnova.cat",
    website: "https://agrotechinnova.cat",
    address: "Carrer Major, 85, Lleida",
    description: "Empresa innovadora que desenvolupa solucions tecnològiques per a l'agricultura de precisió i cultius sostenibles",
    aiScore: 94,
    aiScoreReasoning: "Excel·lent potencial! AgriTech és un sector emergent amb alta demanda de màrqueting especialitzat. La combinació d'agricultura i tecnologia ofereix múltiples angles de comunicació",
    aiInsights: {
      strengths: [
        "Sector AgriTech en creixement",
        "Innovació tecnològica avançada",
        "Sostenibilitat com a valor afegit"
      ],
      weaknesses: [
        "Mercat objectiu conservador",
        "Necessitat d'educació del client",
        "Inversió inicial elevada per clients"
      ],
      opportunities: [
        "Expansió internacional",
        "Partnerships amb universitats",
        "Subvencions per innovació"
      ]
    },
    suggestedPitch: "AgroTech Innova està transformant l'agricultura catalana. Podem crear una estratègia de màrqueting que eduqui el sector sobre els beneficis de la tecnologia, posicionant-vos com a líders en agricultura del futur amb contingut tècnic i casos d'èxit mesurables.",
    targetAudience: "Agricultors progressistes, cooperatives agrícoles i empreses agroalimentàries que busquen optimitzar producció",
    estimatedSize: "20-40 empleats",
    generationMethod: "AI_SCRAPING",
    reviewStatus: "PENDING",
    status: "AI_REVIEW"
  }
];

async function insertSampleAILeads() {
  try {
    console.log('🚀 Començant la inserció de leads ficticis d\'IA...');

    // Primer, busquem una empresa existent per assignar els leads
    const companies = await prisma.company.findMany({
      where: { status: 'PUBLISHED' },
      take: 1,
    });

    if (companies.length === 0) {
      console.error('❌ No hi ha empreses actives a la base de dades per assignar els leads');
      return;
    }

    const defaultCompany = companies[0];
    console.log(`📋 Assignant leads a l'empresa: ${defaultCompany.name}`);

    // Busquem un usuari existent per assignar els leads
    const users = await prisma.user.findMany({
      where: { isActive: true },
      take: 1,
    });

    if (users.length === 0) {
      console.error('❌ No hi ha usuaris actius a la base de dades per assignar els leads');
      return;
    }

    const defaultUser = users[0];
    console.log(`👤 Assignant leads a l'usuari: ${defaultUser.email}`);

    // Busquem una oferta existent
    const offers = await prisma.offer.findMany({
      where: { status: 'PUBLISHED' },
      take: 1,
    });

    if (offers.length === 0) {
      console.error('❌ No hi ha ofertes publicades per associar els leads');
      return;
    }

    const defaultOffer = offers[0];
    console.log(`🎯 Assignant leads a l'oferta: ${defaultOffer.title}`);

    // Adaptem les dades al model Lead actual
    const leadsData = sampleAILeads.map((lead, index) => ({
      offerId: defaultOffer.id,
      userId: defaultUser.id,
      companyId: defaultCompany.id,
      name: lead.companyName,
      email: lead.email,
      phone: lead.phone,
      message: lead.suggestedPitch,
      status: 'NEW', // Usem l'estat NEW del model actual
      metadata: {
        // Guardem totes les dades específiques d'IA al camp metadata
        city: lead.city,
        sector: lead.sector,
        industry: lead.industry,
        website: lead.website,
        address: lead.address,
        description: lead.description,
        aiScore: lead.aiScore,
        aiScoreReasoning: lead.aiScoreReasoning,
        aiInsights: lead.aiInsights,
        suggestedPitch: lead.suggestedPitch,
        targetAudience: lead.targetAudience,
        estimatedSize: lead.estimatedSize,
        generationMethod: lead.generationMethod,
        reviewStatus: lead.reviewStatus,
        originalStatus: lead.status
      },
    }));

    // Inserim els leads
    const insertedLeads = await prisma.lead.createMany({
      data: leadsData,
    });

    console.log(`✅ S'han inserit ${insertedLeads.count} leads ficticis d'IA correctament!`);

    // Mostrem un resum
    console.log('\n📊 Resum dels leads inserits:');
    sampleAILeads.forEach((lead, index) => {
      console.log(`${index + 1}. ${lead.companyName} (${lead.city}) - Score: ${lead.aiScore}`);
    });

    console.log('\n🎉 Proces completat! Ja pots veure els leads al sistema de Revisió IA.');

  } catch (error) {
    console.error('❌ Error inserint els leads ficticis:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executem l'script
insertSampleAILeads();