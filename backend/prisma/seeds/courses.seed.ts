// backend/prisma/seeds/courses.seed.ts
import { PrismaClient, CourseLevel, CourseMode, CourseCategory, CourseStatus } from '@prisma/client';

const prisma = new PrismaClient();

const courses = [
  // ===== TECNOLOGIA =====
  {
    title: 'Introducció a la Digitalització de l\'Administració Pública',
    slug: 'digitalitzacio-administracio-publica',
    description: 'Aprèn els fonaments de la transformació digital en l\'administració pública catalana. Aquest curs ofereix una visió completa dels processos, eines i metodologies per implementar serveis digitals eficients.',
    shortDescription: 'Fonaments de la transformació digital en l\'administració pública',
    instructor: 'Dr. Marc Vilà',
    institution: 'Escola d\'Administració Pública de Catalunya',
    category: CourseCategory.TECNOLOGIA,
    level: CourseLevel.PRINCIPIANT,
    mode: CourseMode.ONLINE,
    duration: 30,
    price: 0,
    language: 'ca',
    status: CourseStatus.PUBLISHED,
    isHighlighted: true,
    isFeatured: true,
    startDate: new Date('2025-11-01'),
    endDate: new Date('2025-12-15'),
    availableSlots: 50,
    totalSlots: 50,
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    tags: JSON.stringify(['digitalització', 'administració', 'transformació digital']),
  },
  {
    title: 'Excel Avançat per a Gestió Administrativa',
    slug: 'excel-avancat-gestio',
    description: 'Domina les funcions avançades d\'Excel aplicades a la gestió administrativa pública. Taules dinàmiques, macros, automatització de processos i anàlisi de dades.',
    shortDescription: 'Funcions avançades d\'Excel per a administració',
    instructor: 'Laura Puig',
    institution: 'Centre de Formació Contínua',
    category: CourseCategory.OFIMATICA,
    level: CourseLevel.AVANÇAT,
    mode: CourseMode.ONLINE,
    duration: 20,
    price: 0,
    language: 'ca',
    status: CourseStatus.PUBLISHED,
    isFeatured: true,
    startDate: new Date('2025-10-15'),
    coverImage: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop',
    tags: JSON.stringify(['excel', 'ofimàtica', 'gestió']),
  },
  {
    title: 'Ciberseguretat per a Funcionaris Públics',
    slug: 'ciberseguretat-funcionaris',
    description: 'Protocol de seguretat informàtica, protecció de dades sensibles, identificació de ciberamenaces i bones pràctiques per garantir la seguretat de la informació pública.',
    shortDescription: 'Protocols de seguretat i protecció de dades',
    instructor: 'Joan Ferrer',
    institution: 'Centre de Ciberseguretat de Catalunya',
    category: CourseCategory.CIBERSEGURETAT,
    level: CourseLevel.INTERMEDI,
    mode: CourseMode.HIBRID,
    duration: 15,
    price: 0,
    language: 'ca',
    status: CourseStatus.PUBLISHED,
    isHighlighted: true,
    startDate: new Date('2025-11-10'),
    coverImage: '/courses/ciberseguretat.jpg',
    tags: JSON.stringify(['seguretat', 'protecció dades', 'RGPD']),
  },
  {
    title: 'Desenvolupament de Serveis Digitals amb APIs',
    slug: 'desenvolupament-apis',
    description: 'Curs pràctic sobre com desenvolupar i integrar APIs REST per a serveis públics digitals. Inclou conceptes de backend, bases de dades i autenticació.',
    shortDescription: 'Creació d\'APIs per a serveis públics',
    instructor: 'Anna Torres',
    institution: 'Generalitat Digital',
    category: CourseCategory.TECNOLOGIA,
    level: CourseLevel.AVANÇAT,
    mode: CourseMode.ONLINE,
    duration: 40,
    price: 0,
    language: 'ca',
    status: CourseStatus.PUBLISHED,
    startDate: new Date('2025-11-20'),
    coverImage: '/courses/apis.jpg',
    tags: JSON.stringify(['programació', 'APIs', 'backend']),
  },

  // ===== GESTIÓ I LIDERATGE =====
  {
    title: 'Lideratge Transformador en l\'Administració Pública',
    slug: 'lideratge-transformador',
    description: 'Desenvolupa competències de lideratge per impulsar canvis positius en l\'administració. Gestió d\'equips, comunicació efectiva i presa de decisions estratègiques.',
    shortDescription: 'Competències de lideratge i gestió d\'equips',
    instructor: 'Carles Roca',
    institution: 'Escola d\'Administració Pública',
    category: CourseCategory.GESTIO_I_LIDERATGE,
    level: CourseLevel.INTERMEDI,
    mode: CourseMode.PRESENCIAL,
    duration: 25,
    price: 0,
    language: 'ca',
    status: CourseStatus.PUBLISHED,
    isFeatured: true,
    startDate: new Date('2025-10-25'),
    availableSlots: 30,
    totalSlots: 30,
    coverImage: '/courses/lideratge.jpg',
    tags: JSON.stringify(['lideratge', 'gestió', 'equips']),
  },
  {
    title: 'Gestió de Projectes amb Metodologies Àgils',
    slug: 'gestio-projectes-agils',
    description: 'Aplicació de Scrum i Kanban en projectes públics. Planificació iterativa, gestió de sprints i millora contínua.',
    shortDescription: 'Scrum i Kanban per a projectes públics',
    instructor: 'Marta Soler',
    institution: 'Institut de Governança',
    category: CourseCategory.GESTIO_I_LIDERATGE,
    level: CourseLevel.INTERMEDI,
    mode: CourseMode.ONLINE,
    duration: 20,
    price: 0,
    language: 'ca',
    status: CourseStatus.PUBLISHED,
    startDate: new Date('2025-11-05'),
    coverImage: '/courses/agile.jpg',
    tags: JSON.stringify(['scrum', 'kanban', 'projectes']),
  },
  {
    title: 'Gestió Pressupostària i Administrativa',
    slug: 'gestio-pressupostaria',
    description: 'Procediments de gestió pressupostària en l\'administració pública catalana. Elaboració, seguiment i justificació de pressupostos.',
    shortDescription: 'Elaboració i seguiment de pressupostos públics',
    instructor: 'Pere Martí',
    institution: 'Departament d\'Economia',
    category: CourseCategory.COMPTABILITAT_I_FINANCES,
    level: CourseLevel.AVANÇAT,
    mode: CourseMode.HIBRID,
    duration: 30,
    price: 0,
    language: 'ca',
    status: CourseStatus.PUBLISHED,
    startDate: new Date('2025-10-20'),
    coverImage: '/courses/pressupost.jpg',
    tags: JSON.stringify(['pressupost', 'finances', 'gestió']),
  },

  // ===== COMUNICACIÓ =====
  {
    title: 'Comunicació Efectiva amb la Ciutadania',
    slug: 'comunicacio-ciutadania',
    description: 'Tècniques de comunicació clara, empàtica i accessible per a l\'atenció ciutadana. Resolució de conflictes i gestió d\'expectatives.',
    shortDescription: 'Tècniques d\'atenció i comunicació ciutadana',
    instructor: 'Elena Vidal',
    institution: 'Institut de Formació Contínua',
    category: CourseCategory.COMUNICACIO,
    level: CourseLevel.PRINCIPIANT,
    mode: CourseMode.ONLINE,
    duration: 12,
    price: 0,
    language: 'ca',
    status: CourseStatus.PUBLISHED,
    isHighlighted: true,
    startDate: new Date('2025-10-30'),
    coverImage: '/courses/comunicacio.jpg',
    tags: JSON.stringify(['comunicació', 'atenció', 'ciutadania']),
  },
  {
    title: 'Redacció de Documents Administratius',
    slug: 'redaccio-documents',
    description: 'Normativa i estil en la redacció de documents oficials. Informes, resolucions, certificats i comunicacions administratives.',
    shortDescription: 'Redacció professional de documents oficials',
    instructor: 'Jordi Pons',
    institution: 'Escola d\'Administració',
    category: CourseCategory.COMUNICACIO,
    level: CourseLevel.INTERMEDI,
    mode: CourseMode.ONLINE,
    duration: 15,
    price: 0,
    language: 'ca',
    status: CourseStatus.PUBLISHED,
    startDate: new Date('2025-11-08'),
    coverImage: '/courses/redaccio.jpg',
    tags: JSON.stringify(['redacció', 'documents', 'administració']),
  },

  // ===== IDIOMES =====
  {
    title: 'Anglès Administratiu Nivell B2',
    slug: 'angles-administratiu-b2',
    description: 'Anglès aplicat a contextos administratius i de gestió pública. Correspondència, reunions internacionals i documentació tècnica.',
    shortDescription: 'Anglès per a administració i gestió',
    instructor: 'Sarah Williams',
    institution: 'Centre d\'Idiomes',
    category: CourseCategory.IDIOMES,
    level: CourseLevel.INTERMEDI,
    mode: CourseMode.ONLINE,
    duration: 50,
    price: 0,
    language: 'ca/en',
    status: CourseStatus.PUBLISHED,
    isFeatured: true,
    startDate: new Date('2025-11-01'),
    availableSlots: 25,
    totalSlots: 25,
    coverImage: '/courses/angles.jpg',
    tags: JSON.stringify(['anglès', 'idiomes', 'B2']),
  },

  // ===== RECURSOS HUMANS =====
  {
    title: 'Gestió de Recursos Humans en l\'Administració',
    slug: 'gestio-rrhh',
    description: 'Procediments de selecció, avaluació del rendiment, plans de formació i gestió del talent en l\'àmbit públic.',
    shortDescription: 'Gestió de persones i talent públic',
    instructor: 'Rosa Camps',
    institution: 'Escola de Recursos Humans',
    category: CourseCategory.RECURSOS_HUMANS,
    level: CourseLevel.AVANÇAT,
    mode: CourseMode.HIBRID,
    duration: 35,
    price: 0,
    language: 'ca',
    status: CourseStatus.PUBLISHED,
    startDate: new Date('2025-11-12'),
    coverImage: '/courses/rrhh.jpg',
    tags: JSON.stringify(['recursos humans', 'gestió', 'talent']),
  },
  {
    title: 'Prevenció de Riscos Laborals',
    slug: 'prevencio-riscos',
    description: 'Normativa de seguretat i salut laboral. Identificació de riscos, plans de prevenció i protocols d\'emergència.',
    shortDescription: 'Seguretat i salut en el treball',
    instructor: 'Francesc Gil',
    institution: 'Institut de Seguretat Laboral',
    category: CourseCategory.RECURSOS_HUMANS,
    level: CourseLevel.PRINCIPIANT,
    mode: CourseMode.ONLINE,
    duration: 10,
    price: 0,
    language: 'ca',
    status: CourseStatus.PUBLISHED,
    isHighlighted: true,
    startDate: new Date('2025-10-22'),
    coverImage: '/courses/prevencio.jpg',
    tags: JSON.stringify(['prevenció', 'riscos', 'seguretat']),
  },

  // ===== DESENVOLUPAMENT PERSONAL =====
  {
    title: 'Intel·ligència Emocional per a Professionals Públics',
    slug: 'intelligencia-emocional',
    description: 'Desenvolupament d\'habilitats emocionals per millorar les relacions laborals, gestionar l\'estrès i augmentar la resiliència.',
    shortDescription: 'Gestió emocional i resiliència professional',
    instructor: 'Montserrat Vilà',
    institution: 'Centre de Benestar Laboral',
    category: CourseCategory.DESENVOLUPAMENT_PERSONAL,
    level: CourseLevel.PRINCIPIANT,
    mode: CourseMode.ONLINE,
    duration: 18,
    price: 0,
    language: 'ca',
    status: CourseStatus.PUBLISHED,
    isFeatured: true,
    startDate: new Date('2025-10-28'),
    coverImage: '/courses/emocional.jpg',
    tags: JSON.stringify(['intel·ligència emocional', 'benestar', 'resiliència']),
  },
  {
    title: 'Gestió del Temps i Productivitat',
    slug: 'gestio-temps',
    description: 'Tècniques i eines per optimitzar la gestió del temps, establir prioritats i augmentar la productivitat laboral.',
    shortDescription: 'Optimització del temps i productivitat',
    instructor: 'David López',
    institution: 'Escola de Productivitat',
    category: CourseCategory.DESENVOLUPAMENT_PERSONAL,
    level: CourseLevel.PRINCIPIANT,
    mode: CourseMode.ONLINE,
    duration: 12,
    price: 0,
    language: 'ca',
    status: CourseStatus.PUBLISHED,
    startDate: new Date('2025-11-03'),
    coverImage: '/courses/temps.jpg',
    tags: JSON.stringify(['productivitat', 'temps', 'organització']),
  },

  // ===== DISSENY I UX/UI =====
  {
    title: 'Disseny d\'Experiència d\'Usuari per a Serveis Públics',
    slug: 'ux-serveis-publics',
    description: 'Principis de UX/UI aplicats al disseny de serveis digitals públics. Investigació d\'usuaris, prototipatge i testing.',
    shortDescription: 'UX/UI per a administració digital',
    instructor: 'Clara Ros',
    institution: 'Generalitat Digital',
    category: CourseCategory.DISSENY,
    level: CourseLevel.INTERMEDI,
    mode: CourseMode.ONLINE,
    duration: 25,
    price: 0,
    language: 'ca',
    status: CourseStatus.PUBLISHED,
    startDate: new Date('2025-11-15'),
    coverImage: '/courses/ux.jpg',
    tags: JSON.stringify(['UX', 'UI', 'disseny', 'usuaris']),
  },
  {
    title: 'Accessibilitat Web i Inclusió Digital',
    slug: 'accessibilitat-web',
    description: 'Normatives WCAG, disseny inclusiu i eines per garantir l\'accessibilitat dels serveis digitals públics.',
    shortDescription: 'Webs accessibles i inclusius',
    instructor: 'Manel Serra',
    institution: 'Centre d\'Accessibilitat',
    category: CourseCategory.DISSENY,
    level: CourseLevel.INTERMEDI,
    mode: CourseMode.ONLINE,
    duration: 16,
    price: 0,
    language: 'ca',
    status: CourseStatus.PUBLISHED,
    isHighlighted: true,
    startDate: new Date('2025-11-07'),
    coverImage: '/courses/accessibilitat.jpg',
    tags: JSON.stringify(['accessibilitat', 'WCAG', 'inclusió']),
  },

  // ===== MÀRQUETING DIGITAL =====
  {
    title: 'Comunicació Digital i Xarxes Socials Públiques',
    slug: 'comunicacio-xarxes-socials',
    description: 'Estratègies de comunicació institucional a les xarxes socials. Gestió de crisis, engagement i transparència.',
    shortDescription: 'Gestió de xarxes socials institucionals',
    instructor: 'Albert Casas',
    institution: 'Direcció de Comunicació',
    category: CourseCategory.MARQUETING_DIGITAL,
    level: CourseLevel.PRINCIPIANT,
    mode: CourseMode.ONLINE,
    duration: 20,
    price: 0,
    language: 'ca',
    status: CourseStatus.PUBLISHED,
    startDate: new Date('2025-10-26'),
    coverImage: '/courses/xarxes.jpg',
    tags: JSON.stringify(['xarxes socials', 'comunicació', 'institucional']),
  },

  // ===== CURSOS ESPECIALITZATS =====
  {
    title: 'Protecció de Dades i RGPD',
    slug: 'proteccio-dades-rgpd',
    description: 'Normativa europea i catalana de protecció de dades personals. Aplicació pràctica del RGPD en l\'administració.',
    shortDescription: 'RGPD i protecció de dades personals',
    instructor: 'Núria Mata',
    institution: 'Autoritat Catalana de Protecció de Dades',
    category: CourseCategory.CIBERSEGURETAT,
    level: CourseLevel.AVANÇAT,
    mode: CourseMode.HIBRID,
    duration: 22,
    price: 0,
    language: 'ca',
    status: CourseStatus.PUBLISHED,
    isHighlighted: true,
    isFeatured: true,
    startDate: new Date('2025-11-18'),
    coverImage: '/courses/rgpd.jpg',
    tags: JSON.stringify(['RGPD', 'protecció dades', 'privacitat']),
  },
  {
    title: 'Procediment Administratiu i Legislació',
    slug: 'procediment-administratiu',
    description: 'Llei 39/2015 del Procediment Administratiu Comú. Actes administratius, recursos i procediments especials.',
    shortDescription: 'Legislació i procediments administratius',
    instructor: 'Josep M. Fonts',
    institution: 'Escola d\'Administració Pública',
    category: CourseCategory.GESTIO_I_LIDERATGE,
    level: CourseLevel.AVANÇAT,
    mode: CourseMode.PRESENCIAL,
    duration: 40,
    price: 0,
    language: 'ca',
    status: CourseStatus.PUBLISHED,
    startDate: new Date('2025-11-22'),
    availableSlots: 35,
    totalSlots: 35,
    coverImage: '/courses/procediment.jpg',
    tags: JSON.stringify(['legislació', 'procediment', 'dret administratiu']),
  },
  {
    title: 'Contractació Pública Electrònica',
    slug: 'contractacio-publica',
    description: 'Procediments de licitació electrònica, plataformes digitals de contractació i gestió de contractes públics.',
    shortDescription: 'Licitació i contractació digital',
    instructor: 'Isabel Riera',
    institution: 'Junta Consultiva de Contractació',
    category: CourseCategory.GESTIO_I_LIDERATGE,
    level: CourseLevel.AVANÇAT,
    mode: CourseMode.ONLINE,
    duration: 28,
    price: 0,
    language: 'ca',
    status: CourseStatus.PUBLISHED,
    startDate: new Date('2025-11-25'),
    coverImage: '/courses/contractacio.jpg',
    tags: JSON.stringify(['contractació', 'licitació', 'electrònica']),
  },
  {
    title: 'Atenció a la Diversitat i Inclusió',
    slug: 'atencio-diversitat',
    description: 'Protocols d\'atenció a col·lectius diversos, llenguatge inclusiu i promoció de la igualtat en l\'administració.',
    shortDescription: 'Igualtat i inclusió en l\'administració',
    instructor: 'Cristina Ferrer',
    institution: 'Institut Català de les Dones',
    category: CourseCategory.DESENVOLUPAMENT_PERSONAL,
    level: CourseLevel.PRINCIPIANT,
    mode: CourseMode.ONLINE,
    duration: 14,
    price: 0,
    language: 'ca',
    status: CourseStatus.PUBLISHED,
    isHighlighted: true,
    startDate: new Date('2025-10-24'),
    coverImage: '/courses/diversitat.jpg',
    tags: JSON.stringify(['diversitat', 'inclusió', 'igualtat']),
  },
];

async function seedCourses() {
  console.log('🎓 Iniciando seed de cursos...');

  try {
    // Obtener creador (admin o primer usuario EMPLEADO_PUBLICO)
    const creator = await prisma.user.findFirst({
      where: {
        OR: [
          { primaryRole: 'ADMIN' },
          { primaryRole: 'SUPER_ADMIN' }
        ]
      }
    });

    if (!creator) {
      console.error('❌ No se encontró un usuario creador');
      return;
    }

    // Crear cursos
    for (const courseData of courses) {
      const course = await prisma.course.upsert({
        where: { slug: courseData.slug },
        update: {},
        create: {
          ...courseData,
          creatorId: creator.id,
          comunidadSlug: 'catalunya',
          // Métricas aleatorias realistas
          viewsCount: Math.floor(Math.random() * 500) + 50,
          enrollmentCount: Math.floor(Math.random() * 100) + 10,
          averageRating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)), // 3.5-5.0
          totalRatings: Math.floor(Math.random() * 50) + 5,
          completionRate: parseFloat((Math.random() * 30 + 60).toFixed(1)), // 60-90%
        }
      });

      console.log(`✅ Curso creado: ${course.title}`);
    }

    console.log('\n🎉 Seed de cursos completado!');
    console.log(`📚 Total de cursos: ${courses.length}`);
    console.log('\n📊 Distribución por categorías:');

    const counts: Record<string, number> = {};
    courses.forEach(c => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });

    Object.entries(counts).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} cursos`);
    });

  } catch (error) {
    console.error('❌ Error en seed de cursos:', error);
    throw error;
  }
}

export { seedCourses };

// Ejecutar si se llama directamente
if (require.main === module) {
  seedCourses()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}