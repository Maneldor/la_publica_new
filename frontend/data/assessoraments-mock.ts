// Mock data completo para assessoraments - Sistema de consultas gratuitas
export const assessoramentsMock = [
  {
    id: 'assessorament-legal-contractacio-publica',
    slug: 'assessorament-legal-contractacio-publica',
    titol: 'Assessorament Legal en Contractació Pública',
    subtitol: 'Primera consulta gratuïta de 60 minuts',
    categoria: 'legal',
    imagen: '/images/advisory/legal-contractacio.jpg',
    badges: ['Legal', 'GRATUÏT', 'Verificat'],
    valoracio: 4.8,
    total_valoracions: 23,
    consultes_realitzades: 87,

    empresa: {
      id: 'empresa-puig',
      nom: 'Consultoria Puig & Associats',
      logo: '/images/companies/puig-logo.jpg',
      valoracio: 4.2,
      total_valoracions: 156,
      verificada: true,
      ubicacio: 'Barcelona',
      web: 'www.cpuig.cat',
      email: 'info@cpuig.cat',
      telefon: '+34 93 456 78 90'
    },

    modalitats: [
      {
        tipus: 'presencial',
        activa: true,
        config: {
          adreca: 'Carrer de la Llei, 45, 08001 Barcelona',
          horari: 'Dilluns - Divendres: 9:00 - 18:00',
          duracio_min: 60,
          com_arribar: 'Metro L3 Liceu / L4 Jaume I',
          parking: 'Pàrquing públic a 100m'
        }
      },
      {
        tipus: 'online',
        activa: true,
        config: {
          plataforma: 'Zoom/Meet/Teams',
          horari: 'Dilluns - Divendres: 9:00 - 20:00',
          duracio_min: 60,
          requisits: 'Ordinador + càmera + micròfon'
        }
      },
      {
        tipus: 'telefonica',
        activa: true,
        config: {
          telefon: '+34 93 456 78 90',
          horari: 'Dilluns - Divendres: 9:00 - 20:00',
          duracio_min: 45
        }
      },
      {
        tipus: 'email',
        activa: false,
        config: {
          email: 'info@cpuig.cat',
          temps_resposta: '24-48 hores',
          accepta_adjunts: true,
          max_size_mb: 5
        }
      }
    ],

    expert: {
      nom: 'Maria Puig Fernández',
      carrec: 'Advocada especialista en Contractació Pública i Dret Administratiu',
      foto: '/images/experts/maria-puig.jpg',
      experiencia: '15 anys d\'experiència',
      clients: 'Assessora de +50 ajuntaments',
      formacio: 'Formadora en contractació pública',
      colegiada: 'Col·legiada núm. 12345',
      frase: 'El meu objectiu és ajudar-te a entendre la normativa i aplicar-la correctament en el teu dia a dia',
      linkedin: 'https://linkedin.com/in/maria-puig'
    },

    descripcio: `Oferim una primera consulta gratuïta d'1 hora amb un dels nostres experts en contractació pública. Podràs exposar el teu cas, dubtes o necessitats i rebràs orientació professional personalitzada.

Aquest servei està dissenyat específicament per empleats públics membres de La Pública que necessitin assessorament legal en temes de contractació.`,

    que_inclou: [
      'Sessió d\'1 hora amb expert jurídic especialitzat',
      'Anàlisi inicial del teu cas o necessitat',
      'Orientació sobre els passos a seguir',
      'Resolució de dubtes generals',
      'Recomanacions personalitzades',
      'Document resum de la reunió (per email)',
      'Pressupost sense compromís (si escau)'
    ],

    dirigit_a: [
      'Funcionaris responsables de contractació',
      'Tècnics que tramiten expedients',
      'Secretaris d\'ajuntament',
      'Personal nou que necessita orientació',
      'Qualsevol empleat públic amb dubtes legals sobre contractació'
    ],

    per_que_gratuit: `Consultoria Puig & Associats ofereix aquesta primera consulta sense cost com a forma de donar-se a conèixer i demostrar la qualitat del seu servei.

És una oportunitat per a tu de conèixer l'empresa i els seus professionals, avaluar si el servei s'ajusta a les teves necessitats i rebre orientació professional sense risc.`,

    stats: {
      vistes: 456,
      consultes_realitzades: 87,
      valoracio_mitjana: 4.8,
      contractacions_despres: 45,
      ratio_conversio: 52
    }
  },

  {
    id: 'assessorament-fiscal-pimes',
    slug: 'assessorament-fiscal-pimes',
    titol: 'Assessorament Fiscal per PIMES',
    subtitol: 'Consultoria tributària gratuïta de 45 minuts',
    categoria: 'fiscal',
    imagen: '/images/advisory/fiscal-pimes.jpg',
    badges: ['Fiscal', 'GRATUÏT', 'Especialitzat'],
    valoracio: 4.6,
    total_valoracions: 34,
    consultes_realitzades: 123,

    empresa: {
      id: 'empresa-fiscal-cat',
      nom: 'Assessoria Fiscal Catalunya',
      logo: '/images/companies/fiscal-cat-logo.jpg',
      valoracio: 4.4,
      total_valoracions: 89,
      verificada: true,
      ubicacio: 'Barcelona',
      web: 'www.fiscalcat.es',
      email: 'consultes@fiscalcat.es',
      telefon: '+34 93 234 56 78'
    },

    modalitats: [
      {
        tipus: 'presencial',
        activa: true,
        config: {
          adreca: 'Avinguda Diagonal, 123, 08028 Barcelona',
          horari: 'Dilluns - Divendres: 9:00 - 17:00',
          duracio_min: 45,
          com_arribar: 'Metro L3/L5 Diagonal',
          parking: 'Zona verda disponible'
        }
      },
      {
        tipus: 'online',
        activa: true,
        config: {
          plataforma: 'Teams/Zoom',
          horari: 'Dilluns - Divendres: 9:00 - 19:00',
          duracio_min: 45,
          requisits: 'Ordinador amb càmera'
        }
      },
      {
        tipus: 'telefonica',
        activa: true,
        config: {
          telefon: '+34 93 234 56 78',
          horari: 'Dilluns - Divendres: 9:00 - 19:00',
          duracio_min: 30
        }
      },
      {
        tipus: 'email',
        activa: true,
        config: {
          email: 'consultes@fiscalcat.es',
          temps_resposta: '24 hores',
          accepta_adjunts: true,
          max_size_mb: 10
        }
      }
    ],

    expert: {
      nom: 'Joan Martí Sánchez',
      carrec: 'Economista especialista en Fiscalitat d\'Empreses Públiques',
      foto: '/images/experts/joan-marti.jpg',
      experiencia: '12 anys d\'experiència',
      clients: 'Assessor de +80 entitats públiques',
      formacio: 'Expert en normativa fiscal local',
      colegiada: 'Col·legiat Economistes núm. 5678',
      frase: 'La fiscalitat no ha de ser complicada. T\'ajudo a optimitzar la gestió tributària de la teva entitat',
      linkedin: 'https://linkedin.com/in/joan-marti'
    },

    descripcio: `Primera consulta gratuïta especialitzada en fiscalitat per a entitats públiques i PIMES col·laboradores. Revisem la teva situació fiscal actual i t'orientem sobre optimització tributària.

Servei pensat per a responsables de gestió econòmica en administracions locals i empreses que treballen amb el sector públic.`,

    que_inclou: [
      'Consulta de 45 minuts amb economista especialitzat',
      'Revisió fiscal de la teva entitat',
      'Identificació d\'oportunitats d\'optimització',
      'Orientació sobre normativa aplicable',
      'Calendari fiscal personalitzat',
      'Informe resum per email'
    ],

    dirigit_a: [
      'Responsables econòmics d\'ajuntaments',
      'Interventors i tresorers',
      'PIMES que treballen amb administracions',
      'Gestors d\'entitats públiques',
      'Personal de nova incorporació'
    ],

    stats: {
      vistes: 289,
      consultes_realitzades: 123,
      valoracio_mitjana: 4.6,
      contractacions_despres: 67,
      ratio_conversio: 54
    }
  },

  {
    id: 'assessorament-nutricional-empleats',
    slug: 'assessorament-nutricional-empleats',
    titol: 'Assessorament Nutricional per Empleats Públics',
    subtitol: 'Consulta dietètica gratuïta per millorar hàbits',
    categoria: 'salut',
    imagen: '/images/advisory/nutricional.jpg',
    badges: ['Salut', 'GRATUÏT', 'Benestar'],
    valoracio: 4.9,
    total_valoracions: 67,
    consultes_realitzades: 234,

    empresa: {
      id: 'empresa-nutrisalut',
      nom: 'Centre Nutrisalut',
      logo: '/images/companies/nutrisalut-logo.jpg',
      valoracio: 4.7,
      total_valoracions: 112,
      verificada: true,
      ubicacio: 'Barcelona',
      web: 'www.nutrisalut.cat',
      email: 'info@nutrisalut.cat',
      telefon: '+34 93 345 67 89'
    },

    modalitats: [
      {
        tipus: 'presencial',
        activa: true,
        config: {
          adreca: 'Carrer de la Salut, 89, 08024 Barcelona',
          horari: 'Dilluns - Divendres: 8:00 - 20:00',
          duracio_min: 60,
          com_arribar: 'Metro L4 Joanic',
          parking: 'Pàrquing gratuït clients'
        }
      },
      {
        tipus: 'online',
        activa: true,
        config: {
          plataforma: 'Zoom especialitzat',
          horari: 'Dilluns - Divendres: 8:00 - 21:00',
          duracio_min: 60,
          requisits: 'Càmera per mostrar hàbits alimentaris'
        }
      },
      {
        tipus: 'telefonica',
        activa: false,
        config: {}
      },
      {
        tipus: 'email',
        activa: true,
        config: {
          email: 'dietista@nutrisalut.cat',
          temps_resposta: '48 hores',
          accepta_adjunts: true,
          max_size_mb: 5
        }
      }
    ],

    expert: {
      nom: 'Laura González Martín',
      carrec: 'Dietista-Nutricionista col·legiada',
      foto: '/images/experts/laura-gonzalez.jpg',
      experiencia: '8 anys d\'experiència',
      clients: 'Especialista en nutrició laboral',
      formacio: 'Màster en Nutrició Clínica',
      colegiada: 'Col·legiada Dietistes núm. 3456',
      frase: 'Una bona alimentació millora el teu rendiment laboral i qualitat de vida',
      linkedin: 'https://linkedin.com/in/laura-gonzalez-dietista'
    },

    descripcio: `Consulta nutricional gratuïta especialitzada en millorar els hàbits alimentaris dels empleats públics. Analitzem la teva alimentació actual i creem un pla personalitzat.

Especialment dissenyat per a treballadors d'oficina que volen millorar la seva energia i benestar durant la jornada laboral.`,

    que_inclou: [
      'Consulta d\'1 hora amb dietista col·legiada',
      'Anàlisi dels teus hàbits alimentaris actuals',
      'Pla nutricional personalitzat inicial',
      'Recomanacions per menjar a la feina',
      'Receptes ràpides i saludables',
      'Seguiment per email durant 2 setmanes'
    ],

    dirigit_a: [
      'Empleats públics amb horaris irregulars',
      'Treballadors d\'oficina sedentaris',
      'Personal amb problemes digestius',
      'Funcionaris amb estrès laboral',
      'Qualsevol que vulgui millorar la seva alimentació'
    ],

    stats: {
      vistes: 678,
      consultes_realitzades: 234,
      valoracio_mitjana: 4.9,
      contractacions_despres: 156,
      ratio_conversio: 67
    }
  },

  {
    id: 'assessorament-transformacio-digital',
    slug: 'assessorament-transformacio-digital',
    titol: 'Transformació Digital per Administracions',
    subtitol: 'Consultoria tecnològica gratuïta especialitzada',
    categoria: 'tecnologia',
    imagen: '/images/advisory/transformacio-digital.jpg',
    badges: ['Tecnologia', 'GRATUÏT', 'Innovació'],
    valoracio: 4.5,
    total_valoracions: 28,
    consultes_realitzades: 95,

    empresa: {
      id: 'empresa-digitalpub',
      nom: 'DigitalPub Solutions',
      logo: '/images/companies/digitalpub-logo.jpg',
      valoracio: 4.3,
      total_valoracions: 67,
      verificada: true,
      ubicacio: 'Barcelona',
      web: 'www.digitalpub.es',
      email: 'consultoria@digitalpub.es',
      telefon: '+34 93 456 78 91'
    },

    modalitats: [
      {
        tipus: 'presencial',
        activa: true,
        config: {
          adreca: 'Carrer de la Tecnologia, 22, 08018 Barcelona',
          horari: 'Dilluns - Divendres: 9:00 - 18:00',
          duracio_min: 90,
          com_arribar: 'Metro L1 Clot',
          parking: 'Zona blava disponible'
        }
      },
      {
        tipus: 'online',
        activa: true,
        config: {
          plataforma: 'Teams/Zoom amb pantalla compartida',
          horari: 'Dilluns - Divendres: 9:00 - 19:00',
          duracio_min: 90,
          requisits: 'Ordinador amb càmera i bona connexió'
        }
      },
      {
        tipus: 'telefonica',
        activa: false,
        config: {}
      },
      {
        tipus: 'email',
        activa: true,
        config: {
          email: 'consultoria@digitalpub.es',
          temps_resposta: '72 hores',
          accepta_adjunts: true,
          max_size_mb: 20
        }
      }
    ],

    expert: {
      nom: 'Marc Ribas Torrents',
      carrec: 'Consultor en Transformació Digital per al Sector Públic',
      foto: '/images/experts/marc-ribas.jpg',
      experiencia: '10 anys d\'experiència',
      clients: 'Ha digitalitzat +40 administracions',
      formacio: 'Enginyer Informàtic + MBA',
      colegiada: 'Col·legiat Enginyers núm. 7890',
      frase: 'La digitalització millora l\'eficiència i l\'atenció ciutadana. T\'ajudo a fer el salt',
      linkedin: 'https://linkedin.com/in/marc-ribas'
    },

    descripcio: `Consulta gratuïta especialitzada en transformació digital per a administracions públiques. Analitzem els teus processos actuals i dissenyem una estratègia de digitalització.

Perfecte per a responsables de sistemes, secretaris tècnics i personal que vol modernitzar els procediments administratius.`,

    que_inclou: [
      'Sessió d\'1h30 amb expert en digitalització',
      'Auditoria inicial dels teus processos',
      'Identificació d\'oportunitats de millora',
      'Roadmap de transformació digital',
      'Recomanacions de tecnologies adequades',
      'Informe executiu personalitzat'
    ],

    dirigit_a: [
      'Responsables de sistemes informàtics',
      'Secretaris i personal tècnic',
      'Caps de departament',
      'Personal de modernització',
      'Alcaldes i regidors interessats en innovació'
    ],

    stats: {
      vistes: 234,
      consultes_realitzades: 95,
      valoracio_mitjana: 4.5,
      contractacions_despres: 58,
      ratio_conversio: 61
    }
  },

  {
    id: 'assessorament-immobiliari-funcionaris',
    slug: 'assessorament-immobiliari-funcionaris',
    titol: 'Assessorament Immobiliari per Funcionaris',
    subtitol: 'Consultoria hipotecària especialitzada gratuïta',
    categoria: 'immobiliari',
    imagen: '/images/advisory/immobiliari.jpg',
    badges: ['Immobiliari', 'GRATUÏT', 'Especialitzat'],
    valoracio: 4.7,
    total_valoracions: 45,
    consultes_realitzades: 156,

    empresa: {
      id: 'empresa-immofunc',
      nom: 'InmoFuncionaris',
      logo: '/images/companies/immofunc-logo.jpg',
      valoracio: 4.5,
      total_valoracions: 98,
      verificada: true,
      ubicacio: 'Barcelona',
      web: 'www.immofuncionaris.cat',
      email: 'assessors@immofuncionaris.cat',
      telefon: '+34 93 567 89 01'
    },

    modalitats: [
      {
        tipus: 'presencial',
        activa: true,
        config: {
          adreca: 'Passeig de Gràcia, 156, 08008 Barcelona',
          horari: 'Dilluns - Divendres: 9:00 - 19:00',
          duracio_min: 60,
          com_arribar: 'Metro L2/L3/L4 Passeig de Gràcia',
          parking: 'Pàrquing concertat amb descompte'
        }
      },
      {
        tipus: 'online',
        activa: true,
        config: {
          plataforma: 'Zoom amb compartició de documents',
          horari: 'Dilluns - Divendres: 9:00 - 20:00',
          duracio_min: 60,
          requisits: 'Ordinador i documentació digitalitzada'
        }
      },
      {
        tipus: 'telefonica',
        activa: true,
        config: {
          telefon: '+34 93 567 89 01',
          horari: 'Dilluns - Divendres: 9:00 - 20:00',
          duracio_min: 45
        }
      },
      {
        tipus: 'email',
        activa: false,
        config: {}
      }
    ],

    expert: {
      nom: 'Carmen Jiménez Ruiz',
      carrec: 'Assessora Immobiliària especialista en Funcionaris Públics',
      foto: '/images/experts/carmen-jimenez.jpg',
      experiencia: '15 anys d\'experiència',
      clients: 'Ha assessorat +500 funcionaris',
      formacio: 'Llicenciada en Dret + API',
      colegiada: 'Col·legiada API núm. 4567',
      frase: 'Conec les particularitats del sector públic. T\'ajudo a trobar la millor opció',
      linkedin: 'https://linkedin.com/in/carmen-jimenez-api'
    },

    descripcio: `Consulta immobiliària gratuïta especialitzada en funcionaris i empleats públics. Aprofitem les teves condicions laborals per aconseguir les millors condicions hipotecàries.

Coneixem a fons els convenis amb bancs per a empleats públics i les particularitats de la teva situació contractual.`,

    que_inclou: [
      'Consulta d\'1 hora amb assessora especialitzada',
      'Anàlisi de la teva capacitat financera',
      'Cerca d\'ofertes hipotecàries preferents',
      'Orientació sobre ajudes públiques',
      'Revisió de documentació necessària',
      'Contacte amb entitats financeres'
    ],

    dirigit_a: [
      'Funcionaris de carrera',
      'Personal laboral fix',
      'Empleats públics temporals',
      'Personal en procés d\'oposicions',
      'Funcionaris que volen canviar d\'hipoteca'
    ],

    stats: {
      vistes: 445,
      consultes_realitzades: 156,
      valoracio_mitjana: 4.7,
      contractacions_despres: 89,
      ratio_conversio: 57
    }
  }
];

// Categories d'assessoraments
export const categoriesAssessorament = [
  {
    id: 'legal',
    nom: 'Legal / Jurídic',
    emoji: '⚖️',
    color: '#1e40af',
    descripcio: 'Assessorament jurídic especialitzat en administració pública'
  },
  {
    id: 'fiscal',
    nom: 'Financer / Fiscal',
    emoji: '💰',
    color: '#059669',
    descripcio: 'Consultoria fiscal i tributària per entitats públiques'
  },
  {
    id: 'salut',
    nom: 'Salut i Benestar',
    emoji: '🍎',
    color: '#dc2626',
    descripcio: 'Assessorament nutricional i de benestar per empleats'
  },
  {
    id: 'tecnologia',
    nom: 'Tecnològic / Digital',
    emoji: '💻',
    color: '#7c3aed',
    descripcio: 'Transformació digital i modernització tecnològica'
  },
  {
    id: 'immobiliari',
    nom: 'Immobiliari',
    emoji: '🏠',
    color: '#ea580c',
    descripcio: 'Consultoria immobiliària especialitzada en funcionaris'
  },
  {
    id: 'recursos-humans',
    nom: 'Recursos Humans',
    emoji: '👔',
    color: '#0891b2',
    descripcio: 'Gestió de personal i desenvolupament professional'
  },
  {
    id: 'sostenibilitat',
    nom: 'Sostenibilitat',
    emoji: '🌱',
    color: '#16a34a',
    descripcio: 'Consultoria ambiental i sostenibilitat urbana'
  },
  {
    id: 'gestio',
    nom: 'Gestió Empresarial',
    emoji: '📊',
    color: '#9333ea',
    descripcio: 'Optimització de processos i gestió administrativa'
  }
];

// Funció per obtenir assessorament per slug
export const getAssessoramentBySlug = (slug: string) => {
  return assessoramentsMock.find(a => a.slug === slug);
};

// Funció per obtenir assessoraments per categoria
export const getAssessoramentsByCategoria = (categoria: string) => {
  return assessoramentsMock.filter(a => a.categoria === categoria);
};

// Funció per obtenir estadístiques generals
export const getAssessoramentsStats = () => {
  const total = assessoramentsMock.length;
  const totalConsultes = assessoramentsMock.reduce((sum, a) => sum + a.consultes_realitzades, 0);
  const valoracioMitjana = assessoramentsMock.reduce((sum, a) => sum + a.valoracio, 0) / total;

  return {
    total_assessoraments: total,
    total_consultes_realitzades: totalConsultes,
    valoracio_mitjana: Math.round(valoracioMitjana * 10) / 10,
    categories_disponibles: categoriesAssessorament.length
  };
};